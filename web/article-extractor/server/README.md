Proxy configuration

This backend supports fetching pages through an HTTP/HTTPS proxy. Useful when direct access to target websites fails due to network/DNS restrictions.

Usage:

- Install dependencies (if not installed):
  cd tools/article-extractor-react; npm install

- Set the proxy environment variable (examples):
  - Windows PowerShell:
    $env:FETCH_PROXY = 'http://127.0.0.1:7890'
    node server/index.js

  - Cross-platform (bash):
    FETCH_PROXY='http://127.0.0.1:7890' node server/index.js

Fallbacks:
- If `FETCH_PROXY` is not set, the code will also check `HTTP_PROXY` and `HTTPS_PROXY`.

Notes:
- This uses the `https-proxy-agent` package. The project `package.json` includes it as a dependency. If you encounter an error asking to install it, run `npm install https-proxy-agent` in `tools/article-extractor-react`.
- Proxy must be accessible from the machine running the backend.

