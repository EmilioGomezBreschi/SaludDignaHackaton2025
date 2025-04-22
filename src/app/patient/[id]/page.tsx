"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import DicomViewer from '@/components/DicomViewer';

interface Patient {
    id: string;
    curp: string;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    edad: number;
    sexo: string;
}

interface MedicalRecord {
    id: string;
    patientId: string;
    date: string;
    studyType: string;
    description: string;
    dicomUrl?: string;
}

export default function PatientProfile({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [newRecord, setNewRecord] = useState({
        studyType: '',
        description: '',
        dicomFile: null as File | null
    });
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

    const resolvedParams = use(params);
    const patientId = resolvedParams.id;

    useEffect(() => {
        const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
        const foundPatient = storedPatients.find((p: Patient) => p.id === patientId);
        setPatient(foundPatient);

        const storedRecords = JSON.parse(localStorage.getItem('medicalRecords') || '[]');
        const patientRecords = storedRecords.filter((r: MedicalRecord) => r.patientId === patientId);
        setMedicalRecords(patientRecords);
    }, [patientId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewRecord(prev => ({ ...prev, dicomFile: e.target.files![0] }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newMedicalRecord: MedicalRecord = {
            id: Date.now().toString(),
            patientId: patientId,
            date: new Date().toISOString(),
            studyType: newRecord.studyType,
            description: newRecord.description,
            dicomUrl: newRecord.dicomFile ? URL.createObjectURL(newRecord.dicomFile) : undefined
        };

        const storedRecords = JSON.parse(localStorage.getItem('medicalRecords') || '[]');
        localStorage.setItem('medicalRecords', JSON.stringify([...storedRecords, newMedicalRecord]));
        
        setMedicalRecords(prev => [...prev, newMedicalRecord]);
        setNewRecord({ studyType: '', description: '', dicomFile: null });
    };

    if (!patient) {
        return <div>Cargando...</div>;
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-8">
                    <button 
                        onClick={() => router.push('/')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Volver
                    </button>
                    <h1 className="text-2xl font-bold text-black">Perfil del Paciente</h1>
                </div>

                {/* Información del paciente */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-black">Datos Personales</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-black font-bold">Nombre completo</p>
                            <p className="font-medium text-black">{patient.nombre} {patient.apellido}</p>
                        </div>
                        <div>
                            <p className="text-black font-bold">CURP</p>
                            <p className="font-medium text-black">{patient.curp}</p>
                        </div>
                        <div>
                            <p className="text-black font-bold">Correo</p>
                            <p className="font-medium text-black">{patient.correo}</p>
                        </div>
                        <div>
                            <p className="text-black font-bold">Teléfono</p>
                            <p className="font-medium text-black">{patient.telefono}</p>
                        </div>
                        <div>
                            <p className="text-black font-bold">Edad</p>
                            <p className="font-medium text-black">{patient.edad} años</p>
                        </div>
                        <div>
                            <p className="text-black font-bold">Sexo</p>
                            <p className="font-medium text-black">{patient.sexo}</p>
                        </div>
                    </div>
                </div>

                {/* Formulario para nuevo estudio */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-black">Nuevo Estudio</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-black">
                                Tipo de Estudio
                            </label>
                            <select
                                value={newRecord.studyType}
                                onChange={(e) => setNewRecord(prev => ({ ...prev, studyType: e.target.value }))}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                            >
                                <option value="">Seleccione un tipo</option>
                                <option value="Radiografía">Radiografía</option>
                                <option value="Tomografía">Tomografía</option>
                                <option value="Resonancia Magnética">Resonancia Magnética</option>
                                <option value="Ultrasonido">Ultrasonido</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-black">
                                Descripción del Padecimiento
                            </label>
                            <textarea
                                value={newRecord.description}
                                onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                                required
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-black">
                                Archivo DICOM
                            </label>
                            <input
                                type="file"
                                accept=".dcm"
                                onChange={handleFileChange}
                                required
                                className="mt-1 block w-full text-sm text-black
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            Guardar Estudio
                        </button>
                    </form>
                </div>

                {/* Historial de estudios y visor DICOM */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Historial de estudios */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-black">Historial de Estudios</h2>
                        <div className="space-y-4">
                            {medicalRecords.map((record) => (
                                <div 
                                    key={record.id} 
                                    className={`border rounded-lg p-4 cursor-pointer ${selectedRecord?.id === record.id ? 'border-blue-500 bg-blue-50' : ''}`}
                                    onClick={() => setSelectedRecord(record)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-black">{record.studyType}</p>
                                            <p className="text-sm text-black">
                                                {new Date(record.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-black">{record.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visor DICOM */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-black">Visor DICOM</h2>
                        {selectedRecord?.dicomUrl ? (
                            <DicomViewer dicomUrl={selectedRecord.dicomUrl} />
                        ) : (
                            <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-lg">
                                <p className="text-black">Seleccione un estudio para ver la imagen DICOM</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
} 