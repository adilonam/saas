import { useState, useRef, useEffect } from "react";
import { Point } from "../types";

export function useCanvasDrawing(isInitials = false) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [penSize, setPenSize] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const lastPointRef = useRef<Point | null>(null);
  const historyRef = useRef<ImageData[]>([]);

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(imageData);
    if (historyRef.current.length > 10) {
      historyRef.current.shift();
    }
    if (!isInitials) setCanUndo(true);
  };

  const getPoint = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number, pressure: number;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      pressure = (e.touches[0] as any).force || 0.5;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      pressure = 0.5;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      pressure: Math.max(0.1, Math.min(1, pressure)),
      timestamp: Date.now(),
    };
  };

  const calculateLineWidth = (
    point: Point,
    lastPoint: Point | null
  ): number => {
    if (!lastPoint) return penSize;

    const distance = Math.sqrt(
      Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2)
    );
    const timeDelta = point.timestamp - lastPoint.timestamp;
    const speed = timeDelta > 0 ? distance / timeDelta : 0;

    const speedFactor = Math.max(0.3, Math.min(1.5, 1 - speed * 0.5));
    const pressureFactor = point.pressure;

    return penSize * speedFactor * pressureFactor;
  };

  const drawSmoothCurve = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const currentPoint = points[i];
      const nextPoint = points[i + 1];

      if (nextPoint) {
        const midX = (currentPoint.x + nextPoint.x) / 2;
        const midY = (currentPoint.y + nextPoint.y) / 2;
        ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, midX, midY);
      } else {
        ctx.lineTo(currentPoint.x, currentPoint.y);
      }
    }

    ctx.stroke();
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();

    const point = getPoint(e);
    if (!point) return;

    saveState();
    setIsDrawing(true);
    pointsRef.current = [point];
    lastPointRef.current = point;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();

    const point = getPoint(e);
    if (!point) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    pointsRef.current.push(point);

    if (pointsRef.current.length >= 3) {
      const lineWidth = calculateLineWidth(point, lastPointRef.current);

      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000000";

      drawSmoothCurve(ctx, pointsRef.current.slice(-3));

      if (pointsRef.current.length > 5) {
        pointsRef.current = pointsRef.current.slice(-3);
      }
    }

    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      pointsRef.current = [];
      lastPointRef.current = null;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
    }
  };

  const undo = () => {
    if (historyRef.current.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    historyRef.current.pop();
    const previousState = historyRef.current[historyRef.current.length - 1];

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (!isInitials) setCanUndo(historyRef.current.length > 0);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveState();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [];
    if (!isInitials) setCanUndo(false);
  };

  const saveAsImage = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL("image/png", 1.0);
  };

  return {
    canvasRef,
    isDrawing,
    canUndo,
    penSize,
    setPenSize,
    startDrawing,
    draw,
    stopDrawing,
    undo,
    clear,
    saveAsImage,
  };
}

