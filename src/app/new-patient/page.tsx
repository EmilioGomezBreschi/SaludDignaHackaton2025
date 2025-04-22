"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearPaciente, Paciente } from "../../services/api";

export default function NewPatient() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		curp: "",
		nombre: "",
		apellido: "",
		correo: "",
		telefono: "",
		edad: "",
		sexo: "Masculino",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// Validar el formato de CURP (18 caracteres, mayúsculas)
			if (formData.curp.length !== 18) {
				throw new Error("El CURP debe tener 18 caracteres");
			}

			// Validar el formato del teléfono (10 dígitos)
			if (!/^\d{10}$/.test(formData.telefono)) {
				throw new Error("El teléfono debe tener 10 dígitos");
			}

			// Convertir los datos del formulario al formato esperado por la API
			const paciente: Paciente = {
				curp: formData.curp.toUpperCase(),
				nombre: formData.nombre,
				apellido: formData.apellido,
				correo: formData.correo,
				telefono: formData.telefono,
				edad: parseInt(formData.edad),
				sexo: formData.sexo === "Masculino" ? "M" : "F",
			};

			// Enviar datos a la API
			const response = await crearPaciente(paciente);
			console.log("Paciente creado:", response);

			// Redirigir a la página principal
			router.push("/");
		} catch (err: any) {
			console.error("Error al crear paciente:", err);
			setError(
				err.message ||
					"Error al guardar el paciente. Por favor, intente nuevamente."
			);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<main className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-6">
				<div className="max-w-2xl mx-auto">
					<h1 className="text-2xl font-bold text-black mb-6">Nuevo Paciente</h1>

					{error && (
						<div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
							{error}
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="bg-white p-6 rounded-lg shadow-md"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* CURP */}
							<div className="space-y-2">
								<label className="block text-sm font-bold text-black">
									CURP
								</label>
								<input
									type="text"
									name="curp"
									value={formData.curp}
									onChange={handleChange}
									required
									maxLength={18}
									pattern="^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$"
									title="CURP válido con formato correcto"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black uppercase"
								/>
							</div>

							{/* Nombre */}
							<div className="space-y-2">
								<label className="block text-sm font-bold text-black">
									Nombre
								</label>
								<input
									type="text"
									name="nombre"
									value={formData.nombre}
									onChange={handleChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
								/>
							</div>

							{/* Apellido */}
							<div className="space-y-2">
								<label className="block text-sm font-bold text-black">
									Apellido
								</label>
								<input
									type="text"
									name="apellido"
									value={formData.apellido}
									onChange={handleChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
								/>
							</div>

							{/* Correo */}
							<div className="space-y-2">
								<label className="block text-sm font-bold text-black">
									Correo
								</label>
								<input
									type="email"
									name="correo"
									value={formData.correo}
									onChange={handleChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
								/>
							</div>

							{/* Teléfono */}
							<div className="space-y-2">
								<label className="block text-sm font-bold text-black">
									Teléfono
								</label>
								<input
									type="tel"
									name="telefono"
									value={formData.telefono}
									onChange={handleChange}
									required
									pattern="^\d{10}$"
									title="Número de teléfono de 10 dígitos"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
								/>
							</div>

							{/* Edad */}
							<div className="space-y-2">
								<label className="block text-sm font-bold text-black">
									Edad
								</label>
								<input
									type="number"
									name="edad"
									value={formData.edad}
									onChange={handleChange}
									required
									min="0"
									max="120"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
								/>
							</div>

							{/* Sexo */}
							<div className="space-y-2">
								<label className="block text-sm font-bold text-black">
									Sexo
								</label>
								<select
									name="sexo"
									value={formData.sexo}
									onChange={handleChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
								>
									<option value="Masculino">Masculino</option>
									<option value="Femenino">Femenino</option>
								</select>
							</div>
						</div>

						<div className="mt-6 flex justify-end gap-4">
							<button
								type="button"
								onClick={() => router.push("/")}
								className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
								disabled={loading}
							>
								Cancelar
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
								disabled={loading}
							>
								{loading ? "Guardando..." : "Guardar Paciente"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</main>
	);
}
