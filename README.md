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

## 安全与限制

- JS 对象字面量解析通过 `Function('return ...')` 包装表达式进行，仅用于对象字面量的解析；请勿输入任何非对象字面量的可执行代码。
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

