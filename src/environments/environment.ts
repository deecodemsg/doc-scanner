export interface DWTEnvironment {
  Dynamsoft: {
    resourcesPath: string;
    dwtProductKey: string;
    serviceInstallerLocation: string;
    uploadTargetURL: string;
    host?: string;
  };
  debug: boolean;
}

/**
 * Get host URL - priority:
 * 1. REACT_APP_HOST env var (if set)
 * 2. window.location (auto-detect at runtime)
 * 3. Default fallback
 */
function getHostUrl(): string {
  // Check for env var set at build time
  const envHost = process.env.REACT_APP_HOST;
  if (envHost && envHost.trim() !== '') {
    return envHost;
  }

  // Auto-detect from window.location at runtime
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol; // http: or https:
    const hostname = window.location.hostname;  // localhost, example.com, etc.
    const port = window.location.port;          // 3000, 8080, etc. (empty if default)

    // Reconstruct URL from current location
    const portPart = port ? `:${port}` : '';
    return `${protocol}//${hostname}${portPart}`;
  }

  // Fallback for SSR or initial load
  return 'http://localhost:3000';
}

const host = getHostUrl();
const dwtProductKey = process.env.REACT_APP_DWT_PRODUCT_KEY;
const uploadTargetURL = process.env.REACT_APP_UPLOAD_URL;

export const environment: DWTEnvironment = {
  Dynamsoft: {
    host: host,
    resourcesPath: `${host}/Resources`,
    dwtProductKey: dwtProductKey || '',
    serviceInstallerLocation: 'https://demo.dynamsoft.com/DWT/Resources/dist/19.4/',
    uploadTargetURL: uploadTargetURL || `${host}/api/upload`,
  },
  debug: false,
};
