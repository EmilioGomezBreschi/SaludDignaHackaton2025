"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
import cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";

const AZURE_AD_TOKEN =
	"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSIsImtpZCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSJ9.eyJhdWQiOiJodHRwczovL2RpY29tLmhlYWx0aGNhcmVhcGlzLmF6dXJlLmNvbSIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2ZjMmI4MjM4LTkyODktNDI1Zi1iMWI3LWIyNzAwM2Q3MTFmMy8iLCJpYXQiOjE3NDU0OTc5NDYsIm5iZiI6MTc0NTQ5Nzk0NiwiZXhwIjoxNzQ1NTAyNDY0LCJhY3IiOiIxIiwiYWlvIjoiQVhRQWkvOFpBQUFBS2tzL2lWSnpTYjVKM0NLc3daQis4L0lnU0lkNzBKc3ZoTXVWdWkyd3VRMWtESytvVUR5aGQweDBqY0NOZ1oxTWlJK29kQk5qQ2ROTkdtQlFyM0cxQ2EySnZPM3VQbklsbjVmeDdlVWZ4NVpDRERLT3dTaDhSRDJkQnZuYndnWERMdHlBSnA3d1lTaXNMMDlHQnBoa01RPT0iLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcGlkIjoiMDRiMDc3OTUtOGRkYi00NjFhLWJiZWUtMDJmOWUxYmY3YjQ2IiwiYXBwaWRhY3IiOiIwIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMjgwNjozMTA6MTAyOjgyZGY6MzU5Nzo2OGIyOjFhMjQ6Y2U4OSIsIm5hbWUiOiJBbGRvICBHYXJkdW5vIEdvbWV6Iiwib2lkIjoiMGM1YWYwNzAtZmEzYi00N2M5LThjM2QtZjQwMGZiMjQwNWJlIiwicHVpZCI6IjEwMDMyMDA0NUM5NDdBQzAiLCJyaCI6IjEuQVFRQU9JSXJfSW1TWDBLeHQ3SndBOWNSODc4bDUzWE9adXBNbTVwY1RLcmxmek1FQUFRRUFBLiIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInNpZCI6IjAwNDBiYTY5LTRlMmItODIxMi1jODkyLTMyYTI2NDExMmEyNSIsInN1YiI6Im1ZdzB4c0JSX2dnSTlWQVRvay1FU1BOMFNZaFRCY2ZCUVFGZkg4YzRZREUiLCJ0aWQiOiJmYzJiODIzOC05Mjg5LTQyNWYtYjFiNy1iMjcwMDNkNzExZjMiLCJ1bmlxdWVfbmFtZSI6IkE4NTAzMTMyMzFAbXkudXZtLmVkdS5teCIsInVwbiI6IkE4NTAzMTMyMzFAbXkudXZtLmVkdS5teCIsInV0aSI6ImpZQ2xOYzdoUWtDbjZld0k5UjEwQUEiLCJ2ZXIiOiIxLjAiLCJ4bXNfaWRyZWwiOiIxIDEwIn0.bP4HJvQBDJbkkmSTlucJN0U2GNymwAiILQ-19P9h0lrVXAOdkgIrryiJy7Oy8de_14O8d6F1CjRH97AE8BfTrllR-WXuhSonOXVm7qLv9AnQz_O0EwA4odtEllMHz9oge5th2lRiqqcquMVW5MecJNj2r_-vKzrrLcy1d6XWxruwkVsA0hbij1PcLkc9kB0EYpL9eXqk49vRCmJrIjAx_Vv3bCRn9fWmILKdVx9BdCibM08LnTlw9iA0gqKuNxJ8G9K5PVBCoJ7ZYjLsEQJ7Kyl8WqHJck4MCq8EQsgPY5QfhehLvTLqqLhiTkx10Rcv4BDRVy46SNnxdktzBUfocg";
interface Props {
	studyUID: string;
}

const tools = [
	{ name: "Pan", label: "Mover" },
	{ name: "Zoom", label: "Zoom" },
	{ name: "Wwwc", label: "Contraste" },
];

