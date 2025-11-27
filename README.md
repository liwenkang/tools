# JSON Key 排序工具

一个极简网页工具，用于对对象的键进行排序。支持输入标准 JSON 或普通 JavaScript 对象字面量（非数组）。排序优先级：特殊符号 > 数字 > 大写字母 > 小写字母 > 中文。相同类别内按字典序排列。

## 使用方法

1. 打开 `index.html`（直接双击或在浏览器中打开）。
2. 在“输入”区粘贴对象：
   - 支持标准 JSON：`{"a":1,"Z":2,"你好":3,"_x":4,"10":5}`
   - 支持 JS 对象字面量：`{ a: 1, 'Z': 2, 你好: 3, _x: 4, '10': 5 }`
3. 点击“转换并排序键”，在“输出”区查看排序结果（JSON 形式）。
4. 可点击“美化输入”将输入转换为格式化 JSON，便于检查。

## 规则与说明

- 首字符类别用于确定优先级：
  - 特殊符号（如 `_`、`-`、其他非字母数字中文字符）
  - 数字 `0-9`
  - 大写字母 `A-Z`
  - 小写字母 `a-z`
  - 中文（CJK 统一表意文字的常见范围）
- 同一类别内，键按 `localeCompare` 的字典序进行比较。
- 会递归排序对象的子对象键（数组不排序）。

### 关于整数索引键的说明

JavaScript 对象的“可枚举属性顺序”会将“看起来像非负整数的键”（例如 `'10'`）按数字升序提升到普通字符串前面，这会影响 `Object.keys()` 与 `JSON.stringify()` 的输出顺序。因此，单纯依赖它们无法稳定体现“特殊符号 > 数字 > 大写 > 小写 > 中文”的自定义排序规则。

本工具通过两点修复：
- 排序逻辑使用自定义分桶/权重排序，得到稳定的键序列。
- 序列化展示使用 `toSortedJSON`，避免 `JSON.stringify` 的整数索引提升，确保输出顺序与规则一致。

## 安全与限制

- 已移除 `Function` 执行方式，使用“安全转换 + JSON.parse”的解析器：
  - 支持：去注释、单引号字符串、未引号键（含中文/标识符）、去尾逗号。
  - 不支持：表达式、函数、模板字符串、`Date`/`RegExp` 等非常规值。
  - 解析失败时将给出提示；如遇复杂场景，建议先转换为标准 JSON。
- 仅支持对象（非数组）。

## 本地打开

无需安装依赖，直接在浏览器中打开：

```powershell
Start-Process "c:\code\tools\json_key_sort\index.html"
```

## 部署方式（GitHub Actions + Pages）

本仓库已配置 `.github/workflows/deploy-pages.yml`，实现推送到 `main` 后自动发布静态站点到 GitHub Pages：

### 工作流简介

- 触发条件：`main` 分支的 push 或手动 `workflow_dispatch`
- 构建步骤：使用 `actions/checkout` 检出代码，直接将根目录作为 artifact 上传
- 部署步骤：`actions/deploy-pages` 将 artifact 发布为 Pages 站点

### 启用方式

1. 打开仓库 `Settings > Pages`
2. 在 Build and deployment 中选择 `Source: GitHub Actions`
3. 保存后，等待工作流完成（首次约 1-3 分钟）
4. 成功后页面 URL 通常为：`https://<你的用户名>.github.io/tools/`

### 切换来源说明

之前使用的 `gh-pages` 分支已被删除，当前仅通过 Actions 发布；若需回退到分支模式，可重新创建分支并在 Pages 设置中切换。

### 常见问题

- 页面 404：通常是缓存或工作流尚未完成，稍候刷新。
- 样式未更新：确认最新提交已触发工作流，可在 `Actions` 查看执行记录。
- 自定义构建：可在工作流中加入构建步骤（例如压缩、生成版本号注入）。
## 测试与开发

### 运行 Node 测试

项目包含基础排序逻辑测试（无需依赖）：

```bash
npm test
```

### 浏览器快速验证

打开 `test.html` 查看控制台与页面输出。


## 自动化变更日志与发布（release:gen 一体化）

脚本：`scripts/release.js` 统一生成 Release Notes 与更新 `CHANGELOG.md` 顶部 `Unreleased` 段落。

功能：
- 自动检测语义版本递增级别（主/次/补丁），支持 Conventional Commits 与 BREAKING CHANGE。
- 分组输出所有变更（新增/修复/重构/文档/测试/重大变更等）。
- 生成建议版本号、写入 `RELEASE_NOTES.md`，并同步更新 `CHANGELOG.md`。

工作流：
- `.github/workflows/release.yml`：推送 `v*` tag 时自动生成 Release Notes 并发布。
- `.github/workflows/changelog.yml`：推送 tag 时自动运行 `release:gen`，提交最新 `CHANGELOG.md`。

使用方式：
```bash
# 生成 Release Notes 并更新 CHANGELOG
npm run release:gen
```

约定：
- 使用 Conventional Commits 前缀（如 `feat:`、`fix:`、`docs:`）分类。
- BREAKING CHANGE 或 `!:` 标记主版本递增。
- 未分类提交归入“其他”。

