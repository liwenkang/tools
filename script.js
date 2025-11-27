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
      // 使用自定义序列化保持键排序规则（含整数索引键）
      const jsonStr = window.Sorter.toSortedJSON(inputObj);
      $output.value = jsonStr;
    } catch (err) {
      showError(err.message || String(err));
      $output.value = "";
    }
  });

  $format.addEventListener("click", () => {
    showError("");
    try {
      const inputObj = parseInput($input.value);
      // 美化但保持排序：重新生成排序后 JSON
      $input.value = window.Sorter.toSortedJSON(inputObj);
    } catch (err) {
      showError("美化失败：" + (err.message || String(err)));
    }
  });
})();
