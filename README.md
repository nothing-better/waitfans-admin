# waitfans 管理端

teriteri 管理端的 React 迁移版本，按仓库根目录的 `MIGRATION_REACT.md`
实现。

## 技术栈

- React 18、TypeScript、Vite 5
- React Router 6、Redux Toolkit
- Ant Design 5、Axios
- Vitest、Testing Library、Oxlint

## 本地运行

```bash
npm install
copy .env.example .env.local
npm run dev
```

默认后端地址为 `http://localhost:8080`；未创建 `.env.local` 时请求使用
`/api` 相对路径。

## 校验

```bash
npm run build
npm run test
npm run lint
```

已迁移管理员登录、仪表盘、视频审核列表、审核详情和审核状态变更流程，
并保留原管理端其余路由的可扩展入口。
