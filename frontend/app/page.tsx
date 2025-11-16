"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 animate-gradient">

      {/* NAVBAR */}
      <header className="w-full absolute top-0 left-0 z-40 bg-transparent">
        <div className="container mx-auto flex items-center justify-between py-6">
          
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo/logo-2.svg"
              alt="logo"
              width={140}
              height={30}
              className="dark:hidden transition duration-300"
            />
            <Image
              src="/images/logo/logo.svg"
              alt="logo"
              width={140}
              height={30}
              className="hidden dark:block transition duration-300"
            />
          </Link>

          {/* Menu Buttons */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#about"
              className="text-gray-700 dark:text-gray-200 hover:text-primary transition duration-300"
            >
              About
            </Link>
            <Link
              href="#how"
              className="text-gray-700 dark:text-gray-200 hover:text-primary transition duration-300"
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="text-gray-700 dark:text-gray-200 hover:text-primary transition duration-300"
            >
              Pricing
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/auth/login")}>
              Log In
            </Button>
            <Button onClick={() => router.push("/auth/signup")}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

     
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-semibold">TeachRelief</h1>
        <p className="text-gray-600 mt-2">Your AI teaching assistant</p>
      </div>

    
      <section id="about" className="min-h-screen flex items-center justify-center px-6">
        <h2 className="text-2xl font-medium">About TeachRelief</h2>
      </section>

      
      <section id="how" className="min-h-screen flex items-center justify-center px-6">
        <h2 className="text-2xl font-medium">How it Works</h2>
      </section>

      
      <section id="pricing" className="min-h-screen flex items-center justify-center px-6">
        <h2 className="text-2xl font-medium">Pricing</h2>
      </section>

  
    </div>
    
  );
}
