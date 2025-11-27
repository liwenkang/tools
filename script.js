(function () {
  const $input = document.getElementById("input");
  const $output = document.getElementById("output");
  const $convert = document.getElementById("convert");
  const $format = document.getElementById("format");
  const $error = document.getElementById("error");

  function showError(msg) {
    $error.textContent = msg || "";
  }

  // 解析输入（更安全的对象字面量解析）
  function parseInput(text) {
    return window.Sorter.parseObject(text);
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
