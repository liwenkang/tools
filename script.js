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

  // 主题切换逻辑
  const THEME_KEY = 'json-key-sort-theme';
  const $themeToggle = document.getElementById('themeToggle');
  function applyTheme(mode) {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  function currentTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch(_){}
  }
  // 初始化主题（优先本地存储，其次系统偏好）
  (function initTheme(){
    let saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch(_){}
    if (!saved) {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      saved = prefersDark ? 'dark' : 'light';
    }
    applyTheme(saved);
  })();
  if ($themeToggle) {
    $themeToggle.addEventListener('click', toggleTheme);
  }

  // 语言切换
  const $langSelect = document.getElementById('langSelect');
  if ($langSelect) {
    $langSelect.addEventListener('change', () => {
      window.I18N && window.I18N.setLanguage($langSelect.value);
    });
  }

  function doConvert() {
    showError("");
    try {
      const inputObj = parseInput($input.value);
      // 性能风险提示：对象过大时提示
      if (window.Sorter && typeof window.Sorter.estimateSize === 'function') {
        const { keys, depth } = window.Sorter.estimateSize(inputObj);
        const KEY_THRESHOLD = 1000; // 键数量阈值
        const DEPTH_THRESHOLD = 10; // 最大嵌套层级阈值
        if (keys > KEY_THRESHOLD || depth > DEPTH_THRESHOLD) {
          showError(`提示：对象较大（键数：${keys}，层级：${depth}），排序/序列化可能较慢。`);
        }
      }
      const jsonStr = window.Sorter.toSortedJSON(inputObj);
      $output.value = jsonStr;
    } catch (err) {
      showError(err.message || String(err));
      $output.value = "";
    }
  }

  $convert.addEventListener("click", doConvert);

  $input.addEventListener("keydown", e => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      doConvert();
      e.preventDefault();
    }
  });

  $format.addEventListener("click", () => {
    showError("");
    try {
      const inputObj = parseInput($input.value);
      if (window.Sorter && typeof window.Sorter.estimateSize === 'function') {
        const { keys, depth } = window.Sorter.estimateSize(inputObj);
        const KEY_THRESHOLD = 1000;
        const DEPTH_THRESHOLD = 10;
        if (keys > KEY_THRESHOLD || depth > DEPTH_THRESHOLD) {
          showError(`提示：对象较大（键数：${keys}，层级：${depth}），美化/排序可能较慢。`);
        }
      }
      // 美化但保持排序：重新生成排序后 JSON
      $input.value = window.Sorter.toSortedJSON(inputObj);
    } catch (err) {
      showError("美化失败：" + (err.message || String(err)));
    }
  });
})();
