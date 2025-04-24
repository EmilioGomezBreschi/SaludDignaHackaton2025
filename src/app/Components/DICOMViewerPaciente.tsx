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
	"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSIsImtpZCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSJ9.eyJhdWQiOiJodHRwczovL2RpY29tLmhlYWx0aGNhcmVhcGlzLmF6dXJlLmNvbSIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2ZjMmI4MjM4LTkyODktNDI1Zi1iMWI3LWIyNzAwM2Q3MTFmMy8iLCJpYXQiOjE3NDU1MDM3ODEsIm5iZiI6MTc0NTUwMzc4MSwiZXhwIjoxNzQ1NTA5MzcwLCJhY3IiOiIxIiwiYWlvIjoiQVhRQWkvOFpBQUFBYllNc3BZS1RHalFOdW9JVDJIZ0VXVWFkZmkwenJuRk9KM3FMWXdHeEliUjVJdzQxL2x3Sk1CZExMTEdTait3bHVKbFYrYlBhNWRhUmR2anRrc25Vc0ZpMTVxYzc4cnYxU0RRN0NpaWVqdnMvTTdwWHJITzRFVXdQU0g3WEhnRXYwTjJ0bUtDUmF4WHExU3pGN3ZvMTlRPT0iLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcGlkIjoiMDRiMDc3OTUtOGRkYi00NjFhLWJiZWUtMDJmOWUxYmY3YjQ2IiwiYXBwaWRhY3IiOiIwIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMjgwNjozMTA6MTAyOjgyZGY6MzU5Nzo2OGIyOjFhMjQ6Y2U4OSIsIm5hbWUiOiJBbGRvICBHYXJkdW5vIEdvbWV6Iiwib2lkIjoiMGM1YWYwNzAtZmEzYi00N2M5LThjM2QtZjQwMGZiMjQwNWJlIiwicHVpZCI6IjEwMDMyMDA0NUM5NDdBQzAiLCJyaCI6IjEuQVFRQU9JSXJfSW1TWDBLeHQ3SndBOWNSODc4bDUzWE9adXBNbTVwY1RLcmxmek1FQUFRRUFBLiIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInNpZCI6IjAwNDBiYTY5LTRlMmItODIxMi1jODkyLTMyYTI2NDExMmEyNSIsInN1YiI6Im1ZdzB4c0JSX2dnSTlWQVRvay1FU1BOMFNZaFRCY2ZCUVFGZkg4YzRZREUiLCJ0aWQiOiJmYzJiODIzOC05Mjg5LTQyNWYtYjFiNy1iMjcwMDNkNzExZjMiLCJ1bmlxdWVfbmFtZSI6IkE4NTAzMTMyMzFAbXkudXZtLmVkdS5teCIsInVwbiI6IkE4NTAzMTMyMzFAbXkudXZtLmVkdS5teCIsInV0aSI6ImI3Y1hOaEJNbmstaUc1ZTNCYXdQQUEiLCJ2ZXIiOiIxLjAiLCJ4bXNfaWRyZWwiOiI4IDEifQ.K2Tr5Evf3s_bHVAk87z0RBFEgG2Yb3rSKuRmJU9EVT0TpCDNkB_OpGqpK4duezl-mIXlwEypPRdWvEIMd0B5uQb0tr25Q83aYuGATx0pPhGdW_EAM8XUnyWXrQOBNGGTTSmSL1IoLt2tn8XZlC9KI5Gxyw3w6zIhYPvHE9V6XCRt2Oa-zzK87ZhIToaiG8Kf_xMEqzYtyYUC4d20dd8lLZl2mWlDkgRiBRMU-cEE1H374uIA-KsXfFfwRDgDojz_idlU3l5hYVghvYXZQm4AKKxxj9sT1TVSzqWELndS58J7b_zwoqbCTSKcAbp6Ol0RldEvFyE_X87pP3ooJQfnlw";
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
