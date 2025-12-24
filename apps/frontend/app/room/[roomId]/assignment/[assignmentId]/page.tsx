"use client"
import { useState } from "react";
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload, } from "@imagekit/next";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardBody } from "@heroui/card";


export default function Assignment() {
  const BACKEND_URL=process.env.NEXT_PUBLIC_BACKEND_URL

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [pdfUrl, setPdfUrl] = useState("")
  const [ocrText, setOcrText] = useState("")
  const [sucess, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)    //const[assignmentId,setAssignmentId]=useState(false)
  const params = useParams();
  const assignmentId = params.assignmentId as string;

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
      const response = await fetch(`${BACKEND_URL}/api/ocr`, {
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
  const submit = async () => {
    if (!pdfUrl || !ocrText) {
      setError("upload pdf and run ocr")
      return;
    }
    setSubmitting(true)
    const response = await fetch(`${BACKEND_URL}/api/submission`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId: assignmentId,
        pdfUrl: pdfUrl,
        extractedText: ocrText
      })
    })
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create assignment");
    }
  };

  return <div className="justify-center  items-center py-4 space-y-4 space-x-2 min-h-screen">
    <Card className="border-gray-200 border-4 w-70 ">
      <CardBody>
        {assignmentId}
      </CardBody>

    </Card>
    <div className="py-4">
      <Input type="file" accept=".pdf" onChange={handleUpload}></Input>
    </div>
    <div className="flex justify-center items-center px-2 space-x-2">
      <Button onClick={handleOCR} disabled={loading || uploading || !pdfUrl}>
        {loading ? "extracting ocr" : "RUN OCR"}
      </Button>
      <Button onClick={submit}>{loading ? "Submitting Solution" : "Submit Solution"}</Button>
    </div>
  </div>
}