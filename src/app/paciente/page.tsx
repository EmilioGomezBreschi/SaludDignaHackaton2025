"use client";

import { useRef } from "react";
import DICOMViewerPaciente from "../Components/DICOMViewerPaciente";

export default function Home() {
	const viewerContainerRef = useRef<HTMLDivElement>(null);

	const handleShare = async () => {
		const container = viewerContainerRef.current;
		if (!container) return;

		const canvas = container.querySelector<HTMLCanvasElement>("canvas");
		if (!canvas) {
			console.error("Canvas no encontrado");
			return;
		}

		canvas.toBlob(
			async (blob) => {
				if (!blob) return;

				const file = new File([blob], `dicom_${Date.now()}.jpg`, {
					type: "image/jpeg",
				});

				// Usar Web Share API con archivos si está disponible
				if (navigator.canShare && navigator.canShare({ files: [file] })) {
					try {
						await navigator.share({
							files: [file],
							title: "Imagen DICOM",
							text: "Compartiendo imagen DICOM",
						});
					} catch (err) {
						console.error("Error compartiendo archivo:", err);
					}
				}
				// Fallback para compartir sin archivos o si API no soporta archivos
				else if (navigator.share) {
					try {
						await navigator.share({
							title: "Imagen DICOM",
							text: "No se pudo compartir el archivo directamente. Descarga manualmente.",
							url: window.location.href,
						});
					} catch (err) {
						console.error("Error compartiendo texto:", err);
					}
				}
				// Fallback final: descarga automática
				else {
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
			// Fallback: copiar al portapapeles
			try {
				await navigator.clipboard.writeText(shareData.url!);
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

			{/* Información del paciente */}
			<div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg w-full">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
					<div>
						<h2 className="text-gray-400 text-sm mb-1">Nombre del Paciente</h2>
						<p className="text-white text-lg">Juan Pérez</p>
					</div>
				</div>
			</div>

			{/* Área principal */}
			<div className="flex flex-col gap-4 w-full">
				{/* Visor DICOM con botón de compartir */}
				<div
					ref={viewerContainerRef}
					className="relative flex-1 w-full overflow-x-hidden"
				>
					<DICOMViewerPaciente />
				</div>
				<div className="flex justify-center gap-4 mb-4">
					<button
						onClick={handleShare}
						className=" bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
					>
						Compartir
					</button>
					<button
						onClick={handleShareLinkToDoctor}
						className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
					>
						Compartir a Doctor
					</button>
				</div>

				{/* Panel de interpretación */}
				<div className="w-full bg-gray-800 rounded-lg p-4">
					<h2 className="text-white text-lg font-semibold mb-4">
						Interpretación
					</h2>
					<p className="text-gray-300">
						Lorem ipsum dolor sit amet consectetur, adipisicing elit. Alias
						corrupti amet quod. Nisi exercitationem nostrum quasi cum deleniti
						vel reiciendis quod ab, deserunt vero? Dolore modi quisquam beatae
						possimus error!
					</p>
				</div>
			</div>
		</div>
	);
}
