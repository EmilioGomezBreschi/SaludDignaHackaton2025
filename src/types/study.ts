export interface Study {
    folio: string;
    pacienteId: string;
    doctorNombre: string;
    fechaRegistro: string;
    tipoEstudio: string;
    dicoms: string[]; // Array de URLs o identificadores de las imágenes DICOM
    estado: 'pendiente' | 'completado' | 'cancelado';
}

export type TipoEstudio = 
    | 'Radiografía'
    | 'Tomografía'
    | 'Resonancia Magnética'
    | 'Ultrasonido'
    | 'Mamografía'; 