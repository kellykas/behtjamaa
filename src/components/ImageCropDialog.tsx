import { useEffect, useRef, useState } from "react";
import { Crop, Loader2, Move, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { centredOffset, cropGeometry, cropSourceRect, MIN_ZOOM, MAX_ZOOM } from "@/lib/imageCrop";

/** Saved square size. The card shows it at ~224px, so this stays sharp on retina. */
const OUTPUT_SIZE = 800;

interface ImageCropDialogProps {
  open: boolean;
  file: File | null;
  onCancel: () => void;
  onCropped: (blob: Blob) => void | Promise<void>;
}

/**
 * Square crop editor for a leader picture.
 *
 * A photo straight from a phone is rarely framed for the square card, so the
 * uploader drags the picture to choose what sits in the square and zooms in when
 * the face is too small. The saved file is exactly the square shown here — the
 * preview and the canvas share `cropGeometry`.
 */
export const ImageCropDialog = ({ open, file, onCancel, onCropped }: ImageCropDialogProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [stage, setStage] = useState(288);
  const [saving, setSaving] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  // Load the picked file and reset the framing each time the dialog opens.
  useEffect(() => {
    if (!open || !file) return;
    setImage(null);
    setError(null);
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      setImage(img);
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      setOffset(
        centredOffset({ imageWidth: width, imageHeight: height, stage: Number(stageRef.current?.clientWidth) || 288, zoom: MIN_ZOOM })
      );
    };
    img.onerror = () => setError("That picture could not be opened. Try another file.");
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [open, file]);

  // Keep the stage square and measured, so drag bounds match what is on screen.
  useEffect(() => {
    const element = stageRef.current;
    if (!open || !element) return;
    const measure = () => setStage(element.clientWidth || 288);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [open, image]);

  const geometry = image
    ? cropGeometry({
        imageWidth: image.naturalWidth,
        imageHeight: image.naturalHeight,
        stage,
        zoom,
        offset,
      })
    : null;

  const handleZoom = (value: number[]) => {
    if (!image) return;
    const nextZoom = (value[0] ?? 100) / 100;
    // Zoom about the centre of the square so the visible area stays put.
    const before = geometry;
    const after = cropGeometry({
      imageWidth: image.naturalWidth,
      imageHeight: image.naturalHeight,
      stage,
      zoom: nextZoom,
      offset,
    });
    if (before && after) {
      const centreX = stage / 2;
      const centreY = stage / 2;
      const ratioX = before.width ? after.width / before.width : 1;
      const ratioY = before.height ? after.height / before.height : 1;
      const scaled = cropGeometry({
        imageWidth: image.naturalWidth,
        imageHeight: image.naturalHeight,
        stage,
        zoom: nextZoom,
        offset: {
          x: centreX - (centreX - offset.x) * ratioX,
          y: centreY - (centreY - offset.y) * ratioY,
        },
      });
      setOffset({ x: scaled.x, y: scaled.y });
    }
    setZoom(nextZoom);
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!image || !geometry) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: geometry.x,
      originY: geometry.y,
    };
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !image) return;
    // Clamp as we go, so the picture never leaves a gap inside the square.
    const limited = cropGeometry({
      imageWidth: image.naturalWidth,
      imageHeight: image.naturalHeight,
      stage,
      zoom,
      offset: {
        x: drag.originX + (event.clientX - drag.startX),
        y: drag.originY + (event.clientY - drag.startY),
      },
    });
    setOffset({ x: limited.x, y: limited.y });
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const resetFraming = () => {
    if (!image) return;
    setZoom(MIN_ZOOM);
    setOffset(centredOffset({ imageWidth: image.naturalWidth, imageHeight: image.naturalHeight, stage, zoom: MIN_ZOOM }));
  };

  const save = async () => {
    if (!image) return;
    const source = cropSourceRect({
      imageWidth: image.naturalWidth,
      imageHeight: image.naturalHeight,
      stage,
      zoom,
      offset,
    });
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext("2d");
    if (!context) {
      setError("This browser cannot crop the picture. Try another browser.");
      return;
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    context.imageSmoothingQuality = "high";
    context.drawImage(image, source.x, source.y, source.width, source.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    setSaving(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) {
        setError("Could not prepare the cropped picture. Try another file.");
        return;
      }
      await onCropped(blob);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !saving && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-4 w-4 text-primary" /> Frame the picture
          </DialogTitle>
          <DialogDescription>
            Drag the picture to move it and use the slider to zoom. The square is exactly how it will appear on the card.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={stageRef}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="relative mx-auto aspect-square w-full max-w-[288px] touch-none select-none overflow-hidden rounded-2xl bg-slate-900 cursor-grab active:cursor-grabbing"
        >
          {image && geometry ? (
            <img
              src={image.src}
              alt=""
              draggable={false}
              className="absolute max-w-none"
              style={{ width: geometry.width, height: geometry.height, left: geometry.x, top: geometry.y }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {error ? (
                <p className="px-6 text-center text-sm text-red-200">{error}</p>
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-white/70" />
              )}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/25" />
        </div>

        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Move className="h-3.5 w-3.5" /> Drag to move
        </p>

        <div className="flex items-center gap-3">
          <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Slider
            value={[Math.round(zoom * 100)]}
            min={MIN_ZOOM * 100}
            max={MAX_ZOOM * 100}
            step={1}
            onValueChange={handleZoom}
            disabled={!image}
            aria-label="Zoom"
          />
          <Button type="button" variant="ghost" size="sm" onClick={resetFraming} disabled={!image}>
            Reset
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={!image || saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crop className="mr-2 h-4 w-4" />}
            Save picture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropDialog;
