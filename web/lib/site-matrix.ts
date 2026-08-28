export const BRAND_SITE_URL = 'https://weekly.2aran.com';
export const WEEKLY_SITE_URL = 'https://weekly.2aran.com';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function normalizeLeadingSlash(value: string): string {
  if (!value) return '';
  return value.startsWith('/') ? value : `/${value}`;
}

export function buildBrandUrl(path = ''): string {
  return `${trimTrailingSlash(BRAND_SITE_URL)}${normalizeLeadingSlash(path)}`;
}

export function buildWeeklyUrl(path = ''): string {
  return `${trimTrailingSlash(WEEKLY_SITE_URL)}${normalizeLeadingSlash(path)}`;
}
