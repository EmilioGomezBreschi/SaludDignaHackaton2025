import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { curp: string } }
) {
    try {
        // Por ahora, simularemos la obtención de datos
        // Aquí iría la lógica para obtener los estudios de la base de datos
        const estudios = [
            {
                folio: "EST001",
                pacienteId: params.curp,
                doctorNombre: "Dr. García",
                fechaRegistro: "2024-03-20",
                tipoEstudio: "Radiografía",
                dicoms: ["dicom1.dcm", "dicom2.dcm"],
                estado: "completado"
            }
        ];

        return NextResponse.json(estudios);
    } catch (error: any) {
        console.error('Error al obtener estudios:', error);
        return NextResponse.json(
            { error: 'Error al obtener los estudios' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { curp: string } }
) {
    try {
        const body = await request.json();
        
        // Aquí iría la lógica para guardar el estudio en la base de datos
        const nuevoEstudio = {
            ...body,
            estado: 'pendiente' as const
        };

        return NextResponse.json(nuevoEstudio);
    } catch (error: any) {
        console.error('Error al crear estudio:', error);
        return NextResponse.json(
            { error: 'Error al crear el estudio' },
            { status: 500 }
        );
    }
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
} 