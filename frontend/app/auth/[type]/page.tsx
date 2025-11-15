"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Link from "next/link";
import { useParams, notFound,useRouter  } from "next/navigation";
import { useForm, Controller } from "react-hook-form";

export default function SignPage(){
    
    const {type} = useParams()
    if(typeof type!=="string"){
        return null //typeof undefined !== "string" is true
    }
    const allowed = ["login", "signup"];

    if (!allowed.includes(type)) {
    notFound(); 
    }
    const signup=type==="signup"


type formValues={
    email:string,
    name?:string,
    password:string
}
const {register,handleSubmit,formState:{errors}}=useForm<formValues>({defaultValues: { name: "", email: "", password: "" }});

async function onSubmit(values:formValues){
    console.log(values)
    const endPoint= signup ?"signup":"login";
    
    const res=await fetch(`http://localhost:1000/api/${endPoint}`,{
        method:"POST",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(values)
    });
    const data=await res.json();
    if(!res.ok){
        alert(data.message)
        return
    }
    alert(data.message)
    }
    
    return <>
    <div className="flex flex-col justify-center items-center space-y-4">
    <form onSubmit={handleSubmit(onSubmit)}>
        <Input className="w-64" placeholder="Enter your email"{...register("email",{required:true})} ></Input>
        <Input className="w-64" placeholder="Enter password"{...register("password",{required:true})}></Input>
        {signup && (<Input className="w-64" placeholder="Enter your name" {...register("name")}></Input>)}
        <Button>Submit</Button>
    </form>

    </div>
    </>
}