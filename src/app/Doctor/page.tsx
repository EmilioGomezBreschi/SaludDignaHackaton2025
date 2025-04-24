"use client";

import DICOMViewer from "../Components/DICOMViewer";
import { useState } from "react";

export default function Home() {
  const [viewCount, setViewCount] = useState(1);
  const [selectedView, setSelectedView] = useState("axial");
  const [activeTool, setActiveTool] = useState("Pan");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const viewTypes = [
    { id: "axial", label: "Axial" },
    { id: "sagital", label: "Sagital" },
    { id: "coronal", label: "Coronal" },
  ];

  const viewOptions = [
    { count: 1, label: "1 Visor" },
    { count: 2, label: "2 Visores" },
    { count: 3, label: "3 Visores" },
    { count: 4, label: "4 Visores" },
  ];

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

  const getGridLayout = () => {
    switch (viewCount) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-2 grid-rows-2';
      default:
        return 'grid-cols-1';
    }
  };

  const getViewerClass = (index: number) => {
    switch (viewCount) {
      case 4:
        switch (index) {
          case 0: return 'col-start-1 col-end-2 row-start-1 row-end-2';
          case 1: return 'col-start-2 col-end-3 row-start-1 row-end-2';
          case 2: return 'col-start-1 col-end-2 row-start-2 row-end-3';
          case 3: return 'col-start-2 col-end-3 row-start-2 row-end-3';
          default: return '';
        }
      case 3:
        return 'col-span-1';
      case 2:
        return 'col-span-1';
      default:
        return 'col-span-1';
    }
  };

  return (
    <div className="flex bg-gray-700">
      {/* Sidebar con controles */}
      <div className="w-64 bg-gray-700 h-full p-4 flex flex-col gap-4 border-r border-gray-700">
        <h1 className="text-xl font-bold text-blue-500">Expediente Digno</h1>

        {/* Selector de cantidad de visores */}
        <div className="space-y-2">
          <h2 className="text-sm text-gray-400">Cantidad de visores</h2>
          <div className="flex flex-col gap-2">
            {viewOptions.map((option) => (
              <button
                key={option.count}
                onClick={() => setViewCount(option.count)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${viewCount === option.count
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de tipo de corte */}
        <div className="space-y-2">
          <h2 className="text-sm text-gray-400">Tipo de Corte</h2>
          <div className="flex flex-col gap-2">
            {viewTypes.map((view) => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${selectedView === view.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Herramientas */}
        <div className="space-y-2">
          <h2 className="text-sm text-gray-400">Herramientas</h2>
          <div className="flex flex-col gap-2">
            {tools.map((tool) => (
              <button
                key={tool.name}
                onClick={() => setActiveTool(tool.name)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTool === tool.name
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
              >
                {tool.label}
              </button>
            ))}
          </div>
        </div>

        {/* Control de scroll */}
        <button
          onClick={() => setScrollEnabled(!scrollEnabled)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${scrollEnabled
            ? "bg-green-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
        >
          {scrollEnabled ? "Scroll Activo" : "Scroll Inactivo"}
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col border-gray-700">
        {/* Header con info del paciente */}
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-gray-400 text-sm">Nombre del Paciente</h2>
              <p className="text-white">Juan Pérez</p>
            </div>
            <div>
              <h2 className="text-gray-400 text-sm">Tipo de Estudio</h2>
              <p className="text-white">Tomografia de cerebro</p>
            </div>
          </div>
        </div>

        {/* Área de visores DICOM */}
        <div className="flex-1 p-4 bg-gray-800">
          <div className="relative h-[calc(100vh-8rem)] bg-gray-800 border border-gray-600">
            {viewCount === 1 && (
              <div className="absolute inset-0">
                <DICOMViewer
                  showControls={false}
                  activeTool={activeTool}
                  currentImageIndex={currentImageIndex}
                  scrollEnabled={scrollEnabled}
                />
              </div>
            )}

            {viewCount === 2 && (
              <>
                <div className="absolute left-0 top-0 w-1/2 h-full border-r border-gray-600">
                  <DICOMViewer
                    showControls={false}
                    activeTool={activeTool}
                    currentImageIndex={currentImageIndex}
                    scrollEnabled={scrollEnabled}
                  />
                </div>
                <div className="absolute right-0 top-0 w-1/2 h-full">
                  <DICOMViewer
                    showControls={false}
                    activeTool={activeTool}
                    currentImageIndex={currentImageIndex}
                    scrollEnabled={scrollEnabled}
                  />
                </div>
              </>
            )}

            {viewCount === 3 && (
              <>
                <div className="absolute left-0 top-0 w-1/3 h-full border-r border-gray-600">
                  <DICOMViewer
                    showControls={false}
                    activeTool={activeTool}
                    currentImageIndex={currentImageIndex}
                    scrollEnabled={scrollEnabled}
                  />
                </div>
                <div className="absolute left-1/3 top-0 w-1/3 h-full border-r border-gray-600">
                  <DICOMViewer
                    showControls={false}
                    activeTool={activeTool}
                    currentImageIndex={currentImageIndex}
                    scrollEnabled={scrollEnabled}
                  />
                </div>
                <div className="absolute right-0 top-0 w-1/3 h-full">
                  <DICOMViewer
                    showControls={false}
                    activeTool={activeTool}
                    currentImageIndex={currentImageIndex}
                    scrollEnabled={scrollEnabled}
                  />
                </div>
              </>
            )}

            {viewCount === 4 && (
              <>
                <div className="absolute left-0 top-0 w-1/2 h-1/2 border-r border-b border-gray-600">
                  <DICOMViewer
                    showControls={false}
                    activeTool={activeTool}
                    currentImageIndex={currentImageIndex}
                    scrollEnabled={scrollEnabled}
                  />
                </div>
                <div className="absolute right-0 top-0 w-1/2 h-1/2 border-b border-gray-600">
                  <DICOMViewer
                    showControls={false}
                    activeTool={activeTool}
                    currentImageIndex={currentImageIndex}
                    scrollEnabled={scrollEnabled}
                  />
                </div>
                <div className="absolute left-0 bottom-0 w-1/2 h-1/2 border-r border-gray-600">
                  <DICOMViewer
                    showControls={false}
                    activeTool={activeTool}
                    currentImageIndex={currentImageIndex}
                    scrollEnabled={scrollEnabled}
                  />
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-1/2">
                  <DICOMViewer
                    showControls={false}
                    activeTool={activeTool}
                    currentImageIndex={currentImageIndex}
                    scrollEnabled={scrollEnabled}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Panel inferior */}
        <div className="flex flex-col border-gray-700">
          {/* Controles de navegación */}
          <div className="p-2 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              >
                Anterior
              </button>
              <span className="text-gray-300 font-mono">
                {currentImageIndex.toString().padStart(3, "0")} / {360}
              </span>
              <button
                onClick={() => setCurrentImageIndex(Math.min(360, currentImageIndex + 1))}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>

          {/* Panel de anotaciones */}
          <div className="bg-gray-800 p-4 border-t border-l border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-white text-lg font-semibold mb-4">Interpretación anterior</h2>
                <p className="text-white text-sm">
                  Tienes un cerebro inflamado y un tumor en el cerebro.
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                </p>
              </div>
              <div>
                <h2 className="text-white text-lg font-semibold mb-4">Nuevas anotaciones</h2>
                <textarea
                  className="w-full h-32 bg-gray-700 text-white rounded-lg p-3 resize-none"
                  placeholder="Escribe tus anotaciones aquí..."
                />
                <div className="mt-4 flex justify-end">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Guardar anotaciones
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
