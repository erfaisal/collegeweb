import Link from "next/link";

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background-color)] text-[var(--text-color)] p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500/30">
      <section className="cms-section cms-container max-w-2xl w-full mx-auto text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Calm Operational/Maintenance Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-8 border-[8px] border-indigo-50/50 dark:border-indigo-900/5 shadow-sm relative">
          <svg 
            className="w-10 h-10 sm:w-12 sm:h-12 motion-safe:animate-[spin_6s_linear_infinite]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>

        {/* Heading */}
        <h1 className="cms-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
          System Maintenance
        </h1>
        
        {/* Friendly Explanation */}
        <p className="text-lg opacity-70 max-w-xl mx-auto mb-6 leading-relaxed">
          We are currently performing scheduled maintenance to upgrade our institutional portal and improve your digital experience. Core services will be restored shortly.
        </p>

        {/* Operational Status / ETA */}
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 px-6 py-3 rounded-xl inline-flex items-center justify-center gap-3 mb-10 text-sm font-medium w-full sm:w-auto">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-left">Estimated duration: <strong>Approximately 2 hours</strong></span>
        </div>

        {/* Recovery / Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/"
            className="cms-button w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
            aria-label="Refresh and check status"
          >
            <svg className="w-5 h-5 mr-2.5 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Check Status
          </Link>
          
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-[var(--text-color)] bg-black/5 dark:bg-white/5 border border-[var(--border-color)] hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
          >
            Contact Support
          </Link>
        </div>

        {/* Emergency Contact Fallback */}
        <div className="mt-16 pt-6 border-t border-[var(--border-color)] w-full max-w-md mx-auto text-center space-y-2">
          <h2 className="text-sm font-bold opacity-70 uppercase tracking-wider">
            Need immediate assistance?
          </h2>
          <p className="text-sm opacity-60">
            Reach out to our emergency IT operations desk at <a href="tel:+18005550199" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-sm">+1 (800) 555-0199</a>
          </p>
        </div>

      </section>
    </main>
  );
}
