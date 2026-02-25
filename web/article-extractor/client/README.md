Development

1. Start backend (from project root `tools/article-extractor-react/server`):

```powershell
# from repository root
cd tools/article-extractor-react/server;
node index.js
```

2. Start frontend (from `tools/article-extractor-react/client`):

```powershell
cd tools/article-extractor-react/client;
npm install
npm run dev
```

Proxy

The frontend dev server proxies requests starting with `/api` to `http://localhost:4000` by default. If your backend runs on a different port, edit `vite.config.js` and change the `target` accordingly.

