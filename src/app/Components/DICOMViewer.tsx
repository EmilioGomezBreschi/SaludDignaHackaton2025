import { useEffect, useRef } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';

// Configuración inicial de los loaders
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

// Configurar codecs y web workers (necesario para Next.js)
if (typeof window !== 'undefined') {
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
}

const DICOMViewer = () => {
  const imageRef = useRef<HTMLDivElement>(null);
  const zoomLevel = useRef<number>(1);

  useEffect(() => {
    const element = imageRef.current;
    
    if (!element) return;

    const enableAndLoadImage = async () => {
      try {
        await cornerstone.enable(element);
        
        // Reemplaza esta URL con la ubicación de tu archivo DICOM
        const imageId = 'wadouri:/tu-imagen.dcm';
        
        const image = await cornerstone.loadImage(imageId);
        cornerstone.displayImage(element, image);
        zoomLevel.current = 1;
      } catch (error) {
        console.error('Error loading DICOM image:', error);
      }
    };

    enableAndLoadImage();

    return () => {
      if (element) {
        cornerstone.disable(element);
      }
    };
  }, []);

  const handleZoom = (direction: 'in' | 'out') => {
    const elements = cornerstone.getEnabledElements();
    
    elements.forEach(enabledElement => {
      if (!enabledElement.element) return;
      
      direction === 'in' ? zoomLevel.current *= 1.2 : zoomLevel.current /= 1.2;
      
      const viewport = cornerstone.getViewport(enabledElement.element);
      
      if (viewport) {
        cornerstone.setViewport(enabledElement.element, {
          ...viewport,
          scale: zoomLevel.current
        });
      }
    });
  };

  return (
    <div className="w-full h-full">
      <div 
        ref={imageRef}
        className="w-full h-full bg-gray-700"
        style={{ width: '100%', height: '500px' }}
      />
      <div className="flex flex-row space-x-3 items-end justify-end w-full rounded-lg mt-2">
        <button 
          onClick={() => handleZoom('in')}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition