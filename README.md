# Waitfans 管理端

Waitfans 管理端是独立的 React 18、TypeScript、Vite 5 仓库，用于管理员登录、内容审核和系统管理。它只通过 HTTP API 访问 `waitfans-backend`。

> **开发前必读**：所有 AI 和开发者必须遵守 [AGENTS.md](AGENTS.md)。任何文件改动都必须验证并创建 Git 提交后才能结束任务。

## 0. 从干净环境启动

以下步骤适用于 Windows PowerShell。

如果用户端、管理端和后端位于同一个 `waitfans` 父目录，最简单的方式是在父目录执行 `.\start-all.ps1`；首次运行使用 `.\start-all.ps1 -Bootstrap`。

1. 按 `../waitfans-backend/README.md` 的“从干净环境启动”完成后端初始化和启动。
2. 确认后端可访问：

```powershell
(Invoke-RestMethod http://127.0.0.1:7070/category/getall).code
```

3. 安装锁定版本并启动管理端：

```powershell
npm ci
npm run dev -- --host 127.0.0.1 --port 8788 --strictPort
```

4. 打开 `http://127.0.0.1:8788/`，验证 Vite 代理：

```powershell
(Invoke-RestMethod http://127.0.0.1:8788/api/category/getall).code
```

预期输出 `200`。

全新数据库没有预置管理员。先在 `http://127.0.0.1:8787/` 注册用户，然后进入后端目录查看本地数据库连接信息：

```powershell
Set-Location ..\waitfans-backend
Get-Content .env.local | Select-String '^WAITFANS_DB_'
```

使用 `.env.local` 中的账号、密码和端口连接 MySQL。例如默认安装路径：

```powershell
& 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe' `
  -h 127.0.0.1 -P 3307 -u waitfans_app -p waitfans
```

输入 `.env.local` 中的 `WAITFANS_DB_PASSWORD`，再执行：

```sql
UPDATE user
SET role = 2, nickname = '管理员'
WHERE username = '刚注册的用户名';
```

退出用户端旧会话，然后使用该账号登录管理端。`role=1` 是管理员，`role=2` 是超级管理员。

日常启动时无需重复 `npm ci`：

```powershell
npm run dev -- --host 127.0.0.1 --port 8788 --strictPort
```

## 1. 运行要求

- Node.js 20 或更高版本（Node.js 22 已验证）
- npm 10 或更高版本（npm 10 已验证）
- Waitfans 后端已启动并监听 `http://127.0.0.1:7070`
- 用于完整验收的测试管理员账号

用户端、管理端和后端分别是独立 Git 仓库。管理端接口、权限或审核流程发生变化时，应在同一次联调中同步检查后端 Controller、Service、鉴权规则和返回结构。

仓库的 `.nvmrc` 固定推荐使用已验证的 Node.js 22.23.1，`package.json` 声明了
最低版本要求，npm 安装时会提示不兼容的工具链。使用 nvm-windows 时可执行
`nvm use 22.23.1`。

## 2. 安装依赖

在本仓库根目录执行：

```powershell
npm install
```

严格按锁文件安装可使用：

```powershell
npm ci
```

## 3. 环境配置

本地开发推荐不创建 `.env.local`。管理端会使用 `/api` 相对路径，由 Vite 转发至 `http://127.0.0.1:7070`。

如需显式保存本机配置：

```powershell
Copy-Item .env.example .env.local
```

默认配置：

```dotenv
VITE_API_BASE_URL=/api
```

注意：

- `/api` 使用 Vite 开发代理；若改为直接访问后端，应填写
  `http://127.0.0.1:7070`，不要再追加 `/api`。
- `.env.local` 不应提交到 Git。
- 修改环境变量后必须重启 Vite。

## 4. 启动开发服务器

先启动后端，再执行：

```powershell
npm run dev -- --host 127.0.0.1 --port 8788 --strictPort
```

默认访问地址：

```text
http://127.0.0.1:8788/
```

等价的 Vite 直接启动命令：

```powershell
.\node_modules\.bin\vite.cmd --host=127.0.0.1 --port=8788 --strictPort
```

代理连通性检查：

```powershell
Invoke-RestMethod http://127.0.0.1:8788/api/category/getall
```

