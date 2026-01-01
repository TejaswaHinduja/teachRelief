"use client"
import { useState, useEffect } from "react";
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload, } from "@imagekit/next";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardBody } from "@heroui/card";
import { ArrowLeft, FileText, Upload, CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";


export default function Assignment() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [pdfUrl, setPdfUrl] = useState("")
  const [ocrText, setOcrText] = useState("")
  const [success, setSuccess] = useState("")
  const [assignment, setAssignment] = useState<{
    title: string;
    pdfUrl: string;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const params = useParams();
  const router = useRouter();
  const roomId=params.roomId as string;
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
          setUploadProgress(percent);
          console.log(`Upload progress: ${percent.toFixed(2)}%`);
        },
      });

      if (uploadResponse.url) {
        setPdfUrl(uploadResponse.url);
        setUploadProgress(100);
        setSuccess("PDF uploaded successfully!");
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
      setUploadProgress(0);
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
        credentials:"include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfUrl }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Failed to fetch OCR text");
      }

      const data = await response.json();
      const extractedText = data.text || "No text found in PDF.";
      setOcrText(extractedText);
      if (extractedText && extractedText !== "No text found in PDF.") {
        setSuccess("Text extracted successfully!");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const submit = async () => {
    if (!pdfUrl || !ocrText) {
      setError("Please upload a PDF and run OCR first");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/submission`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignmentId,
          pdfUrl: pdfUrl,
          extractedText: ocrText
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit assignment");
      }
      
      const data = await response.json();
      setSuccess("Submission successful! Your assignment has been submitted.");
      // Reset form after successful submission
      setTimeout(() => {
        setPdfUrl("");
        setOcrText("");
        setUploadProgress(0);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    fetchAssignments()
  }, [assignmentId])

  const fetchAssignments = async () => {
    const response = await fetch(`${BACKEND_URL}/api/room/${roomId}/assignment/${assignmentId}`, {
      method: "GET",
      credentials: "include"
    })
    const data = await response.json()
    setAssignment(data.assignmentDetails)
    console.log(data.pdfUrl)
  }


  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {assignment?.title || "Assignment"}
          </h1>
          <p className="text-gray-600">Submit your solution for this assignment</p>
        </div>
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardBody className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Success Message */}
      {success && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardBody className="flex items-center gap-3 p-4">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-green-700 text-sm">{success}</p>
          </CardBody>
        </Card>
      )}

      {/* View Assignment Card */}
      {assignment?.pdfUrl && (
        <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Assignment PDF</h3>
                  <p className="text-sm text-gray-600">View the assignment questions</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open(assignment.pdfUrl, "_blank")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open PDF
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Upload Section */}
      <Card className="border-2 border-gray-200">
        <CardBody className="p-6 space-y-4">
          <div>
            <Label htmlFor="pdf-upload" className="text-base font-semibold mb-2 block">
              Upload Your Solution (PDF)
            </Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleUpload}
                  disabled={uploading || submitting}
                  className="flex-1"
                />
                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{uploadProgress.toFixed(0)}%</span>
                  </div>
                )}
              </div>
              {pdfUrl && !uploading && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">PDF uploaded successfully</span>
                </div>
              )}
            </div>
          </div>

          {/* OCR Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Extract Text from PDF</Label>
              <Button
                onClick={handleOCR}
                disabled={loading || uploading || !pdfUrl || submitting}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Run OCR
                  </>
                )}
              </Button>
            </div>
            {ocrText && (
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ocrText}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Submit Section */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Ready to Submit?</h3>
              <p className="text-sm text-gray-600">
                Make sure you've uploaded your PDF and extracted the text before submitting.
              </p>
            </div>
            <Button
              onClick={submit}
              disabled={submitting || !pdfUrl || !ocrText || loading || uploading}
              className="flex items-center gap-2 px-6"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Submit Solution
                </>
              )}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}