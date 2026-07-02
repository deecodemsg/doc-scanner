export function getEl(elId: string): HTMLElement | null {
  return document.getElementById(elId);
}

export function getInputEl(elId: string): HTMLInputElement | null {
  return getEl(elId) as HTMLInputElement;
}

export function getSelectEl(elId: string): HTMLSelectElement | null {
  return getEl(elId) as HTMLSelectElement;
}

export function isString(o: unknown): boolean {
  if (o === undefined || o === null) return false;
  return typeof o === 'string';
}

export function isNumber(o: unknown): boolean {
  if (o === undefined || o === null) return false;
  const _num = parseInt(o as string);
  return _num === 0 || _num > 0 || _num < 0;
}

export function elAddClass(element: HTMLElement | null, className: string): void {
  element?.classList.add(className);
}

export function elRemoveClass(element: HTMLElement | null, className: string): void {
  element?.classList.remove(className);
}

export function elHide(element: HTMLElement | null): void {
  if (element) element.style.display = 'none';
}

export function elShow(element: HTMLElement | null): void {
  if (element) element.style.display = '';
}

// ── Browser detection ────────────────────────────────────────────────────────

let _bWin = false,
  _bWin64 = false,
  _bLinux = false,
  _bMac = false,
  _bChromeOS = false,
  _bEdge = false,
  _bChrome = false,
  _bOpera = false,
  _bFirefox = false,
  _bSafari = false,
  _bIE = false,
  _bUseUserAgent = false;

if ('userAgentData' in navigator) {
  const uaData: any = (navigator as any).userAgentData;
  const _platform: string = uaData.platform.toLowerCase();
  let aryBrands: any[] = [];

  if (Array.isArray(uaData['brands']) && uaData['brands'].length > 0) {
    aryBrands = uaData.brands;
  } else if (Array.isArray(uaData['uaList']) && uaData['uaList'].length > 0) {
    aryBrands = uaData.uaList;
  }

  if (aryBrands.length === 0) {
    _bUseUserAgent = true;
  } else {
    for (const elBrand of aryBrands) {
      const brand: string = elBrand.brand.toLowerCase();
      if (brand.includes('chrome')) { _bChrome = true; break; }
      else if (brand.includes('edge')) { _bEdge = true; break; }
      else if (brand.includes('opera')) { _bOpera = true; break; }
    }
    if (!_bChrome && !_bEdge && !_bOpera) _bChrome = true;

    _bMac = _platform.includes('mac');
    _bChromeOS = _platform.includes('chrome os');
    _bWin = _platform === 'windows';
    _bLinux = _platform === 'linux';
  }
} else {
  _bUseUserAgent = true;
}

if (_bUseUserAgent) {
  const ua = navigator.userAgent.toLowerCase();
  const _platform = navigator.platform.toLowerCase();
  const _bHarmonyOS = /harmonyos/g.test(ua);

  _bChromeOS = !_bHarmonyOS && /cros/.test(ua);
  _bFirefox = ua.indexOf('firefox') !== -1;
  _bSafari = !!ua.match(/version\/[\d.]+.*safari/);

  const _bAndroid = !_bHarmonyOS && /android/g.test(ua);
  const _biPhone = /iphone/g.test(ua);
  const _bPadOrMacDesktop = /macintosh/.test(ua);
  const _maxTouchPoints = navigator.maxTouchPoints || 0;
  const _biPad = /ipad/g.test(ua) || ((_bPadOrMacDesktop || _platform === 'macintel') && _maxTouchPoints > 1);
  const _bNexus = !(/ucweb|ucbrowser/g.test(ua)) && /nexus/g.test(ua) && /version\/[\d.]+.*safari\//g.test(ua);
  const _bPlaybook = /playbook/g.test(ua);
  const _bHpTablet = /hp-tablet/g.test(ua);
  const _bBlackBerry = /blackberry|bb10/g.test(ua);
  const _bSymbian = /symbian/g.test(ua);
  const _bWindowsPhone = /windows phone/g.test(ua);
  const _bOtherMobile = /mobile/g.test(ua);

  const _bPad = _bPlaybook || _biPad || _bHpTablet;
  const _bMobile =
    !_bPad && !_bChromeOS &&
    (_biPhone || _bNexus || _bBlackBerry || _bSymbian || _bWindowsPhone || _bAndroid || _bHarmonyOS || _bOtherMobile);
  const _bNotMobileOS = !_bMobile && !_bPad && !_bChromeOS;

  const _nMSIE = ua.indexOf('msie');
  const _nTrident = ua.indexOf('trident');
  const _nRV = ua.indexOf('rv:');
  const _indexOfChrome = ua.indexOf('chrome');
  const _nEdge = ua.indexOf('edge');

  _bWin = _bNotMobileOS && /win32|win64|windows/.test(_platform);
  _bEdge = _bWin && !_bFirefox && _nEdge !== -1;
  _bChrome = !_bEdge && _indexOfChrome !== -1;
  _bWin64 = _bWin && /win64|x64/.test(ua);
  _bMac = _bNotMobileOS && /mac68k|macppc|macintosh|macintel/.test(ua);
  _bLinux = _bNotMobileOS && /linux/.test(_platform);
  _bIE = _bWin && !_bFirefox && !_bEdge && !_bChrome && (_nMSIE !== -1 || _nTrident !== -1 || _nRV !== -1);
}

export const browserInfo = {
  bWin: _bWin,
  bWin64: _bWin64,
  bLinux: _bLinux,
  bMac: _bMac,
  bChromeOS: _bChromeOS,
  bChrome: _bChrome,
  bEdge: _bEdge,
  bFirefox: _bFirefox,
  bIE: _bIE,
  bSafari: _bSafari,
};
