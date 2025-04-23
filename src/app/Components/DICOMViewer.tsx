"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
import * as cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";

const MIN_INDEX = 0;
const MAX_INDEX = 7;
const BASE_URL = "http://localhost:3000/Imagenes";

const DICOMViewer = () => {
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Inicialización de Cornerstone y herramientas
  useEffect(() => {
    const element = imageRef.current;
    if (!element) return;

    // Conectar dependencias externas
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone as any;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.Hammer = Hammer;

    // Inicializar web worker
    try {
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
    } catch (e: any) {
      if (!e.message?.includes("already initialized")) {
        console.error(e);
      }
    }

    // Inicializar tools
    cornerstoneTools.init({
      globalToolSyncEnabled: true,
      showSVGCursors: true,
    });

    // Habilitar canvas
    if (!cornerstone.getEnabledElements().some(e => e.element === element)) {
      cornerstone.enable(element);
    }

    // Crear lista de imágenes
    const ids = Array.from({ length: MAX_INDEX + 1 }, (_, i) =>
      `wadouri:${BASE_URL}/${i.toString().padStart(8, "0")}.dcm`
    );
    setImageIds(ids);

    // Registrar stack tools
    cornerstoneTools.addStackStateManager(element, ["stack"]);
    cornerstoneTools.addToolState(element, "stack", {
      imageIds: ids,
      currentImageIdIndex: 0,
    });

    // Registrar herramientas
    const tools = cornerstoneTools;
    tools.addTool(tools.PanTool);
    tools.addTool(tools.ZoomTool);
    tools.addTool(tools.WwwcTool);
    tools.addTool(tools.LengthTool);
    tools.addTool(tools.StackScrollMouseWheelTool);

    tools.setToolActive("Pan", { mouseButtonMask: 1 });
    tools.setToolActive("Zoom", { mouseButtonMask: 2 });
    tools.setToolActive("Wwwc", { mouseButtonMask: 4 });
    tools.setToolActive("StackScrollMouseWheel", {});

    // Cargar imagen inicial
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
      if (element) {
        cornerstone.disable(element);
      }
    };
  }, []);

  // Cargar imagen actual (solo display, no modificar el stack)
  useEffect(() => {
    const element = imageRef.current;
    if (!element || !imageLoaded || !imageIds[currentIndex]) return;

    cornerstone
      .loadAndCacheImage(imageIds[currentIndex])
      .then((image) => {
        cornerstone.displayImage(element, image);
      })
      .catch((err) => {
        console.error("Error al cambiar de imagen:", err);
      });
  }, [currentIndex, imageIds, imageLoaded]);

  // Navegación manual
  const navigate = useCallback((dir: "next" | "prev") => {
    setCurrentIndex((prev) =>
      Math.max(MIN_INDEX, Math.min(MAX_INDEX, dir === "next" ? prev + 1 : prev - 1))
    );
  }, []);

  // Activar herramienta
  const activateTool = (toolName: string) => {
    const element = imageRef.current;
    if (!imageLoaded || !element) return;

    try {
      // Desactivar las herramientas antes de activar la nueva
      ["Pan", "Zoom", "Wwwc", "Length"].forEach((tool) => {
        cornerstoneTools.setToolPassive(tool);
      });

      // Activar la herramienta seleccionada
      cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
    } catch (e) {
      console.error("Error al activar herramienta:", e);
    }
  };

  return (
    <div className="w-full h-full">
      <div ref={imageRef} className="w-full h-96 bg-black" />

      <div className="flex justify-center gap-4 mt-4">
        <button onClick={() => navigate("prev")} className="btn">
          Anterior
        </button>
        <span className="text-white">{currentIndex.toString().padStart(8, "0")}</span>
        <button onClick={() => navigate("next")} className="btn">
          Siguiente
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-2">
        {["Pan", "Zoom", "Wwwc", "Length"].map((tool) => (
          <button
            key={tool}
            onClick={() => activateTool(tool)}
            className="btn"
            disabled={!imageLoaded}
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(DICOMViewer), { ssr: false });
