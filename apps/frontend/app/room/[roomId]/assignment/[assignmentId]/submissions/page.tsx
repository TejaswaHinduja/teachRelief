"use client"

import { Card, CardHeader, CardBody } from "@heroui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { User, FileText, Calendar, CheckCircle, Clock, ExternalLink, Wallet } from "lucide-react"
import WalletButton from "@/components/ui/WalletButton"
import axios from "axios"
import { withPaymentInterceptor } from "x402-axios"
import { useAccount, useWalletClient } from "wagmi"

export default function Submissions() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  const [loading, setLoading] = useState(false)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [grading, setGrading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.assignmentId as string

  // EVM Wallet connection
  const { isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  // Create axios instance with x402 payment interceptor
  const paymentApi = useMemo(() => {
    if (!walletClient) return null;

    const axiosInstance = axios.create({
      baseURL: BACKEND_URL,
      withCredentials: true,
      headers: { "Content-Type": "application/json" }
    });

    // x402-axios automatically works with viem WalletClient
    return withPaymentInterceptor(axiosInstance, walletClient as any);
  }, [walletClient, BACKEND_URL]);

  useEffect(() => {
    viewSubmissions()
  }, [assignmentId])

  const viewSubmissions = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(`${BACKEND_URL}/api/view/submissions`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assignmentId
        })
      })
      const data = await response.json()
      if (data.submissions) {
        setSubmissions(data.submissions)
      } else {
        setError("Failed to load submissions")
      }
    }
    catch (e) {
      console.log(e)
      setError("Error loading submissions")
    }
    finally { setLoading(false) }
  }

  const grade = async (submissionId: string) => {
    // Check if wallet is connected
    if (!isConnected || !paymentApi) {
      setError("Please connect your wallet to grade submissions. Payment required: $0.0001 (ETH/Base)")
      return
    }

    try {
      setGrading(submissionId)
      setError("")
      setSuccess("")
      setPaymentStatus("Preparing payment...")

      // Use x402-axios which handles 402 Payment Required automatically
      const response = await paymentApi.post("/api/gradeAi", {
        assignmentId,
        submissionId
      })

      if (response.data.savegrades) {
        setSuccess("Submission graded successfully! Payment processed.")
        setPaymentStatus("")
        // Refresh submissions
        await viewSubmissions()
      } else {
        setError(response.data.message || "Failed to grade submission")
      }
    } catch (e: any) {
      console.error("Grading error:", e)

      // Handle specific error cases
      if (e.response?.status === 402) {
        setError("Payment required. Please ensure your wallet has sufficient ETH and you're on Base Sepolia.")
      } else if (e.message?.includes("User rejected")) {
        setError("Payment cancelled. You need to approve the transaction to grade.")
      } else if (e.message?.includes("insufficient")) {
        setError("Insufficient funds. Please add ETH to your wallet.")
      } else {
        setError(e.response?.data?.message || "Error grading submission. Please try again.")
      }
    } finally {
      setGrading(null)
      setPaymentStatus("")
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <div className="flex items-center gap-3">
          <WalletButton />
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Payment info banner */}
      {!isConnected && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <Wallet className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">Wallet Required for Grading</p>
            <p className="text-xs text-blue-600">Connect your wallet (Base Sepolia) to grade. Cost: $0.0001 per grading.</p>
          </div>
        </div>
      )}

      {isConnected && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700">Wallet connected! Ready to grade.</p>
        </div>
      )}

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

      {paymentStatus && (
        <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
          {paymentStatus}
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
                      {grading === submission.id ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          {paymentStatus || "Grading..."}
                        </>
                      ) : (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Grade Submission ($0.0001)
                        </>
                      )}
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
