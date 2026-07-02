import type { WebTwain } from 'dwt/dist/types/WebTwain';
import type { DeviceConfiguration, ScanSetup } from 'dwt/dist/types/WebTwain.Acquire';
import { Subject } from 'rxjs';
import Dynamsoft from 'dwt';
import { environment } from '../../environments/environment';
import { browserInfo } from './common';

export interface Device {
  deviceId: string;
  name: string;
  label: string;
  deviceInfo: any;
}

export class DwtService {
  public bufferSubject: Subject<string> = new Subject<string>();
  public generalSubject: Subject<any> = new Subject<any>();

  protected _dwtObject?: WebTwain;
  protected _devices: Device[] = [];
  protected _selectedDevice: string = '';
  protected _fileSavingPath = '';
  protected _fileActualName = '';
  protected _beforeSaveIndex: number = -1;
  protected _containerId: string;

  constructor(containerId: string) {
    this._containerId = containerId;
  }

  init(onReady: (dwtInstance: WebTwain) => void, onError: (err: any) => void): void {
    Dynamsoft.DWT.ResourcesPath = environment.Dynamsoft.resourcesPath;
    Dynamsoft.DWT.ProductKey = environment.Dynamsoft.dwtProductKey;
    Dynamsoft.DWT.ServiceInstallerLocation = environment.Dynamsoft.serviceInstallerLocation;

    Dynamsoft.DWT.CreateDWTObjectEx(
      { WebTwainId: this._containerId },
      (dwtInstance: WebTwain) => {
        this._dwtObject = dwtInstance;
        this._dwtObject.Addon.PDF.SetReaderOptions({
          convertMode: Dynamsoft.DWT.EnumDWT_ConvertMode.CM_RENDERALL,
          renderOptions: { renderAnnotations: true, resolution: 200 },
          preserveUnmodifiedOnSave: true,
        });
        onReady(dwtInstance);
      },
      (err: any) => onError(err),
    );
  }

  destroy(): void {
    this._dwtObject?.dispose();
  }

  getDevices(): Promise<Device[]> {
    return new Promise((res, rej) => {
      this._devices = [];
      this._dwtObject?.GetDevicesAsync().then((devicesList) => {
        for (const dev of devicesList) {
          this._devices.push({
            deviceId: Math.floor(Math.random() * 100000).toString(),
            name: dev.displayName,
            label: dev.displayName,
            deviceInfo: dev,
          });
        }
        res(this._devices);
      }).catch((exp: any) => rej(exp.message));
    });
  }

  getDeviceDetails(): string[] | undefined {
    return this._dwtObject?.GetSourceNames(true) as unknown as string[];
  }

  selectADevice(name: string): Promise<boolean> {
    return new Promise((res, rej) => {
      if (this._devices.length === 0) { rej(false); return; }
      if (this._selectedDevice !== '' && this._selectedDevice === name) { res(true); return; }

      let waitForAnotherPromise = false;
      this._devices.forEach((value, index) => {
        if (value && value.name === name) {
          const _scannersCount = this._devices.length;
          waitForAnotherPromise = true;
          if (index <= _scannersCount - 1) {
            this._dwtObject?.SelectDeviceAsync(value.deviceInfo).then(() => {
              this._selectedDevice = name;
              this.generalSubject.next({ type: 'deviceName', deviceName: this._selectedDevice });
              res(true);
            }).catch((exp: any) => rej(exp.message));
          }
        }
      });

      if (!waitForAnotherPromise) {
        if (this._selectedDevice !== '') {
          this.generalSubject.next({ type: 'deviceName', deviceName: this._selectedDevice });
          res(true);
        } else {
          res(false);
        }
      }
    });
  }

  acquire(config?: DeviceConfiguration | ScanSetup, bAdvanced?: boolean): Promise<any> {
    return new Promise((res, rej) => {
      if (this._selectedDevice !== '') {
        this._dwtObject?.SetOpenSourceTimeout(3000);
        if (bAdvanced) {
          if (this._dwtObject?.OpenSource()) {
            this._dwtObject?.startScan(config as ScanSetup);
          } else {
            rej(this._dwtObject?.ErrorString);
          }
        } else {
          this._dwtObject?.AcquireImageAsync(config as DeviceConfiguration)
            .then(() => this._dwtObject?.CloseSourceAsync())
            .then(() => {
              this._dwtObject?.CloseWorkingProcess();
              res(true);
            })
            .catch((exp: any) => rej(exp.message));
        }
      } else {
        rej('Please select a device first!');
      }
    });
  }

