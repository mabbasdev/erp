"use client";

import { useRef, useState } from "react";
import { Camera, LoaderCircle, Trash2 } from "lucide-react";
import LeadAvatar from "@/components/leads/LeadAvatar";

/**
 * Server-controlled ImageKit upload; no API keys in this component.
 * `value` is the stored profileImage object; it is not a base64 image.
 * TODO(API): Production flow should upload an image to a temp media record,
 * then PATCH /api/leads/:id with returned `fileId` (server verifies ownership
 * of that media). Remove/replace must be authorized and garbage-collected.
 */
export default function LeadImageUpload({ leadId, leadName, value, onChange }) {
  const fileInput = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const nameParts = leadName.trim().split(/\s+/);
  const lead = { firstName: nameParts[0] || "New", lastName: nameParts.slice(1).join(" "), profileImage: value };

  async function choose(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024 || !file.size) {
      setError("Choose a JPG, PNG or WebP image up to 2 MB."); return;
    }
    setBusy(true); setError(""); setProgress("Uploading to ImageKit...");
    try {
      const data = new FormData(); data.set("file", file);
      if (leadId) data.set("leadId", leadId);
      const response = await fetch("/api/media/leads", { method: "POST", body: data, credentials: "same-origin" });
      const json = await response.json();
      if (!response.ok || !json.image?.fileId) throw new Error(json.error || "Image upload failed.");
      onChange(json.image); // Update form state; save the lead to persist association.
      setProgress("Uploaded. Save the lead to keep this photo.");
    } catch (err) { setError(err.message || "Upload failed."); setProgress(""); }
    finally { setBusy(false); }
  }

  return <div className="flex flex-wrap items-center gap-4">
    <LeadAvatar lead={lead} size="lg" preview />
    <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
      <input ref={fileInput} type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={choose} aria-label="Choose lead photo" />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => fileInput.current?.click()} className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-card px-3 text-[11px] font-medium hover:bg-muted disabled:opacity-50">
          {busy ? <LoaderCircle className="size-3.5 animate-spin"/> : <Camera className="size-3.5"/>}{value ? "Change photo" : "Upload photo"}
        </button>
        {value && <button type="button" disabled={busy} onClick={() => { onChange(null); setProgress("Photo unlinked; save lead to persist."); }} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2 text-[11px] text-rose-500 hover:bg-muted"><Trash2 className="size-3.5"/> Remove</button>}
      </div>
      <span role="status" className="text-[11px] text-muted-foreground">{busy ? "Uploading..." : progress || "Click the avatar to preview an uploaded photo."}</span>
      {error && <p role="alert" className="text-[11px] text-rose-500">{error}</p>}
    </div>
  </div>;
}
