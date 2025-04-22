import DICOMViewer from "../Components/DICOMViewer";

export default function Home() {
	return (
		<div className="flex flex-col min-h-0 h-screen py-6">
			{/* Encabezado */}
			<div className="pb-4 dark:border-gray-200 border-gray-700 border-b-2 flex justify-between items-center mb-2">
				<h1 className="text-2xl font-bold text-blue-600 px-6">
					expedientedigno
				</h1>
			</div>

			{/* Contenido */}
			<div className="flex flex-col px-12 text-white">
				<div className="flex flex-col items-start space-x-4">
					<h2 className="text-xl font-semibold">Nombre</h2>
					<p className="text-lg font-extralight">Descripción del paciente</p>
				</div>
			</div>

			{/* Sección principal */}
			<main className="flex flex-row items-start gap-8 grow px-3 py-1">
        <div className="flex flex-col items-start justify-start h-full w-3/4 p-4 bg-gray-900">
          <DICOMViewer/>
					<div className="flex flex-row space-x-3 items-end justify-end w-full rounded-lg mt-2">
						<button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out">
							Zoom +
						</button>
						<button className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300 ease-in-out">
							Zoom -
						</button>
					</div>
				</div>
				<div className="flex flex-col items-start justify-start w-1/4 bg-gray-800 h-full rounded-lg p-4">
					<h2 className="text-xl font-semibold mb-2">Datos del paciente</h2>
					<p className="text-lg font-extralight mb-4">
						Fecha de nacimiento: <span className="font-bold">01/01/2000</span>
					</p>
					<h3 className="text-lg font-semibold">Historial</h3>
					<div className="flex flex-col">
						<ul className="list-disc list-inside text-gray-300">
							<li className="text-gray-400">Consulta 1</li>
							<li className="text-gray-400">Consulta 2</li>
							<li className="text-gray-400">Consulta 3</li>
							<li className="text-gray-400">Consulta 4</li>
						</ul>
					</div>
				</div>
			</main>
			<footer className="flex items-end justify-end mt-2 text-white rounded-lg space-x-4 px-4">
				<button className="bg-blue-600 text-white font-semibold py-1.5 px-4 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out">
					Descargar DICOM
				</button>
				<button className="bg-red-600 text-white font-semibold py-1.5 px-4 rounded-lg hover:bg-red-700 transition duration-300 ease-in-out">
					Compartir enlace
				</button>
			</footer>
		</div>
	);
}
