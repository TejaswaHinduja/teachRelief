"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardBody } from "@heroui/card";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Assignment {
    id: string;
    title: string;
    pdfUrl: string;
}


export default function StudentRoom() {
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
            const response = await fetch(`http://localhost:1000/api/assignment/${roomId}`, {
                method: "GET",
                credentials: "include"
            })
            const data = await response.json();
            console.log("API Response:", data)
            // The API returns {assignments: [...]}
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
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Assignments</h1>

            {loading ? (
                <p>Loading assignments...</p>
            ) : assignments.length === 0 ? (
                <p>No assignments found for this room.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignments.map((assignment) => (
                        <Card
                            key={assignment.id}
                            isPressable
                            onPress={() => handleAssignmentClick(assignment.id)}
                            className="border-2 border-gray-200 hover:border-gray-300 transition-colors"
                        >
                            <CardBody>
                                <h3 className="font-semibold">{assignment.title}</h3>
                                <p className="text-sm text-gray-500 mt-2">Click to view details</p>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}