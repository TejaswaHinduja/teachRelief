"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {ImageKitAbortError,ImageKitInvalidRequestError,ImageKitServerError,ImageKitUploadNetworkError,upload,} from "@imagekit/next";

export default function DashboardPage() {
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  // Authenticator function for ImageKit upload
  const authenticator = async () => {
    try {
      const response = await fetch("/api/upload-auth");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }
      const data = await response.json();
      const { signature, expire, token, publicKey } = data;
      return { signature, expire, token, publicKey };
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error("Authentication request failed");
    }
  };

  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setPdfUrl("");

    try {
      
      const authParams = await authenticator();
      const { signature, expire, token, publicKey } = authParams;

      
      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name,
        onProgress: (event) => {
          const percent = (event.loaded / event.total) * 100;
          console.log(`Upload progress: ${percent.toFixed(2)}%`);
        },
      });

      if (uploadResponse.url) {
        setPdfUrl(uploadResponse.url);
        console.log("Upload successful:", uploadResponse.url);
      } else {
        throw new Error("Upload succeeded but no URL was returned");
      }
    } catch (error) {
      
      if (error instanceof ImageKitAbortError) {
        setError(`Upload aborted: ${error.reason}`);
      } else if (error instanceof ImageKitInvalidRequestError) {
        setError(`Invalid request: ${error.message}`);
      } else if (error instanceof ImageKitUploadNetworkError) {
        setError(`Network error: ${error.message}`);
      } else if (error instanceof ImageKitServerError) {
        setError(`Server error: ${error.message}`);
      } else {
        setError("Upload failed. Please try again.");
      }
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  
  const handleOCR = async () => {
    if (!pdfUrl) {
      setError("Please upload a PDF first");
      return;
    }

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
          Upload a PDF to extract text using OCR
        </p>
      </div>

      {/* PDF Upload Section */}
      <div className="space-y-2">
        <Label htmlFor="pdf-file">Upload Solution PDF</Label>
        <Input
          id="pdf-file"
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          disabled={uploading || loading}
        />
        {pdfUrl && (
          <p className="text-sm text-green-600">
            ✅ PDF uploaded successfully
          </p>
        )}
        {uploading && (
          <p className="text-sm text-blue-600">📤 Uploading PDF...</p>
        )}
      </div>

      {/* OCR Button */}
      <div className="flex justify-center">
        <Button onClick={handleOCR} disabled={loading || uploading || !pdfUrl}>
          {loading ? "Extracting OCR..." : "Run OCR on PDF"}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      {/* OCR Result Display */}
      {ocrText && (
        <div className="p-4 bg-gray-50 border rounded-md whitespace-pre-wrap">
          <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
          <p className="text-sm text-gray-800">{ocrText}</p>
        </div>
      )}

      {/* PDF URL Display (for debugging) */}
      {pdfUrl && (
        <div className="p-2 bg-gray-50 rounded text-xs">
          <strong>PDF URL:</strong> {pdfUrl}
        </div>
      )}
    </div>
  );
}
