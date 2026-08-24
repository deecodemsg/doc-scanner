declare var Dynamsoft: any;

import type {
  ThumbnailViewer,
  ThumbnailViewerSettings,
  ViewMode,
} from "dwt/dist/types/WebTwain.Viewer";
import type { WebTwain } from "dwt/dist/types/WebTwain";
import { environment as defaultEnvironment } from "../../environments/environment";

import {
  getEl,
  getInputEl,
  getSelectEl,
  elAddClass,
  elRemoveClass,
  elHide,
  isNumber,
  isString,
  browserInfo,
} from "./common";

import { DwtService, type Device } from "./dwtService";
import { Subscription } from "rxjs";

let _arrMessages: string[] = []; // Store the temp string for display
let _iLeft: number, _iTop: number, _iRight: number, _iBottom: number; //These variables are used to remember the selected area
const HOST = defaultEnvironment.Dynamsoft.host;
export class DwtUIOperations {
  protected dwtService: DwtService;
  protected dwtObject?: WebTwain;
  protected thumbnail?: ThumbnailViewer;
  protected bufferSubscription?: Subscription;
  protected generalSubscription?: Subscription;
  protected containerId: string;
  protected editorShown = false;

  constructor(containerId: string) {
    this.containerId = containerId;
    this.dwtService = new DwtService(containerId);
  }

  onPageInit() {
    initiateInputs();
    hideLoadImageForLinux();
    initStyle();

    // bind events
    this.bufferSubscription = this.dwtService.bufferSubject.subscribe(
      (bufferStatus) => {
        switch (bufferStatus) {
          case "empty":
            console.log("There is no image in the buffer.");
            break;
          case "changed":
            break;
          default:
            break;
        }
      },
    );

    // subscribe dwtService event
    this.generalSubscription = this.dwtService.generalSubject.subscribe(
      (input) => {
        if (input && input.type) {
          switch (input.type) {
            case "uploadError":
              this._handleUploadError(input);
              break;
            default:
              break;
          }
        }
      },
    );

    let _this = this;
    this.dwtService.init(
      function (dwtObject: WebTwain) {
        _this.dwtObject = dwtObject;
        _this.bindViewer();
        _this.dwtService
          .getDevices()
          .then(function (devices) {
            let bNoDevices = devices.length == 0;
            _this._initedDynamicWebTWAIN(dwtObject, bNoDevices);
            _this._initDevices(devices);
          })
          .catch(function (exp) {
            checkErrorStringWithErrorCode(-1, exp.message);
          });
      },
      function (error: any) {
        typeof error === "string"
          ? checkErrorStringWithErrorCode(-1, error)
          : addMessage(error);
      },
    );
  }

  destroy() {
    this.unBindViewer();
    this.generalSubscription?.unsubscribe();
    this.bufferSubscription?.unsubscribe();
    this.dwtService.destroy();
    this.dwtObject?.dispose();
  }

  // Viewer
  bindViewer() {
    if (!this.dwtObject) return;

    this.dwtObject.Viewer.bind(
      <HTMLDivElement>document.getElementById(this.containerId),
    );
    this.dwtObject.Viewer.pageMargin = 10;
    this.updateViewer();

    if (this.thumbnail) {
      // Remove the context menu which is still not functioning correctly.
      this.dwtObject.Viewer.off("imageRightClick");
      this.dwtObject.Viewer.cursor = "crosshair";
      this.dwtObject.Viewer.showPageNumber = true;
      this.thumbnail.updateViewMode(<ViewMode>{ columns: 1, rows: 3 });
      this.thumbnail.on("click", (evt) => {
        this.handleOnMouseClick(evt);
      });
      this.thumbnail.on("dragdone", (evt) => {
        this.handleOnIndexChangeDragDropDone(evt);
      });
      this.thumbnail.on("keydown", (evt) => {
        this.handleOnKeyDown(evt);
      });
      this.dwtObject?.Viewer.on("wheel", (evt) => {
        this.handleOnMouseWheel(evt);
      }); //H5 only
    } else {
      console.log(this.dwtObject?.ErrorString);
    }
  }

  unBindViewer() {
    if (this.dwtObject?.Viewer.unbind()) {
      let container = document.getElementById(
        this.containerId,
      ) as HTMLDivElement;
      while (container.firstChild) {
        if (container.lastChild) {
          container.removeChild(container.lastChild);
        }
      }
      return true;
    } else {
      checkErrorStringWithErrorCode(-1, this.dwtObject?.ErrorString as string);
      return false;
    }
  }

  updateViewer() {
    if (this.dwtObject) {
      this.thumbnail = this.dwtObject?.Viewer.createThumbnailViewer(<
        ThumbnailViewerSettings
      >{ size: "25%" });
      this.dwtObject.Viewer.width = "100%";
      this.dwtObject.Viewer.height = "100%";
      this.dwtObject.Viewer.show();

      if (this.thumbnail) {
        this.thumbnail.placeholderBackground = "#D1D1D1";
        this.thumbnail.show();
      }
      return true;
    }

    return false;
  }

  checkIfImagesInBuffer() {
    if (this.dwtObject?.HowManyImagesInBuffer == 0) {
      appendMessage(
        "<span style='color:#cE5E04'><strong>There is no image in the buffer.</strong></span><br />",
      );
      return false;
    } else return true;
  }

  //----------------
  // Edit Image
  //----------------
  onclickShowImageEditor() {
    if (!this.dwtObject || !this.checkIfImagesInBuffer()) {
      return;
    }
    let imageEditor = this.dwtObject?.Viewer.createImageEditor();
    imageEditor?.show();
    this.editorShown = true;
  }

