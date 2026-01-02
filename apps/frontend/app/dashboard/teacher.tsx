import { useState, useEffect } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const BACKEND_URL=process.env.NEXT_PUBLIC_BACKEND_URL
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter()

  const createRoom = async () => {
    if (!roomName.trim()) {
      setError("Please enter a room name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/createroom`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName.trim() }),
      });
      const data = await response.json();

      if (data.roomId) {
        const newRoom = {
          id: data.roomId,
          code: data.code,
          name: data.name,
          createdAt: new Date().toISOString(),
        };
      
        setRooms((prev) => [newRoom, ...prev]);
      
        setRoomId(data.roomId);
        setRoomCode(data.code);
        setRoomName("");
        setShowCreateForm(false);
      
        router.push(`/room/${data.roomId}`);
      }
    } catch (e) {
      console.log(e);
      setError("Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${BACKEND_URL}/api/myrooms`, {
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
        {/* Create Room Form */}
        {showCreateForm ? (
          <Card className="border-2 border-gray-200">
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room Name</Label>
                <Input
                  id="room-name"
                  type="text"
                  placeholder="e.g., Math 101 - Algebra"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      createRoom();
                    }
                  }}
                />
              </div>
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={createRoom} disabled={loading} className="flex-1">
                  {loading ? "Creating Room..." : "Create Room"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setRoomName("");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Button 
            onClick={() => setShowCreateForm(true)} 
            className="w-full" 
            disabled={loading}
          >
            Create New Room
          </Button>
        )}

        <div className="flex-wrap gap-4 w-300 space-y-4">
          {rooms?.map((room) => {
            return (
              <Card className="flex col space-x-4 border-2 border-gray-200 hover:border-gray-300 transition-colors"
                isPressable
                onPress={() => { router.push(`/room/${room.id}`) }}
                key={room.id}
              >
                <CardBody className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      
                      {room.name && room.name !== "room name" ? room.name : `Room ${room.code.slice(-4)}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600 font-mono">{room.code}</span>
                      <CopyButton content={room.code} onCopy={() => console.log("copied")} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
        
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