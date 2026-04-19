/** Lightweight UA parsing without external deps (best-effort). */

export type ParsedUa = {
  raw: string;
  browser: string;
  engine: string;
  os: string;
  device: string;
  mobile: boolean;
};

function pickBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Microsoft Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/Chrome\/|CriOS/i.test(ua) && !/Edg/i.test(ua)) return "Chrome";
  if (/Firefox\/|FxiOS/i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua) && !/Chrome|Chromium|CriOS/i.test(ua)) return "Safari";
  if (/MSIE |Trident\//i.test(ua)) return "Internet Explorer";
  return "Unknown / other";
}

function pickEngine(ua: string): string {
  if (/Trident\//i.test(ua)) return "Trident";
  if (/AppleWebKit/i.test(ua)) return "WebKit";
  if (/Gecko\/\d/i.test(ua)) return "Gecko";
  return "Unknown";
}

function pickOs(ua: string): string {
  if (/Windows NT 10/i.test(ua)) return "Windows 10/11";
  if (/Windows NT 6\.3/i.test(ua)) return "Windows 8.1";
  if (/Windows NT 6\.2/i.test(ua)) return "Windows 8";
  if (/Windows NT 6\.1/i.test(ua)) return "Windows 7";
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Mac OS X 10[._]\d+/i.test(ua)) {
    const m = ua.match(/Mac OS X (10[._]\d+)/i);
    return m ? `macOS (${m[1]!.replace("_", ".")})` : "macOS";
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    const m = ua.match(/OS (\d+[._]\d+)/i);
    return m ? `iOS ${m[1]!.replace("_", ".")}` : "iOS";
  }
  if (/Android/i.test(ua)) {
    const m = ua.match(/Android ([\d.]+)/i);
    return m ? `Android ${m[1]}` : "Android";
  }
  if (/Linux/i.test(ua)) return "Linux";
  if (/CrOS/i.test(ua)) return "Chrome OS";
  return "Unknown";
}

function pickDevice(ua: string, mobile: boolean): string {
  if (/iPad/i.test(ua)) return "Tablet (iPad)";
  if (/iPhone/i.test(ua)) return "Phone (iPhone)";
  if (/iPod/i.test(ua)) return "Media (iPod)";
  if (/Android.*Mobile/i.test(ua) || (/Android/i.test(ua) && /Mobile/i.test(ua))) {
    return "Phone (Android)";
  }
  if (/Android/i.test(ua)) return "Tablet / device (Android)";
  if (mobile) return "Mobile";
  return "Desktop / unknown form factor";
}

export function parseUserAgent(ua: string): ParsedUa {
  const raw = ua.trim();
  const mobile = /Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    raw,
  );
  return {
    raw,
    browser: pickBrowser(raw),
    engine: pickEngine(raw),
    os: pickOs(raw),
    device: pickDevice(raw, mobile),
    mobile,
  };
}