  // Rotate Left
  onclickRotateLeft() {
    if (!this.dwtObject || !this.checkIfImagesInBuffer()) {
      return;
    }
    this.dwtObject?.RotateLeft(this.dwtObject?.CurrentImageIndexInBuffer);
    appendStrongMessage("Rotate left: ");
    if (this._checkErrorString()) {
      return;
    }
  }

  // Crop
  onclickCrop() {
    if (!this.dwtObject || !this.checkIfImagesInBuffer()) {
      return;
    }
    if (_iLeft != 0 || _iTop != 0 || _iRight != 0 || _iBottom != 0) {
      this.dwtObject?.Crop(
        this.dwtObject?.CurrentImageIndexInBuffer,
        _iLeft,
        _iTop,
        _iRight,
        _iBottom,
      );
      _iLeft = 0;
      _iTop = 0;
      _iRight = 0;
      _iBottom = 0;

      if (this.dwtObject?.isUsingActiveX()) {
        let axDWTObject: any;
        axDWTObject = this.dwtObject;
        axDWTObject.SetSelectedImageArea(
          this.dwtObject?.CurrentImageIndexInBuffer,
          0,
          0,
          0,
          0,
        );
      }

      appendStrongMessage("Crop: ");
      if (this._checkErrorString()) {
        return;
      }
      return;
    } else {
      appendMessage(
        "<strong>Crop: </strong>failed. Please first select the area you'd like to crop.<br />",
      );
    }
  }

  // Select Area
  onclickSelect() {
    this.handAndSelectSelected(false);

    if (this.dwtObject) {
      this.dwtObject.Viewer.cursor = "crosshair";
    }
  }

  handAndSelectSelected(bHandSelected: boolean) {
    let btnHand = getEl("btnHand");
    let btnHand_selected = getEl("btnHand_selected");
    let btnSelect = getEl("btnSelect");
    let btnSelect_selected = getEl("btnSelect_selected");
    if (bHandSelected) {
      if (btnHand) btnHand.style.display = "none";
      if (btnHand_selected) btnHand_selected.style.display = "";
      if (btnSelect) btnSelect.style.display = "";
      if (btnSelect_selected) btnSelect_selected.style.display = "none";
    } else {
      if (btnHand) btnHand.style.display = "";
      if (btnHand_selected) btnHand_selected.style.display = "none";
      if (btnSelect) btnSelect.style.display = "none";
      if (btnSelect_selected) btnSelect_selected.style.display = "";
    }
  }

  // Zoom Out
  onclickZoomOut() {
    if (!this.dwtObject || !this.checkIfImagesInBuffer()) {
      return;
    }

    let zoom = Math.round(this.dwtObject.Viewer.zoom * 100);
    if (zoom <= 2) return;

    let zoomOutStep = 5;
    this.dwtObject.Viewer.zoom =
      (this.dwtObject?.Viewer.zoom * 100 - zoomOutStep) / 100.0;
    this.updateZoomInfo();
    this._enableButtonForZoomInAndOut();
  }

  // Zoom In
  onclickZoomIn() {
    if (!this.dwtObject || !this.checkIfImagesInBuffer()) {
      return;
    }

    let zoom = Math.round(this.dwtObject.Viewer.zoom * 100);
    if (zoom >= 6500) return;

    let zoomInStep = 5;
    this.dwtObject.Viewer.zoom =
      (this.dwtObject?.Viewer.zoom * 100 + zoomInStep) / 100.0;
    this.updateZoomInfo();
    this._enableButtonForZoomInAndOut();
  }

  // show original size
  onclickOrigSize() {
    if (!this.dwtObject || !this.checkIfImagesInBuffer()) {
      return;
    }

    let btnOrigSize = getEl("btnOrigSize");
    if (btnOrigSize) btnOrigSize.style.display = "none";
    let btnFitWindow = getEl("btnFitWindow");
    if (btnFitWindow) btnFitWindow.style.display = "";

    this.dwtObject.Viewer.zoom = 1;
    this.updateZoomInfo();
    this._enableButtonForZoomInAndOut();
  }

  // show fit window size
  onclickFitWindow() {
    if (!this.dwtObject || !this.checkIfImagesInBuffer()) {
      return;
    }

    let btnOrigSize = getEl("btnOrigSize");
    if (btnOrigSize) btnOrigSize.style.display = "";
    let btnFitWindow = getEl("btnFitWindow");
    if (btnFitWindow) btnFitWindow.style.display = "none";

    this.dwtObject?.Viewer.fitWindow();
    this.updateZoomInfo();
    this._enableButtonForZoomInAndOut();
  }

  // click hand button
  onclickHandButton() {
    if (!this.dwtObject) {
      return;
    }

    this.handAndSelectSelected(true);
    this.dwtObject.Viewer.cursor = "pointer";
  }

  // show no scanners tips
  showNoScanners() {
    let divNoScanners = getEl("divNoScanners");
    if (divNoScanners) {
      divNoScanners.style.visibility = "visible";
      let divResolution = getEl("Resolution");
      if (divResolution) {
        divResolution.style.visibility = "hidden";
      }
    }
  }

  // close no scanners tips
  hideNoScanners() {
    let divNoScanners = getEl("divNoScanners");
    if (divNoScanners) {
      divNoScanners.style.visibility = "hidden";
      let divResolution = getEl("Resolution");
      if (divResolution) {
        divResolution.style.visibility = "visible";
      }
    }
  }
  // Custom Added: Durgesh
  // async saveLocallyPathStored(
  //   { name, path }: { name: string; path: string },
  //   {
  //     selectedIndices,
  //     enumImageType,
  //   }: { selectedIndices: number[]; enumImageType: any },
  // ): Promise<void> {
  //   try {
  //     const STORAGE_KEY = "SCANNED_LOCAL_PATH";

