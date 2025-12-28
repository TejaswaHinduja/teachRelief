"use client"

import { Button } from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react";
import {useRouter,useParams} from "next/navigation";
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload, } from "@imagekit/next";
import { Card,CardBody } from "@heroui/card";

export default function Teacherroom(){
  const BACKEND_URL=process.env.NEXT_PUBLIC_BACKEND_URL
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [solutionpdfUrl, setPdfUrl] = useState("");
  const [assignmentpdfUrl, setAssignmentPdfUrl] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState("");
  const [submissions,setSubmissions]=useState<any[]>([])
  const [assignments,setAssignments]=useState<any[]>([])

  const params = useParams();
  const roomId = params.roomId as string;
  const assignmentId=params.assignmentdId as string

  const router = useRouter();

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
  const handleUploadAssignment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setAssignmentPdfUrl("");

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
        setAssignmentPdfUrl(uploadResponse.url);
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
    if (!solutionpdfUrl) {
      setError("Please upload a PDF first");
      return;
    }
    setLoading(true);
    setError("");
    setOcrText("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/ocr`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfUrl: solutionpdfUrl }),
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

  const createAssignment = async () => {
    if (!assignmentTitle.trim()) {
      setError("Please enter an assignment title");
      return;
    }
    if (!assignmentpdfUrl) {
      setError("Please upload a PDF first");
      return;
    }
    if (!ocrText) {
      setError("Please run OCR first to extract solution text");
      return;
    }
    if (!roomId) {
      setError("Room code not found");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      /*const roomResponse = await fetch(`http://localhost:1000/api/room/${roomId}`, {
        credentials: "include", 
      });

      if (!roomResponse.ok) {
        throw new Error("Failed to fetch room details");
      }*/

      const response = await fetch(`${BACKEND_URL}/api/createAssignment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: assignmentTitle,
          roomId: roomId,
          pdfUrl: assignmentpdfUrl,
          solutionText: ocrText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create assignment");
      }
      const data = await response.json();
      setSuccess(`Assignment "${assignmentTitle}" created successfully!`);

      // Reset form
      setAssignmentTitle("");
      setPdfUrl("");
      setOcrText("");

      console.log("Assignment created:", data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create assignment");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    const viewAssignments = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/teacher/assignment/${roomId}`, {
          method: "GET",
          credentials: "include"
        })
        const data = await response.json();
        setAssignments(data.getAssignments);
      }
      catch (e) {
        console.log(e)
        setError("failed to fetch assignments")
      }
      finally {
        setLoading(false)
      }
    }
    if (roomId) {
      viewAssignments()
    }
  }, [roomId])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardBody>
          <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>

          {/* Assignment Title Input */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="assignment-title">Assignment Title</Label>
            <Input
              id="assignment-title"
              type="text"
              placeholder="e.g., Chapter 1 - Algebra"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              disabled={uploading || loading || creating}
            />
          </div>

          {/* PDF Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="pdf-file">Upload Assignment </Label>
            <Input id="pdf-file" type="file" accept=".pdf" onChange={handleUploadAssignment}></Input>
            <Label htmlFor="pdf-file">Upload Solution </Label>
            <Input id="pdf-file" type="file" accept=".pdf" onChange={handleUpload} disabled={uploading || loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-y-2 space-x-1 gap-3 mb-4">
            <Button
              onClick={handleOCR}
              disabled={loading || uploading || !assignmentpdfUrl || creating}
              variant="outline"
            >
              {loading ? "Extracting OCR..." : "Run OCR on PDF"}
            </Button>

            <Button
              onClick={createAssignment}
              disabled={creating || !assignmentTitle || !assignmentpdfUrl || !ocrText}
            >
              {creating ? "Creating..." : "Create Assignment"}
            </Button>
          </div>

          {/* OCR Text Display */}
          {ocrText && (
            <div className="p-4 bg-gray-50 rounded-md mb-4">
              <h3 className="font-semibold mb-2">Extracted Solution Text:</h3>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{ocrText}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
              {success}
            </div>
          )}
        </CardBody>
      </Card>
      {/*Assignments Section*/}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Assignments</h2>

        {loading && <p>Loading assignments...</p>}

        {!loading && assignments.length === 0 && (
          <p className="text-gray-500">No assignments yet. Create one above!</p>
        )}

        {assignments.map((assignment) => (
          <Card isPressable onPress={() => { router.push(`/room/${roomId}/assignment/${assignment.id}/submissions`) }} key={assignment.id} className="border-2 border-gray-200">
            <CardBody>
              <h3 className="font-semibold">{assignment.title}</h3>
              <p className="text-sm text-gray-500">
                Created: {new Date(assignment.createdAt).toLocaleDateString()}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}