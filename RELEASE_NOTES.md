# v1.0.0

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

