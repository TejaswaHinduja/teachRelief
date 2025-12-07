"use client"

import {Card,CardBody} from "@heroui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState,useEffect } from "react"
import { useParams } from "next/navigation"

export default function Submissions(){
    const [loading,setLoading]=useState(false)
    const [submissions,setSubmissions]=useState<any[]>([])
    const params=useParams()
    const assignmentId=params.assignmentId as string

useEffect(()=>{
    const viewSubmissions= async () => {
    try{
      setLoading(true)
      const response=await fetch("http://localhost:1000/api/view/submissions",{
        method:"POST",
        credentials:"include",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({
          assignmentId
        })
      })
      const data=await response.json()
      setSubmissions(data.submissions)
      console.log(data)
    }
    catch(e){
      console.log(e)
    }
    finally{setLoading(false)}
  }
  viewSubmissions()
},[])

return <>
{submissions.map((submission)=>{
    <Card
    key={assignmentId}
    >
        <CardBody>
            {submissions}

        </CardBody>
    </Card>



})}





</>
}