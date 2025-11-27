(function(global){
  const I18N_KEY = 'json-key-sort-lang';
  const dict = {
    zh: {
      title: 'JSON Key 排序工具',
      description: '输入一个 JSON 或普通 JavaScript 对象（非数组），按优先级排序其键：特殊符号 > 数字 > 大写字母 > 小写字母 > 中文。',
      inputLabel: '输入',
      outputLabel: '输出（已按规则排序的对象）',
      convertBtn: '转换并排序键',
      formatBtn: '美化输入',
      toggleTheme: '🌓 切换主题'
    },
    en: {
      title: 'JSON Key Sorter',
      description: 'Paste a JSON or plain JS object (non-array) and sort keys by priority: symbol > digit > upper > lower > CJK.',
      inputLabel: 'Input',
      outputLabel: 'Output (sorted object)',
      convertBtn: 'Convert & Sort Keys',
      formatBtn: 'Format Input',
      toggleTheme: '🌓 Toggle Theme'
    }
  };
  function getSaved(){ try { return localStorage.getItem(I18N_KEY); } catch(_) { return null; } }
  function saveLang(l){ try { localStorage.setItem(I18N_KEY,l); } catch(_){} }
  function current(){ return getSaved() || 'zh'; }
  function apply(lang){
    const pack = dict[lang] || dict.zh;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (pack[key]) el.textContent = pack[key];
    });
    // label attributes
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-label');
      if (pack[key]) el.setAttribute('aria-label', pack[key]);
    });
    const select = document.getElementById('langSelect');
    if (select) select.value = lang;
  }
  function init(){ apply(current()); }
  function setLanguage(lang){ saveLang(lang); apply(lang); }
  global.I18N = { setLanguage, current, dict };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})(typeof window !== 'undefined' ? window : globalThis);