  load(): Promise<any> {
    return new Promise((res, rej) => {
      if (!this._dwtObject) return rej({ code: -1, message: 'invalid operation' });

      this._dwtObject.IfShowFileDialog = true;
      this._dwtObject.RegisterEvent('OnPostLoad', (_dir: string, _fn: string, _ft: number) => {});
      this._dwtObject.LoadImageEx(
        '',
        Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL,
        () => res(true),
        (errCode: number, errStr: string) => rej({ code: errCode, message: errStr }),
      );
    });
  }

  getBlob(indices: number[], type: number, dwt?: WebTwain): Promise<any> {
    return new Promise((res, rej) => {
      const _dwt = dwt ?? this._dwtObject;
      if (type === Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL) { rej('Must specify an image type!'); return; }
      if (!_dwt) { rej('invalid operation'); return; }

      _dwt.ConvertToBlob(indices, type, (result: any) => res(result), (errCode: number, errString: string) => rej(errString));
    });
  }

  getBase64(indices: number[], type: number, dwt?: WebTwain): Promise<string> {
    return new Promise((res, rej) => {
      const _dwt = dwt ?? this._dwtObject;
      if (type === Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL) { rej('Must specify an image type!'); return; }
      if (!_dwt) { rej('invalid operation'); return; }

      _dwt.ConvertToBase64(indices, type, (result: any, _indices: number[], _type: number) => {
        const _result = result.getData(0, result.getLength());
        const prefixes: Record<number, string> = {
          [Dynamsoft.DWT.EnumDWT_ImageType.IT_BMP]: 'data:image/bmp;base64,',
          [Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG]: 'data:image/jpeg;base64,',
          [Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF]: 'data:image/tiff;base64,',
          [Dynamsoft.DWT.EnumDWT_ImageType.IT_MULTIPAGE_TIF]: 'data:image/tiff;base64,',
          [Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG]: 'data:image/png;base64,',
          [Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF]: 'data:application/pdf;base64,',
          [Dynamsoft.DWT.EnumDWT_ImageType.IT_MULTIPAGE_PDF]: 'data:application/pdf;base64,',
        };
        const prefix = prefixes[_type];
        if (prefix) res(prefix + _result);
        else rej('Wrong image type!');
      }, (errCode: number, errString: string) => rej(errString));
    });
  }

