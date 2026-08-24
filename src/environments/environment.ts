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

const host = process.env.REACT_APP_HOST;
const dwtProductKey = process.env.REACT_APP_DWT_PRODUCT_KEY;
const uploadTargetURL = process.env.REACT_APP_UPLOAD_URL;

export const environment: DWTEnvironment = {
  Dynamsoft: {
    host: host || 'http://localhost:3000',
    resourcesPath: host+'/Resources',
    dwtProductKey: dwtProductKey || '',
    serviceInstallerLocation: 'https://demo.dynamsoft.com/DWT/Resources/dist/19.4/',
    uploadTargetURL: uploadTargetURL || 'https://demo.dynamsoft.com/sample-uploads/',
  },
  debug: false,
};

// dwtProductKey: 't0081jAAAAE30THReaP1rN7/7MW+82mk3aHgsDX8AK0T2Gh3wlh2VYWwDFh648OlUQ9wIAPDfc3tqS5i/DHQb8GlB9Hz8uPbMzPg58HBZuwGy6xxn',
