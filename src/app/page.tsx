"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerPacientes, Paciente } from '@/services/api';

export default function Home() {
    const router = useRouter();
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const cargarPacientes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await obtenerPacientes();
            console.log('Pacientes obtenidos:', data);
            setPacientes(data);
        } catch (err: any) {
            console.error('Error al obtener pacientes:', err);
            setError(err.message || 'Error al cargar los pacientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarPacientes();
    }, []);

    const pacientesFiltrados = pacientes.filter(paciente =>
        paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.curp.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="pb-4 border-gray-200 border-b-2 flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-blue-600">expedientedigno</h1>
                <button
                    onClick={() => router.push('/new-patient')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <span>+</span>
                    Upload New Study
                </button>
            </div>
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-sm rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-black">Sistema de Gestión de Pacientes</h1>
                        <div className="space-x-4">
                            <button
                                onClick={cargarPacientes}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                            >
                                {loading ? 'Actualizando...' : 'Actualizar Lista'}
                            </button>
                        </div>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, apellido o CURP..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                            <svg
                                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                            <h2 className="font-semibold mb-2">Error:</h2>
                            <p>{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Cargando pacientes...</p>
                        </div>
                    ) : pacientes.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No hay pacientes registrados</p>
                            <button
                                onClick={() => router.push('/new-patient')}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Registrar Primer Paciente
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CURP</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sexo</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pacientesFiltrados.map((paciente, index) => (
                                        <tr 
                                            key={paciente.curp} 
                                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors cursor-pointer`}
                                            onClick={() => console.log('Paciente seleccionado:', paciente)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{paciente.curp}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.nombre}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.apellido}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.correo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.telefono}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.edad}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.sexo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {pacientesFiltrados.length === 0 && searchTerm && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No se encontraron pacientes que coincidan con la búsqueda</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
