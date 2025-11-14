import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { usePathname } from "next/navigation";


export default function SignPage(){
    const[formData,setformData]=useState("")
    const pathname = usePathname()
    const signup=pathname==="/signup"
 

    return <>
    <div className="flex flex-col justify-center items-center space-y-4">

        <Input className="w-64" placeholder="Enter your email"></Input>
        <Input className="w-64" placeholder="Enter password"></Input>
        {signup && (<Input className="w-64" placeholder="Enter your name"></Input>)}
        
        
        <Button>Submit</Button>

    </div>
    </>
}