  getExtension(type: number): string {
    const map: Record<number, string> = {
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_BMP]: '.bmp',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG]: '.jpg',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG]: '.png',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF]: '.pdf',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_MULTIPAGE_PDF]: '.pdf',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF]: '.tif',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_MULTIPAGE_TIF]: '.tif',
    };
    return map[type] ?? '.unknown';
  }

  saveLocally(indices: number[], type: number, fileNameWithoutExt: string, showDialog: boolean): Promise<any> {
    return new Promise((res, rej) => {
      if (!this._dwtObject) { rej('invalid operation'); return; }

      const saveInner = (_path: string, _name: string, _type: number): Promise<any> =>
        new Promise((resInner, rejInner) => {
          const s = () => {
            if (showDialog) {
              _name = this._fileActualName;
              _path = `${this._fileSavingPath}/${_name}`;
            }
            resInner({ name: _name, path: _path });
          };
          const f = (errCode: number, errStr: string) => rejInner({ code: errCode, message: errStr });

          switch (_type) {
            case Dynamsoft.DWT.EnumDWT_ImageType.IT_BMP: this._dwtObject?.SaveAsBMP(_path, indices[0], s, f); break;
            case Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG: this._dwtObject?.SaveAsJPEG(_path, indices[0], s, f); break;
            case Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF: this._dwtObject?.SaveAsTIFF(_path, indices[0], s, f); break;
            case Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG: this._dwtObject?.SaveAsPNG(_path, indices[0], s, f); break;
            case Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF: this._dwtObject?.SaveAsPDF(_path, indices[0], s, f); break;
            case Dynamsoft.DWT.EnumDWT_ImageType.IT_MULTIPAGE_PDF: this._dwtObject?.SaveAllAsPDF(_path, s, f); break;
            case Dynamsoft.DWT.EnumDWT_ImageType.IT_MULTIPAGE_TIF: this._dwtObject?.SaveAllAsMultiPageTIFF(_path, s, f); break;
          }
        });

      const fileName = fileNameWithoutExt + this.getExtension(type);
      const filePath = `${this._fileSavingPath}/${fileName}`;

      if (showDialog) {
        this._fileSavingPath = "";
        this._fileActualName = '';
        this._dwtObject.IfShowFileDialog = false;
        Dynamsoft.Lib.showMask();
        this._dwtObject.RegisterEvent('OnGetFilePath', (isSave: boolean, filesCount: number, _index: number, directory: string, _fn: string) => {
          Dynamsoft.Lib.hideMask();
          if (directory === '' && _fn === '') { rej('User cancelled the operation.'); return; }
          if (isSave && filesCount !== -1) {
            this._fileActualName = _fn;
            this._fileSavingPath = directory;
            res(saveInner(`${this._fileSavingPath}/${this._fileActualName}`, this._fileActualName, type));
          }
        });
        this._dwtObject.ShowFileDialog(true, getDialogFilter(type), 0, '', fileName, true, false, 0);
      } else {
        this._dwtObject.IfShowFileDialog = false;
        res(saveInner(filePath, fileName, type));
      }
    });
  }

  uploadToServer(indices: number[], type: number, fileName: string, customInfo: string, folderLocation?: string): Promise<any> {
  return new Promise((res, rej) => {
    const tmp = fileName.replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
    const _fileName = tmp + this.getExtension(type);
    const url = 'http://localhost:3017/fs-upload?loc='+folderLocation;

    this._dwtObject?.SetHTTPFormField('CustomInfo', customInfo);
    
    this._dwtObject?.HTTPUpload(
      url, indices, type,
      Dynamsoft.DWT.EnumDWT_UploadDataFormat.Binary,
      _fileName,
      // SUCCESS CALLBACK
      (responseStr: string) => {
        try {
          // Parse the JSON response from your Node.js API
          const data = JSON.parse(responseStr);
          res(data); 
        } catch (e) {
          res({ name: _fileName, rawResponse: responseStr });
        }
      },
      // ERROR CALLBACK
      (errCode: number, errString: string, responseStr: string) => {
        if (errCode === 0 || errCode === -2003) {
            // Even on these codes, check if there is data
            try {
                const data = JSON.parse(responseStr);
                res(data);
            } catch {
                res({ name: _fileName });
            }
        } else {
          if (responseStr !== '') this.generalSubject.next({ type: 'uploadError', responsString: responseStr });
          rej({ code: errCode, message: errString });
        }
      },
    );
  });
}
}

function getDialogFilter(type: number): string {
  if (browserInfo.bMac) {
    const map: Record<number, string> = {
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_BMP]: 'BMP',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG]: 'JPG,JPEG',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG]: 'PNG',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF]: 'PDF',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_MULTIPAGE_PDF]: 'PDF',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF]: 'TIF,TIFF',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_MULTIPAGE_TIF]: 'TIF,TIFF',
    };
    return map[type] ?? 'TIF,TIFF,JPG,JPEG,PNG,PDF';
  } else {
    const map: Record<number, string> = {
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_BMP]: 'BMP(*.bmp)|*.bmp',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG]: 'JPG(*.jpg;*.jpeg)|*.jpg;*.jpeg',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG]: 'PNG(*.png)|*.png',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF]: 'PDF(*.pdf)|*.pdf',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_MULTIPAGE_PDF]: 'PDF(*.pdf)|*.pdf',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF]: 'TIF(*.tif;*.tiff)|*.tif;*.tiff',
      [Dynamsoft.DWT.EnumDWT_ImageType.IT_MULTIPAGE_TIF]: 'TIF(*.tif;*.tiff)|*.tif;*.tiff',
    };
    return map[type] ?? 'BMP,TIF,JPG,PNG,PDF|*.bmp;*.tif;*.png;*.jpg;*.pdf;*.tiff;*.jpeg';
  }
}
