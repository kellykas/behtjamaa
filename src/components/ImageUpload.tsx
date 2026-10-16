import { useRef, useState } from "react";
import { Link2, Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  buildImagePath,
  DEFAULT_IMAGE_BUCKET,
  IMAGE_ACCEPT,
  validateImageFile,
} from "@/lib/imageUpload";

/**
 * One picture field: pick a file (or drop it) and get a public URL back.
 *
 * Every place that used to ask an admin to paste a picture URL uses this, so
 * uploading behaves the same in the admin area, the branch portals and the
 * state branch editor. Pasting a link is still available behind a toggle for
 * pictures that already live somewhere else.
 *
 * Uploads default to the `profile-avatars` bucket because its insert policy
 * allows any signed-in manager, while `episode-thumbnails` only allows system
 * admins - so a branch admin or branch leader could not upload there.
 */

type PreviewShape = "avatar" | "thumbnail" | "banner" | "card";

const PREVIEW_CLASS: Record<PreviewShape, string> = {
  avatar: "h-20 w-20 rounded-full",
  thumbnail: "h-24 w-24 rounded-lg",
  banner: "h-28 w-full rounded-lg",
  card: "h-40 w-full rounded-lg",
};

interface ImageUploadProps {
  /** Current public URL, or "" when there is no picture yet. */
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Small note under the control, e.g. where the picture is used. */
  hint?: string;
  bucket?: string;
  /** Folder inside the bucket, e.g. "events". */
  folder?: string;
  preview?: PreviewShape;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Hide the link toggle when a field should only ever hold an upload. */
  allowUrl?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  label,
  hint,
  bucket = DEFAULT_IMAGE_BUCKET,
  folder,
  preview = "card",
  disabled = false,
  className,
  id,
  allowUrl = true,
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const { toast } = useToast();

  const upload = async (file: File | null | undefined) => {
    if (disabled || uploading) return;
    const problem = validateImageFile(file);
    if (problem) {
      toast({ title: "Cannot use that image", description: problem, variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const path = buildImagePath(file!.name, folder);
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file!, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      if (!data?.publicUrl) throw new Error("Could not build a public link for that image.");
      onChange(data.publicUrl);
      toast({ title: "Image uploaded" });
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const pick = () => inputRef.current?.click();

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0])}
        disabled={disabled || uploading}
      />

      {value ? (
        <div className="space-y-3">
          <div className="relative w-fit max-w-full overflow-hidden rounded-xl border bg-muted">
            <img src={value} alt={label || "Selected image"} className={cn("object-cover", PREVIEW_CLASS[preview])} />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={pick} disabled={disabled || uploading}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => onChange("")}
              disabled={disabled || uploading}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !uploading) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            upload(e.dataTransfer?.files?.[0]);
          }}
          disabled={disabled || uploading}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/50",
            (disabled || uploading) && "cursor-not-allowed opacity-60",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </>
          ) : (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <Upload className="h-4 w-4 text-muted-foreground" />
              </span>
              <span className="text-sm font-medium">Upload a picture</span>
              <span className="text-xs text-muted-foreground">
                Click to choose a file, or drop one here — PNG, JPG, GIF or WebP up to 5MB
              </span>
            </>
          )}
        </button>
      )}

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {allowUrl && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowUrl((s) => !s)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Link2 className="h-3.5 w-3.5" />
            {showUrl ? "Hide link field" : "Or paste an image link instead"}
          </button>
          {showUrl && (
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              className="text-xs"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
