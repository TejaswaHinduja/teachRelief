"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card,CardBody } from "@heroui/card";
import { useState } from "react";
import { useParams,useRouter } from "next/navigation";




export default function StudentRoom(){
    const [uploading,setUploading]=useState("")
    const [ocrText,setOcrText]=useState("")
    const [pdfUrl,setPdfUrl]=useState("")
    const [title,setTitle]=useState("")
    const [assignmentId,setAssignmentId]=useState("")

    const router = useRouter();
    const params=useParams()
    const roomId=params.roomId as string;
    

    const assignmentsInRoom=async ()=>{
        try {
        const response=await fetch(`http://localhost:1000/api/assignment/${roomId}`,{
            method:"GET",
            credentials:"include"
        })
        const data=await response.json();
        setPdfUrl(data.pdfUrl)
        console.log(data)
    }
        catch(error){
            console.log(error)
        }
    }
    const assignmentDetails=async ()=>{

        try{
            const response=await fetch(`http://localhost:1000/api/assignment/${assignmentId}`,{
                method:"GET",
                credentials:"include"
            })
            const data=await response.json();
            setTitle(data.title)
            setPdfUrl(data.pdfUrl)
            setAssignmentId(data.assignmentId)
            router.push(`/room/${roomId}/assignment/${assignmentId}`)
        }
        catch(e){
            console.log(e)

        }
    }
      return <div className="flex">
        hi there
        <Card isPressable onPress={assignmentsInRoom} className="border-2 border-gray-200 hover:border-gray-300 transition-colors">
            title
        </Card>
        <Card isPressable onPress={assignmentDetails}>
            whats upppp

        </Card>


    </div>
}