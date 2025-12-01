"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card,CardBody } from "@heroui/card";
import { useState } from "react";
import { useParams } from "next/navigation";


export default function StudentRoom(){
    const[uploading,setUploading]=useState("")
    const[ocrText,setOcrText]=useState("")
    const[pdfUrl,setPdfUrl]=useState("")

    
    const params=useParams()
    const roomId=params.roomId as string;
    const assignmentId=params.assignmentId as string;

    const response=async ()=>{await fetch("http://localhost:1000/api/assignment/roomId")}
    const submitAnswer=async ()=>{
        if(!pdfUrl||!ocrText||!assignmentId){
            return console.log("fields missing")
        }

    }
    return <div>

    </div>
}