  //     const folders: Array<{
  //       name: string;
  //       path: string;
  //       lastAccessed: string;
  //       base64?: string;
  //     }> = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

  //     const index = folders.findIndex((f) => f.name === name);

  //     if (index !== -1) {
  //       folders[index].lastAccessed = new Date().toISOString();
  //     } else {
  //       const base64 = await this.dwtService.getBase64(
  //         selectedIndices,
  //         enumImageType,
  //       );
  //       folders.push({
  //         name,
  //         path,
  //         lastAccessed: new Date().toISOString(),
  //         base64,
  //       });
  //     }

  //     localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  //   } catch (error) {
  //     console.error("DWT Conversion Error:", error);
  //   }
  // }

  // save image OR upload
  save(
    saveType: string,
    strFileNameWithoutExt: string,
    strExtension: string,
    strAllPages: string,
    folderLocation?: string,
    resolution?: number,
  ) {
    if (!this.dwtObject || !this.checkIfImagesInBuffer()) {
      return;
    }

    let bUpload = saveType == "server";
    let bSaveToFile = saveType == "local";

    let enumImageType = getImageType(strExtension);

    let selectedIndices;
    selectedIndices = [];

    if (strAllPages == "true") {
      let count = this.dwtObject?.HowManyImagesInBuffer,
        i;
      for (i = 0; i < count; i++) {
        selectedIndices.push(i);
      }
    } else {
      let cIndex = this.dwtObject?.CurrentImageIndexInBuffer;
      selectedIndices.push(cIndex);
    }

    // const checkPDFReader = this.dwtObject?.Addon.PDF.SetReaderOptions({
    //   convertMode: Dynamsoft.DWT.EnumDWT_ConvertMode.CM_RENDERALL,
    //   renderOptions: {
    //     resolution: resolution
    //   }
    // });

    if (bUpload) {
      appendStrongMessage("Upload: ");

      let txt_CustomInfo = getInputEl("txt_CustomInfo") as HTMLInputElement;
      let customeInfo = txt_CustomInfo.value || null;

      let _this = this;
      return this.dwtService
        .uploadToServer(
          selectedIndices,
          enumImageType,
          strFileNameWithoutExt,
          customeInfo,
          folderLocation,
        )
        .then(
          (res) => {
            alert("Upload successful.");

            checkErrorStringWithErrorCode(0, "Successful.");
            return res;
          },
          (error) =>
            typeof error === "string"
              ? checkErrorStringWithErrorCode(-1, error)
              : addMessage(error),
        );
    } else if (bSaveToFile) {
      appendStrongMessage("Save Image: ");
      // Convert to base64 to forward to the parent component for api if required.
      // const base64 = await this.dwtService.getBase64(
      //               selectedIndices,
      //               enumImageType,
      //             );
      if (enumImageType == Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF) {
        if (selectedIndices.length > 1) {
          enumImageType = Dynamsoft.DWT.EnumDWT_ImageType.IT_MULTIPAGE_TIF;
        }
      } else if (enumImageType == Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF) {
        if (selectedIndices.length > 1) {
          enumImageType = Dynamsoft.DWT.EnumDWT_ImageType.IT_MULTIPAGE_PDF;
        }
      }

      let _this = this;
      return this.dwtService
        .saveLocally(
          selectedIndices,
          enumImageType,
          strFileNameWithoutExt,
          true,
        )
        .then(
          async (res) => {
            checkErrorStringWithErrorCode(0, "Successful.");            
            appendStrongMessage("Saved Folderd detail: " + res.path);
            return { ...res };
          },
          (error) =>
            typeof error === "string"
              ? checkErrorStringWithErrorCode(-1, error)
              : addMessage(error),
        );
    }
  }

  // acquire image
  acquireImage(deviceName: any, scanOptions: any) {
    this.dwtService
      .selectADevice(deviceName)
      .then(() => {
        return this.dwtService.acquire(scanOptions);
      })
      .then(
        () => {
          appendStrongMessage("Scan: ");
          checkErrorStringWithErrorCode(0, "Successful.");
        },
        (err) => {
          appendStrongMessage("Scan: ");
          checkErrorStringWithErrorCode(-1, err);
        },
      );
  }

  // load image
  loadImage() {
    appendStrongMessage("Loaded image: ");

    this.dwtService.load().then(
      () => {
        this._checkErrorString();

        let divLoadAndDownload = getEl("divLoadAndDownload");
        if (divLoadAndDownload)
          divLoadAndDownload.parentNode?.removeChild(divLoadAndDownload);

        this._setCanvasBackground();
      },
      (errObj) => {
        checkErrorStringWithErrorCode(errObj.code, errObj.message);
        this._setCanvasBackground();
      },
    );
  }

  // device changed
  handleDeviceChanged(deviceName: string) {
    if (deviceName === "" || deviceName === "Choose...") return;

    this.dwtService.selectADevice(deviceName).then(
      (done) => {
        if (!done) {
          checkErrorStringWithErrorCode(-1, "Device selecting failed!");
        }

        let showUI = getInputEl("ShowUI");
        let twainsource = getSelectEl("source") as HTMLSelectElement;
        if (showUI) {
          let cIndex = twainsource.selectedIndex;
          if (cIndex >= 0) {
            let option = twainsource.options[cIndex];
            if (option.value.indexOf("WIA-") == 0) {
              showUI.disabled = true;
              showUI.checked = false;
            } else showUI.disabled = false;
          }
        }
      },
      (error) =>
        typeof error === "string"
          ? checkErrorStringWithErrorCode(-1, error)
          : checkErrorStringWithErrorCode(-1, "Device selecting failed!"),
    );
  }

