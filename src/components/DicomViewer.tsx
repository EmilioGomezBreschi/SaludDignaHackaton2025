'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const MIN_INDEX = 0;
const MAX_INDEX = 360;
type EnabledElement = {
  element: HTMLDivElement;
  // other properties can be added as needed
};

const DICOMViewer = () => {
  const imageRef = useRef<HTMLDivElement>(null);
  const cornerstoneRef = useRef<any>(null);

  function getEnabledElements(): EnabledElement[] {
    if (cornerstoneRef.current && typeof cornerstoneRef.current.getEnabledElements === 'function') {
      return cornerstoneRef.current.getEnabledElements();
    }
    return [];
  }
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);

  // 1. Inicialización única de Cornerstone y loader
  useEffect(() => {
    const initialize = async () => {
      const cornerstone = (await import('cornerstone-core')).default;
      const cornerstoneWADOImageLoader = (await import('cornerstone-wado-image-loader')).default;
      const dicomParser = (await import('dicom-parser')).default;
      cornerstoneWADOImageLoader.external.cornerstone = cornerstone as any;
      cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
  
      cornerstoneWADOImageLoader.webWorkerManager.initialize({
        maxWebWorkers: navigator.hardwareConcurrency || 1,
        startWebWorkersOnDemand: true,
        taskConfiguration: {
          decodeTask: {
            initializeCodecsOnStartup: true,
            usePDFJS: false,
            strict: false,
          },
        },
      });

      cornerstoneRef.current = cornerstone;

      const enabledElements = Array.isArray(cornerstone.getEnabledElements && cornerstone.getEnabledElements())
        ? cornerstone.getEnabledElements()
        : [];
      if (imageRef.current && Array.isArray(enabledElements) && !enabledElements.some((e: any) => e.element === imageRef.current)) {
        cornerstone.enable(imageRef.current);
      }
      setIsReady(true);
    };
    initialize();

    return () => {
      const cleanup = async () => {
        if (cornerstoneRef.current && imageRef.current) {
          cornerstoneRef.current.disable(imageRef.current);
        }
      };
      cleanup();
    };
  }, []);

  // 2. Carga de imágenes solo cuando cornerstone está listo y cambia el índice
  useEffect(() => {
    const loadImage = async () => {
      if (!isReady || !cornerstoneRef.current || !imageRef.current) return;
      const cornerstone = cornerstoneRef.current;
      const validIndex = Math.min(Math.max(currentIndex, MIN_INDEX), MAX_INDEX);
      const imageId = `wadouri:/cerebro/image-${validIndex.toString().padStart(5, '0')}.dcm`;
      try {
        const image = await cornerstone.loadAndCacheImage(imageId);
        cornerstone.displayImage(imageRef.current, image);
      } catch (error) {
        console.error('Error cargando imagen:', error);
      }
    };
    loadImage();
  }, [currentIndex, isReady]);

  // 3. Navegación circular
  const navigateImages = useCallback((direction: 'next' | 'prev') => {
    setCurrentIndex(current => {
      let newIndex = direction === 'next' ? current + 1 : current - 1;
      if (newIndex > MAX_INDEX) newIndex = MIN_INDEX;
      if (newIndex < MIN_INDEX) newIndex = MAX_INDEX;
      return newIndex;
    });
  }, []);

  return (
    <div className="w-full h-full">
      <div
        ref={imageRef}
        className="w-full h-full bg-gray-700"
        style={{ width: '100%', height: '500px' }}
      />
      <div className="flex gap-4 mt-4 justify-center">
        <button
          onClick={() => navigateImages('prev')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Anterior
        </button>
        <span className="text-white self-center">
          {currentIndex.toString().padStart(5, '0')}
        </span>
        <button
          onClick={() => navigateImages('next')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default DICOMViewer;