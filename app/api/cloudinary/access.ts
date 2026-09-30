import { NextResponse } from 'next/server';

const ADMIN_ROLES = new Set(['ADMIN', 'MODERATOR']);
const CUSTOMER_ROLES = new Set(['ADMIN', 'MODERATOR', 'CUSTOMER']);

export const ALLOWED_CLOUDINARY_FOLDERS = new Set([
  'tocco/products',
  'tocco/categories',
  'tocco/subcategories',
  'tocco/events',
  'tocco/collaborations',
  'tocco/banners',
  'tocco/custom-designs',
]);

export function isLocalDirectApiDevelopment(request: Request): boolean {
  const hostname = new URL(request.url).hostname;
  return process.env.NODE_ENV === 'development'
    && Boolean(process.env.NEXT_PUBLIC_API_URL)
    && ['localhost', '127.0.0.1', '::1'].includes(hostname);
}

function backendOrigin(): string | null {
  const configuredUrl = process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL;
  if (!configuredUrl) return null;

  const normalizedUrl = configuredUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  try {
    const url = new URL(normalizedUrl);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

export async function authorizeCloudinaryRequest(
  request: Request,
  folder: string,
  adminOnly = false
): Promise<Response | null> {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if ((origin && origin !== requestUrl.origin) || (fetchSite && fetchSite !== 'same-origin')) {
    return NextResponse.json({ message: 'Cross-origin image requests are not allowed.' }, { status: 403 });
  }

  if (!ALLOWED_CLOUDINARY_FOLDERS.has(folder)) {
    return NextResponse.json({ message: 'The requested upload folder is not allowed.' }, { status: 400 });
  }

  const cookie = request.headers.get('cookie');
  if (!cookie && isLocalDirectApiDevelopment(request)) {
    return null;
  }
  if (!cookie) {
    return NextResponse.json({ message: 'Sign in before uploading images.' }, { status: 401 });
  }

  const apiOrigin = backendOrigin();
  if (!apiOrigin) {
    return NextResponse.json({ message: 'The authentication service is unavailable.' }, { status: 503 });
  }

  let role: string;
  try {
    const response = await fetch(`${apiOrigin}/api/auth/me/`, {
      method: 'GET',
      headers: { accept: 'application/json', cookie },
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 401) {
      return NextResponse.json({ message: 'Your session has expired. Sign in again.' }, { status: 401 });
    }
    if (response.status === 403) {
      return NextResponse.json({ message: 'You do not have permission to upload images.' }, { status: 403 });
    }
    if (!response.ok) {
      return NextResponse.json({ message: 'The authentication service is unavailable.' }, { status: 503 });
    }

    const user = await response.json() as { role?: unknown };
    role = typeof user.role === 'string' ? user.role : '';
  } catch {
    return NextResponse.json({ message: 'The authentication service is unavailable.' }, { status: 503 });
  }

  const requiresAdmin = adminOnly || folder !== 'tocco/custom-designs';
  if (requiresAdmin ? !ADMIN_ROLES.has(role) : !CUSTOMER_ROLES.has(role)) {
    return NextResponse.json({ message: 'You do not have permission to upload to this folder.' }, { status: 403 });
  }

  return null;
}