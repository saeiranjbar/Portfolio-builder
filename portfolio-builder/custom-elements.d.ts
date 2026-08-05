// Custom element declarations for JSX (React 19: augment React.JSX, not global JSX)
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-player': {
        src?: string;
        background?: string;
        speed?: string;
        style?: React.CSSProperties;
        autoplay?: boolean;
        [key: string]: any;
      };
      'model-viewer': {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        style?: React.CSSProperties;
        [key: string]: any;
      };
    }
  }
}
