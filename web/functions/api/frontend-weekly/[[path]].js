const UPSTREAM = 'https://2aran.com/api/frontend-weekly';

export async function onRequest({ request, params }) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' },
    });
  }

  const segments = Array.isArray(params.path)
    ? params.path
    : params.path
      ? [params.path]
      : [];
  const pathname = segments.map(encodeURIComponent).join('/');
  const upstreamUrl = pathname ? `${UPSTREAM}/${pathname}` : UPSTREAM;
  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers: { Accept: 'application/json' },
  });
  const headers = new Headers(upstream.headers);
  headers.set('Cache-Control', pathname ? 'public, max-age=300' : 'public, max-age=60');
  headers.set('X-Content-Source', '2aran.com');
  headers.delete('Set-Cookie');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
