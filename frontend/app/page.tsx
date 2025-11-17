"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { cn } from "@/lib/utils";
import { Highlighter } from "@/components/ui/highlighter"

export default function Home() {
  const router = useRouter();

  return (
    
      <div className="relative min-h-screen overflow-hidden">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatdelay={1}
        className={cn(
          "fixed inset-0 -z-10",
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      )}/>
      {/*<div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-b  from-rose-100/40  via-rose-200/30  to-rose-400/20" />*/}
      {/*<div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-b  from-sky-200/40  via-blue-200/30  to-blue-300/20" />*/}
    
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
        <Highlighter action="underline" color="#87CEFA">
        <h1 className="text-3xl font-semibold">TeachRelief</h1>
        </Highlighter>
        <p className="text-gray-600 mt-2">Your AI teaching assistant</p>
      </div>

    
      <section id="about" className="min-h-screen flex items-center justify-center px-6">
        <Highlighter action="underline" color="#FF9800">
        <Highlighter action="highlight" color="#FF9800">
        <h2 className="text-2xl font-medium">About TeachRelief</h2>
        </Highlighter>
        </Highlighter>
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
