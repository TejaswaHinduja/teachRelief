import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router=useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [loading,setLoading]=useState(false);



  const joinRoom = async () => {
    setLoading(true)
    if (!roomCode) {
      alert("Please enter a room code");
      return;
    }
    const response=await fetch("http://localhost:1000/api/joinroom",{
      method:"POST",
      credentials:"include",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({roomCode})
    })

    const data=await response.json()
    if(data.roomId){
      router.push(`/room/${data.roomId}`)
    }
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

        <Button onClick={joinRoom} className="w-full" disabled={loading}>
          {loading?"Joining Room ...":"Join Room"}
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