"use client"

import {Card, CardHeader, CardBody} from "@heroui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { User, FileText, Calendar, CheckCircle, Clock, ExternalLink } from "lucide-react"

export default function Submissions(){
   const BACKEND_URL=process.env.NEXT_PUBLIC_BACKEND_URL
    const [loading,setLoading]=useState(false)
    const [submissions,setSubmissions]=useState<any[]>([])
    const [grading, setGrading] = useState<string | null>(null)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const params=useParams()
    const router = useRouter()
    const assignmentId=params.assignmentId as string

useEffect(()=>{
  viewSubmissions()
},[assignmentId])

const viewSubmissions= async () => {
    try{
      setLoading(true)
      setError("")
      const response=await fetch(`${BACKEND_URL}/api/view/submissions`,{
        method:"POST",
        credentials:"include",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({
          assignmentId
        })
      })
      const data=await response.json()
      if (data.submissions) {
        setSubmissions(data.submissions)
      } else {
        setError("Failed to load submissions")
      }
    }
    catch(e){
      console.log(e)
      setError("Error loading submissions")
    }
    finally{setLoading(false)}
  }

const grade= async (submissionId:string) =>{
  try {
    setGrading(submissionId)
    setError("")
    setSuccess("")
    const response=await fetch(`${BACKEND_URL}/api/gradeAi`,{
      method:"POST",
      credentials:"include",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({assignmentId,submissionId})
    })
    const data = await response.json()
    if (response.ok) {
      setSuccess("Submission graded successfully!")
      // Refresh submissions
      await viewSubmissions()
    } else {
      setError(data.message || "Failed to grade submission")
    }
  } catch (e) {
    console.log(e)
    setError("Error grading submission")
  } finally {
    setGrading(null)
  }
}

return (
  <div className="p-6 max-w-6xl mx-auto space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Submissions</h1>
      <Button variant="outline" onClick={() => router.back()}>
        Back
      </Button>
    </div>

    {error && (
      <div className="p-3 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    )}

    {success && (
      <div className="p-3 bg-green-100 text-green-700 rounded-md">
        {success}
      </div>
    )}

    {loading ? (
      <div className="text-center py-8 text-gray-500">Loading submissions...</div>
    ) : submissions.length === 0 ? (
      <Card className="border-2 border-dashed border-gray-300">
        <CardBody className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No submissions yet.</p>
        </CardBody>
      </Card>
    ) : (
      <div className="space-y-4">
        {submissions.map((submission) => {
          const submittedDate = new Date(submission.createdAt);
          const formattedDate = submittedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
          
          const gradedDate = submission.gradedAt 
            ? new Date(submission.gradedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })
            : null;

          return (
            <Card 
              key={submission.id}
              className="border-2 border-gray-200 hover:border-blue-300 transition-colors"
            >
              <CardBody className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {submission.student?.name || "Unknown Student"}
                      </h3>
                      <p className="text-sm text-gray-500">{submission.student?.email}</p>
                    </div>
                  </div>
                  {submission.grade && (
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                        Grade: {submission.grade}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted: {formattedDate}</span>
                  </div>
                  {submission.gradedAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Graded: {gradedDate}</span>
                    </div>
                  )}
                  {!submission.grade && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <Clock className="h-4 w-4" />
                      <span>Pending grading</span>
                    </div>
                  )}
                </div>

                {submission.pdfUrl && (
                  <div className="mb-4">
                    <a 
                      href={submission.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Submission PDF</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {submission.feedback && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-semibold mb-1">Feedback:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>
                  </div>
                )}

                {!submission.grade && (
                  <Button 
                    onClick={() => grade(submission.id)}
                    disabled={grading === submission.id}
                    className="w-full md:w-auto"
                  >
                    {grading === submission.id ? "Grading..." : "Grade Submission"}
                  </Button>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    )}
  </div>
)
}