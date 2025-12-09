"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload, } from "@imagekit/next";
import { Copy } from "lucide-react";
import TeacherDashboard from "./teacher"
import StudentDashboard from "./student";

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

