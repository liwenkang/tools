// 简单 Node 测试：验证排序优先级与递归
require('../sort.js'); // 在全局挂载 Sorter
const assert = require('assert');

function runTests() {
  const input = {
    a: 1,
    Z: 2,
    你好: 3,
    _x: 4,
    '10': 5,
    nested: { b: 2, A: 1, _c: 3 },
  };
  const sorted = global.Sorter.sortObjectKeys(input);
  const keys = Object.keys(sorted);
  // 期望顺序：特殊符号开头 _x -> 数字 '10' -> 大写 Z -> 小写 a -> 中文 你好 -> nested
  assert.deepStrictEqual(keys, ['_x', '10', 'Z', 'a', '你好', 'nested']);
  const nestedKeys = Object.keys(sorted.nested);
  assert.deepStrictEqual(nestedKeys, ['_c', 'A', 'b']);
  console.log('✔ 基本与递归排序测试通过');

  // 空对象
  assert.deepStrictEqual(global.Sorter.sortObjectKeys({}), {});
  console.log('✔ 空对象测试通过');

  // 混合类型值保持不变
  const mixed = { a: 1, b: [1,2], c: { z: 1, y: 2 } };
  const mixedSorted = global.Sorter.sortObjectKeys(mixed);
  assert.ok(Array.isArray(mixedSorted.b), '数组应保持原样');
  assert.deepStrictEqual(Object.keys(mixedSorted.c), ['y','z'].sort((x,y)=> x.localeCompare(y)), '子对象排序');
  console.log('✔ 数组与子对象处理测试通过');

  console.log('\n全部测试通过');
}

runTests();