  // resize
  handleResizeEvent() {
    if (!this.editorShown) this.updateViewer();
  }

  removeAllImages() {
    this.dwtObject?.RemoveAllImages();
    this.dwtObject?.RemoveImage(0);
    this._setCanvasBackground();
  }

  removeCurrentImage() {
    this.dwtObject?.RemoveImage(this.dwtObject?.CurrentImageIndexInBuffer);
    if (this.dwtObject?.HowManyImagesInBuffer == 0)
      this.dwtObject?.RemoveImage(0);

    this._setCanvasBackground();
    this.updatePageInfo();
  }

  //--------
  updatePageInfo() {
    if (!this.dwtObject) {
      return;
    }

    let totalImage = getInputEl("DW_TotalImage");
    if (totalImage)
      totalImage.value = "" + this.dwtObject.HowManyImagesInBuffer;

    let currentImage = getInputEl("DW_CurrentImage");
    if (currentImage)
      currentImage.value = "" + (this.dwtObject.CurrentImageIndexInBuffer + 1);
    this.updateZoomInfo();
  }

  private updateZoomInfo() {
    if (!this.dwtObject) {
      return;
    }

    let spanZoom = getInputEl("DW_spanZoom");

    if (spanZoom) {
      if (this.dwtObject?.HowManyImagesInBuffer == 0) spanZoom.value = "100%";
      else spanZoom.value = Math.round(this.dwtObject?.Viewer.zoom * 100) + "%";
    }
  }

  // UI events
  // show files
  onclickSaveDocuments() {}

  onclickShowUploadedFiles() {}

  //------------------------
  // handle other events
  //------------------------
  handleCloseImageEditorUI() {
    this.updatePageInfo();
  }

  handleOnMouseClick(evt?: any) {
    this.updatePageInfo();
  }

  handleOnMouseWheel(evt?: any) {
    this.updatePageInfo();
  }

  handleOnIndexChangeDragDropDone(event?: any) {
    this.updatePageInfo();
  }

  handleOnKeyDown(evt?: any) {
    this.updatePageInfo();
  }

  _setCanvasBackground() {
    if (this.dwtObject && this.dwtObject.HowManyImagesInBuffer > 0) {
      if (
        this.dwtObject.Viewer &&
        this.dwtObject.Viewer.background != "#F5F5F5"
      ) {
        const scrollEl = document.querySelector(
          ".dvs-viewer-main .dvs-scroll-container",
        ) as HTMLElement;
        if (scrollEl) {
          scrollEl.style.background = "#F5F5F5";
        }
      }
    } else {
      if (this.dwtObject && this.dwtObject.Viewer) {
        const scrollEl = document.querySelector(
          ".dvs-viewer-main .dvs-scroll-container",
        ) as HTMLElement;
        if (scrollEl) {
          scrollEl.style.background =
            `url('${HOST}/assets/Images/canvasbackground.png') center / 60% no-repeat,#F5F5F5`;
        }
      }
    }
  }

  private _handleOnBufferChanged() {
    // The event OnBufferChanged is used here for monitoring the image buffer.
    this.dwtService.bufferSubject.next("changed");
    if (this.dwtObject?.HowManyImagesInBuffer === 0)
      this.dwtService.bufferSubject.next("empty");
    else this.dwtService.bufferSubject.next("filled");

    this._setCanvasBackground();
    this.updatePageInfo();
    const _this = this;
    setTimeout(function () {
      _this.updateZoomInfo();
    }, 100);
  }

  private _handleOnBitmapChanged(aryIndex?: any, type?: any) {
    if (type == 3) {
      this.updatePageInfo();
    }

    if (type == 4) this.updateZoomInfo();

    if (type == 5)
      //only ActiveX
      handleOnImageAreaDeselected();
  }

  private _handleOnPostTransfer() {
    this.updatePageInfo();
  }

  private _handleOnPostLoad(path?: any, name?: any, type?: any) {
    this.updatePageInfo();
  }

  private _checkErrorString() {
    if (!this.dwtObject) {
      return false;
    }

    return checkErrorStringWithErrorCode(
      this.dwtObject?.ErrorCode,
      this.dwtObject?.ErrorString,
    );
  }

  private _handleUploadError(input: any) {
    checkErrorStringWithErrorCode(-1, input.message);
  }

  private _initDevices(devices: Device[]) {
    let twainsource = getSelectEl("source");
    if (twainsource) {
      twainsource.options.length = 0;
      let vCount = devices.length;
      let deviceName: string = "";

      for (let i = 0; i < vCount; i++) {
        // Get how many sources are installed in the system
        let option = new Option(devices[i].label, devices[i].name);
        if (i == 0) {
          option.selected = true;
          deviceName = option.value;
        }

        twainsource.options.add(option); // Add the sources in a drop-down list
      }

      if (vCount > 0) {
        this.handleDeviceChanged(deviceName);
      }
    }
  }

  private _downloadSamplePDF() {
    if (!this.dwtObject) {
      return;
    }

    appendStrongMessage("Downloaded image: ");

    let OnSuccess = () => {
      checkErrorStringWithErrorCode(0, "Successful.");

      let divLoadAndDownload = getEl("divLoadAndDownload");
      if (divLoadAndDownload)
        divLoadAndDownload.parentNode?.removeChild(divLoadAndDownload);

      this._setCanvasBackground();
    };

    let OnFailure = (errorCode: number, errorString: string) => {
      checkErrorStringWithErrorCode(errorCode, errorString);
      this._setCanvasBackground();
    };

    this.dwtObject.IfSSL = Dynamsoft.Lib.detect.ssl;
    let _strPort = location.port == "" ? 80 : parseInt(location.port);
    if (Dynamsoft.Lib.detect.ssl == true)
      _strPort = location.port == "" ? 443 : parseInt(location.port);
    this.dwtObject.HTTPPort = _strPort;
    let strDownloadFile =
      `${HOST}/assets/Images/DynamsoftSample.pdf`;

    this.dwtObject?.HTTPDownload(
      location.hostname,
      strDownloadFile,
      OnSuccess,
      OnFailure,
    );
  }

