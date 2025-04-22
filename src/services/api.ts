export interface Paciente {
    curp: string;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    edad: number;
    sexo: 'M' | 'F';
}

export const obtenerPacientes = async () => {
    try {
        const response = await fetch('/api/pacientes');

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`Error ${response.status}: ${errorData?.error || response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        throw error;
    }
};

export const crearPaciente = async (paciente: Paciente) => {
    try {
        const response = await fetch('/api/pacientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paciente)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`Error ${response.status}: ${errorData?.error || response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error detallado:', error);
        throw error;
    }
};