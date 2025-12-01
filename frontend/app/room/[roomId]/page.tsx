"use client"

import { Button } from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react";
import {useRouter,useParams} from "next/navigation";
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload, } from "@imagekit/next";
import { Card,CardBody } from "@heroui/card";
import TeacherRoom from "./teacherRoom"
import StudentRoom from "./studentRoom";

export default function room(){
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState(""); 
  const [creating, setCreating] = useState(false); 
  const [success, setSuccess] = useState(""); 


  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <StudentRoom/>
    </div>
)}