  private _enableButtonForZoomInAndOut() {
    if (!this.dwtObject) {
      return;
    }

    let btnZoomIn = getEl("btnZoomIn");
    let zoom = Math.round(this.dwtObject.Viewer.zoom * 100);

    if (zoom >= 6500) {
      elAddClass(btnZoomIn, "grayimg");
      return;
    } else {
      elRemoveClass(btnZoomIn, "grayimg");

      let btnZoomOut = getEl("btnZoomOut");
      if (zoom <= 2) {
        elAddClass(btnZoomOut, "grayimg");
        return;
      } else {
        elRemoveClass(btnZoomOut, "grayimg");
      }
    }
  }

  // Check if the control is fully loaded.
  private _initedDynamicWebTWAIN(
    dynamicWebTWAINInstance: WebTwain,
    bNoDevices: boolean,
  ) {
    let _divMessageContainer = getEl("DWTemessage");
    _divMessageContainer &&
      (_divMessageContainer.ondblclick = function () {
        (_divMessageContainer as any).innerHTML = "";
        _arrMessages.splice(0);
      });

    if (!browserInfo.bWin) {
      let lblShowUI = getEl("lblShowUI");
      lblShowUI && (lblShowUI.style.display = "none");

      let chkShowUI = getEl("ShowUI");
      chkShowUI && (chkShowUI.style.display = "none");
    }

    // If the ErrorCode is 0, it means everything is fine for the control. It is fully loaded.
    if (dynamicWebTWAINInstance) {
      if (dynamicWebTWAINInstance.ErrorCode == 0) {
        let thumbnailViewer: any =
          dynamicWebTWAINInstance.Viewer.createThumbnailViewer();
        if (thumbnailViewer) {
          thumbnailViewer.showPageNumber = true;
          thumbnailViewer.selectedPageBackground = thumbnailViewer.background;
          thumbnailViewer.selectedPageBorder = "solid 2px #FE8E14";
          thumbnailViewer.hoverPageBorder = "solid 2px #FE8E14";
          thumbnailViewer.placeholderBackground = "#D1D1D1";
          thumbnailViewer.show();
          thumbnailViewer.hoverPageBackground = thumbnailViewer.background;
          thumbnailViewer.on("click", (evt?: any) => {
            this.handleOnMouseClick(evt);
          });
          thumbnailViewer.on("dragdone", (evt?: any) => {
            this.handleOnIndexChangeDragDropDone(evt);
          });
          thumbnailViewer.on("keydown", () => {
            this.handleOnKeyDown();
          });
        }

        dynamicWebTWAINInstance.Viewer.on("wheel", (evt?: any) => {
          this.handleOnMouseWheel(evt);
        }); //H5 only

        dynamicWebTWAINInstance.Viewer.on("OnPaintDone", (evt?: any) => {
          this.handleOnMouseWheel(evt);
        }); //ActiveX only

        dynamicWebTWAINInstance.Viewer.allowSlide = false;
        elHide(getEl("DWTNonInstallContainerID"));

        dynamicWebTWAINInstance.IfAllowLocalCache = true;
        dynamicWebTWAINInstance.ImageCaptureDriverType = 4;
        initFileType();

        const scrollEl = document.querySelector(
          ".dvs-viewer-main .dvs-scroll-container",
        ) as HTMLElement;
        if (scrollEl) {
          scrollEl.style.background =
            `url('${HOST}/assets/Images/canvasbackground.png') center / 60% no-repeat,#F5F5F5`;
        }
        dynamicWebTWAINInstance.Viewer.background = "";
        thumbnailViewer.background = "#F5F5F5";

        let twainsource = getSelectEl("source");
        if (twainsource) {
          if (bNoDevices) {
            this._downloadSamplePDF();
          }

          // If source list need to be displayed, fill in the source items.
          if (bNoDevices) {
            let liNoScanner = getEl("pNoScanner");
            if (liNoScanner) {
              if (browserInfo.bWin) {
                liNoScanner.style.display = "block";
                liNoScanner.style.textAlign = "center";
              } else liNoScanner.style.display = "none";
            }

            let btnScan = getInputEl("btnScan");
            if (btnScan) {
              btnScan.disabled = true;
            }
          }

          if (!bNoDevices) {
            let divTwainType = getEl("divTwainType");
            if (divTwainType) divTwainType.style.display = "";

            let btnScan = getInputEl("btnScan");
            if (btnScan) {
              btnScan.disabled = false;
            }

            elAddClass(getEl("btnScan"), "btnScanActive");
          }

          _iLeft = 0;
          _iTop = 0;
          _iRight = 0;
          _iBottom = 0;

          for (let i = 0; i < document.links.length; i++) {
            if (document.links[i].className == "ClosetblLoadImage") {
              document.links[i].onclick = () => {
                this.hideNoScanners();
              };
            }
          }

          if (bNoDevices) {
            if (browserInfo.bWin) {
              this.showNoScanners();

              let Resolution = getEl("Resolution");
              if (Resolution) {
                Resolution.style.display = "none";
              }
            }
          } else {
            let divBlank = getEl("divBlank");
            if (divBlank) divBlank.style.display = "none";
          }

          this.updatePageInfo();

          dynamicWebTWAINInstance.RegisterEvent("CloseImageEditorUI", () => {
            this.editorShown = false;
            this.handleCloseImageEditorUI();
          });

          dynamicWebTWAINInstance.RegisterEvent("OnBufferChanged", () => {
            this._handleOnBufferChanged();
          });

          dynamicWebTWAINInstance.RegisterEvent("OnBitmapChanged", () => {
            this._handleOnBitmapChanged();
          });

          dynamicWebTWAINInstance.RegisterEvent("OnPostTransfer", () => {
            this._handleOnPostTransfer();
          });

          dynamicWebTWAINInstance.RegisterEvent(
            "OnPostLoad",
            (path?: any, name?: any, type?: any) => {
              this._handleOnPostLoad(path, name, type);
            },
          );

          dynamicWebTWAINInstance.RegisterEvent("OnPostAllTransfers", () => {
            this.dwtObject?.CloseSource();
            this._setCanvasBackground();
            this.updatePageInfo();
          });

          dynamicWebTWAINInstance.RegisterEvent(
            "OnGetFilePath",
            handleOnGetFilePath,
          );
          dynamicWebTWAINInstance.Viewer.on(
            "pageAreaSelected",
            handleOnImageAreaSelected,
          );
          dynamicWebTWAINInstance.Viewer.on(
            "pageAreaUnselected",
            handleOnImageAreaDeselected,
          );
        }
      }
    }
  }

