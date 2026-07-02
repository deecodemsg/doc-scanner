import React, { Component } from "react";
import Dynamsoft from "dwt";
import { getSelectEl } from "./tools/common";
import { DwtUIOperations } from "./tools/dwtUIOperations";
import { environment as defaultEnvironment } from "../environments/environment";

interface Props {
  dwtUtil: DwtUIOperations;
}

interface State {
  IfShowUI: boolean;
  IfFeederEnabled: boolean;
  IfAutoDiscardBlankpages: boolean;
  IfDuplexEnabled: boolean;
  PixelType: string;
  Resolution: string;
}

export default class DWTScan extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      IfShowUI: false,
      IfFeederEnabled: true,
      IfAutoDiscardBlankpages: false,
      IfDuplexEnabled: false,
      PixelType: "1",
      Resolution: "200",
    };
  }

  private handlePixelTypeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const el = event.target;
    if (el.checked) {
      const nPixelType = parseInt(el.getAttribute("data-value") ?? "1");
      this.setState({ PixelType: nPixelType.toString() });
    }
  }

  private handleCheckBoxChange(
    event: React.ChangeEvent<HTMLInputElement>,
    checkBoxName: keyof State,
  ) {
    const bChecked = event.target.checked;
    this.setState({ [checkBoxName]: bChecked } as Pick<State, keyof State>);
  }

  render() {
    const HOST = defaultEnvironment.Dynamsoft.host;
    const { dwtUtil } = this.props;
    const {
      IfShowUI,
      IfFeederEnabled,
      IfAutoDiscardBlankpages,
      IfDuplexEnabled,
      PixelType,
      Resolution,
    } = this.state;

    return (
      <div id="divScanner" className="divinput">
        <ul className="PCollapse">
          <li>
            <div className="divType">Custom Scan</div>
            <div id="div_ScanImage" className="divTableStyle">
              <ul id="ulScaneImageHIDE">
                <li>
                  <label htmlFor="source">
                    <p>Select Source:</p>
                  </label>
                  <select
                    size={1}
                    id="source"
                    style={{ position: "relative" }}
                    onChange={(e) =>
                      dwtUtil.handleDeviceChanged(e.target.value)
                    }
                  />
                </li>
                <li id="divProductDetail">
                  <ul id="divTwainType">
                    {/* <li>
                      <label style={{ width: '165px' }} id="lblShowUI" htmlFor="showUI">
                        <input
                          type="checkbox"
                          id="showUI"
                          checked={IfShowUI}
                          onChange={(e) => this.handleCheckBoxChange(e, 'IfShowUI')}
                        />
                        Show Scanner UI&nbsp;
                      </label>
                      <label htmlFor="pageFeeder">
                        <input
                          type="checkbox"
                          id="pageFeeder"
                          checked={IfFeederEnabled}
                          onChange={(e) => this.handleCheckBoxChange(e, 'IfFeederEnabled')}
                        />
                        Use ADF&nbsp;
                      </label>
                    </li>
                    <li>
                      <label style={{ width: '165px' }} htmlFor="DiscardBlankPage">
                        <input
                          type="checkbox"
                          id="DiscardBlankPage"
                          checked={IfAutoDiscardBlankpages}
                          onChange={(e) => this.handleCheckBoxChange(e, 'IfAutoDiscardBlankpages')}
                        />
                        Auto Remove Blank Page
                      </label>
                      <label htmlFor="Duplex">
                        <input
                          type="checkbox"
                          id="Duplex"
                          checked={IfDuplexEnabled}
                          onChange={(e) => this.handleCheckBoxChange(e, 'IfDuplexEnabled')}
                        />
                        2-sided Scan
                      </label>
                    </li> */}
                    <li>
                      Pixel Type:
                      <label
                        htmlFor="BW"
                        style={{ marginLeft: "5px" }}
                        className="lblPixelType"
                      >
                        <input
                          type="radio"
                          id="BW"
                          checked={
                            PixelType ===
                            Dynamsoft.DWT.EnumDWT_PixelType.TWPT_BW.toString()
                          }
                          data-value={Dynamsoft.DWT.EnumDWT_PixelType.TWPT_BW}
                          onChange={(e) => this.handlePixelTypeChange(e)}
                        />
                        B&amp;W{" "}
                      </label>
                      <label htmlFor="Gray" className="lblPixelType">
                        <input
                          type="radio"
                          id="Gray"
                          checked={
                            PixelType ===
                            Dynamsoft.DWT.EnumDWT_PixelType.TWPT_GRAY.toString()
                          }
                          data-value={Dynamsoft.DWT.EnumDWT_PixelType.TWPT_GRAY}
                          onChange={(e) => this.handlePixelTypeChange(e)}
                        />
                        Gray{" "}
                      </label>
                      <label htmlFor="RGB" className="lblPixelType">
                        <input
                          type="radio"
                          id="RGB"
                          checked={
                            PixelType ===
                            Dynamsoft.DWT.EnumDWT_PixelType.TWPT_RGB.toString()
                          }
                          data-value={Dynamsoft.DWT.EnumDWT_PixelType.TWPT_RGB}
                          onChange={(e) => this.handlePixelTypeChange(e)}
                        />
                        Color
                      </label>
                    </li>
                    <li>
                      <span>Resolution:</span>
                      <select
                        className="custom-select w-50"
                        id="Resolution"
                        size={1}
                        value={Resolution}
                        onChange={(e) =>
                          this.setState({ Resolution: e.target.value })
                        }
                      >
                        <option value="100">100</option>
                        <option value="150">150</option>
                        <option value="200">200</option>
                        <option value="300">300</option>
                      </select>
                    </li>
                  </ul>
                </li>
                <li>
                  <input
                    id="btnScan"
                    className="btnScanGray btnScanActive"
                    type="button"
                    value="Scan"
                    onClick={() => {
                      const sourceEl = getSelectEl("source");
                      dwtUtil.acquireImage(sourceEl?.value, this.state);
                    }}
                  />
                  <a
                    id="btnLoad"
                    className="btnLoadAndSave"
                    onClick={() => dwtUtil.loadImage()}
                    style={{ cursor: "pointer" }}
                  >
                    Import Local Images &gt;
                  </a>
                </li>
              </ul>
              <div id="divNoScanners" style={{ visibility: "hidden" }}>
                <a href="#" className="ClosetblLoadImage">
                  <img
                    className="imgClose"
                    src={HOST+'/assets/Images/Close.png'}
                    alt="Close tblLoadImage"
                  />
                </a>
                <img
                  src={HOST+'/assets/Images/Warning.png'}
                  alt="Warning"
                />
                {/* <span className="spanContent">
                  <p className="contentTitle">
                    No TWAIN compatible drivers detected
                  </p>
                  <p className="contentDetail">
                    You can Install a Virtual Scanner:
                  </p>
                  <p className="contentDetail">
                    <a
                      id="samplesource32bit"
                      href="https://download.dynamsoft.com/tool/twainds.win32.installer.2.1.3.msi"
                    >
                      32-bit Sample Source
                    </a>
                    <a
                      id="samplesource64bit"
                      style={{ display: "none" }}
                      href="https://download.dynamsoft.com/tool/twainds.win64.installer.2.1.3.msi"
                    >
                      64-bit Sample Source
                    </a>{" "}
                    from{" "}
                    <a
                      target="_blank"
                      href="http://www.twain.org"
                      rel="noreferrer"
                    >
                      TWG
                    </a>
                  </p>
                </span> */}
              </div>
            </div>
          </li>
        </ul>
      </div>
    );
  }
}
