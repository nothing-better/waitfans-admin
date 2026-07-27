# Waitfans 管理端

Waitfans 管理端是独立的 React 18、TypeScript、Vite 5 仓库，用于管理员登录、内容审核和系统管理。它只通过 HTTP API 访问 `waitfans-backend`。

## 1. 运行要求

- Node.js 20 或更高版本（本次验证使用 Node.js 24）
- npm 10 或更高版本（本次验证使用 npm 11）
- Waitfans 后端已启动并监听 `http://127.0.0.1:7070`
- 用于完整验收的测试管理员账号

用户端、管理端和后端分别是独立 Git 仓库。管理端接口、权限或审核流程发生变化时，应在同一次联调中同步检查后端 Controller、Service、鉴权规则和返回结构。

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

本地开发推荐不创建 `.env.local`。管理端会使用 `/api` 相对路径，由 Vite 转发至 `http://localhost:7070`。

如需直接访问后端：

```powershell
Copy-Item .env.example .env.local
```

默认配置：

```dotenv
VITE_API_BASE_URL=http://localhost:7070
```

注意：

- 不要在地址末尾追加 `/api`。
- `.env.local` 不应提交到 Git。
- 修改环境变量后必须重启 Vite。

## 4. 启动开发服务器

先启动后端，再执行：

```powershell
npm run dev
```

默认访问地址：

```text
http://127.0.0.1:8788/
```

需要固定监听地址和端口时可执行：

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
