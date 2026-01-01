"use client"

import { Card, CardBody } from "@heroui/card";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, ArrowLeft, FileText } from "lucide-react";

interface Assignment {
    id: string;
    title: string;
    pdfUrl: string;
}

export default function StudentRoom() {
    const BACKEND_URL=process.env.NEXT_PUBLIC_BACKEND_URL
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)

    const router = useRouter();
    const params=useParams()
    const roomId=params.roomId as string;
    
    useEffect(() => {
        fetchAssignments();
    }, [roomId])

    const fetchAssignments = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${BACKEND_URL}/api/assignment/${roomId}`, {
                method: "GET",
                credentials: "include"
            })
            const data = await response.json();
            console.log("API Response:", data)
            if (data.assignments) {
                setAssignments(data.assignments)
                console.log("Assignments:", data.assignments)
            }
        } catch (e) {
            console.log("Error fetching assignments:", e)
        } finally {
            setLoading(false)
        }
    }

    const handleAssignmentClick = (assignmentId: string) => {
        console.log("Assignment ID clicked:", assignmentId)
        router.push(`/room/${roomId}/assignment/${assignmentId}`)
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Assignments</h1>
                    <p className="text-gray-600">Select an assignment to submit your solution</p>
                </div>
                <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500">Loading assignments...</p>
                </div>
            ) : assignments.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                    <CardBody className="text-center py-12">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">No assignments found for this room.</p>
                        <p className="text-gray-400 text-sm mt-2">Check back later or contact your teacher.</p>
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignments.map((assignment) => (
                        <Card
                            key={assignment.id}
                            isPressable
                            onPress={() => handleAssignmentClick(assignment.id)}
                            className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                        >
                            <CardBody className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors shrink-0">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors truncate">
                                            {assignment.title}
                                        </h3>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0 ml-2" />
                                </div>
                                <p className="text-sm text-gray-500 pl-11">Click to view and submit</p>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}