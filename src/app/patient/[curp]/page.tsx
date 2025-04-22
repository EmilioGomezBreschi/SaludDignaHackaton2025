"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Paciente, obtenerPacientePorCurp } from '@/services/api';
import { use } from 'react';
import DicomViewer from '@/components/DicomViewer';

export default function PatientDetails({ params }: { params: { curp: string } }) {
    const router = useRouter();
    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchPaciente = async () => {
            try {
                
                setLoading(true);
                setError(null);
                const data = await obtenerPacientePorCurp(params.curp);
                setPaciente(data);
            } catch (err: any) {
                console.error('Error al cargar paciente:', err);
                setError(err.message || 'Error al cargar los datos del paciente');
            } finally {
                setLoading(false);
            }
        };

        fetchPaciente();
    }, [params.curp]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg shadow-sm max-w-md w-full">
                <h2 className="font-semibold mb-2">Error:</h2>
                <p>{error}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                    Volver
                </button>
            </div>
        </div>
    );
    
    if (!paciente) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-gray-500 mb-4">Paciente no encontrado</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Volver a la lista
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Detalles del Paciente
                        </h1>
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Volver
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">CURP</label>
                                <p className="mt-1 text-gray-900">{paciente.curp}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Nombre</label>
                                <p className="mt-1 text-gray-900">{paciente.nombre}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Apellido</label>
                                <p className="mt-1 text-gray-900">{paciente.apellido}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Correo</label>
                                <p className="mt-1 text-gray-900">{paciente.correo}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                                <p className="mt-1 text-gray-900">{paciente.telefono}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Edad</label>
                                <p className="mt-1 text-gray-900">{paciente.edad} años</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Sexo</label>
                                <p className="mt-1 text-gray-900">{paciente.sexo}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Registro de Estudio</h2>
                    
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Tipo de Estudio
                                </label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black">
                                    <option value="">Seleccionar tipo de estudio</option>
                                    <option value="radiografia">Radiografía</option>
                                    <option value="tomografia">Tomografía</option>
                                    <option value="resonancia">Resonancia Magnética</option>
                                    <option value="ultrasonido">Ultrasonido</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Fecha del Estudio
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Anotaciones del Estudio
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                                placeholder="Ingrese las observaciones y anotaciones del estudio..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Archivo DICOM
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-black">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                        >
                                            <span>Subir archivo</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                        </label>
                                        <p className="pl-1">o arrastrar y soltar</p>
                                    </div>
                                    <p className="text-xs text-black">DICOM hasta 10MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Guardar Estudio
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <h2 className="text-2xl font-semibold text-black mb-6">Historial de Imagenología</h2>
                    
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-medium text-black">Radiografía de Tórax</h3>
                                        <p className="text-sm text-black">Fecha: 15/03/2024</p>
                                    </div>
                                    <button className="text-blue-600 hover:text-blue-800">Ver Imagen</button>
                                </div>
                                <p className="mt-2 text-sm text-black">
                                    Estudio de rutina. No se observan hallazgos significativos.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <h2 className="text-2xl font-semibold text-black mb-6">Visualizador DICOM</h2>
                    <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
                        <DicomViewer dicomUrl="https://example.com/dicom.dcm" />
                    </div>
                </div>
            </div>
        </div>
    );
}