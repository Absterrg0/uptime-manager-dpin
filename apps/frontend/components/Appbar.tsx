"use client";
import { Button } from "./ui/button";
import { Activity } from "lucide-react";
import { ThemeToggle } from "./ui/toggle-theme-button";
import { SignedOut,SignedIn,SignUpButton,SignInButton,UserButton } from "@clerk/nextjs";
export default function Appbar() {
  return (
    <nav className="fixed w-full backdrop-blur-md bg-white/50 dark:bg-slate-900/50 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center group">
            <Activity className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
              DePin Monitor
            </span>
          </div>
          <div className="flex items-center gap-6">
          <SignedOut>
            <div className="flex gap-2">
              <SignInButton>
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
          
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}