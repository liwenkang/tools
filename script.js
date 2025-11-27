// 简洁的排序规则实现：特殊符号 > 数字 > 大写字母 > 小写字母 > 中文

(function () {
  const $input = document.getElementById("input");
  const $output = document.getElementById("output");
  const $convert = document.getElementById("convert");
  const $format = document.getElementById("format");
  const $error = document.getElementById("error");

  function showError(msg) {
    $error.textContent = msg || "";
  }

  // 判断首字符类别并生成比较权重
  function charCategory(ch) {
    if (!ch) return 5; // 兜底
    const code = ch.codePointAt(0);
    // 数字 0-9
    const isDigit = code >= 48 && code <= 57;
    // 大写 A-Z
    const isUpper = code >= 65 && code <= 90;
    // 小写 a-z
    const isLower = code >= 97 && code <= 122;
    // CJK 统一表意文字（粗略范围）
    const isCJK =
      (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf);

    // 特殊符号：排除上述任何一种即认为是特殊符号（含下划线、连字符等）
    const isSpecial = !(isDigit || isUpper || isLower || isCJK);

    // 规则优先级：特殊符号(0) > 数字(1) > 大写(2) > 小写(3) > 中文(4)
    if (isSpecial) return 0;
    if (isDigit) return 1;
    if (isUpper) return 2;
    if (isLower) return 3;
    if (isCJK) return 4;
    return 5;
  }

  function keyWeight(key) {
    const first = key && key[0];
    return [charCategory(first), key]; // 次级按字典序
  }

  function compareKeys(a, b) {
    const wa = keyWeight(a);
    const wb = keyWeight(b);
    if (wa[0] !== wb[0]) return wa[0] - wb[0];
    // 同类时按本身字典序（localeCompare 保持简单）
    return String(wa[1]).localeCompare(String(wb[1]));
  }

  // 尝试解析输入为对象，兼容 JSON 与 JS 对象字面量（非数组）。
  function parseInput(text) {
    text = (text || "").trim();
    if (!text) throw new Error("请输入内容");

    // 先尝试标准 JSON
    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
      throw new Error("仅支持对象（非数组）的 JSON");
    } catch (_) {}

    // 尝试 JS 对象字面量：包装成表达式安全求值
    // 仅允许对象字面量，避免执行其它代码
    const wrapped = `("use strict"),(${text})`;
    try {
      // 使用 Function 构造器而非 eval，以表达式模式返回对象
      const obj = Function(`return ${wrapped}`)();
      if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
      throw new Error("仅支持对象（非数组）的 JS 对象字面量");
    } catch (e) {
      throw new Error("解析失败：请检查输入是否为合法 JSON 或对象字面量");
    }
  }

  function sortObjectKeys(obj) {
    const keys = Object.keys(obj).sort(compareKeys);
    const out = {};
    for (const k of keys) {
      const v = obj[k];
      // 若值仍为纯对象（非数组），递归排序其子键（可选）
      if (v && typeof v === "object" && !Array.isArray(v)) {
        out[k] = sortObjectKeys(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  function toPrettyJSON(obj) {
    return JSON.stringify(obj, null, 2);
  }

  $convert.addEventListener("click", () => {
    showError("");
    try {
      const inputObj = parseInput($input.value);
      const sorted = sortObjectKeys(inputObj);
      $output.value = toPrettyJSON(sorted);
    } catch (err) {
      showError(err.message || String(err));
      $output.value = "";
    }
  });

  $format.addEventListener("click", () => {
    showError("");
    try {
      const inputObj = parseInput($input.value);
      $input.value = toPrettyJSON(inputObj);
    } catch (err) {
      showError("美化失败：" + (err.message || String(err)));
    }
  });
})();
