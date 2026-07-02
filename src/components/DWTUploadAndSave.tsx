import React, { Component } from "react";
import { getEl, getInputEl, getSelectEl } from "./tools/common";
import { DwtUIOperations } from "./tools/dwtUIOperations";

interface Props {
  dwtUtil: DwtUIOperations;
  strFileNameWithoutExt?: string;
  scannedFileDetails?: (data: {
    fileName: string;
    filePath: string;
    base64?: string;
  }) => void;
}

interface State {
  strFileNameWithoutExt: string;
  strExtension: string;
  folderLocation: string;
  bAllPages: boolean;
}

export default class DWTUploadAndSave extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      strFileNameWithoutExt: props.strFileNameWithoutExt || "WebTWAINImage",
      strExtension: "pdf",
      folderLocation: "",
      bAllPages: true,
    };
  }

  async setFolderLocation(evt: React.ChangeEvent<HTMLSelectElement>) {
    // try {
    //   const folder = evt.target.value.toLowerCase();
    //   this.setState({ folderLocation: folder });
    //   const dirHandle = await (window as any).showDirectoryPicker({
    //     mode: "readwrite",
    //     startIn: folder, // This sets the default directory
    //   });
    //   console.log("User selected:", dirHandle.name);
    // } catch (err) {
    //   console.error("User cancelled or denied access:", err);
    // }
    const folder = evt.target.value;
    this.setState({ folderLocation: folder });
  }

  private submitToServer() {
    const { dwtUtil } = this.props;
    const sourceEl = getSelectEl("source");
  }

  private handleUploadDoc() {
    const { strFileNameWithoutExt, strExtension, bAllPages, folderLocation } =
      this.state;
    this.props.dwtUtil
      .save(
        "server",
        strFileNameWithoutExt,
        strExtension,
        bAllPages.toString(),
        folderLocation,
      )
      .then((res) => console.log("data", res));
  }

  private handleSaveToLocal = () => {
    const { strFileNameWithoutExt, strExtension, bAllPages } = this.state;
    this.props.dwtUtil.save(
      "local",
      strFileNameWithoutExt,
      strExtension,
      bAllPages.toString(),
    ).then((res) => {
      this.props.scannedFileDetails && this.props.scannedFileDetails({ fileName: res.name, filePath: res.path });
    });
  };

  private handleImageExtensionChange(
    evt: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const strNewExtension = evt.target.value.toLowerCase();
    const currentPage = getInputEl("CurrentPage");
    const allPages = getInputEl("AllPages");

    let bAllPages = this.state.bAllPages;
    switch (strNewExtension) {
      case "pdf":
        bAllPages = true;
        break;
      case "tif":
      case "bmp":
      case "jpg":
      case "png":
        bAllPages = false;
        break;
    }

    this.setState({ strExtension: strNewExtension, bAllPages });

    const multiPageSupport =
      strNewExtension === "pdf" || strNewExtension === "tif";
    if (currentPage) currentPage.disabled = !multiPageSupport;
    if (allPages) allPages.disabled = !multiPageSupport;
  }

  render() {
    const { strFileNameWithoutExt, strExtension, bAllPages, folderLocation } =
      this.state;

    return (
      <>
        <div
          id="divUpload"
          className="divinput mt30"
          style={{ position: "relative" }}
        >
          <ul>
            <li>
              <div className="divType">Save Documents</div>
            </li>
          </ul>
        </div>
        <div className="divinput" style={{ padding: "8px" }}>
          <div id="divSaveDetail">
            <ul>
              <li>
                <p>File Name:</p>
                <input
                  type="text"
                  size={20}
                  value={strFileNameWithoutExt}
                  onChange={(e) =>
                    this.setState({ strFileNameWithoutExt: e.target.value })
                  }
                />
                <span> . </span>
                <select
                  size={1}
                  id="fileType"
                  style={{ position: "relative", width: "25%" }}
                  value={strExtension}
                  onChange={(e) => this.handleImageExtensionChange(e)}
                >
                  <option value="pdf">pdf</option>
                  <option value="tif">tif</option>
                  <option value="jpg">jpg</option>
                  <option value="png">png</option>
                  <option value="bmp">bmp</option>
                </select>
              </li>
              <li>
                <span> Pages: </span>
                <label htmlFor="CurrentPage" style={{ marginLeft: "5px" }}>
                  <input
                    type="radio"
                    id="CurrentPage"
                    checked={!bAllPages}
                    onChange={() => this.setState({ bAllPages: false })}
                    name="Pages"
                  />
                  Current Page&nbsp;
                </label>
                <label htmlFor="AllPages">
                  <input
                    type="radio"
                    id="AllPages"
                    checked={bAllPages}
                    onChange={() => this.setState({ bAllPages: true })}
                    name="Pages"
                  />
                  All Pages
                </label>
              </li>
              <li style={{ display: "none" }}>
                <span
                  className="customInfo"
                  onMouseOver={() => {
                    const el = getEl("customDetail");
                    if (el) el.style.display = "";
                  }}
                  onMouseOut={() => {
                    const el = getEl("customDetail");
                    if (el) el.style.display = "none";
                  }}
                >
                  Optional Custom Info <i className="fa fa-download" />
                </span>
                :
                <div style={{ display: "none" }} id="customDetail">
                  You can input any custom info to be uploaded with your images.
                </div>
                <input type="text" id="txt_CustomInfo" />
              </li>
              {/* <hr />
              <li>
                <div>
                  Upload Document to:{" "}
                  <span style={{ color: "red" }}>
                    (* It will upload to server folder)
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <select
                    className="custom-select"
                    style={{ width: "70%", marginRight: "8px" }}
                    id="save-doc"
                    size={1}
                    value={folderLocation}
                    onChange={(e) => {
                      this.setFolderLocation(e);
                    }}
                  >
                    <option value="Downloads">Download Folder</option>
                  </select>
                  <input
                    id="btnUpload"
                    className="btnOrg"
                    type="button"
                    value="Upload"
                    onClick={() => this.handleUploadDoc()}
                  />
                </div>
              </li> */}
              <hr />
              <li>
                <span>Save in Local Directory:</span>
                <input
                  id="btnSave"
                  className="btnOrg"
                  type="button"
                  value="Save to Local Drive &gt;"
                  style={{
                    padding: "8px 12px",
                    margin: "8px",
                    fontSize: "14px",
                  }}
                  onClick={() => this.handleSaveToLocal()}
                />
              </li>
            </ul>
          </div>
          <div id="divUploadedFiles" style={{ display: "none" }}>
            <div id="resultWrap" />
          </div>
        </div>
      </>
    );
  }
}
