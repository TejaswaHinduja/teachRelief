import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRouter } from "next/navigation";



export default function StudentDashboard() {
  const BACKEND_URL=process.env.NEXT_PUBLIC_BACKEND_URL
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState("")

  const joinRoom = async () => {
    if (!roomCode) {
      alert("Please enter a room code");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/joinroom`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode })
      });

      const data = await response.json();

      if (data.roomId) {
        setRoomId(data.roomId);
        router.push(`/room/${data.roomId}`);
        console.log("redirecting to the room");
      } else {
        alert("Failed to join room. Please check the room code.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("An error occurred while joining the room");
      setLoading(false);
    }
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

        <Button onClick={joinRoom} className="w-full" disabled={loading}>
          {loading ? "Joining Room ..." : "Join Room"}
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => router.push("/submissions")}
        >
          View My Submissions
        </Button>
      </div>
    </div>
  );
}