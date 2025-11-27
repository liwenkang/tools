# Changelog

## Unreleased (2025-11-27)

## 重大变更
- feat(release): 解析 commit 正文 BREAKING CHANGE 并生成重大变更分组 — 发布脚本结构调整，需使用新日志格式

## 新增
- feat(release): 解析 commit 正文 BREAKING CHANGE 并生成重大变更分组
- feat(release): 添加语义版本自动检测与 Release Notes 生成脚本
- feat(i18n): 基础中英文切换与持久化语言选择
- feat(ui,theme): 添加暗色主题切换与CSS变量重构
- feat(ui): 输入区自动聚焦，支持 Ctrl/⌘+Enter 触发转换

## 测试
- test(edge): 增加特殊符号/数字/大型对象等排序边界测试
- test(parser): 增加 parseObject 单元测试，覆盖多场景



## v0.1.0 (2025-11-27)

### 新增
- 初始发布：JSON Key 排序工具静态网页 (`index.html`, `style.css`, `script.js`)
- 支持标准 JSON 与 JS 对象字面量（非数组）解析
- 键排序优先级：特殊符号 > 数字 > 大写字母 > 小写字母 > 中文
- 递归对子对象键排序（数组不排序）
- 转换并排序 / 美化输入 / 错误提示交互
- 更新 `README.md`：使用方法、规则、安全说明、离线打开方式

### 清理
- 移除生产环境中不必要的 `debugger` 语句

> 语义化版本：后续如有破坏性改动将提升主版本，新增功能为次版本，修复为补丁版本。