  private toggleNoScanners() {
    let divNoScanners = getEl("divNoScanners");
    if (divNoScanners) {
      switch (divNoScanners.style.visibility) {
        case "":
        case "hidden":
          this.showNoScanners();
          break;
        case "visible":
          this.hideNoScanners();
          break;
        default:
          break;
      }
    }
  }
}

function checkErrorStringWithErrorCode(
  errorCode: number,
  errorString: string,
  responseString?: string,
) {
  if (errorCode == 0) {
    appendMessage("<strong>" + errorString + "</strong><br />");

    return true;
  }
  if (errorCode == -2115)
    //Cancel file dialog
    return true;
  else {
    if (errorCode == -2003) {
      if (responseString && responseString != "") {
        let ErrorMessageWin: any = window.open(
          "",
          "ErrorMessage",
          "height=500,width=750,top=0,left=0,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no",
        );
        ErrorMessageWin.document.writeln(responseString); //DWTObject.HTTPPostResponseString);
      }
    }
    appendMessage(
      "<span style='color:#cE5E04'><strong>" +
        errorString +
        "</strong></span><br />",
    );
    return false;
  }
}

function addMessage(msg: any) {
  if (isString(msg)) {
    appendMessage(msg);
    appendMessage("<br />");
  } else if (msg && isNumber(msg.code) && msg.message) {
    checkErrorStringWithErrorCode(msg.code, msg.message);
  } else if (msg && msg.message) {
    appendMessage(msg.message);
    appendMessage("<br />");
  }
}

function appendStrongMessage(strMessage: string) {
  appendMessage(["<strong>", strMessage, "</strong>"].join(""));
}

function appendMessage(strMessage: string) {
  _arrMessages.push(strMessage);
  let _divMessageContainer = getEl("DWTemessage");
  if (_divMessageContainer) {
    _divMessageContainer.innerHTML = _arrMessages.join("");
    let element = getEl("DWTdivMsg");
    if (element) element.scrollTop = element.scrollHeight;
  }
}

function hideLoadImageForLinux() {
  let btnLoad = getEl("btnLoad");
  if (btnLoad) {
    if (browserInfo.bLinux || browserInfo.bChromeOS)
      btnLoad.style.display = "none";
    else btnLoad.style.display = "";
  }

  let btnSave = getEl("btnSave");
  if (btnSave) {
    if (browserInfo.bLinux || browserInfo.bChromeOS)
      btnSave.style.display = "none";
    else btnSave.style.display = "";
  }
}

function initiateInputs() {
  if (browserInfo.bIE && browserInfo.bWin64) {
    let o = getEl("samplesource64bit");
    if (o) o.style.display = "inline";

    o = getEl("samplesource32bit");
    if (o) o.style.display = "none";
  }
}

function initFileType() {
  let fileType = getSelectEl("fileType");
  if (fileType) {
    fileType.options.length = 0;
    fileType.options.add(new Option("pdf", "pdf"));
    fileType.options.add(new Option("tif", "tif"));
    fileType.options.add(new Option("jpg", "jpg"));
    fileType.options.add(new Option("png", "png"));
    fileType.options.add(new Option("bmp", "bmp"));

    fileType.selectedIndex = 0;
  }

  let vAllPages = getInputEl("AllPages");
  if (vAllPages) vAllPages.checked = true;
}

function enableButtonForCrop(bEnable: boolean) {
  if (bEnable) {
    let btnCrop = getEl("btnCrop");
    if (btnCrop) btnCrop.style.display = "";
    let btnCropGray = getEl("btnCropGray");
    if (btnCropGray) btnCropGray.style.display = "none";
  } else {
    let btnCrop = getEl("btnCrop");
    if (btnCrop) btnCrop.style.display = "none";
    let btnCropGray = getEl("btnCropGray");
    if (btnCropGray) btnCropGray.style.display = "";
  }
}

function handleOnImageAreaSelected(index: number, rect: any) {
  if (rect.length > 0) {
    let currentRect = rect[rect.length - 1];
    _iLeft = currentRect.x;
    _iTop = currentRect.y;
    _iRight = currentRect.x + currentRect.width;
    _iBottom = currentRect.y + currentRect.height;

    enableButtonForCrop(true);
  }
}

