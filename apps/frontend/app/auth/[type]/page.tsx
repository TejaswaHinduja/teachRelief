"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams, notFound, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from "@/lib/validations/auth";

export default function SignPage() {
  const BACKEND_URL=process.env.NEXT_PUBLIC_BACKEND_URL 
  const { type } = useParams();
  const router = useRouter();

  // Create separate form hooks for better type safety
  // Hooks must be called at the top level, before any conditional returns
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur", // Validate on blur for better UX
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", role: "STUDENT" },
    mode: "onChange", // Real-time validation for signup
  });

  // Validation checks after hooks
  if (typeof type !== "string") return null;
  
  const isValidType = typeof type === "string" && ["login", "signup"].includes(type);
  if (!isValidType) notFound();
  
  const signup = typeof type === "string" && type === "signup";

  // Use the appropriate schema based on the form type
  const schema = signup ? signupSchema : loginSchema;

  // Use the appropriate form based on type
  const form = signup ? signupForm : loginForm;
  const { register, handleSubmit, control, formState: { errors }, watch } = form;
  
  // Watch password for strength indicator (only for signup)
  const password = signup ? signupForm.watch("password") : "";

  async function onSubmit(values: SignupFormData | LoginFormData) {
    const endpoint = signup ? "signup" : "login";

    const res = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
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
    const userRole = signup ? data.user?.role : data.role;
    const userName = signup ? data.user?.name : data.name;
    if (userRole) {
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("userName", userName || "");
    }
    alert(data.message);
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col items-start max-w-sm mx-auto h-dvh overflow-hidden pt-4 md:pt-20">

      <div className="flex items-center w-full py-8 border-b border-border/80">
        <Link href="/" className="flex items-center gap-x-2">
          {/*<Icons.logo className="w-6 h-6" />*/}
          <h1 className="text-lg font-medium">teachRelief</h1>
        </Link>
      </div>


      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 py-6">
        <div className="flex flex-col gap-2">
        {/*<div className="hidden-field" aria-hidden="true">
        <label htmlFor="website">Website</label>
              <input
                id="website"
                type="text"
                {...signupForm.register("website")} 
                tabIndex={-1}            // prevents keyboard focus
                autoComplete="off"       
              />
            </div> */}
          <Label htmlFor="email">Email<span className="text-red-500">*</span></Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...(signup ? signupForm.register("email") : loginForm.register("email"))}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password{signup && <span className="text-red-500">*</span>}</Label>
          <Input
            id="password"
            type="password"
            placeholder={signup ? "Enter password (min 6 chars, 1 uppercase, 1 lowercase, 1 number)" : "Enter password"}
            {...(signup ? signupForm.register("password") : loginForm.register("password"))}
            className={errors.password ? "border-red-500" : ""}
          />
          {signup && password && (
            <div className="space-y-1">
              <div className="flex gap-2 text-xs">
                <span className={password.length >= 6 ? "text-green-600" : "text-gray-400"}>
                  {password.length >= 6 ? "✓" : "○"} At least 6 characters
                </span>
                <span className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-400"}>
                  {/[A-Z]/.test(password) ? "✓" : "○"} Uppercase
                </span>
                <span className={/[a-z]/.test(password) ? "text-green-600" : "text-gray-400"}>
                  {/[a-z]/.test(password) ? "✓" : "○"} Lowercase
                </span>
                <span className={/[0-9]/.test(password) ? "text-green-600" : "text-gray-400"}>
                  {/[0-9]/.test(password) ? "✓" : "○"} Number
                </span>
              </div>
            </div>
          )}
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {signup && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name<span className="text-red-500 ">*</span></Label>
            <Input
              id="name"
              placeholder="Enter your name (letters and spaces only)"
              {...signupForm.register("name")}
              className={signupForm.formState.errors.name ? "border-red-500" : ""}
            />
            {signupForm.formState.errors.name && (
              <p className="text-sm text-red-500">{signupForm.formState.errors.name.message}</p>
            )}
          </div>
        )}

        {signup && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Role<span className="text-red-500">*</span></Label>
            <Controller
              name="role"
              control={signupForm.control}
              render={({ field }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={signupForm.formState.errors.role ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                  {signupForm.formState.errors.role && (
                    <p className="text-sm text-red-500">{signupForm.formState.errors.role.message}</p>
                  )}
                </>
              )}
            />
          </div>
        )}

        <Button className="w-full mt-2 cursor-pointer">{signup ? "Sign Up" : "Sign In"}</Button>
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