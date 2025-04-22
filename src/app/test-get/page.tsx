"use client";

import { useState, useEffect } from 'react';
import { obtenerPacientes, Paciente } from '@/services/api';

export default function TestGet() {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-sm rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-black">Lista de Pacientes</h1>
                        <button
                            onClick={cargarPacientes}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                        >
                            {loading ? 'Cargando...' : 'Recargar'}
                        </button>
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
                                    {pacientes.map((paciente, index) => (
                                        <tr key={paciente.curp} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 