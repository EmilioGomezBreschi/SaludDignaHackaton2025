// app/api/pacientes/[curp]/route.ts
import { NextResponse } from 'next/server';

const API_URL = 'http://hackaton-backend-hfa4c6cteaa9g4ae.canadacentral-01.azurewebsites.net';

export async function GET(_request: Request, { params }: { params: { curp: string } }) {
    const { curp } = params;

    try {
        const response = await fetch(`${API_URL}/paciente/api/v1/paciente/${curp}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error al obtener paciente con CURP ${curp}`);
        }

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        return NextResponse.json(
            { error: 'Error al obtener el paciente' },
            { status: 500 }
        );
    }
}
