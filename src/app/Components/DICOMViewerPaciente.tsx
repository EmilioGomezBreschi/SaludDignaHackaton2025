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
const BASE_URL = "http://localhost:3000/cerebro";

const DICOMViewerPaciente = () => {
	const imageRef = useRef<HTMLDivElement>(null);
	const [imageIds, setImageIds] = useState<string[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [activeTool, setActiveTool] = useState<string>("Pan");

	const tools = [
		{ name: "Pan", label: "Mover" },
		{ name: "Zoom", label: "Zoom" },
		{ name: "Wwwc", label: "Contraste" },
	];

	const handleToolChange = (toolName: string) => {
		setActiveTool(toolName);
		cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
	};

	useEffect(() => {
		const element = imageRef.current;
		if (!element) return;

		// Conectar dependencias externas
		cornerstoneWADOImageLoader.external.cornerstone = cornerstone as any;
		cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
		cornerstoneTools.external.cornerstone = cornerstone;
		cornerstoneTools.external.Hammer = Hammer;
		cornerstoneTools.external.cornerstoneMath = cornerstoneMath;

		// Inicializar web workers…
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
			if (!e.message?.includes("already initialized")) console.error(e);
		}

		// Inicialización de Cornerstone y herramientas
		cornerstoneTools.init({
			globalToolSyncEnabled: true,
			showSVGCursors: true,
		});
		cornerstone.enable(element);

		const ids = Array.from(
			{ length: MAX_INDEX + 1 },
			(_, i) => `wadouri:${BASE_URL}/${i.toString().padStart(1, "0")}.dcm`
		);
		setImageIds(ids);

		cornerstoneTools.addStackStateManager(element, ["stack"]);
		cornerstoneTools.addToolState(element, "stack", {
			imageIds: ids,
			currentImageIdIndex: 0,
		});

		cornerstoneTools.addTool(cornerstoneTools.PanTool);
		cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
		cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
		cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });

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

	useEffect(() => {
		const element = imageRef.current;
		if (!element || !imageLoaded) return;

		cornerstone
			.loadAndCacheImage(imageIds[currentIndex])
			.then((image) => cornerstone.displayImage(element, image))
			.catch((err) => console.error("Error al cambiar de imagen:", err));
	}, [currentIndex, imageIds, imageLoaded]);

	return (
		<div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden justify-center">
			{/* Visor DICOM */}
			<div
				ref={imageRef}
				className="flex-1 bg-black min-h-96"
			/>

			{/* Controles de herramientas */}
			<div className="flex flex-col p-4 bg-gray-800 border-t border-gray-700 w-full items-center">
				<div className="flex flex-wrap gap-2 mb-4">
					{tools.map((tool) => (
						<button
							key={tool.name}
							onClick={() => handleToolChange(tool.name)}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								activeTool === tool.name
									? "bg-blue-600 text-white"
									: "bg-gray-700 text-gray-300 hover:bg-gray-600"
							}`}
						>
							{tool.label}
						</button>
					))}
				</div>

				{/* Navegación con slider */}
				<div className="flex flex-col items-center gap-2 w-screen max-w-[900px] px-9">
					<input
						type="range"
						min={MIN_INDEX}
						max={MAX_INDEX}
						value={currentIndex}
						onChange={(e) => setCurrentIndex(Number(e.target.value))}
						className="w-full"
					/>
					<span className="text-gray-300 font-mono">
						{currentIndex.toString().padStart(1, "0")} / {MAX_INDEX}
					</span>
				</div>
			</div>
		</div>
	);
};

export default dynamic(() => Promise.resolve(DICOMViewerPaciente), {
	ssr: false,
});
