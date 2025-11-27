// 排序逻辑独立模块：暴露 Sorter 到全局（browser）
(function (global) {
  function charCategory(ch) {
    if (!ch) return 5;
    const code = ch.codePointAt(0);
    const isDigit = code >= 48 && code <= 57;
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    const isCJK = (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf);
    const isSpecial = !(isDigit || isUpper || isLower || isCJK);
    if (isSpecial) return 0;
    if (isDigit) return 1;
    if (isUpper) return 2;
    if (isLower) return 3;
    if (isCJK) return 4;
    return 5;
  }
  function keyWeight(key) {
    const first = key && key[0];
    return [charCategory(first), key];
  }
  function compareKeys(a, b) {
    const wa = keyWeight(a);
    const wb = keyWeight(b);
    if (wa[0] !== wb[0]) return wa[0] - wb[0];
    return String(wa[1]).localeCompare(String(wb[1]));
  }
  function sortObjectKeys(obj) {
    const keys = Object.keys(obj).sort(compareKeys);
    const out = {};
    for (const k of keys) {
      const v = obj[k];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        out[k] = sortObjectKeys(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  global.Sorter = { charCategory, sortObjectKeys };
})(typeof window !== 'undefined' ? window : globalThis);
