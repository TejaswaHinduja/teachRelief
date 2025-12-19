import { useState, useEffect } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { useRouter } from "next/navigation";



export default function TeacherDashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const router = useRouter()

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

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:1000/api/myrooms", {
          method: "GET",
          credentials: "include"
        })
        const data = await response.json();
        setRooms(data.getRooms);
      }
      catch (e) {
        console.log(e)
      }
      finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Teacher Dashboard</h2>

      <div className="space-y-4">
        <div className="flex-wrap gap-4 w-300 space-y-4">
          {rooms?.map((room) => {
            return (
              <Card className="flex col space-x-4 border-2 border-gray-200 hover:border-gray-300 transition-colors"
                isPressable
                onPress={() => { router.push(`/room/${room.id}`) }}
                key={room.id}
              >
                <CardBody className="">
                  {room.name} {room.code}
                </CardBody>
              </Card>
            );
          })}
        </div>

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