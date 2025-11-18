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
        duration={300}
        repeatdelay={1}
        className={cn(
          "fixed inset-0 -z-10",
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        )} />
      {/*<div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-b  from-rose-100/40  via-rose-200/30  to-rose-400/20" />*/}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-b  from-sky-200/40  via-blue-200/30  to-blue-300/20" />

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
          <h1 className="text-3xl md:text-6xl font-bold mb-6">Automate Grading with AI Precision</h1>
        </Highlighter>
        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mt-6 mb-8 max-w-3xl text-center px-6">Upload your solution key, let us grade your students' work instantly.</p>
        <Button size="lg" onClick={() => router.push("/auth/signup")} className="text-lg px-8 py-6">
          Get Started
        </Button>
      </div>


      <section id="about" className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          <Highlighter action="highlight" color="#FF9800">
            <h2 className="text-4xl font-bold mb-6">About TeachRelief</h2>
          </Highlighter>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mt-6 mb-6">
            Grading assignments is one of the most time-consuming tasks for educators. Hours spent reviewing student work could be better used for teaching, mentoring, and curriculum development.
          </p>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300">
            <strong>TeachRelief</strong> uses advanced AI to automate the grading process. Simply upload your solution key, and our intelligent system will evaluate student submissions, providing accurate grades and detailed feedback in seconds.
          </p>
        </div>
      </section>


      <section id="how" className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl w-full">
          <h2 className="text-4xl font-bold text-center mb-12">How it Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-2xl font-semibold mb-3">Upload Assignment</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Teachers provide the assignment and solution key to establish the grading criteria.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
              <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-2xl font-semibold mb-3">Student Submission</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Students upload their answers through a simple and intuitive interface.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
              <div className="w-16 h-16 rounded-full bg-purple-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-2xl font-semibold mb-3">Instant Grading</h3>
              <p className="text-gray-700 dark:text-gray-300">
                AI compares student work to the solution key and provides detailed feedback instantly.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section id="pricing" className="min-h-screen flex items-center justify-center px-6">
        <h2 className="text-2xl font-medium">Pricing</h2>
      </section>

    </div>
  );
}
