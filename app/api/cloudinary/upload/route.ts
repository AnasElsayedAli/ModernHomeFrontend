import crypto from 'node:crypto';
import {
  ALLOWED_CLOUDINARY_FOLDERS,
  authorizeCloudinaryRequest,
  isLocalDirectApiDevelopment,
} from '../access';

export const runtime = 'nodejs';
const PRODUCT_IMAGE_TRANSFORMATION = 'c_pad,w_1200,h_1200,b_white';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 256 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

async function parseLimitedFormData(request: Request): Promise<FormData> {
  const contentType = request.headers.get('content-type');
  if (!contentType?.toLowerCase().startsWith('multipart/form-data')) {
    throw new TypeError('Expected a multipart image upload.');
  }

  const reader = request.body?.getReader();
  if (!reader) throw new TypeError('The upload body is missing.');

  const chunks: ArrayBuffer[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_REQUEST_SIZE) {
      await reader.cancel();
      throw new RangeError('The upload exceeds the 10 MB limit.');
    }
    chunks.push(Uint8Array.from(value).buffer);
  }

  const body = new Blob(chunks);
  const formRequest = new Request(request.url, {
    method: 'POST',
    headers: { 'content-type': contentType },
    body,
  });
  return formRequest.formData();
}

function buildSignature(params: Record<string, string>, apiSecret: string) {
  const signatureBase = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(`${signatureBase}${apiSecret}`).digest('hex');
}

export async function POST(request: Request) {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const defaultFolder = process.env.CLOUDINARY_FOLDER || 'tocco/products';

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json({ message: 'Cloudinary is not configured.' }, { status: 500 });
  }

  const headerFolder = request.headers.get('x-cloudinary-folder');
  const preflightFolder = headerFolder?.trim() || defaultFolder;
  if (!headerFolder && !isLocalDirectApiDevelopment(request)) {
    return Response.json({ message: 'The upload folder header is required.' }, { status: 400 });
  }
  if (headerFolder && !ALLOWED_CLOUDINARY_FOLDERS.has(preflightFolder)) {
    return Response.json({ message: 'The requested upload folder is not allowed.' }, { status: 400 });
  }
  if (headerFolder) {
    const authorizationFailure = await authorizeCloudinaryRequest(request, preflightFolder);
    if (authorizationFailure) return authorizationFailure;
  }

  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
    return Response.json({ message: 'The upload exceeds the 10 MB limit.' }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await parseLimitedFormData(request);
  } catch (error) {
    if (error instanceof RangeError) {
      return Response.json({ message: 'The upload exceeds the 10 MB limit.' }, { status: 413 });
    }
    return Response.json({ message: 'The upload form is invalid or exceeds the size limit.' }, { status: 400 });
  }
  const file = formData.get('file');
  const requestedFolder = formData.get('folder');
  const folder = typeof requestedFolder === 'string' && requestedFolder.trim()
    ? requestedFolder.trim()
    : preflightFolder;
  const preserveAspectRatio = formData.get('preserve_aspect_ratio') === 'true';

  if (headerFolder && folder !== preflightFolder) {
    return Response.json({ message: 'Upload folder values do not match.' }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return Response.json({ message: 'Missing image file.' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ message: 'The upload exceeds the 10 MB limit.' }, { status: 413 });
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    return Response.json({ message: 'Only JPEG, PNG, WebP, AVIF, and GIF images are accepted.' }, { status: 415 });
  }
  if (!ALLOWED_CLOUDINARY_FOLDERS.has(folder)) {
    return Response.json({ message: 'The requested upload folder is not allowed.' }, { status: 400 });
  }

  if (!headerFolder) {
    const authorizationFailure = await authorizeCloudinaryRequest(request, folder);
    if (authorizationFailure) return authorizationFailure;
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const uploadParams: Record<string, string> = preserveAspectRatio
    ? { folder, timestamp }
    : { folder, timestamp, transformation: PRODUCT_IMAGE_TRANSFORMATION };
  const signature = buildSignature(uploadParams, apiSecret);

  const cloudinaryForm = new FormData();
  cloudinaryForm.append('file', file, file.name);
  cloudinaryForm.append('api_key', apiKey);
  cloudinaryForm.append('timestamp', timestamp);
  cloudinaryForm.append('folder', folder);
  if (!preserveAspectRatio) {
    cloudinaryForm.append('transformation', PRODUCT_IMAGE_TRANSFORMATION);
  }
  cloudinaryForm.append('signature', signature);

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: cloudinaryForm,
    }
  );

  if (!cloudinaryResponse.ok) {
    const errorText = await cloudinaryResponse.text();
    let cloudinaryMessage = 'Cloudinary upload failed.';
    try {
      const errorPayload = JSON.parse(errorText) as { error?: { message?: string } };
      cloudinaryMessage = errorPayload.error?.message || cloudinaryMessage;
    } catch {
      // Keep the generic message when Cloudinary does not return JSON.
    }

    return Response.json(
      {
        message: cloudinaryMessage,
        details: errorText,
      },
      { status: cloudinaryResponse.status === 403 ? 403 : 502 }
    );
  }

  const payload = await cloudinaryResponse.json();

  return Response.json({
    url: payload.secure_url || payload.url,
    public_id: payload.public_id,
    width: payload.width,
    height: payload.height,
  });
}
