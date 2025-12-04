"use client"
import { useState } from "react";
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload, } from "@imagekit/next";
import { useParams } from "next/navigation";


export default function assignment(){

    const[uploading,setUploading]=useState(false)
    const[error,setError]=useState("")
    const[pdfUrl,setPdfUrl]=useState("")
    const[ocrText,setOcrText]=useState("")
    const[submitting,setSubmitting]=useState(false)
    //const[assignmentId,setAssignmentId]=useState(false)

    const params=useParams();
    const assignmentId=params.assignmentId as string;





    const authenticator = async () => {
        try {
          const response = await fetch("/api/upload-auth");
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed with status ${response.status}: ${errorText}`
            );
          }
          const data = await response.json();
          const { signature, expire, token, publicKey } = data;
          return { signature, expire, token, publicKey };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Authentication request failed");
        }
      };
    
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        setUploading(true);
        setError("");
        setPdfUrl("");
    
        try {
          const authParams = await authenticator();
          const { signature, expire, token, publicKey } = authParams;
    
          const uploadResponse = await upload({
            expire,
            token,
            signature,
            publicKey,
            file,
            fileName: file.name,
            onProgress: (event) => {
              const percent = (event.loaded / event.total) * 100;
              console.log(`Upload progress: ${percent.toFixed(2)}%`);
            },
          });
    
          if (uploadResponse.url) {
            setPdfUrl(uploadResponse.url);
            console.log("Upload successful:", uploadResponse.url);
          } else {
            throw new Error("Upload succeeded but no URL was returned");
          }
        } catch (error) {
          if (error instanceof ImageKitAbortError) {
            setError(`Upload aborted: ${error.reason}`);
          } else if (error instanceof ImageKitInvalidRequestError) {
            setError(`Invalid request: ${error.message}`);
          } else if (error instanceof ImageKitUploadNetworkError) {
            setError(`Network error: ${error.message}`);
          } else if (error instanceof ImageKitServerError) {
            setError(`Server error: ${error.message}`);
          } else {
            setError("Upload failed. Please try again.");
          }
          console.error("Upload error:", error);
        } finally {
          setUploading(false);
        }
      };


    const submit= async () => {
        if(!pdfUrl||!ocrText){
            setError("upload pdf and run ocr")
            return;
        }
        setSubmitting(true)
        const response=await fetch("localhost://1000/api/submission",{
            method:"POST",
            credentials:"include",
            body:JSON.stringify({
                assignmentId:assignmentId,
                pdfUrl:pdfUrl,
                extractedText:ocrText
            })
        })
        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create assignment");
        }
        


    }
    return <div>
        whats up 
    </div>
}