响应体 `code` 应为 `200`。

## 5. 构建与自动化测试

每次提交前执行：

```powershell
npm run build
npm run test
npm run lint
```

命令说明：

- `npm run build`：执行 TypeScript 构建并生成 `dist/`。
- `npm run test`：运行 Vitest。
- `npm run lint`：运行 Oxlint。
- `npm run preview`：预览构建产物；预览服务器不包含 Vite 开发代理。

修改登录、鉴权、审核状态或错误响应时，除前端测试外，还应在后端补充对应的单元测试或契约测试。

## 6. 手工联调清单

建议先清除旧会话：

```javascript
localStorage.removeItem('teri_token')
```

然后依次检查：

1. 打开登录页，确认背景、表单和按钮正常渲染。
2. 输入错误凭证，确认显示“账号或密码不正确”，而不是“登录已过期”。
3. 确认失败登录不会写入 `teri_token`，浏览器控制台没有未处理异常。
4. 使用普通用户账号尝试登录，确认后端拒绝并提示“您不是管理员，无权访问”。
5. 使用有效管理员账号登录，确认进入仪表盘并能刷新管理员信息。
6. 刷新页面，确认有效令牌可以恢复会话。
7. 使用失效或伪造令牌访问受保护页面，确认清理本地令牌并回到登录页。
8. 检查视频审核列表、分页、筛选和审核详情。
9. 在专用测试数据上验证审核状态变更，并刷新用户端确认状态同步。
10. 检查退出登录后后端认证缓存与本地令牌均被清理。

审核、封禁、删除等操作会修改业务数据，应只在隔离的测试库或明确指定的测试记录上执行。

## 7. 登录接口契约

管理员登录请求：

```http
POST /admin/account/login
Content-Type: application/json
```

请求体：

```json
{
  "username": "admin",
  "password": "password"
}
```

认证失败时，后端应返回统一业务响应：

```json
{
  "code": 403,
  "message": "账号或密码不正确",
  "data": null
}
```

共享请求层会将响应体中非 `200` 的业务码转为 rejected Promise。HTTP `401`/`403` 仅用于真正的会话失效场景，登录接口本身的凭证错误由后端业务响应表达。

## 8. 常见问题

### 登录总是提示服务不可用

确认后端已监听 `7070`，并检查 Vite 代理：

```powershell
Test-NetConnection 127.0.0.1 -Port 7070
Invoke-RestMethod http://127.0.0.1:8788/api/category/getall
```

### 登录失败被误判为会话过期

确认后端已更新并重新构建、重启。旧进程可能仍返回 HTTP `403` 异常响应；当前实现会在认证服务中捕获凭证异常，并返回结构化业务错误。

### 端口自动变成 8789

说明 `8788` 已被其他进程占用。停止旧管理端进程后，用 `--strictPort` 重新启动，保证文档和代理检查地址一致。

### 构建成功但生产预览接口失败

`npm run preview` 不使用开发服务器中的 `/api` 代理。生产部署必须由网关转发 `/api`，或在构建前设置正确的 `VITE_API_BASE_URL`。

## 9. 已知问题

### 🟡 占位数据

| # | 位置 | 说明 |
|---|------|------|
| 1 | `pages/GenericPage.tsx:4-19` | 轮播管理、排行管理、专栏审核、头像审核、动态审核、评论审核、弹幕审核、举报处理、申诉处理、用户管理、角色管理等 14 个路由映射到占位页面，显示"暂无数据" |
| 2 | `pages/Dashboard.tsx:113-122` | 审核流程表格数据硬编码 |
| 3 | `components/Layout/AdminLayout.tsx:37-71` | 侧边栏菜单 label 全部硬编码 |

### 🟢 接口不匹配

| # | 问题 | 文件 |
|---|------|------|
| 1 | `PageResult<T>` 结构（`items`/`total`/`page`/`pageSize`）与用户端版本不同 | `api/management.ts` |
| 2 | `request.ts:25` 硬编码比较 `'您不是管理员，无权访问'` 字符串，后端消息变更会导致判断失效 | `api/request.ts` |
| 3 | 空 catch 块在 `pages/Login.tsx:24` | 应至少加 `console.error` |
