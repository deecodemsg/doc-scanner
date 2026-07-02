import React, { Component } from "react";
import DWTEditBar from "./DWTEditBar";
import DWTScan from "./DWTScan";
import DWTUploadAndSave from "./DWTUploadAndSave";
import OutputMessage from "./OutputMessage";
import { DwtUIOperations } from "./tools/dwtUIOperations";
import {
  DWTEnvironment,
  environment as defaultEnvironment,
} from "../environments/environment";
import { Helmet } from "react-helmet";

export interface DWTAppProps {
  /**
   * Override environment config (e.g. custom productKey, resourcesPath, uploadTargetURL).
   * Merges with defaults; any provided keys take precedence.
   */
  config?: Partial<DWTEnvironment["Dynamsoft"]>;
  /** Custom CSS class on the root wrapper element */
  className?: string;
  /** Show the logo header (default: true) */
  showHeader?: boolean;
  strFileNameWithoutExt?: string;
  scannedFileDetails?: (data: { fileName: string; fileAddress: string }) => void; // Adjust the type as needed
}

const containerId = "dwtcontrolContainer";

export default class DWTApp extends Component<DWTAppProps> {
  private dwtUtil: DwtUIOperations;

  static defaultProps: DWTAppProps = {
    showHeader: true,
  };

  constructor(props: DWTAppProps) {
    super(props);

    // Merge caller-supplied config with defaults so the component can be
    // dropped into a host app with a different product key / upload target.
    if (props.config) {
      Object.assign(defaultEnvironment.Dynamsoft, props.config);
    }

    this.dwtUtil = new DwtUIOperations(containerId);
  }

  componentDidMount() {
    this.dwtUtil.onPageInit();
  }

  componentWillUnmount() {
    this.dwtUtil.destroy();
  }

  private handleSaveToLocal(res) {
    const { scannedFileDetails } = this.props;
    if (scannedFileDetails && res) {
      scannedFileDetails(res);
    }

  }

  render() {
    const { className, showHeader, strFileNameWithoutExt } = this.props;
    const HOST = defaultEnvironment.Dynamsoft.host;

    return (
      <div className={className}>
        <Helmet>
          <link
            rel="stylesheet"
            href={HOST+'/assets/Styles/style.css'}
          />
          <link
            rel="stylesheet"
            href={HOST+'/assets/Styles/fonts.css'}
          />
        </Helmet>
        {showHeader && (
          <>
            <div className="ds-dwt-logo">
              <img
                src={HOST+'/assets/Images/logo.png'}
                alt="Dynamsoft Logo"
              />
            </div>
            <div className="ds-dwt-content ds-dwt-center">
              <div className="ds-dwt-header">
                <h1>Scan and upload documents in browsers</h1>
              </div>
            </div>
          </>
        )}
        <div className="ds-dwt-content ds-dwt-center">
          <div id="DWTcontainerTop">
            <DWTEditBar dwtUtil={this.dwtUtil} />
            <div id={containerId} />
          </div>
          <div id="ScanWrapper">
            <DWTScan dwtUtil={this.dwtUtil} />
            <DWTUploadAndSave
              dwtUtil={this.dwtUtil}
              strFileNameWithoutExt={strFileNameWithoutExt || undefined}
              scannedFileDetails={(res) => this.handleSaveToLocal(res)}
            />
            <OutputMessage />
          </div>
        </div>
      </div>
    );
  }
}
