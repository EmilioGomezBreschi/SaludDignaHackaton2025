"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
// 1️⃣ Importa cornerstone-math
import cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";

const MIN_INDEX = 0;
const MAX_INDEX = 360;
const BASE_URL = "http://localhost:3000/series-00000";

const DICOMViewer = () => {
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const element = imageRef.current;
    if (!element) return;

    // Conectar dependencias externas
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone as any;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.Hammer = Hammer;
   // 2️⃣ Registrar cornerstoneMath como dependencia
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;

    // Inicializar web workers…
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

    // Resto de la inicialización (enable, stack, herramientas, etc.)…
    cornerstoneTools.init({ globalToolSyncEnabled: true, showSVGCursors: true });
    cornerstone.enable(element);

    const ids = Array.from({ length: MAX_INDEX + 1 }, (_, i) =>
      `wadouri:${BASE_URL}/image-${i.toString().padStart(5, "0")}.dcm`
    );
    setImageIds(ids);

    // Stack state manager
    cornerstoneTools.addStackStateManager(element, ["stack"]);
    cornerstoneTools.addToolState(element, "stack", {
      imageIds: ids,
      currentImageIdIndex: 0,
    });

    // Registro de herramientas (solo la clase)
    cornerstoneTools.addTool(cornerstoneTools.PanTool);
    cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
    cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
    cornerstoneTools.addTool(cornerstoneTools.LengthTool);
    cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);

    // Activación
    cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
    cornerstoneTools.setToolActive("Zoom", { mouseButtonMask: 2 });
    cornerstoneTools.setToolActive("Wwwc", { mouseButtonMask: 4 });
    cornerstoneTools.setToolActive("StackScrollMouseWheel", {});

    // Carga imagen inicial…
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

  // Efecto para cambiar de imagen…
  useEffect(() => {
    const element = imageRef.current;
    if (!element || !imageLoaded) return;
    cornerstone
      .loadAndCacheImage(imageIds[currentIndex])
      .then((image) => cornerstone.displayImage(element, image))
      .catch((err) => console.error("Error al cambiar de imagen:", err));
  }, [currentIndex, imageIds, imageLoaded]);

  const navigate = useCallback((dir: "next" | "prev") => {
    setCurrentIndex((i) =>
      Math.max(MIN_INDEX, Math.min(MAX_INDEX, dir === "next" ? i + 1 : i - 1))
    );
  }, []);

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
    </div>
  );
};

export default dynamic(() => Promise.resolve(DICOMViewer), { ssr: false });
