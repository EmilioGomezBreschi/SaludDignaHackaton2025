"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const DICOMViewerPaciente = dynamic(
	() => import("../../Components/DICOMViewerPaciente"),
	{ ssr: false }
);

interface Study {
	study_uid: string;
	folio: string;
	paciente: number;
	fecha: string;
	wado_url: string;
}

export default function StudyPage() {
	const params = useParams();
	const [study, setStudy] = useState<Study | null>(null);

	// Buscar el estudio específico
	useEffect(() => {
		async function fetchStudy() {
			try {
				const res = await fetch(
					`https://hackaton-backend-hfa4c6cteaa9g4ae.canadacentral-01.azurewebsites.net/estudio/api/v1/estudios/${params.study_uid}`
				);
				if (!res.ok) throw new Error("Estudio no encontrado");
				const data: Study = await res.json();
				setStudy(data);
			} catch (err) {
				console.error(err);
			}
		}
		fetchStudy();
	}, [params.study_uid]);

	if (!study) return <div className="text-white p-4">Cargando estudio...</div>;

	return (
		<div className="flex flex-col min-h-screen bg-gray-900 overflow-x-hidden w-full">
			<header className="bg-gray-800 p-4 flex justify-between items-center w-full">
				<h1 className="text-2xl font-bold text-blue-500">Expediente Digno</h1>
			</header>

			<div className="m-4 flex-1">
				<DICOMViewerPaciente studyUID={study.study_uid} />
			</div>
		</div>
	);
}