function handleOnImageAreaDeselected() {
  _iLeft = 0;
  _iTop = 0;
  _iRight = 0;
  _iBottom = 0;

  enableButtonForCrop(false);
}

function handleOnGetFilePath(
  bSave: any,
  count: any,
  index: any,
  path: any,
  name: any,
) {}

function appendUploadedItem(
  strImageName: string,
  strCustomInfo: string,
  removeUrl: string,
  downloadUrl: string,
) {
  let resultWrap = getEl("resultWrap") as HTMLElement;

  let newDiv = document.createElement("div");
  newDiv.innerHTML =
    "<span class='ds-uploaded-block-title'>File Name:</span><span class='ds-uploaded-block-content'>" +
    strImageName +
    "</span><br />" +
    "<span class='ds-uploaded-block-title'>Custom Info:</span><span class='ds-uploaded-block-content'>" +
    strCustomInfo +
    "</span><br />" +
    "<a class='ds-uploaded-remove' data='" +
    removeUrl +
    "' href='#'>Del</a><span> | </span><a class='ds-uploaded-download' target='_blank' href ='" +
    downloadUrl +
    "'>Download</a>";

  newDiv.style.borderBottom = "solid 1px #ccc";
  newDiv.className = "ds-uploaded-block";
  resultWrap.appendChild(newDiv);

  let btnDelete = newDiv.querySelector(".ds-uploaded-remove");
  btnDelete?.addEventListener("click", (evt: Event) => {
    let _this = evt.target as HTMLElement;
    let removeUrl = _this.getAttribute("data");

    if (removeUrl) {
      fetch(removeUrl, {
        method: "GET",
      })
        .then((response) => response.text())
        .then(() => {}) // ignore response
        .catch(() => {}); // ignore error
    }

    let parent = _this.parentNode;
    if (parent) {
      parent.parentNode?.removeChild(parent);
    }
  });

  resultWrap.scrollTop = resultWrap.scrollHeight;
}

