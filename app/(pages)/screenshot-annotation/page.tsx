"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowUpTrayIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type Tool = "arrow" | "rect" | "text" | "none";
type Shape = { type: "arrow" | "rect"; start: { x: number; y: number }; end: { x: number; y: number }; color: string };
type TextAnn = { x: number; y: number; text: string; color: string };

export default function ScreenshotAnnotationPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>("arrow");
  const [text, setText] = useState("");
  const [color, setColor] = useState("#e11d48");
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [current, setCurrent] = useState<{ x: number; y: number } | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [texts, setTexts] = useState<TextAnn[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, img: HTMLImageElement, clear = false) => {
      const c = canvasRef.current;
      if (!c || !img) return;
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      if (clear) return;
      const lw = Math.max(2, c.width / 300);
      const fontSz = Math.max(14, c.width / 40);
      const drawArrow = (s: { x: number; y: number }, e: { x: number; y: number }, col: string) => {
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        const angle = Math.atan2(e.y - s.y, e.x - s.x);
        const head = 12;
        ctx.lineTo(e.x - head * Math.cos(angle - 0.4), e.y - head * Math.sin(angle - 0.4));
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x - head * Math.cos(angle + 0.4), e.y - head * Math.sin(angle + 0.4));
        ctx.stroke();
      };
      const drawRect = (s: { x: number; y: number }, e: { x: number; y: number }, col: string) => {
        ctx.strokeStyle = col;
        ctx.strokeRect(Math.min(s.x, e.x), Math.min(s.y, e.y), Math.abs(e.x - s.x), Math.abs(e.y - s.y));
      };
      shapes.forEach((sh) => {
        if (sh.type === "arrow") drawArrow(sh.start, sh.end, sh.color);
        else drawRect(sh.start, sh.end, sh.color);
      });
      texts.forEach((t) => {
        ctx.fillStyle = t.color;
        ctx.font = `bold ${fontSz}px sans-serif`;
        ctx.fillText(t.text, t.x, t.y);
      });
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lw;
      if (start && current && tool === "arrow") drawArrow(start, current, color);
      if (start && current && tool === "rect") drawRect(start, current, color);
    },
    [color, current, shapes, start, texts, tool],
  );

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) draw(ctx, img);
    };
    img.src = imageUrl;
  }, [draw, imageUrl]);

  const getCoord = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    const scaleX = c.width / r.width;
    const scaleY = c.height / r.height;
    return {
      x: (e.clientX - r.left) * scaleX,
      y: (e.clientY - r.top) * scaleY,
    };
  };

  const onCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCoord(e);
    if (tool === "text" && text.trim()) {
      setTexts((prev) => [...prev, { x: pos.x, y: pos.y, text: text.trim(), color }]);
      setText("");
      return;
    }
    if (tool === "arrow" || tool === "rect") {
      setStart(pos);
      setCurrent(pos);
    }
  };

  const onCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (start && (tool === "arrow" || tool === "rect")) setCurrent(getCoord(e));
  };

  const onCanvasMouseUp = () => {
    if (start && current && (tool === "arrow" || tool === "rect")) {
      setShapes((prev) => [...prev, { type: tool, start, end: current, color }]);
      setStart(null);
      setCurrent(null);
    }
  };

  const clearCanvas = () => {
    if (!imageUrl || !canvasRef.current) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) draw(ctx, img, true);
    };
    img.src = imageUrl;
    setStart(null);
    setCurrent(null);
    setShapes([]);
    setTexts([]);
  };

  const handleDownload = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/screenshot-annotation")}`,
      );
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    const c = canvasRef.current;
    if (!c) {
      setError("No image to download.");
      return;
    }
    const link = document.createElement("a");
    link.download = (file?.name ?? "annotation").replace(/\.[^.]+$/, "") + "-annotated.png";
    link.href = c.toDataURL("image/png");
    link.click();
    setError(null);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Screenshot Annotation Tool
          </h1>
          <p className="mt-1 text-muted-foreground">
            Upload a screenshot, add arrows and text, then download the annotated image.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Upload image
            </Button>
            <div className="flex gap-2 items-center">
              <Label className="text-sm">Tool:</Label>
              {(["none", "arrow", "rect", "text"] as Tool[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTool(t)}
                  className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${
                    tool === t ? "border-primary bg-primary text-primary-foreground" : "border-input"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {tool === "text" && (
              <input
                type="text"
                placeholder="Text to add"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            )}
            <div className="flex gap-2 items-center">
              <Label className="text-sm">Color:</Label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-12 rounded border border-input cursor-pointer"
              />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={clearCanvas} className="gap-1">
              <TrashIcon className="h-4 w-4" />
              Clear drawings
            </Button>
          </div>

          {imageUrl ? (
            <div className="overflow-auto max-h-[70vh] rounded-lg border border-input bg-muted/30 flex justify-center">
              <canvas
                ref={canvasRef}
                onMouseDown={onCanvasMouseDown}
                onMouseMove={onCanvasMouseMove}
                onMouseUp={onCanvasMouseUp}
                onMouseLeave={onCanvasMouseUp}
                className="max-w-full cursor-crosshair"
                style={{ maxHeight: "70vh" }}
              />
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-input rounded-lg p-12 text-center text-muted-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              <PencilSquareIcon className="h-12 w-12 mx-auto mb-2" />
              Upload a screenshot to annotate
            </div>
          )}

          <Button onClick={handleDownload} disabled={!imageUrl} className="gap-2">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download annotated image
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
