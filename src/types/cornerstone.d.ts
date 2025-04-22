declare module 'cornerstone-core' {
    export function enable(element: HTMLElement): void;
    export function disable(element: HTMLElement): void;
    export function loadImage(imageId: string): Promise<any>;
    export function displayImage(element: HTMLElement, image: any): void;
    export function fitToWindow(element: HTMLElement): void;
}

declare module 'cornerstone-tools' {
    export const WwwcTool: any;
    export const ZoomTool: any;
    export const PanTool: any;
    export function addTool(tool: any): void;
    export function setToolActive(toolName: string, options: { mouseButtonMask: number }): void;
}

declare module 'cornerstone-wado-image-loader' {
    export const wadouri: {
        dataSetCacheManager: {
            setMaxSize(size: number): void;
        };
    };
} 