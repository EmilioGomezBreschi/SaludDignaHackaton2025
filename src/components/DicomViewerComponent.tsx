"use client";

import { useEffect, useRef, useState } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';

// Inicializar cornerstone
if (typeof window !== 'undefined') {
    // @ts-ignore
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    // @ts-ignore
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

    // Registrar el cargador de imágenes WADO
    // @ts-ignore
    cornerstoneWADOImageLoader.webWorkerManager.initialize({
        maxWebWorkers: navigator.hardwareConcurrency || 1,
        startWebWorkersOnDemand: true,
        webWorkerTaskPaths: [],
        taskConfiguration: {
            decodeTask: {
                initializeCodecsOnStartup: false,
                usePDFJS: false,
                strict: false
            }
        }
    });

    // Registrar el cargador de imágenes
    // @ts-ignore
    cornerstoneWADOImageLoader.wadouri.register(cornerstone);
}

interface DicomViewerComponentProps {
    dicomUrl: string;
}

export default function DicomViewerComponent({ dicomUrl }: DicomViewerComponentProps) {
    const viewerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [storedBlobUrl, setStoredBlobUrl] = useState<string | null>(null);

    // Efecto para cargar y almacenar el archivo DICOM
    useEffect(() => {
        const loadAndStoreDicom = async () => {
            try {
                setIsLoading(true);
                setError(null);

                let blobUrl: string;

                if (dicomUrl.startsWith('blob:')) {
                    // Verificar si la URL blob es válida
                    try {
                        const response = await fetch(dicomUrl);
                        if (!response.ok) {
                            throw new Error('URL blob no válida');
                        }
                        blobUrl = dicomUrl;
                    } catch (err) {
                        // Si la URL blob no es válida, intentar descargar de nuevo
                        const response = await fetch(dicomUrl.replace('blob:', ''));
                        if (!response.ok) {
                            throw new Error(`Error al descargar el archivo: ${response.status}`);
                        }
                        const blob = await response.blob();
                        blobUrl = URL.createObjectURL(blob);
                    }
                } else {
                    // Descargar el archivo DICOM
                    const response = await fetch(dicomUrl);
                    if (!response.ok) {
                        throw new Error(`Error al descargar el archivo: ${response.status}`);
                    }
                    const blob = await response.blob();
                    blobUrl = URL.createObjectURL(blob);
                }

                // Verificar que el blob sea un archivo DICOM válido
                const response = await fetch(blobUrl);
                const arrayBuffer = await response.arrayBuffer();
                const byteArray = new Uint8Array(arrayBuffer);
                
                // Verificar el encabezado DICOM
                if (byteArray[128] !== 0x44 || byteArray[129] !== 0x49 || 
                    byteArray[130] !== 0x43 || byteArray[131] !== 0x4D) {
                    throw new Error('El archivo no parece ser un archivo DICOM válido');
                }

                setStoredBlobUrl(blobUrl);
            } catch (err) {
                console.error('Error al cargar el archivo DICOM:', err);
                setError(err instanceof Error ? err.message : 'Error al cargar el archivo DICOM');
            } finally {
                setIsLoading(false);
            }
        };

        loadAndStoreDicom();

        return () => {
            if (storedBlobUrl) {
                URL.revokeObjectURL(storedBlobUrl);
            }
        };
    }, [dicomUrl]);

    // Efecto para mostrar la imagen cuando el blob esté disponible
    useEffect(() => {
        if (!viewerRef.current || !storedBlobUrl) return;

        const element = viewerRef.current;

        const initializeViewer = async () => {
            try {
                setIsLoading(true);
                console.log('Iniciando inicialización del visor...');
                
                // Habilitar el elemento para cornerstone
                cornerstone.enable(element);
                console.log('Elemento habilitado para cornerstone');

                // Configurar las herramientas
                cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
                cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
                cornerstoneTools.addTool(cornerstoneTools.PanTool);
                cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
                cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 2 });
                cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 4 });
                console.log('Herramientas configuradas');

                // Preparar el imageId
                const imageId = `wadouri:${storedBlobUrl}`;
                console.log('ImageId preparado:', imageId);

                // Cargar y mostrar la imagen
                console.log('Cargando imagen en cornerstone...');
                const image = await cornerstone.loadImage(imageId);
                console.log('Imagen cargada, mostrando...');
                
                cornerstone.displayImage(element, image);
                cornerstone.fitToWindow(element);
                
                console.log('Imagen mostrada correctamente');
                setError(null);
            } catch (err) {
                console.error('Error en el proceso de carga:', {
                    error: err,
                    message: err instanceof Error ? err.message : 'Error desconocido',
                    stack: err instanceof Error ? err.stack : undefined
                });
                setError(err instanceof Error ? err.message : 'Error desconocido al cargar la imagen DICOM');
            } finally {
                setIsLoading(false);
            }
        };

        initializeViewer();

        return () => {
            try {
                cornerstone.disable(element);
            } catch (err) {
                console.error('Error al limpiar el visor DICOM:', err);
            }
        };
    }, [storedBlobUrl]);

    if (error) {
        return (
            <div className="w-full h-[500px] bg-red-50 rounded-lg overflow-hidden flex items-center justify-center">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <p className="text-gray-600">Cargando imagen DICOM...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[500px] bg-black rounded-lg overflow-hidden">
            <div ref={viewerRef} className="w-full h-full" />
        </div>
    );
}