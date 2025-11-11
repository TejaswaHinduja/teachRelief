"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pdfUrl =
    "https://ik.imagekit.io/tejaswahinduja/teachR_RPwDONYhB.pdf"

  const handleOCR = async () => {
    setLoading(true);
    setError("");
    setOcrText("");

    try {
      const response = await fetch("http://localhost:1000/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfUrl }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Failed to fetch OCR text");
      }

      const data = await response.json();
      setOcrText(data.text || "No text found in PDF.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">PDF OCR Extractor</h1>
        <p className="text-gray-600">
          Click below to extract text from a hardcoded PDF URL.
        </p>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleOCR} disabled={loading}>
          {loading ? "Extracting OCR..." : "Run OCR on PDF"}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      {ocrText && (
        <div className="p-4 bg-gray-50 border rounded-md whitespace-pre-wrap">
          <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
          <p className="text-sm text-gray-800">{ocrText}</p>
        </div>
      )}
    </div>
  );
}
