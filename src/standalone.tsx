import React from 'react';
import { createRoot } from 'react-dom/client';
import DWTApp from './components/App';

const container = document.getElementById('root');
if (!container) throw new Error('[DWT-MFE] No #root element found');

const root = createRoot(container);
root.render(
  <DWTApp showHeader={true} scannedFileDetails={(res) => console.log("App Scanned file details:", res)}/>,
);
