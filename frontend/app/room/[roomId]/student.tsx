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
    const assignmentId=params.assignmentId as string;


    const submitAnswer=async ()=>{
        const check
        if(!pdfUrl||!ocrText||!assignmentId){
            return console.log("fields missing")
        }


    }



    return <div>

    </div>
}