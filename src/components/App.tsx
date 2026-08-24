import React, { Component } from "react";
import DWTEditBar from "./DWTEditBar";
import DWTScan from "./DWTScan";
import DWTUploadAndSave from "./DWTUploadAndSave";
import OutputMessage from "./OutputMessage";
import { DwtUIOperations } from "./tools/dwtUIOperations";
import {
  DWTEnvironment,
  getEffectiveDWTConfig,
} from "../environments/environment";

// Global registry to prevent duplicate DwtUIOperations instances in host MFE scenarios
const dwtInstanceRegistry = new Map<string, DwtUIOperations>();

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

export default class DWTApp extends Component<DWTAppProps> {
  private readonly containerId: string;
  private dwtUtil?: DwtUIOperations;
  private styleLinks: HTMLLinkElement[] = [];
  private config: DWTEnvironment["Dynamsoft"];
  private isInitialized = false;

  static defaultProps: DWTAppProps = {
    showHeader: true,
  };

  constructor(props: DWTAppProps) {
    super(props);

    this.config = getEffectiveDWTConfig(props.config);
    
    // Create a stable cache key based on config to detect remounts
    const cacheKey = `dwt_${this.config.productKey}_${this.config.host}`;
    
    // Check if instance already exists in registry (prevents duplicate instantiation on remount)
    if (dwtInstanceRegistry.has(cacheKey)) {
      this.dwtUtil = dwtInstanceRegistry.get(cacheKey)!;
      this.containerId = this.dwtUtil.getContainerId();
      console.log(`[DWTApp] Reusing existing DwtUIOperations for cache key: ${cacheKey}, containerId: ${this.containerId}`);
    } else {
      // Create new instance only if it doesn't exist
      this.containerId = `dwtcontrolContainer_${Math.random().toString(36).slice(2, 10)}`;
      this.dwtUtil = new DwtUIOperations(this.containerId, this.config);
      dwtInstanceRegistry.set(cacheKey, this.dwtUtil);
      console.log(`[DWTApp] Created new DwtUIOperations for cache key: ${cacheKey}, containerId: ${this.containerId}`);
    }
  }

  private injectStyles() {
    const host = this.config.host;
    const hrefs = [`${host}/assets/Styles/style.css`, `${host}/assets/Styles/fonts.css`];

    this.styleLinks = hrefs.map((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
  }

  private removeStyles() {
    this.styleLinks.forEach((link) => link.remove());
    this.styleLinks = [];
  }

  componentDidMount() {
    // Only initialize on first mount; skip if instance was reused from registry
    if (!this.isInitialized && this.dwtUtil) {
      this.dwtUtil.onPageInit();
      this.isInitialized = true;
      console.log(`[DWTApp] componentDidMount: onPageInit called for containerId: ${this.containerId}`);
    } else {
      console.log(`[DWTApp] componentDidMount: Skipping onPageInit (already initialized) for containerId: ${this.containerId}`);
    }
    this.injectStyles();
  }

  componentWillUnmount() {
    this.removeStyles();
    // Do not destroy the DwtUIOperations instance to preserve state across remounts in host MFE
    console.log(`[DWTApp] componentWillUnmount for containerId: ${this.containerId} (instance preserved in registry)`);
  }

  private handleSaveToLocal(res) {
    const { scannedFileDetails } = this.props;
    if (scannedFileDetails && res) {
      scannedFileDetails(res);
    }

  }

  render() {
    const { className, showHeader, strFileNameWithoutExt } = this.props;
    const host = this.config.host;

    return (
      <div className={className}>
        {showHeader && (
          <>
            <div className="ds-dwt-logo">
              <img
                src={host+'/assets/Images/logo.png'}
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
            <div
              id={this.containerId}
              style={{
                width: "100%",
                height: "600px",
                minHeight: "600px",
                overflow: "hidden",
                background: "#F5F5F5",
              }}
            />
          </div>
          <div id="ScanWrapper">
            <DWTScan dwtUtil={this.dwtUtil} host={this.config.host} />
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
