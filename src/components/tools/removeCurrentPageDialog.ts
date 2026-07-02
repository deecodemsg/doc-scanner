declare const Dynamsoft: any;
import { getInputEl } from './common';
import type { DwtUIOperations } from './dwtUIOperations';

export class RemoveCurrentPageDialog {
  protected bNotShowMessageAgain: boolean;
  protected dwtUtil: DwtUIOperations;

  constructor(dwtUtil: DwtUIOperations) {
    this.dwtUtil = dwtUtil;
    this.bNotShowMessageAgain = false;
  }

  remove(): void {
    if (!this.dwtUtil.checkIfImagesInBuffer()) return;

    if (this.bNotShowMessageAgain) {
      this.dwtUtil.removeCurrentImage();
      return;
    }

    const ObjString = [
      '<div class="dynamsoft-dwt-header"></div>',
      '<div class="dynamsoft-dwt-dlg-title">Delete current page?</div>',
      "<div class='dynamsoft-dwt-showMessage'>",
      "<label class='dynamsoft-dwt-showMessage-detail' for='showMessage'>",
      "<input type='checkbox' id='showMessage'/>Don't show this message again.&nbsp;",
      '</label></div>',
      '<div class="dynamsoft-dwt-installdlg-buttons">',
      '<input id="btnDelete" class="button-yes" type="button" value="Yes" />',
      '<input id="btnCancel" class="button-no" type="button" value="No" />',
      '</div>',
    ];

    Dynamsoft.DWT.ShowDialog(500, 0, ObjString.join(''), true, false);

    const btnDelete = getInputEl('btnDelete');
    btnDelete?.addEventListener('click', () => {
      const showMessage = getInputEl('showMessage');
      if (showMessage?.checked) this.bNotShowMessageAgain = true;
      this.dwtUtil.removeCurrentImage();
      Dynamsoft.DWT.CloseDialog();
    });

    const btnCancel = getInputEl('btnCancel');
    btnCancel?.addEventListener('click', () => {
      const showMessage = getInputEl('showMessage');
      if (showMessage?.checked) this.bNotShowMessageAgain = true;
      Dynamsoft.DWT.CloseDialog();
    });
  }
}
