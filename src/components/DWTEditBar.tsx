import React, { Component } from 'react';
import { RemoveCurrentPageDialog } from './tools/removeCurrentPageDialog';
import { RemoveAllPagesDialog } from './tools/removeAllPagesDialog';
import { DwtUIOperations } from './tools/dwtUIOperations';

interface Props {
  dwtUtil: DwtUIOperations;
}

export default class DWTEditBar extends Component<Props> {
  private dlgRemoveCurrent: RemoveCurrentPageDialog;
  private dlgRemoveAll: RemoveAllPagesDialog;

  constructor(props: Props) {
    super(props);
    this.dlgRemoveCurrent = new RemoveCurrentPageDialog(props.dwtUtil);
    this.dlgRemoveAll = new RemoveAllPagesDialog(props.dwtUtil);
  }

  render() {
    const { dwtUtil } = this.props;
    return (
      <div id="divEdit">
        <ul className="operateGrp">
          <li>
            <div
              className="menuIcon RemoveSelectedImages"
              style={{ marginLeft: '5px' }}
              title="Remove current page"
              id="DW_btnRemoveCurrentImage"
              onClick={() => this.dlgRemoveCurrent.remove()}
            />
          </li>
          <li>
            <div
              className="menuIcon RemoveAllImages"
              title="Remove all pages"
              id="DW_btnRemoveAllImages"
              onClick={() => this.dlgRemoveAll.removeAll()}
            />
          </li>
          <li style={{ width: '90px' }} />
          <li className="lblShowCurrentImage">
            <input type="text" size={2} id="DW_CurrentImage" readOnly />
            /
            <input type="text" size={2} id="DW_TotalImage" readOnly />
          </li>
          <li className="lblZoom">
            <ul>
              <li style={{ width: '25%' }}>
                <div
                  className="menuIcon ZoomOut"
                  title="Zoom out"
                  id="btnZoomOut"
                  onClick={() => dwtUtil.onclickZoomOut()}
                />
              </li>
              <li style={{ width: '50%' }}>
                <input type="text" id="DW_spanZoom" readOnly />
              </li>
              <li style={{ width: '25%' }}>
                <div
                  className="menuIcon ZoomIn"
                  title="Zoom in"
                  id="btnZoomIn"
                  onClick={() => dwtUtil.onclickZoomIn()}
                />
              </li>
            </ul>
          </li>
          <li>
            <div
              style={{ marginLeft: '10px' }}
              className="menuIcon OrigSize"
              title="1:1"
              id="btnOrigSize"
              onClick={() => dwtUtil.onclickOrigSize()}
            />
            <div
              className="menuIcon FitWindow"
              title="Fit To Window"
              id="btnFitWindow"
              style={{ display: 'none' }}
              onClick={() => dwtUtil.onclickFitWindow()}
            />
          </li>
          <li style={{ width: '50px' }} />
          <li>
            <div
              className="menuIcon RotateLeft"
              title="Rotate left"
              id="btnRotateL"
              onClick={() => dwtUtil.onclickRotateLeft()}
            />
          </li>
          <li>
            <div className="menuIcon grayimg Crop" title="Please select an area to crop." id="btnCropGray" />
            <div
              className="menuIcon Crop"
              title="Crop"
              id="btnCrop"
              style={{ display: 'none' }}
              onClick={() => dwtUtil.onclickCrop()}
            />
          </li>
          <li>
            <div
              className="menuIcon ShowEditor"
              title="Show image editor"
              id="btnShowImageEditor"
              onClick={() => dwtUtil.onclickShowImageEditor()}
            />
          </li>
          <li style={{ marginTop: '0' }}>
            <div className="menuIcon SelectSelected" title="Select" id="btnSelect_selected" />
            <div
              className="menuIcon Select"
              style={{ display: 'none' }}
              title="Select"
              id="btnSelect"
              onClick={() => dwtUtil.onclickSelect()}
            />
          </li>
          <li style={{ marginTop: '0' }}>
            <div className="menuIcon HandSelected" style={{ display: 'none' }} title="Hand" id="btnHand_selected" />
            <div className="menuIcon Hand" title="Hand" id="btnHand" onClick={() => dwtUtil.onclickHandButton()} />
          </li>
        </ul>
      </div>
    );
  }
}
