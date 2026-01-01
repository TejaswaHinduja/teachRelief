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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Submissions</h1>
          <p className="text-gray-600">View all your assignment submissions and grades</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
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
                className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200"
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xl mb-1 truncate">
                            {submission.assignment?.title || "Unknown Assignment"}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Room:</span>
                            <span className="font-medium">
                              {submission.assignment?.room?.name && submission.assignment.room.name !== "room name" 
                                ? submission.assignment.room.name 
                                : "Unknown Room"}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="font-mono text-xs">{submission.assignment?.room?.code}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {submission.grade && (
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <div className="px-5 py-2.5 bg-linear-to-r from-green-100 to-green-50 text-green-700 rounded-lg font-bold text-xl shadow-sm border border-green-200">
                          {submission.grade}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Submitted:</span>
                      <span>{formattedDate}</span>
                    </div>
                    {submission.gradedAt ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-2 rounded-md">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Graded:</span>
                        <span>{gradedDate}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded-md">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Status:</span>
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors text-sm font-medium border border-blue-200"
                      >
                        <FileText className="h-4 w-4" />
                        <span>View Submission PDF</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {submission.feedback && (
                    <div className="mb-4 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-blue-200 rounded">
                          <CheckCircle className="h-4 w-4 text-blue-700" />
                        </div>
                        <p className="text-sm font-semibold text-blue-900">Teacher Feedback</p>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed pl-7">
                        {submission.feedback}
                      </p>
                    </div>
                  )}

                  {!submission.grade && (
                    <div className="p-4 bg-linear-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-900 mb-1">Submission Under Review</p>
                          <p className="text-sm text-yellow-800">
                            Your submission is being reviewed. Check back later for your grade and feedback.
                          </p>
                        </div>
                      </div>
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

