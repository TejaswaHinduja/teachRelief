import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";







export default function StudentDashboard() {
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