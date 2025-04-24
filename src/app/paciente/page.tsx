import DICOMViewer from "../Components/DICOMViewer";

export default function Home() {
	return (
		<div className="flex flex-col min-h-screen bg-gray-900">
			{/* Header */}
			<header className="bg-gray-800 p-4 flex justify-between items-center">
				<h1 className="text-2xl font-bold text-blue-500">Expediente Digno</h1>
			</header>

			{/* Información del paciente */}
			<div className="bg-gray-800 m-4 p-6 rounded-lg shadow-lg">
				<div className="grid grid-cols-3 gap-8">
					<div>
						<h2 className="text-gray-400 text-sm mb-1">Nombre del Paciente</h2>
						<p className="text-white text-lg">Juan Pérez</p>
					</div>
					<div>
						<h2 className="text-gray-400 text-sm mb-1">Tipo de Estudio</h2>
						<p className="text-white text-lg">Radiografía de Tórax</p>
					</div>
				</div>
			</div>

			{/* Área principal */}
			<div className="flex flex-1 gap-4 m-4">
				{/* Visor DICOM */}
				<div className="flex-1">
					<DICOMViewer />
				</div>

				{/* Panel de anotaciones */}
				<div className="w-96 bg-gray-800 rounded-lg p-4">
					<h2 className="text-white text-lg font-semibold mb-4">Anotaciones</h2>
					<textarea
						className="w-full h-64 bg-gray-700 text-white rounded-lg p-3 resize-none"
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
	);
}