const DICOMViewerPaciente = ({ studyUID }: Props) => {
	const imageRef = useRef<HTMLDivElement>(null);
	const [imageIds, setImageIds] = useState<string[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [loaded, setLoaded] = useState(false);
	const [activeTool, setActiveTool] = useState<string>(tools[0].name);

	useEffect(() => {
		const element = imageRef.current;
		if (!element) return;

		// Bind external dependencies
		cornerstoneWADOImageLoader.external.cornerstone = cornerstone as any;
		cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
		cornerstoneTools.external.cornerstone = cornerstone;
		cornerstoneTools.external.Hammer = Hammer;
		cornerstoneTools.external.cornerstoneMath = cornerstoneMath;

		// 2) Inyecta Authorization header en cada petición WADO-RS
		cornerstoneWADOImageLoader.configure({
			beforeSend: (xhr: XMLHttpRequest) => {
				xhr.setRequestHeader("Authorization", `Bearer ${AZURE_AD_TOKEN}`);
				xhr.setRequestHeader("Accept", "application/dicom");
			},
		});

		// Initialize web workers
		try {
			cornerstoneWADOImageLoader.webWorkerManager.initialize({
				maxWebWorkers: navigator.hardwareConcurrency || 1,
				startWebWorkersOnDemand: true,
				taskConfiguration: {
					decodeTask: {
						strict: false,
						initializeCodecsOnStartup: true,
						usePDFJS: false,
					},
				},
			});
		} catch {}

		// Init Cornerstone and tools
		cornerstoneTools.init({
			globalToolSyncEnabled: true,
			showSVGCursors: true,
		});
		cornerstone.enable(element);

		// Carga la lista de instancias desde tu backend
		fetch(
			`https://hackaton-backend-hfa4c6cteaa9g4ae.canadacentral-01.azurewebsites.net/estudio/api/v1/estudios/${studyUID}/all-instances/`
		)
			.then((res) => {
				if (!res.ok) throw new Error("No se pudieron obtener instancias");
				return res.json();
			})
			.then((data: { wado_url: string }[]) => {
				// Mapea cada URL a un wadouri:<url>?<sas>
				console.log(data);
				const ids = data.map((item) => `wadouri:${item}`);
				console.log(ids);
				setImageIds(ids);

				cornerstoneTools.addStackStateManager(element, ["stack"]);
				cornerstoneTools.addToolState(element, "stack", {
					imageIds: ids,
					currentImageIdIndex: 0,
				});

				// Añade sólo UNA VEZ las herramientas al elemento
				cornerstoneTools.addTool(cornerstoneTools.PanTool);
				cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
				cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
				cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);

				cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
				cornerstoneTools.setToolActive("StackScrollMouseWheel", {});

				return cornerstone.loadAndCacheImage(ids[0]);
			})
			.then((image) => {
				cornerstone.displayImage(element, image);
				setLoaded(true);
			})
			.catch(console.error);

		return () => cornerstone.disable(element);
	}, [studyUID]);

	useEffect(() => {
		const element = imageRef.current;
		if (!element || !loaded) return;
		cornerstone
			.loadAndCacheImage(imageIds[currentIndex])
			.then((image) => cornerstone.displayImage(element, image))
			.catch(console.error);
	}, [currentIndex, imageIds, loaded]);

	const handleToolChange = useCallback((toolName: string) => {
		setActiveTool(toolName);
		cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
	}, []);

	return (
		<div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden">
			<div
				ref={imageRef}
				className="flex-1 bg-black min-h-[300px]"
			/>
			<div className="p-4 bg-gray-800 border-t border-gray-700 flex flex-col gap-4">
				<div className="flex flex-wrap gap-2">
					{tools.map((tool) => (
						<button
							key={tool.name}
							onClick={() => handleToolChange(tool.name)}
							className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
								activeTool === tool.name
									? "bg-blue-600 text-white"
									: "bg-gray-700 text-gray-300 hover:bg-gray-600"
							}`}
						>
							{tool.label}
						</button>
					))}
				</div>
				<div className="flex flex-col items-center w-full px-4">
					<input
						type="range"
						min={0}
						max={imageIds.length - 1}
						value={currentIndex}
						onChange={(e) => setCurrentIndex(Number(e.target.value))}
						className="w-full"
					/>
					<span className="text-gray-300 font-mono">
						{currentIndex.toString().padStart(3, "0")} / {imageIds.length - 1}
					</span>
				</div>
			</div>
		</div>
	);
};

export default dynamic(() => Promise.resolve(DICOMViewerPaciente), {
	ssr: false,
});
