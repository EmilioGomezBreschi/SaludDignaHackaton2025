"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
import cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";

const MIN_INDEX = 0;
const MAX_INDEX = 7;
const BASE_URL = "http://localhost:3000/Imagenes";

interface DICOMViewerProps {
  showControls?: boolean;
  onToolChange?: (tool: string) => void;
  activeTool?: string;
  currentImageIndex?: number;
  onImageIndexChange?: (index: number) => void;
  scrollEnabled?: boolean;
  onScrollToggle?: () => void;
}

const DICOMViewer = ({
  showControls = true,
  onToolChange,
  activeTool: externalActiveTool,
  currentImageIndex: externalIndex,
  onImageIndexChange,
  scrollEnabled: externalScrollEnabled,
  onScrollToggle
}: DICOMViewerProps) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(externalIndex || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTool, setActiveTool] = useState<string>(externalActiveTool || "Pan");
  const [scrollEnabled, setScrollEnabled] = useState(externalScrollEnabled ?? true);

  const tools = [
    { name: "Pan", label: "Mover" },
    { name: "Zoom", label: "Zoom" },
    { name: "Wwwc", label: "Contraste" },
    { name: "Length", label: "Medir" },
    { name: "Angle", label: "Ángulo" },
    { name: "Magnify", label: "Lupa" },
    { name: "RectangleRoi", label: "Rectángulo" },
    { name: "EllipticalRoi", label: "Elipse" },
    { name: "FreehandRoi", label: "ROI Manual" },
  ];

  const handleToolChange = (toolName: string) => {
    setActiveTool(toolName);
    onToolChange?.(toolName);
    cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
  };

  const toggleScroll = () => {
    const newScrollState = !scrollEnabled;
    setScrollEnabled(newScrollState);
    onScrollToggle?.();
    if (newScrollState) {
      cornerstoneTools.setToolActive("StackScrollMouseWheel", {});
    } else {
      cornerstoneTools.setToolDisabled("StackScrollMouseWheel");
    }
  };

  useEffect(() => {
    if (externalActiveTool && externalActiveTool !== activeTool) {
      handleToolChange(externalActiveTool);
    }
  }, [externalActiveTool]);

  useEffect(() => {
    if (typeof externalScrollEnabled === 'boolean' && externalScrollEnabled !== scrollEnabled) {
      setScrollEnabled(externalScrollEnabled);
    }
  }, [externalScrollEnabled]);

  useEffect(() => {
    if (typeof externalIndex === 'number' && externalIndex !== currentIndex) {
      setCurrentIndex(externalIndex);
    }
  }, [externalIndex]);

  useEffect(() => {
    const element = imageRef.current;
    if (!element) return;

    // Conectar dependencias externas
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone as any;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.Hammer = Hammer;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;

    // Inicializar web workers
    try {
      cornerstoneWADOImageLoader.webWorkerManager.initialize({
        maxWebWorkers: navigator.hardwareConcurrency || 1,
        startWebWorkersOnDemand: true,
        taskConfiguration: {
          decodeTask: { initializeCodecsOnStartup: false, usePDFJS: false, strict: false },
        },
      });
    } catch (e: any) {
      if (!e.message?.includes("already initialized")) console.error(e);
    }

    // Inicializar herramientas
    cornerstoneTools.init({ globalToolSyncEnabled: true, showSVGCursors: true });
    cornerstone.enable(element);

    const ids = Array.from({ length: MAX_INDEX + 1 }, (_, i) =>
      `wadouri:${BASE_URL}/${i.toString().padStart(1, "0")}.dcm`
    );
    setImageIds(ids);

    // Stack state manager
    cornerstoneTools.addStackStateManager(element, ["stack"]);
    cornerstoneTools.addToolState(element, "stack", {
      imageIds: ids,
      currentImageIdIndex: 0,
    });

    // Registro de herramientas
    cornerstoneTools.addTool(cornerstoneTools.PanTool);
    cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
    cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
    cornerstoneTools.addTool(cornerstoneTools.LengthTool);
    cornerstoneTools.addTool(cornerstoneTools.AngleTool);
    cornerstoneTools.addTool(cornerstoneTools.MagnifyTool);
    cornerstoneTools.addTool(cornerstoneTools.RectangleRoiTool);
    cornerstoneTools.addTool(cornerstoneTools.EllipticalRoiTool);
    cornerstoneTools.addTool(cornerstoneTools.FreehandRoiTool);
    cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);

    // Activación inicial
    cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
    cornerstoneTools.setToolActive("StackScrollMouseWheel", {});

    // Carga imagen inicial
    cornerstone
      .loadAndCacheImage(ids[0])
      .then((image) => {
        cornerstone.displayImage(element, image);
        setImageLoaded(true);
      })
      .catch((err) => {
        console.error("Error cargando imagen inicial:", err);
        setImageLoaded(false);
      });

    return () => {
      cornerstone.disable(element);
    };
  }, []);

  // Efecto para cambiar de imagen
  useEffect(() => {
    const element = imageRef.current;
    if (!element || !imageLoaded) return;
    cornerstone
      .loadAndCacheImage(imageIds[currentIndex])
      .then((image) => cornerstone.displayImage(element, image))
      .catch((err) => console.error("Error al cambiar de imagen:", err));
  }, [currentIndex, imageIds, imageLoaded]);

  const navigate = useCallback((dir: "next" | "prev") => {
    const newIndex = Math.max(
      MIN_INDEX,
      Math.min(MAX_INDEX, dir === "next" ? currentIndex + 1 : currentIndex - 1)
    );
    setCurrentIndex(newIndex);
    onImageIndexChange?.(newIndex);
  }, [currentIndex, onImageIndexChange]);

  return (
    <div className="w-full h-full">
      {/* Visor DICOM */}
      <div ref={imageRef} className="w-full h-full bg-black" />

      {/* Controles */}
      {showControls && (
        <div className="p-2 md:p-4 bg-gray-800 border-t border-gray-700">
          {/* Herramientas */}
          <div className="flex flex-wrap gap-1 md:gap-2 mb-4">
            {tools.map((tool) => (
              <button
                key={tool.name}
                onClick={() => handleToolChange(tool.name)}
                className={`px-2 md:px-4 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                  activeTool === tool.name
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {tool.label}
              </button>
            ))}
            <button
              onClick={toggleScroll}
              className={`px-2 md:px-4 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                scrollEnabled
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {scrollEnabled ? "Scroll Activo" : "Scroll Inactivo"}
            </button>
          </div>

          {/* Navegación */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => navigate("prev")}
              className="px-2 md:px-4 py-1 md:py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors text-xs md:text-sm"
            >
              Anterior
            </button>
            <span className="text-gray-300 font-mono text-xs md:text-sm">
              {currentIndex.toString().padStart(3, "0")} / {MAX_INDEX}
            </span>
            <button
              onClick={() => navigate("next")}
              className="px-2 md:px-4 py-1 md:py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors text-xs md:text-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(DICOMViewer), { ssr: false });
