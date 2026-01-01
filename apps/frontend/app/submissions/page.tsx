"use client"

import { useState, useEffect } from "react"
import { Card, CardBody } from "@heroui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { FileText, Calendar, CheckCircle, Clock, ExternalLink, BookOpen, ArrowLeft } from "lucide-react"

export default function StudentSubmissions() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  const [loading, setLoading] = useState(false)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(`${BACKEND_URL}/api/my-submissions`, {
        method: "GET",
        credentials: "include"
      })
      const data = await response.json()
      if (data.submissions) {
        setSubmissions(data.submissions)
      } else {
        setError("Failed to load submissions")
      }
    } catch (e) {
      console.log(e)
      setError("Error loading submissions")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Submissions</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardBody className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No submissions yet. Submit an assignment to see it here!</p>
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">
                          {submission.assignment?.title || "Unknown Assignment"}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Room: {submission.assignment?.room?.name || "Unknown Room"} 
                        <span className="text-gray-400 ml-2">
                          ({submission.assignment?.room?.code})
                        </span>
                      </p>
                    </div>
                    {submission.grade && (
                      <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold text-lg">
                          {submission.grade}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted: {formattedDate}</span>
                    </div>
                    {submission.gradedAt ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Graded: {gradedDate}</span>
                      </div>
                    ) : (
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
                        <span>View My Submission PDF</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {submission.feedback && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-sm font-semibold mb-2 text-blue-900">Teacher Feedback:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>
                    </div>
                  )}

                  {!submission.grade && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        Your submission is being reviewed. Check back later for your grade and feedback.
                      </p>
                    </div>
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

