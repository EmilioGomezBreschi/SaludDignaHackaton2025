import { NextResponse } from 'next/server';

const API_URL = 'http://hackaton-backend-hfa4c6cteaa9g4ae.canadacentral-01.azurewebsites.net';

export async function GET() {
    try {
        const response = await fetch(`${API_URL}/paciente/api/v1/paciente/`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        return NextResponse.json(
            { error: 'Error al obtener los pacientes' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const response = await fetch(`${API_URL}/paciente/api/v1/paciente/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}

export async function OPTIONS(request: Request) {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}