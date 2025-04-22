'use client';

import { useEffect, useRef } from 'react';

const DICOMViewer = () => {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const cornerstone = (await import('cornerstone-core')).default;
        const cornerstoneWADOImageLoader = (await import('cornerstone-wado-image-loader')).default;
        const dicomParser = (await import('dicom-parser')).default;

        // Configurar el cargador DICOM
        cornerstoneWADOImageLoader.external.cornerstone = cornerstone as typeof import('cornerstone-core');
        cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

        // Configurar el cargador
        cornerstoneWADOImageLoader.configure({
          beforeSend: (xhr) => {
            // Configura encabezados o ajustes necesarios aquí
          },
        });

        // Inicializar web workers
        cornerstoneWADOImageLoader.webWorkerManager.initialize({
          maxWebWorkers: navigator.hardwareConcurrency || 1,
          startWebWorkersOnDemand: true,
          taskConfiguration: {
            decodeTask: {
              initializeCodecsOnStartup: false,
              usePDFJS: false,
              strict: false,
            },
          },
        });

        const element = imageRef.current;
        if (!element) return;

        // Habilitar el elemento de visualización
        cornerstone.enable(element);

        // Cargar imagen (asegúrate de que el archivo esté en /public)
        const imageId = 'wadouri:/image-00290.dcm'; // Cambia por tu archivo
        const image = await cornerstone.loadAndCacheImage(imageId); // Usa loadAndCacheImage
        cornerstone.displayImage(element, image);
      } catch (error) {
        console.error('Error durante la inicialización:', error);
      }
    };

    initialize();

    return () => {
      const cleanup = async () => {
        const cornerstone = (await import('cornerstone-core')).default;
        const element = imageRef.current;
        if (element) cornerstone.disable(element);
      };
      cleanup();
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div
        ref={imageRef}
        className="w-full h-full bg-gray-700"
        style={{ width: '100%', height: '500px' }}
      />
    </div>
  );
};

export default DICOMViewer;