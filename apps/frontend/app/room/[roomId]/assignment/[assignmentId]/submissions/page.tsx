"use client"

import {Card,CardBody} from "@heroui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState,useEffect } from "react"
import { useParams } from "next/navigation"

export default function Submissions(){
   const BACKEND_URL=process.env.NEXT_PUBLIC_BACKEND_URL
    const [loading,setLoading]=useState(false)
    const [submissions,setSubmissions]=useState<any[]>([])
    const params=useParams()
    const assignmentId=params.assignmentId as string

useEffect(()=>{
  viewSubmissions()
},[assignmentId])

const viewSubmissions= async () => {
    try{
      setLoading(true)
      const response=await fetch(`${BACKEND_URL}/api/view/submissions`,{
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

const grade= async (submissionId:string) =>{
  const response=await fetch(`http://localhost:1000/api/gradeAi`,{
    method:"POST",
    credentials:"include",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({assignmentId,submissionId})
  })

}

return <>
{submissions.map((submission)=>{
    return (
    <Card
    className="border-gray-200 "
    key={submission.id}
    >
        <CardBody>
            {submission.studentId}
            {submission.grade}
            {submission.assignmentId}
            <Button onClick={()=>{
              grade(submission.id)
            }}>Grade this assignment</Button>

        </CardBody>
    </Card>
    )
})}
</>
}