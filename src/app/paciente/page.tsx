"use client";

import { useEffect, useRef, useState } from "react";
import DICOMViewerPaciente from "../Components/DICOMViewerPaciente";

interface Study {
	study_uid: string;
	folio: string;
	paciente: number;
	fecha: string;
	wado_url: string;
}

export default function Home() {
	const viewerContainerRef = useRef<HTMLDivElement>(null);
	const [studies, setStudies] = useState<Study[]>([]);
	const [selectedStudyUID, setSelectedStudyUID] = useState<string>("");

	// Fetch studies on mount
	useEffect(() => {
		async function fetchStudies() {
			try {
				const res = await fetch(
					"https://hackaton-backend-hfa4c6cteaa9g4ae.canadacentral-01.azurewebsites.net/estudio/api/v1/estudios/"
				);
				if (!res.ok) throw new Error("Error fetching studies");
				const data: Study[] = await res.json();
				setStudies(data);
				if (data.length) setSelectedStudyUID(data[0].study_uid);
			} catch (err) {
				console.error(err);
			}
		}
		fetchStudies();
	}, []);

	// Share image handler
	const handleShareImage = () => {
		const container = viewerContainerRef.current;
		if (!container) return;
		const canvas = container.querySelector<HTMLCanvasElement>("canvas");
		if (!canvas) return;
		canvas.toBlob(
			(blob) => {
				if (!blob) return;
				const file = new File([blob], `dicom_${Date.now()}.jpg`, {
					type: "image/jpeg",
				});
				if (navigator.canShare && navigator.canShare({ files: [file] })) {
					navigator
						.share({ files: [file], title: "Imagen DICOM" })
						.catch(console.error);
				} else if (navigator.share) {
					navigator
						.share({ title: "Imagen DICOM", url: window.location.href })
						.catch(console.error);
				} else {
					const url = URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.download = file.name;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(url);
				}
			},
			"image/jpeg",
			0.92
		);
	};

	// Share link to doctor handler
	const handleShareLinkToDoctor = async () => {
		const shareData: ShareData = {
			title: "Enlace para Doctor",
			url: "http://localhost:3000/Doctor",
		};
		if (navigator.share) {
			try {
				await navigator.share(shareData);
			} catch (err) {
				console.error("Error compartiendo enlace:", err);
			}
		} else {
			try {
				await navigator.clipboard.writeText(shareData.url ?? "");
				alert("Enlace copiado al portapapeles");
			} catch {
				console.error("Error copiando al portapapeles");
			}
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-gray-900 overflow-x-hidden w-full">
			{/* Header */}
			<header className="bg-gray-800 p-4 flex justify-between items-center w-full">
				<h1 className="text-2xl font-bold text-blue-500">Expediente Digno</h1>
			</header>

			{/* Patient Info */}
			<div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg w-full">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
					<div>
						<h2 className="text-gray-400 text-sm mb-1">Nombre del Paciente</h2>
						<p className="text-white text-lg">Juan Pérez</p>
					</div>
				</div>
			</div>

			{/* Study Selector */}
			<div className="bg-gray-800 p-4 m-4 rounded-lg">
				<label
					htmlFor="studySelect"
					className="text-gray-300 mr-2"
				>
					Selecciona estudio:
				</label>
				<select
					id="studySelect"
					value={selectedStudyUID}
					onChange={(e) => setSelectedStudyUID(e.target.value)}
					className="bg-gray-700 text-white px-2 py-1 rounded"
				>
					{studies.map((s) => (
						<option
							key={s.study_uid}
							value={s.study_uid}
						>
							{s.folio} — {new Date(s.fecha).toLocaleString()}
						</option>
					))}
				</select>
			</div>

			{/* Main Area */}
			<div
				className="flex flex-col gap-4 w-full m-4"
				ref={viewerContainerRef}
			>
				{/* DICOM Viewer Container */}
				{selectedStudyUID && (
					<DICOMViewerPaciente studyUID={selectedStudyUID} />
				)}

				{/* Action Buttons */}
				<div className="flex w-full justify-end p-5 gap-2">
					<button
						onClick={handleShareImage}
						className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
					>
						Compartir Imagen
					</button>
					<button
						onClick={handleShareLinkToDoctor}
						className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
					>
						Compartir a Doctor
					</button>
				</div>

				{/* Interpretation Panel */}
				<div className="w-full bg-gray-800 rounded-lg p-4">
					<h2 className="text-white text-lg font-semibold mb-4">
						Interpretación
					</h2>
					<p className="text-gray-300">{/* Interpretación aquí */}</p>
				</div>
			</div>
		</div>
	);
}
