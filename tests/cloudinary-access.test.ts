import { afterEach, describe, expect, it, vi } from 'vitest';
import { authorizeCloudinaryRequest } from '../app/api/cloudinary/access';

function sameOriginRequest(folder: string, origin = 'https://shop.test'): Request {
  return new Request('https://shop.test/api/cloudinary/upload', {
    method: 'POST',
    headers: { cookie: 'access_token=session', origin, 'x-upload-folder': folder },
  });
}

describe('Cloudinary upload authorization', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('allows admin and moderator uploads only to known editor folders', async () => {
    vi.stubEnv('API_PROXY_TARGET', 'https://api.test');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ role: 'MODERATOR' })));

    const response = await authorizeCloudinaryRequest(sameOriginRequest('tocco/products'), 'tocco/products');

    expect(response).toBeNull();
  });

  it('allows customer uploads to custom-design references but not admin folders', async () => {
    vi.stubEnv('API_PROXY_TARGET', 'https://api.test');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ role: 'CUSTOMER' })));

    const customerReferences = await authorizeCloudinaryRequest(
      sameOriginRequest('tocco/custom-designs'),
      'tocco/custom-designs'
    );
    const adminFolder = await authorizeCloudinaryRequest(
      sameOriginRequest('tocco/products'),
      'tocco/products'
    );

    expect(customerReferences).toBeNull();
    expect(adminFolder?.status).toBe(403);
  });

  it('keeps the signing endpoint admin-only, including for custom-design folders', async () => {
    vi.stubEnv('API_PROXY_TARGET', 'https://api.test');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ role: 'CUSTOMER' })));

    const response = await authorizeCloudinaryRequest(
      sameOriginRequest('tocco/custom-designs'),
      'tocco/custom-designs',
      true
    );

    expect(response?.status).toBe(403);
  });

  it('rejects cross-origin requests before checking the session', async () => {
    const backendFetch = vi.fn();
    vi.stubGlobal('fetch', backendFetch);

    const response = await authorizeCloudinaryRequest(
      sameOriginRequest('tocco/products', 'https://evil.test'),
      'tocco/products'
    );

    expect(response?.status).toBe(403);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('rejects arbitrary folders and requires a session outside local direct-API development', async () => {
    const arbitraryFolder = await authorizeCloudinaryRequest(
      sameOriginRequest('unrestricted/folder'),
      'unrestricted/folder'
    );
    const missingSession = await authorizeCloudinaryRequest(
      new Request('https://shop.test/api/cloudinary/upload', { method: 'POST' }),
      'tocco/products'
    );

    expect(arbitraryFolder?.status).toBe(400);
    expect(missingSession?.status).toBe(401);
  });

  it('keeps local direct-API upload development working without forwarding backend-domain cookies', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8000/api');

    const response = await authorizeCloudinaryRequest(
      new Request('http://localhost:3000/api/cloudinary/upload', { method: 'POST' }),
      'tocco/products'
    );

    expect(response).toBeNull();
  });
});