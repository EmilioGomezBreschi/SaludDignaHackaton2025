declare module 'cornerstone-wado-image-loader' {
  import * as cornerstone from 'cornerstone-core';
  import * as dicomParser from 'dicom-parser';

  interface WebWorkerManager {
    initialize(config: {
      maxWebWorkers: number;
      startWebWorkersOnDemand: boolean;
      webWorkerPath?: string;
      taskConfiguration: {
        decodeTask: {
          initializeCodecsOnStartup: boolean;
          usePDFJS: boolean;
          strict: boolean;
        };
      };
    }): void;
  }

  interface ImageLoader {
    registerImageLoader: (scheme: string, loader: any) => void;
  }

  const webWorkerManager: WebWorkerManager;
  const external: {
    cornerstone: typeof cornerstone;
    dicomParser: typeof dicomParser;
  };
  const imageLoader: ImageLoader;

  export { webWorkerManager, external, imageLoader };

    export function loadImage(arg0: string, loadImage: any) {
      throw new Error('Function not implemented.');
    }

  export function configure(arg0: { beforeSend: (xhr: any) => void; }) {
    throw new Error('Function not implemented.');
  }
}