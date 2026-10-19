import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;
const MIME = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function imageSignature(bytes, type) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return [137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n);
  if (type === "image/webp") return new TextDecoder().decode(bytes.slice(0,4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8,12)) === "WEBP";
  return false;
}

/**
 * POST /api/media/leads
 * ImageKit upload is PROXIED through the Node.js runtime: API private key never
 * reaches the browser, and this server owns the destination folder and name.
 *
 * DEMO SAFETY: This route ONLY works on non-production environments when
 * NODE_ENV=development. Without real server authentication it must
 * stay disabled in production. The dropdown demo identity is NOT authentication.
 *
 * TODO(AUTH): Before enabling production, replace demo gate with a verified
 * session, tenant membership, and (for existing leads) lead ownership/admin
 * authorization. Resolve tenantId from the server session, NOT from form data.
 * TODO(DB): For draft profiles allocate a server-side draft/media entity ID,
 * and after a successful lead save attach ImageKit fileId and URL via MySQL.
 * TODO(CLEANUP): Replacing/deleting a photo requires an authorized backend
 * workflow that removes old ImageKit files; don't delete an image on form cancel.
 */
export async function POST(request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Uploads are disabled until authorized media upload is configured." }, { status: 403 });
  }
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) return NextResponse.json({ error: "IMAGEKIT_PRIVATE_KEY is not configured on the server." }, { status: 503 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    const leadId = form.get("leadId");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image." }, { status: 400 });
    if (!MIME[file.type] || file.size > MAX_BYTES || file.size === 0) return NextResponse.json({ error: "Use JPG, PNG or WebP, maximum 2 MB." }, { status: 400 });
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!imageSignature(bytes, file.type)) return NextResponse.json({ error: "Image file signature is invalid." }, { status: 400 });

    // Always server-owned paths, never use user-provided filenames/folders.
    // SaaS scale: /nexora/{tenantId}/{module}/{resourceId}/{assetType}/
    // DEMO tenant is fixed; production uses tenant ID from authenticated session.
    const tenantId = "demo-workspace";
    const resourceId = typeof leadId === "string" && /^lead-[a-z0-9-]{1,64}$/i.test(leadId)
      ? leadId : `draft-${crypto.randomUUID()}`;
    const folder = `/nexora/${tenantId}/crm/leads/${resourceId}/profile`;
    const fileName = `avatar-${crypto.randomUUID()}.${MIME[file.type]}`;
    const payload = new FormData();
    payload.set("file", new Blob([bytes], { type: file.type }), fileName);
    payload.set("fileName", fileName);
    payload.set("folder", folder);
    payload.set("useUniqueFileName", "true");
    payload.set("isPrivateFile", "false"); // TODO(PRIVACY): Switch to private media + short-lived signed delivery URLs if personal photos require restricted access.
    payload.set("tags", "nexora,crm,leads,profile");
    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}` },
      body: payload, cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.fileId || !result.url) {
      return NextResponse.json({ error: "ImageKit upload failed. Check server credentials and logs." }, { status: 502 });
    }
    return NextResponse.json({ image: { fileId: result.fileId, url: result.url, path: result.filePath || `${folder}/${fileName}` } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to process image upload." }, { status: 500 });
  }
}
