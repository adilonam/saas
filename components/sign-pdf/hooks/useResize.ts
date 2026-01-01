import React, { useState, useRef, useEffect, useCallback } from "react";
import { SignaturePosition } from "../types";

type ResizeHandle = "se" | "sw" | "ne" | "nw" | null; // se = southeast (bottom-right), etc.

export function useResize(
  pdfContainerRef: React.RefObject<HTMLDivElement>,
  currentPage: number,
  onPositionUpdate: (positions: SignaturePosition[]) => void,
  signaturePositions: SignaturePosition[]
) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizingIndex, setResizingIndex] = useState<number | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const resizeStartPos = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const resizingIndexRef = useRef<number | null>(null);
  const resizeHandleRef = useRef<ResizeHandle>(null);
  const signaturePositionsRef = useRef(signaturePositions);

  // Keep refs in sync with state
  useEffect(() => {
    resizingIndexRef.current = resizingIndex;
    resizeHandleRef.current = resizeHandle;
    signaturePositionsRef.current = signaturePositions;
  }, [resizingIndex, resizeHandle, signaturePositions]);

  const getImageRect = useCallback(() => {
    if (!pdfContainerRef.current) return null;
    const container = pdfContainerRef.current;
    const imgElement = container.querySelector("img") as HTMLImageElement;
    if (!imgElement) return null;
    return imgElement.getBoundingClientRect();
  }, [pdfContainerRef]);

  const normalizeToImage = (clientX: number, clientY: number) => {
    const imgRect = getImageRect();
    if (!imgRect) return null;

    const x = (clientX - imgRect.left) / imgRect.width;
    const y = (clientY - imgRect.top) / imgRect.height;
    return { x, y };
  };

  const handleResizeStart = (
    e: React.MouseEvent | React.TouchEvent,
    index: number,
    handle: ResizeHandle
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const position = signaturePositions[index];
    if (!position) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const imgRect = getImageRect();
    if (!imgRect) return;

    setIsResizing(true);
    setResizingIndex(index);
    setResizeHandle(handle);

    const startX = (clientX - imgRect.left) / imgRect.width;
    const startY = (clientY - imgRect.top) / imgRect.height;

    resizeStartPos.current = {
      x: startX,
      y: startY,
      width: position.width,
      height: position.height,
    };
  };

  const handleResizeMoveRef = useRef<(e: MouseEvent | TouchEvent) => void>(
    () => {}
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (
        !isResizing ||
        resizingIndexRef.current === null ||
        !resizeHandleRef.current ||
        !resizeStartPos.current
      )
        return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const imgRect = getImageRect();
      if (!imgRect) return;

      const currentX = (clientX - imgRect.left) / imgRect.width;
      const currentY = (clientY - imgRect.top) / imgRect.height;

      const deltaX = currentX - resizeStartPos.current.x;
      const deltaY = currentY - resizeStartPos.current.y;

      const position = signaturePositionsRef.current[resizingIndexRef.current];
      if (!position) return;

      // Calculate fixed edges/corners for each resize handle
      const rightEdge = position.x + position.width;
      const bottomEdge = position.y + position.height;

      let newWidth = resizeStartPos.current.width;
      let newHeight = resizeStartPos.current.height;
      let newX = position.x;
      let newY = position.y;

      // Calculate new dimensions based on handle
      switch (resizeHandleRef.current) {
        case "se": // Bottom-right
          newWidth = Math.max(
            0.05,
            Math.min(0.5, resizeStartPos.current.width + deltaX)
          );
          newHeight = Math.max(
            0.05,
            Math.min(0.5, resizeStartPos.current.height + deltaY)
          );
          // Position stays the same (top-left corner fixed)
          newX = position.x;
          newY = position.y;
          break;
        case "sw": // Bottom-left
          newWidth = Math.max(
            0.05,
            Math.min(0.5, resizeStartPos.current.width - deltaX)
          );
          newHeight = Math.max(
            0.05,
            Math.min(0.5, resizeStartPos.current.height + deltaY)
          );
          // Right edge stays fixed, calculate new X from right edge
          newX = Math.max(0, rightEdge - newWidth);
          newWidth = rightEdge - newX; // Adjust width to ensure it fits
          newY = position.y; // Top edge stays fixed
          break;
        case "ne": // Top-right
          newWidth = Math.max(
            0.05,
            Math.min(0.5, resizeStartPos.current.width + deltaX)
          );
          newHeight = Math.max(
            0.05,
            Math.min(0.5, resizeStartPos.current.height - deltaY)
          );
          // Adjust Y position based on height change (bottom edge stays fixed)
          newX = position.x; // Left edge stays fixed
          newY = Math.max(0, bottomEdge - newHeight);
          newHeight = bottomEdge - newY; // Adjust height to ensure it fits
          break;
        case "nw": // Top-left
          newWidth = Math.max(
            0.05,
            Math.min(0.5, resizeStartPos.current.width - deltaX)
          );
          newHeight = Math.max(
            0.05,
            Math.min(0.5, resizeStartPos.current.height - deltaY)
          );
          // Right and bottom edges stay fixed, calculate new X and Y from those edges
          newX = Math.max(0, rightEdge - newWidth);
          newWidth = rightEdge - newX; // Adjust width to ensure it fits
          newY = Math.max(0, bottomEdge - newHeight);
          newHeight = bottomEdge - newY; // Adjust height to ensure it fits
          break;
      }

      const updatedPositions = [...signaturePositionsRef.current];
      updatedPositions[resizingIndexRef.current] = {
        ...position,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      };
      onPositionUpdate(updatedPositions);
    },
    [onPositionUpdate, isResizing, getImageRect]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizingIndex(null);
    setResizeHandle(null);
    resizeStartPos.current = null;
  }, []);

  // Set up global event listeners for resize
  useEffect(() => {
    // Update ref here to avoid updating during render
    handleResizeMoveRef.current = handleResizeMove;

    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => handleResizeMoveRef.current?.(e);
    const handleMouseUp = () => handleResizeEnd();
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleResizeMoveRef.current?.(e);
    };
    const handleTouchEnd = () => handleResizeEnd();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  return {
    isResizing,
    resizingIndex,
    resizeHandle,
    handleResizeStart,
  };
}
