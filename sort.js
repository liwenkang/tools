// 排序逻辑独立模块：暴露 Sorter 到全局（browser）
(function (global) {
  // --- 安全对象字面量解析（无执行） ---
  function stripComments(text) {
    let out = '';
    let inS = false, inD = false, esc = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i+1];
      if (!inS && !inD && ch === '/' && next === '/') {
        while (i < text.length && text[i] !== '\n') i++;
        out += '\n';
        continue;
      }
      if (!inS && !inD && ch === '/' && next === '*') {
        i += 2;
        while (i < text.length && !(text[i] === '*' && text[i+1] === '/')) i++;
        i++; // 跳过 '/'
        continue;
      }
      if (!inD && ch === '\'' && !esc) inS = !inS;
      else if (!inS && ch === '"' && !esc) inD = !inD;
      esc = (ch === '\\' && !esc);
      if (ch !== '\\') esc = false;
      out += ch;
    }
    return out;
  }

  function convertSingleQuotes(text) {
    let out = '';
    let inS = false, inD = false, esc = false;
    for (let i = 0; i < text.length; i++) {
      let ch = text[i];
      if (!inD && ch === '\'' && !esc) {
        // 开始/结束 单引号字符串
        inS = !inS;
        out += '"';
        esc = false;
        continue;
      }
      if (!inS && ch === '"' && !esc) inD = !inD;
      if (inS) {
        if (ch === '"') { out += '\\"'; }
        else if (ch === '\\') { out += '\\\\'; }
        else { out += ch; }
      } else {
        out += ch;
      }
      esc = (ch === '\\' && !esc);
      if (ch !== '\\') esc = false;
    }
    return out;
  }

  function quoteUnquotedKeys(text) {
    let out = '';
    let inS = false, inD = false, esc = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (!inD && ch === '\'' && !esc) { inS = !inS; out += ch; esc = false; continue; }
      if (!inS && ch === '"' && !esc) { inD = !inD; out += ch; esc = false; continue; }
      if (!inS && !inD && (ch === '{' || ch === ',')) {
        out += ch;
        i++;
        while (i < text.length && /\s/.test(text[i])) { out += text[i]; i++; }
        if (text[i] === '"') { out += '"'; continue; }
        // 识别未引号键
        const start = i;
        const isIdStart = /[A-Za-z_$\u4E00-\u9FFF]/.test(text[i] || '');
        if (isIdStart) {
          i++;
          while (i < text.length && /[A-Za-z0-9_$\u4E00-\u9FFF]/.test(text[i])) i++;
          const key = text.slice(start, i);
          let j = i;
          while (j < text.length && /\s/.test(text[j])) j++;
          if (text[j] === ':') {
            out += '"' + key + '"';
            while (i < j) { out += text[i]; i++; }
            out += ':';
            continue;
          } else {
            out += key;
            i = j - 1;
            continue;
          }
        } else {
          i--;
        }
      }
      // 去尾逗号：,\s*[}\]]
      if (!inS && !inD && ch === ',') {
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) j++;
        if (j < text.length && (text[j] === '}' || text[j] === ']')) {
          // 跳过这个逗号
          i = j - 1;
          continue;
        }
      }
      out += ch;
      esc = (ch === '\\' && !esc);
      if (ch !== '\\') esc = false;
    }
    return out;
  }

  function parseObject(text) {
    const raw = (text || '').trim();
    if (!raw) throw new Error('请输入内容');
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
      throw new Error('仅支持对象（非数组）的 JSON');
    } catch (_) {}

    if (!(raw.startsWith('{') && raw.endsWith('}'))) {
      throw new Error('对象字面量需以 { } 包裹');
    }
    let s = stripComments(raw);
    s = convertSingleQuotes(s);
    s = quoteUnquotedKeys(s);
    try {
      const obj = JSON.parse(s);
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
      throw new Error('仅支持对象（非数组）的对象字面量');
    } catch (e) {
      throw new Error('解析失败：请检查输入是否为合法 JSON 或对象字面量');
    }
  }

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
    const rawKeys = Object.keys(obj);
    const buckets = [[], [], [], [], [], []]; // 0 特殊,1 数字,2 大写,3 小写,4 中文,5 兜底
    for (const k of rawKeys) {
      const cat = charCategory(k[0]);
      buckets[cat].push(k);
    }
    for (const b of buckets) {
      b.sort((a, b) => String(a).localeCompare(String(b)));
    }
    const keys = buckets.flat().filter(k => rawKeys.includes(k));
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
  // 提供仅返回排序后的键列表（包含整数索引键也按规则自定义顺序）
  function sortedKeyList(obj) {
    const rawKeys = Object.keys(obj);
    return rawKeys.map(k => ({ k, w: keyWeight(k) }))
      .sort((a, b) => {
        if (a.w[0] !== b.w[0]) return a.w[0] - b.w[0];
        return String(a.w[1]).localeCompare(String(b.w[1]));
      })
      .map(x => x.k);
  }
  // 自定义 JSON 序列化，保持排序规则而不受对象枚举的整数索引提升影响
  function toSortedJSON(obj, indent = 2) {
    function serialize(o, level) {
      if (!o || typeof o !== 'object' || Array.isArray(o)) return JSON.stringify(o);
      const keys = sortedKeyList(o);
      const pad = ' '.repeat(level * indent);
      const padInner = ' '.repeat((level + 1) * indent);
      const parts = keys.map(k => {
        const v = o[k];
        const valueStr = serialize(v, level + 1);
        return `${padInner}${JSON.stringify(k)}: ${valueStr}`;
      });
      if (!parts.length) return '{}';
      return `{$\n${parts.join(',\n')}$\n${pad}}`.replace(/\$\\n/g,'\n');
    }
    // 直接返回构造字符串（避免 JSON.parse 破坏顺序）
    const raw = serialize(obj, 0);
    return raw;
  }
  global.Sorter = { parseObject, charCategory, sortObjectKeys, sortedKeyList, toSortedJSON };
})(typeof window !== 'undefined' ? window : globalThis);
