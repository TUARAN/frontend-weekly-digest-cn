export const BRAND_SITE_URL = 'https://frontendnext.com';
export const WEEKLY_SITE_URL = 'https://frontendweekly.cn';

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
