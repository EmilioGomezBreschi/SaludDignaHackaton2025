"use client";

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';

const DicomViewerComponent = dynamic(() => import('./DicomViewerComponent'), {
    ssr: false
});

interface DicomViewerProps {
    dicomUrl: string;
}

export default function DicomViewer({ dicomUrl }: DicomViewerProps) {
    return <DicomViewerComponent dicomUrl={dicomUrl} />;
} 