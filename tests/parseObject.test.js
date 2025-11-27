// parseObject 单元测试
require('../sort.js');
const assert = require('assert');
const parse = global.Sorter.parseObject;

function testParse(desc, input, expected) {
  let result;
  try {
    result = parse(input);
    assert.deepStrictEqual(result, expected);
    console.log('✔', desc);
  } catch (e) {
    console.error('✘', desc, e.message);
    throw e;
  }
}

// 标准 JSON
testParse('标准 JSON', '{"a":1,"b":2}', { a:1, b:2 });
// 单引号字符串
testParse('单引号字符串', "{a: 'x', b: 2}", { a:'x', b:2 });
// 未引号键
testParse('未引号键', '{a:1, b:2, 中文:3}', { a:1, b:2, 中文:3 });
// 去尾逗号
testParse('去尾逗号', '{a:1, b:2,}', { a:1, b:2 });
// 去注释
testParse('去注释', '{a:1, /* 注释 */ b:2, // 行注释\nc:3}', { a:1, b:2, c:3 });
// 嵌套对象
testParse('嵌套对象', '{a:1, b:{c:2}}', { a:1, b:{c:2} });
// 中文键与单引号
testParse('中文键与单引号', "{中文: '你好', a: 1}", { 中文:'你好', a:1 });
// 失败场景
try {
  parse('{a:1, b:2');
  console.error('✘ 未闭合对象未抛错');
  process.exit(1);
} catch(e) {
  console.log('✔ 未闭合对象抛错');
}
try {
  parse('{a:1, b: function(){}}');
  console.error('✘ 不支持表达式未抛错');
  process.exit(1);
} catch(e) {
  console.log('✔ 不支持表达式抛错');
}
