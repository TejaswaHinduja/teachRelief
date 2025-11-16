"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
//import { Icons } from "@/components";
import { useParams, notFound, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";

export default function SignPage() {
  const { type } = useParams();

  if (typeof type !== "string") return null;

  const allowed = ["login", "signup"];
  if (!allowed.includes(type)) notFound();

  const signup = type === "signup";

  type formValues = {
    email: string;
    name?: string;
    password: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formValues>({
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: formValues) {
    const endpoint = signup ? "signup" : "login";

    const res = await fetch(`http://localhost:1000/api/${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }
    alert(data.message);
  }

  return (
    <div className="flex flex-col items-start max-w-sm mx-auto h-dvh overflow-hidden pt-4 md:pt-20">

      
      <div className="flex items-center w-full py-8 border-b border-border/80">
        <Link href="/#home" className="flex items-center gap-x-2">
          {/*<Icons.logo className="w-6 h-6" />*/}
          <h1 className="text-lg font-medium">teachRelief</h1>
        </Link>
      </div>

      
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 py-6">
        <Input
          placeholder="Enter your email"
          {...register("email", { required: true })}
        />

        <Input
          type="password"
          placeholder="Enter password"
          {...register("password", { required: true })}
        />

        {signup && (
          <Input
            placeholder="Enter your name"
            {...register("name")}
          />
        )}

        <Button className="w-full mt-2">{signup ? "Sign Up" : "Sign In"}</Button>
      </form>

     

      {/* Footer */}
      <div className="flex items-start mt-auto border-t border-border/80 py-6 w-full">
        <p className="text-sm text-muted-foreground">
          {signup ? "Already have an account?" : "Don't have an account?"}{" "}
          <Link
            href={`/auth/${signup ? "login" : "signup"}`}
            className="text-primary"
          >
            {signup ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
}
