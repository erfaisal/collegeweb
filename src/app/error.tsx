"use client";

import { useEffect } from "react";
import Link from "next/link";

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service or console
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background-color)] text-[var(--text-color)] p-4 sm:p-6 lg:p-8 font-sans selection:bg-red-500/30">
      <section className="cms-section cms-container max-w-2xl w-full mx-auto text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Calming Alert Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-8 border-[8px] border-red-50/50 dark:border-red-900/5 shadow-sm">
          <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>

        {/* Error Heading */}
        <h1 className="cms-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
          Unexpected Error
        </h1>
        
        {/* Human-Friendly Explanation */}
        <p className="text-lg opacity-70 max-w-xl mx-auto mb-10 leading-relaxed">
          We encountered an issue while trying to process your request. Our technical team has been notified. Please try refreshing the page or return to the homepage to continue.
        </p>

        {/* Recovery Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => reset()}
            className="cms-button w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
            aria-label="Try again"
          >
            <svg className="w-5 h-5 mr-2.5 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Try Again
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-[var(--text-color)] bg-black/5 dark:bg-white/5 border border-[var(--border-color)] hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
          >
            Return to Homepage
          </Link>
        </div>

        {/* Subtle Technical Reference */}
        {error.digest && (
          <div className="mt-16 pt-6 border-t border-[var(--border-color)] w-full max-w-md mx-auto text-center">
            <p className="text-xs font-mono opacity-40">
              Error Reference: {error.digest}
            </p>
          </div>
        )}

      </section>
    </main>
  );
}
