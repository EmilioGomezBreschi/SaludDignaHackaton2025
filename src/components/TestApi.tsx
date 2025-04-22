"use client";

import { useState } from 'react';
import { crearPaciente, Paciente } from '../services/api';

export default function TestApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const paciente: Paciente = {
                curp: "KXVR611131MGRPTPJ5",
                nombre: "string",
                apellido: "string",
                correo: "user@example.com",
                telefono: "4740018938",
                edad: 120,
                sexo: "M"
            };

            const response = await crearPaciente(paciente);
            console.log('Respuesta de la API:', response);
            setSuccess(true);
        } catch (err) {
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Prueba de API</h2>
            
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {loading ? 'Enviando...' : 'Enviar Datos de Prueba'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    Error: {error}
                </div>
            )}

            {success && (
                <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
                    ¡Datos enviados exitosamente!
                </div>
            )}
        </div>
    );
} 