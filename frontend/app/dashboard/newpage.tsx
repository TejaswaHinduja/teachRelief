"use client";

import { useState,useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {ImageKitAbortError,ImageKitInvalidRequestError,ImageKitServerError,ImageKitUploadNetworkError,upload,} from "@imagekit/next";

export default function NewDashboard() {
        const [uploading, setUploading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [urls, setUrls] = useState<{ student?: string; solution?: string }>({});

     const authenticator = async () => {
        try {
            const response = await fetch("/api/upload-auth");
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }
            const data = await response.json();
            const { signature, expire, token, publicKey } = data;
            return { signature, expire, token, publicKey };
        } catch (error) {
            console.error("Authentication error:", error);
            throw new Error("Authentication request failed");
        }
    };

    const handleUpload = async (e:React.ChangeEvent<HTMLInputElement>,type:"student"|"solution") => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        // Retrieve authentication parameters for the upload.
        let authParams;
        try {
            authParams = await authenticator();
        } catch (authError) {
            console.error("Failed to authenticate for upload:", authError);
            return;
        }
        const { signature, expire, token, publicKey } = authParams;

        // Call the ImageKit SDK upload function with the required parameters and callbacks.
        try {
            const uploadResponse = await upload({
                expire,
                token,
                signature,
                publicKey,
                file,
                fileName: file.name, // Optionally set a custom file name
                // Progress callback to update upload progress state
                onProgress: (event) => {
                    const percent=((event.loaded / event.total) * 100);
                },
                
            });
            setUrls((prev) => ({ ...prev, [type]: uploadResponse.url }));
            console.log("Upload response:", uploadResponse);
        } catch (error) {
            // Handle specific error types provided by the ImageKit SDK.
            if (error instanceof ImageKitAbortError) {
                console.error("Upload aborted:", error.reason);
            } else if (error instanceof ImageKitInvalidRequestError) {
                console.error("Invalid request:", error.message);
            } else if (error instanceof ImageKitUploadNetworkError) {
                console.error("Network error:", error.message);
            } else if (error instanceof ImageKitServerError) {
                console.error("Server error:", error.message);
            } else {
                // Handle any other errors that may occur.
                console.error("Upload error:", error);
            }
        }
    };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">ImageKit PDF Upload Test</h1>
      </div>

      <div className="space-y-6">
        {/* Student File Upload */}
        <div className="space-y-2">
          <Label htmlFor="student-file">Student PDF</Label>
          <Input
            id="student-file"
            type="file"
            accept=".pdf"
            onChange={(e) => handleUpload(e, "student")}
            disabled={uploading}
          />
          {urls.student && (
            <p className="text-sm text-green-600">
              ✅ Student PDF uploaded successfully
            </p>
          )}
        </div>

        {/* Solution File Upload */}
        <div className="space-y-2">
          <Label htmlFor="solution-file">Solution PDF</Label>
          <Input
            id="solution-file"
            type="file"
            accept=".pdf"
            onChange={(e) => handleUpload(e, "solution")}
            disabled={uploading}
          />
          {urls.solution && (
            <p className="text-sm text-green-600">
              ✅ Solution PDF uploaded successfully
            </p>
          )}
        </div>

        {/* Error & Status */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {uploading && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-600">📤 Uploading file...</p>
          </div>
        )}

        {/* URLs */}
        {(urls.student || urls.solution) && (
          <div className="space-y-2">
            <h3 className="font-medium">Uploaded URLs:</h3>
            {urls.student && (
              <div className="p-2 bg-gray-50 rounded text-xs">
                <strong>Student:</strong> {urls.student}
              </div>
            )}
            {urls.solution && (
              <div className="p-2 bg-gray-50 rounded text-xs">
                <strong>Solution:</strong> {urls.solution}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
