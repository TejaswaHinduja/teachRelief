"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload, } from "@imagekit/next";

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");

    if (!role) {
      router.push("/auth/login");
      return;
    }

    setUserRole(role);
    setUserName(name || "User");
  }, [router]);


  if (userRole === null) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Welcome, {userName}!
        </h1>
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem("userRole");
            localStorage.removeItem("userName");
            router.push("/auth/login");
          }}
        >
          Logout
        </Button>
      </div>

      {userRole === "TEACHER" ? (
        <TeacherDashboard />
      ) : (
        <StudentDashboard />
      )}
    </div>
  );
}

function TeacherDashboard() {
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [roomCode, setRoomCode] = useState<string | null>(null);

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

  const createRoom = async () => {
    try {
      const response = await fetch("http://localhost:1000/api/createroom", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      console.log(data);
      if (data.code) {
        setRoomCode(data.code);
        alert(data.message || "Room created successfully!");
      }
    } catch (e) {
      console.log(e);
      alert("Failed to create room. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Teacher Dashboard</h2>

      <div className="space-y-4">
        <Button onClick={createRoom} className="w-full">
          Create Room
        </Button>
        {/* Room Code Display */}
        {roomCode && (
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Room Code</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-white border border-blue-300 rounded text-xl font-mono font-bold text-blue-700">
                {roomCode}
              </code>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(roomCode);
                  alert("Room code copied to clipboard!");
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Share this code with your students so they can join the room.
            </p>
          </div>
        )}

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
    </div>
  );
}


function StudentDashboard() {
  const [roomCode, setRoomCode] = useState("");

  const joinRoom = async () => {
    if (!roomCode) {
      alert("Please enter a room code");
      return;
    }

    // TODO: Implement join room API call
    alert(`Joining room: ${roomCode}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Student Dashboard</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="room-code">Room Code</Label>
          <Input
            id="room-code"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
        </div>

        <Button onClick={joinRoom} className="w-full">
          Join Room
        </Button>

        <Button variant="outline" className="w-full">
          View My Submissions
        </Button>

        <Button variant="outline" className="w-full">
          View Grades
        </Button>
      </div>
    </div>
  );
}
