import { useState, useRef } from "react";
import { SignaturePosition } from "../types";

export function useDragAndDrop(
  signatureImage: string | null,
  currentPage: number,
  onPositionUpdate: (positions: SignaturePosition[]) => void,
  signaturePositions: SignaturePosition[]
) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSignatureIndex, setDraggedSignatureIndex] = useState<number | null>(null);
  const [isDraggingNewSignature, setIsDraggingNewSignature] = useState(false);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const isTouchDraggingRef = useRef(false);
  const isDraggingNewSignatureRef = useRef(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const createDragImage = () => {
    const dragImg = document.createElement("div");
    dragImg.style.width = "60px";
    dragImg.style.height = "40px";
    dragImg.style.border = "2px solid #ef4444";
    dragImg.style.borderRadius = "4px";
    dragImg.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
    dragImg.style.position = "absolute";
    dragImg.style.top = "-1000px";
    document.body.appendChild(dragImg);
    return dragImg;
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!signatureImage) return;
    setIsDraggingNewSignature(true);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");

    const dragImg = createDragImage();
    e.dataTransfer.setDragImage(dragImg, 30, 20);
    setTimeout(() => document.body.removeChild(dragImg), 0);
  };

  const handleSignatureDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedSignatureIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `signature-${index}`);

    const dragImg = createDragImage();
    e.dataTransfer.setDragImage(dragImg, 30, 20);
    setTimeout(() => document.body.removeChild(dragImg), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDraggingNewSignature(false);
    setDraggedSignatureIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const calculatePosition = (clientX: number, clientY: number): SignaturePosition | null => {
    if (!pdfContainerRef.current) return null;

    const container = pdfContainerRef.current;
    const imgElement = container.querySelector("img") as HTMLImageElement;
    if (!imgElement) return null;

    const imgRect = imgElement.getBoundingClientRect();
    const dropX = clientX - imgRect.left;
    const dropY = clientY - imgRect.top;

    const imgWidth = imgRect.width;
    const imgHeight = imgRect.height;

    const sigWidth = 0.15;
    const sigHeight = 0.1;

    const normalizedX = Math.max(
      0,
      Math.min(1 - sigWidth, dropX / imgWidth - sigWidth / 2)
    );
    const normalizedY = Math.max(
      0,
      Math.min(1 - sigHeight, dropY / imgHeight - sigHeight / 2)
    );

    return {
      x: normalizedX,
      y: normalizedY,
      pageNumber: currentPage,
      width: sigWidth,
      height: sigHeight,
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!signatureImage || !pdfContainerRef.current) return;

    const position = calculatePosition(e.clientX, e.clientY);
    if (!position) return;

    if (draggedSignatureIndex !== null) {
      const updatedPositions = [...signaturePositions];
      updatedPositions[draggedSignatureIndex] = {
        ...updatedPositions[draggedSignatureIndex],
        x: position.x,
        y: position.y,
        pageNumber: currentPage,
      };
      onPositionUpdate(updatedPositions);
    } else {
      onPositionUpdate([...signaturePositions, position]);
    }

    setIsDragging(false);
    setIsDraggingNewSignature(false);
    setDraggedSignatureIndex(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!signatureImage || !pdfContainerRef.current) return;

    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setIsTouchDragging(true);
    setIsDraggingNewSignature(true);
    isTouchDraggingRef.current = true;
    isDraggingNewSignatureRef.current = true;
    e.preventDefault();

    const handleGlobalTouchMove = (globalEvent: TouchEvent) => {
      if (isTouchDraggingRef.current && isDraggingNewSignatureRef.current) {
        globalEvent.preventDefault();
      }
    };

    const handleGlobalTouchEnd = (globalEvent: TouchEvent) => {
      document.removeEventListener("touchmove", handleGlobalTouchMove);

      if (!isTouchDraggingRef.current || !isDraggingNewSignatureRef.current) {
        document.removeEventListener("touchend", handleGlobalTouchEnd);
        return;
      }

      const touch = globalEvent.changedTouches[0];
      if (!touch || !pdfContainerRef.current) {
        setIsTouchDragging(false);
        setTouchStartPos(null);
        setIsDraggingNewSignature(false);
        isTouchDraggingRef.current = false;
        isDraggingNewSignatureRef.current = false;
        document.removeEventListener("touchend", handleGlobalTouchEnd);
        return;
      }

      const position = calculatePosition(touch.clientX, touch.clientY);
      if (position) {
        onPositionUpdate([...signaturePositions, position]);
      }

      setIsTouchDragging(false);
      setTouchStartPos(null);
      setIsDraggingNewSignature(false);
      isTouchDraggingRef.current = false;
      isDraggingNewSignatureRef.current = false;
      document.removeEventListener("touchend", handleGlobalTouchEnd);
    };

    document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
    document.addEventListener("touchend", handleGlobalTouchEnd, { once: true });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDraggingRef.current || !touchStartPos || !pdfContainerRef.current) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSignatureTouchStart = (e: React.TouchEvent, index: number) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setDraggedSignatureIndex(index);
    setIsTouchDragging(true);
    e.preventDefault();
  };

  const handleSignatureTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDragging || draggedSignatureIndex === null || !pdfContainerRef.current) return;
    e.preventDefault();
  };

  const handleSignatureTouchEnd = (e: React.TouchEvent) => {
    if (!isTouchDragging || draggedSignatureIndex === null || !touchStartPos || !pdfContainerRef.current) {
      setIsTouchDragging(false);
      setTouchStartPos(null);
      setDraggedSignatureIndex(null);
      return;
    }

    const touch = e.changedTouches[0];
    const position = calculatePosition(touch.clientX, touch.clientY);
    
    if (position) {
      const updatedPositions = [...signaturePositions];
      updatedPositions[draggedSignatureIndex] = {
        ...updatedPositions[draggedSignatureIndex],
        x: position.x,
        y: position.y,
        pageNumber: currentPage,
      };
      onPositionUpdate(updatedPositions);
    }

    setIsTouchDragging(false);
    setTouchStartPos(null);
    setDraggedSignatureIndex(null);
  };

  return {
    pdfContainerRef,
    isDragging,
    draggedSignatureIndex,
    isDraggingNewSignature,
    isTouchDragging,
    isTouchDraggingRef,
    handleDragStart,
    handleSignatureDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    handleSignatureTouchStart,
    handleSignatureTouchMove,
    handleSignatureTouchEnd,
  };
}

