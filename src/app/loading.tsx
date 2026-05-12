export default function Loading() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--background-color)] text-[var(--text-color)] p-4 sm:p-6 lg:p-8">
      <div 
        className="cms-container flex flex-col items-center justify-center max-w-md mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700"
        role="status"
        aria-live="polite"
      >
        {/* Elegant Institutional Spinner */}
        <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
          {/* Static Background Track */}
          <svg 
            className="absolute inset-0 w-full h-full text-black/5 dark:text-white/5" 
            viewBox="0 0 100 100" 
            fill="none"
          >
            <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="8" />
          </svg>
          
          {/* Animated Progress Ring */}
          <svg 
            className="absolute inset-0 w-full h-full text-indigo-600 dark:text-indigo-400 motion-safe:animate-spin" 
            viewBox="0 0 100 100" 
            fill="none"
          >
            <circle 
              cx="50" cy="50" r="44" 
              stroke="currentColor" 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeDasharray="276" 
              strokeDashoffset="200" 
            />
          </svg>

          {/* Center Pulse Element */}
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full motion-safe:animate-pulse"></div>
        </div>

        {/* Loading Typography */}
        <div className="flex flex-col items-center space-y-2.5 text-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Loading
          </h1>
          <p className="text-sm sm:text-base font-medium opacity-60 max-w-[280px] mx-auto leading-relaxed">
            Preparing institutional resources and content...
          </p>
        </div>
        
        {/* Screen Reader Only Announcement */}
        <span className="sr-only">Loading page content, please wait.</span>
      </div>
    </main>
  );
}
