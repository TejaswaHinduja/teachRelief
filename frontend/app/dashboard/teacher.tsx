import { useState, useEffect } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload, } from "@imagekit/next";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { useRouter } from "next/navigation";



export default function TeacherDashboard() {
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const router = useRouter()

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
    setLoading(true);
    try {
      const response = await fetch("http://localhost:1000/api/createroom", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.roomId) {
        setRoomId(data.roomId);
        setRoomCode(data.code); 
        alert(data.message || "Room created successfully!");
        router.push(`/room/${data.roomId}`);
        console.log("redirecting to the room")
      }
    } catch (e) {
      console.log(e);
      alert("Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Teacher Dashboard</h2>

      <div className="space-y-4">
        <Button onClick={createRoom} className="w-full" disabled={loading}>
          {loading ? "Creating Room..." : "Create Room"}
        </Button>
        {/* Room Code Display */}
        {roomCode && (<div className="flex">
          <Card isPressable onPress={() => router.push(`/room/${roomId}`)} className="border-2 border-gray-200 hover:border-gray-300 transition-colors">
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <p className="text-md">Room Code</p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex space-x-2">
                <p>{roomCode}</p>
                <CopyButton content={roomCode} onCopy={() => console.log("copied")} />
              </div>
            </CardBody>
          </Card>
        </div>
        )}

        {/* OCR Button */}
        <div className="flex justify-center">
          <Button onClick={handleOCR} disabled={loading || uploading || !pdfUrl}>
            {loading ? "Extracting OCR..." : "Run OCR on PDF"}
          </Button>
        </div>
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
        {/* PDF URL Display */}
        {pdfUrl && (
          <div className="p-2 bg-gray-50 rounded text-xs">
            <strong>PDF URL:</strong> {pdfUrl}
          </div>
        )}
      </div>
    </div>
  );
}