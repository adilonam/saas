import { useState, useRef } from "react";

export function usePDFConversion() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPageImages, setPdfPageImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfPages, setPdfPages] = useState(1);
  const pageImageRefs = useRef<{ [key: number]: HTMLImageElement }>({});

  const convertPdfToImages = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/fast-api/v1/pdf-to-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || errorData.error || "Failed to convert PDF"
        );
      }

      const data = await response.json();

      if (data.pages && Array.isArray(data.pages)) {
        setPdfPages(data.total_pages);

        const images = data.pages
          .sort((a: any, b: any) => a.page_number - b.page_number)
          .map((page: any) => page.image);

        setPdfPageImages(images);

        images.forEach((imageDataUrl: string, index: number) => {
          const img = new Image();
          img.src = imageDataUrl;
          pageImageRefs.current[index + 1] = img;
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error converting PDF to images:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error loading PDF. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      await convertPdfToImages(file);
    } else {
      alert("Please select a valid PDF file");
    }
  };

  return {
    pdfFile,
    pdfPageImages,
    isLoading,
    pdfPages,
    pageImageRefs,
    handleFileChange,
    setPdfFile,
  };
}

