(function () {
  const $input = document.getElementById("input");
  const $output = document.getElementById("output");
  const $convert = document.getElementById("convert");
  const $format = document.getElementById("format");
  const $error = document.getElementById("error");

  function showError(msg) {
    $error.textContent = msg || "";
  }

  // 解析输入（兼容 JSON 与对象字面量）
  function parseInput(text) {
    text = (text || "").trim();
    if (!text) throw new Error("请输入内容");
    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
      throw new Error("仅支持对象（非数组）的 JSON");
    } catch (_) {}
    const wrapped = `(\"use strict\"),(${text})`;
    try {
      const obj = Function(`return ${wrapped}`)();
      if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
      throw new Error("仅支持对象（非数组）的 JS 对象字面量");
    } catch (e) {
      throw new Error("解析失败：请检查输入是否为合法 JSON 或对象字面量");
    }
  }

  function toPrettyJSON(obj) {
    return JSON.stringify(obj, null, 2);
  }

  $convert.addEventListener("click", () => {
    showError("");
    try {
      const inputObj = parseInput($input.value);
      const sorted = window.Sorter.sortObjectKeys(inputObj);
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
