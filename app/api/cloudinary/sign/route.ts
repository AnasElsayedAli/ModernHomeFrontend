import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { ALLOWED_CLOUDINARY_FOLDERS, authorizeCloudinaryRequest } from '../access';

export const runtime = 'nodejs';

function buildSignature(params: Record<string, string>, apiSecret: string) {
  const signatureBase = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(`${signatureBase}${apiSecret}`).digest('hex');
}

/**
 * Provides SHA-1 signature for direct client-to-Cloudinary upload.
 * Keeps CLOUDINARY_API_SECRET protected strictly on the server.
 */
export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const defaultFolder = process.env.CLOUDINARY_FOLDER || 'tocco/products';

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { message: 'Server-side Cloudinary credentials are not configured.' },
      { status: 500 }
    );
  }

  let requestedFolder: unknown;
  try {
    const body = await request.json() as { folder?: unknown };
    requestedFolder = body.folder;
  } catch {
    // Body is optional
  }
  const folder = typeof requestedFolder === 'string' && requestedFolder.trim()
    ? requestedFolder.trim()
    : defaultFolder;

  if (!ALLOWED_CLOUDINARY_FOLDERS.has(folder)) {
    return NextResponse.json({ message: 'The requested upload folder is not allowed.' }, { status: 400 });
  }

  const authorizationFailure = await authorizeCloudinaryRequest(request, folder, true);
  if (authorizationFailure) return authorizationFailure;

  const timestamp = String(Math.floor(Date.now() / 1000));
  const uploadParams: Record<string, string> = {
    folder,
    timestamp,
  };

  const signature = buildSignature(uploadParams, apiSecret);

  return NextResponse.json({
    cloud_name: cloudName,
    api_key: apiKey,
    timestamp,
    folder,
    signature,
  });
}