function initStyle() {
  let newCssStyle: string[] = [],
    screenWidth = screen.width,
    screenHeight = screen.height,
    bIE = browserInfo.bIE;

  if (
    screenWidth > 1600 &&
    screenWidth < 3441 &&
    screenHeight > 1200 &&
    screenHeight < 2000
  ) {
    newCssStyle.push(
      "\
      html,body { font-size: 16px; }\
    ",
    );
  }

  if (screenWidth < 1280) {
    newCssStyle.push(
      "\
      .ds-dwt-content { width:983px;  }\
      #divEdit{ width:663px; }\
      #DWTcontainerTop,#dwtcontrolContainer,#dwt-NonInstallContainerID { width:665px; }\
      #ScanWrapper,#DWTdivMsg { width:315px;  }\
      #divNoScanners { width:275px;  }\
    ",
    );
  } else if (screenWidth >= 1280 && screenWidth < 1792) {
    newCssStyle.push(
      "\
      .ds-dwt-content { width:1068px;  }\
      #divEdit{ width:663px; }\
      #DWTcontainerTop,#dwtcontrolContainer,#dwt-NonInstallContainerID { width:665px; }\
      #ScanWrapper,#DWTdivMsg { width:400px;  }\
      #divNoScanners { width:275px;  }\
    ",
    );
  } else if (screenWidth >= 1792 && screenWidth < 3441) {
    newCssStyle.push(
      "\
      .ds-dwt-content { width:1395px;  }\
      #divEdit { width:928px; }\
      #DWTcontainerTop,#dwtcontrolContainer,#dwt-NonInstallContainerID { width:930px; }\
      #ScanWrapper,#DWTdivMsg { width:455px;  }\
      #divNoScanners { width:415px;  }\
    ",
    );
  } else {
    newCssStyle.push(
      "\
      .ds-dwt-content { width:2820px;  }\
      #divEdit { width:1898px; }\
      #DWTcontainerTop,#dwtcontrolContainer,#dwt-NonInstallContainerID { width:1900px; }\
      #ScanWrapper,#DWTdivMsg { width:900px;  }\
      #divNoScanners { width:515px;  }\
    ",
    );
  }

  if (screenHeight <= 1080) {
    newCssStyle.push(
      "\
      #dwt-NonInstallContainerID,#dwtcontrolContainer,#ScanWrapper  { height:760px; }\
    ",
    );
  } else if (screenWidth == 1600 && screenHeight < 1440) {
    newCssStyle.push(
      "\
      #dwt-NonInstallContainerID,#dwtcontrolContainer,#ScanWrapper { height:848px; }\
    ",
    );
  } else if (screenHeight > 1080 && screenHeight < 1440) {
    newCssStyle.push(
      "\
      #dwt-NonInstallContainerID,#dwtcontrolContainer,#ScanWrapper { height:880px; }\
    ",
    );
  } else if (screenHeight >= 1440 && screenHeight < 2000) {
    newCssStyle.push(
      "\
      #dwt-NonInstallContainerID,#dwtcontrolContainer,#ScanWrapper { height:1050px; }\
    ",
    );
  } else {
    newCssStyle.push(
      "\
      #dwt-NonInstallContainerID,#dwtcontrolContainer,#ScanWrapper { height:1900px; }\
    ",
    );
  }

  if (
    screenWidth > 1440 &&
    screenWidth < 3441 &&
    screenHeight > 1080 &&
    screenHeight < 2000
  ) {
    newCssStyle.push(
      '\
      .operateGrp input[type="radio"] { width:25px; height:20px; }\
      #divProductDetail li:first-child label:first-child,  #divProductDetail li:nth-child(2) label:first-child { width:250px !important; } \
      #tblLoadImage { width:275px;height:128px;line-height:30px;}\
      #divSaveDetail li p { margin-bottom: 3px; }\
      #divSaveDetail li label { margin-right: 30px; }\
      #divSaveDetail li input[type="radio"], #divSaveDetail li input[type="checkbox"] { width:18px; height:18px; vertical-align: middle; }\
      #divSaveDetail #txt_CustomInfo { margin-top: 10px; }\
      #resultWrap { min-height:80px; }\
      #resultWrap #div-uploadedFile tr { height:30px; }\
      #resultWrap .title { font-size:16px; }\
      #source { margin-top: 10px; }\
      label[for="BW"] { margin-left: 15px !important; }\
      #Resolution { margin-left: 14px; }\
      #divProductDetail li label input[type="radio"] { width:18px; height:18px; }\
      #ScanWrapper select, #divSaveDetail input[type="text"] { height:30px; }\
      #ScanWrapper input[type="checkbox"], #ScanWrapper input[type="radio"] { margin-right: 6px; }\
    ',
    );
  }

  if (screenHeight <= 1024) {
    if ((screenWidth == 1440 || screenWidth == 1600) && screenHeight == 900) {
      newCssStyle.push(
        "\
      #tabCon { height:255px }\
      ",
      );
    } else {
      newCssStyle.push(
        "\
        #tabCon { height:245px } \
      ",
      );
    }
  } else if (screenHeight < 2000) {
    if (
      (screenWidth == 1920 && screenHeight == 1080) ||
      (screenWidth == 1680 && screenHeight == 1050)
    ) {
      newCssStyle.push(
        "\
        #tabCon { height:242px; padding-top: 15px }\
      ",
      );
    } else if (screenWidth == 1400 && screenHeight == 1050) {
      newCssStyle.push(
        "\
        #tabCon { height:255px; padding-top: 15px }\
      ",
      );
    } else if (screenWidth > 3000 && screenHeight <= 1080) {
      newCssStyle.push(
        "\
        #tabCon { height:560px; padding-top: 15px }\
      ",
      );
    } else if (screenWidth < 3441 && screenHeight < 1440) {
      newCssStyle.push(
        "\
        #tabCon { height:273px; padding-top: 15px }\
      ",
      );
    } else if (screenWidth < 3441) {
      newCssStyle.push(
        "\
        #tabCon { height:280px; padding-top: 15px }\
      ",
      );
    }
  }

  if (screenHeight <= 1024) {
    if (screenHeight == 900) {
      newCssStyle.push(
        "\
      #DWTdivMsg { height:198px }\
      ",
      );
    } else {
      newCssStyle.push(
        "\
      #DWTdivMsg{ height:210px; }\
      ",
      );
    }
  } else if (screenHeight > 1024 && screenHeight <= 1200) {
    if (screenWidth == 1400 && screenHeight == 1050) {
      newCssStyle.push(
        "\
      #DWTdivMsg { height:200px }\
      ",
      );
    } else if (screenWidth == 2048 && screenHeight == 1152) {
      newCssStyle.push(
        "\
      #DWTdivMsg { height:282px }\
      ",
      );
    } else if (screenWidth == 1600 && screenHeight == 1200) {
      newCssStyle.push(
        "\
      #DWTdivMsg { height:266px }\
      ",
      );
    } else if (screenWidth == 1920 && screenHeight == 1200) {
      newCssStyle.push(
        "\
      #DWTdivMsg { height:300px }\
      ",
      );
    } else if (screenWidth == 3840 && screenHeight == 1080) {
      newCssStyle.push(
        "\
      #DWTdivMsg { height:350px }\
      ",
      );
    } else {
      newCssStyle.push(
        "\
      #DWTdivMsg { height:210px }\
      ",
      );
    }
  } else if (screenHeight > 1200) {
    if (screenHeight == 1392 || screenHeight == 1344) {
      newCssStyle.push(
        "\
      #DWTdivMsg { height:285px }\
      ",
      );
    } else if (screenWidth == 1920 && screenHeight == 1440) {
      newCssStyle.push(
        "\
      #DWTdivMsg { height:445px }\
      ",
      );
    } else if (screenHeight < 2000) {
      newCssStyle.push(
        "\
        #DWTdivMsg{ height:440px; }\
      ",
      );
    } else {
      newCssStyle.push(
        "\
        #DWTdivMsg{ height:600px; }\
      ",
      );
    }
  }

  if (screenHeight < 900) {
    newCssStyle.push(
      "\
    #dwtcontrolContainer { margin: 5px 0 20px 0; }\
    ",
    );
  } else if (screenHeight > 1200 && screenHeight < 2000) {
    newCssStyle.push(
      "\
      #divSaveDetail li:nth-child(2) { padding-top: 5px; }\
    ",
    );
  }
  newCssStyle.push(".ds-dwt-content { display:block }");

  if (bIE) {
    // IE
    (window as any).style = newCssStyle.join("");
    (document as any).createStyleSheet("javascript:style");
  } else {
    // Chrome / FF
    var styleEl = document.createElement("style");
    styleEl.innerHTML = newCssStyle.join("");
    document.body.appendChild(styleEl);
  }
}

export function getImageType(fileExtension: string): number {
  let lowercaseFormat = fileExtension.toLocaleLowerCase(),
    ret = Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF;
  switch (lowercaseFormat) {
    case "bmp":
      ret = Dynamsoft.DWT.EnumDWT_ImageType.IT_BMP;
      break;
    case "jpg":
      ret = Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG;
      break;
    case "tif":
      ret = Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF;
      break;
    case "png":
      ret = Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG;
      break;
    case "pdf":
      ret = Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF;
      break;
  }

  return ret;
}
