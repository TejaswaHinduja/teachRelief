"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import TeacherDashboard from "./teacher"
import StudentDashboard from "./student";

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // First check localStorage for immediate display
    const cachedRole = localStorage.getItem("userRole");
    const cachedName = localStorage.getItem("userName");
    
    if (cachedRole) {
      setUserRole(cachedRole);
      setUserName(cachedName || "User");
    }

    // Then verify with the backend
    const verifyAuth = async () => {
      try {
        const response = await fetch("/api/verify-auth", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok || !data.authenticated) {
          // User is not authenticated, clear localStorage and redirect
          localStorage.removeItem("userRole");
          localStorage.removeItem("userName");
          router.push("/auth/login");
          return;
        }

        // Update with fresh data from backend
        if (data.user) {
          localStorage.setItem("userRole", data.user.role);
          localStorage.setItem("userName", data.user.name || "");
          setUserRole(data.user.role);
          setUserName(data.user.name || "User");
        }
      } catch (error) {
        console.error("Error verifying authentication:", error);
        // On error, redirect to login
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        router.push("/auth/login");
      }
    };

    verifyAuth();
  }, [router]);



  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Welcome, {userName}!
        </h1>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
              await fetch(`${BACKEND_URL}/api/logout`, {
                method: "POST",
                credentials: "include",
              });
            } catch (error) {
              console.error("Error during logout:", error);
            } finally {
              // Clear localStorage and redirect regardless of API success
              localStorage.removeItem("userRole");
              localStorage.removeItem("userName");
              router.push("/auth/login");
            }
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

