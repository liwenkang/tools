// 边界与特殊排序测试
require('../sort.js');
const assert = require('assert');

function testEdgeCases() {
  const obj = {
    '_a': 1,
    '-b': 2,
    '02': 'numLeadingZero',
    '2': 'num2',
    'A': 'upper',
    'a': 'lower',
    '中文': 'cjk',
    '#hash': true,
    nested: { '__x': 1, '10': 2, Z: 3, z: 4, 中文: 5 },
  };
  const keys = global.Sorter.sortedKeyList(obj);
  // 特殊符号桶应包含: '#hash','-b','_a' (按字典序) 然后数字 '02','2' 然后 大写 A 再 小写 a 再 nested 再 中文
  // 根据当前排序实现，特殊符号桶内部按 localeCompare: '-b' < '#hash' < '_a'
  assert.deepStrictEqual(keys, ['_a','-b','#hash','02','2','A','a','nested','中文']);

  // nested 内顺序: 特殊符号 '__x' -> 数字 '10' -> 大写 'Z' -> 小写 'z' -> 中文 '中文'
  const nestedKeys = global.Sorter.sortedKeyList(obj.nested);
  // nested 特殊符号 '__x'，其余按类别与字典序
  assert.deepStrictEqual(nestedKeys, ['__x','10','Z','z','中文']);

  // 空对象不报错
  assert.deepStrictEqual(global.Sorter.sortedKeyList({}), []);

  console.log('✔ 边界与特殊符号排序测试通过');
}

function testParserRejectArray() {
  try {
    global.Sorter.parseObject('[1,2,3]');
    console.error('✘ 数组未被拒绝');
    process.exit(1);
  } catch (e) {
    console.log('✔ 数组被正确拒绝');
  }
}

function testLargeObject() {
  const big = {};
  for (let i=0;i<50;i++) big['k'+i] = i;
  big['_first'] = true; // 应排到前面
  const keys = global.Sorter.sortedKeyList(big);
  assert.ok(keys[0] === '_first', '特殊符号键应在最前');
  console.log('✔ 大对象特殊键优先测试通过');
}

function run() {
  testEdgeCases();
  testParserRejectArray();
  testLargeObject();
  console.log('\n全部扩展测试通过');
}
run();
