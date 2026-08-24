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

function resolveRuntimeHost(): string {
  const configuredHost = process.env.REACT_APP_HOST;
  if (configuredHost) {
    return configuredHost;
  }

  if (typeof document !== 'undefined') {
    const candidateScripts = Array.from(document.scripts || [])
      .map((script) => script.src)
      .filter(Boolean) as string[];

    const preferredScript =
      (typeof document.currentScript !== 'undefined' && document.currentScript?.src) ||
      candidateScripts.find((src) => /remoteEntry|dwt[-_]?mfe/i.test(src)) ||
      candidateScripts.find((src) => /\/remoteEntry\.|\/dwt[_-]?mfe\./i.test(src)) ||
      candidateScripts[0];

    if (preferredScript) {
      try {
        const scriptUrl = new URL(preferredScript, window.location.href);
        const basePath = scriptUrl.pathname.replace(/\/[^/]*$/, '/');
        return `${scriptUrl.protocol}//${scriptUrl.host}${basePath}`.replace(/\/$/, '');
      } catch {
        // fall through to the browser location below
      }
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost:3000';
}

const host = process.env.REACT_APP_HOST || resolveRuntimeHost();
const dwtProductKey = process.env.REACT_APP_DWT_PRODUCT_KEY || '';
const uploadTargetURL = process.env.REACT_APP_UPLOAD_URL;
const defaultServiceInstallerLocation = 'https://demo.dynamsoft.com/DWT/Resources/dist/18.5.1/';

export const environment: DWTEnvironment = {
  Dynamsoft: {
    host,
    resourcesPath: `${host}/Resources`,
    dwtProductKey: 't01918AUAAFCB8JtAs5N6f30obndsGYcBze4BP/9CHULs3CYDFNKE8N/SWEbO1DqahVxRU/F1SyxehZ2Bh995LiWO46DXzzmvKycPcEp/p6C/kwY4+ZETmLamz7tt0rg4gCMwb4Dsx2EHSAN5LhXwsan3ylAA3AKkAUhrDtQCTldx/PiMOiD67Z0NXZ08wCn9nTogfZw0wMmPnCEgzsN8w2qXHBDSJ6cAuAXIKUD/H9khIKgBbgFyAHy4WAfzA8WHMSw=',
    serviceInstallerLocation: defaultServiceInstallerLocation,
    uploadTargetURL: uploadTargetURL || 'https://demo.dynamsoft.com/sample-uploads/',
  },
  debug: false,
};

export function getEffectiveDWTConfig(
  overrides: Partial<DWTEnvironment['Dynamsoft']> = {},
): DWTEnvironment['Dynamsoft'] {
  const base = { ...environment.Dynamsoft };
  const effectiveHost = overrides.host || base.host || resolveRuntimeHost();

  return {
    ...base,
    ...overrides,
    host: effectiveHost,
    resourcesPath: overrides.resourcesPath || `${effectiveHost}/Resources`,
    dwtProductKey:
      overrides.dwtProductKey || base.dwtProductKey || dwtProductKey,
    serviceInstallerLocation:
      overrides.serviceInstallerLocation ||
      base.serviceInstallerLocation ||
      defaultServiceInstallerLocation,
    uploadTargetURL:
      overrides.uploadTargetURL ||
      base.uploadTargetURL ||
      uploadTargetURL ||
      'https://demo.dynamsoft.com/sample-uploads/',
  };
}

// dwtProductKey: 't0081jAAAAE30THReaP1rN7/7MW+82mk3aHgsDX8AK0T2Gh3wlh2VYWwDFh648OlUQ9wIAPDfc3tqS5i/DHQb8GlB9Hz8uPbMzPg58HBZuwGy6xxn',
