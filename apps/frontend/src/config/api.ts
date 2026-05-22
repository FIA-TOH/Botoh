import config from './environment';

function joinUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

export function apiUrl(path: string) {
  return joinUrl(config.apiUrl, path);
}

export function pitwallApiUrl(path: string) {
  return joinUrl(config.pitwallApiUrl, path);
}
