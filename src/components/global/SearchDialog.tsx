"use client";

import { useEffect, useMemo, useState, KeyboardEvent as ReactKeyboardEvent, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Types & Interfaces ---

export type SearchEntityType = 
  | "pages" 
  | "notices" 
  | "faculty" 
  | "departments" 
  | "gallery" 
  | "hostels" 
  | "hospital" 
  | "admissions";

export interface SearchResult {
  id: string;
  title: string;
  type: SearchEntityType;
  route: string;
  description: string;
}

// --- Mock Data (Future integration point for API/AI/Fuzzy search) ---

const MOCK_SEARCH_DATA: SearchResult[] = [
  { id: "1", title: "Admissions 2024-2025", type: "admissions", route: "/admissions", description: "Apply for the upcoming academic year undergraduate programs." },
  { id: "2", title: "Computer Science & Engineering", type: "departments", route: "/departments/cse", description: "B.Tech and M.Tech programs in Computer Science." },
  { id: "3", title: "Dr. Alan Turing", type: "faculty", route: "/faculty/alan-turing", description: "Professor, Department of Computer Science & Engineering." },
  { id: "4", title: "Exam Schedule Released", type: "notices", route: "/notices/exam-schedule-spring-2024", description: "Mid-term examination schedule for Spring 2024." },
  { id: "5", title: "Tagore Boys Hostel", type: "hostels", route: "/hostels/tagore", description: "Accommodation for first and second-year male students." },
  { id: "6", title: "Cardiology Department", type: "hospital", route: "/hospital/cardiology", description: "Advanced cardiac care and OPD services." },
  { id: "7", title: "Annual Convocation 2023", type: "gallery", route: "/gallery/convocation-2023", description: "Photo gallery of the 24th Annual Convocation." },
  { id: "8", title: "About the Institution", type: "pages", route: "/about", description: "History, mission, and vision of the university." },
  { id: "9", title: "Fee Structure", type: "admissions", route: "/admissions/fees", description: "Detailed tuition and hostel fee breakdown." },
  { id: "10", title: "Emergency Trauma Center", type: "hospital", route: "/hospital/emergency", description: "24/7 emergency medical services and trauma care." },
];

// --- Helper for Type Badges ---

const getTypeStyles = (type: SearchEntityType) => {
  switch (type) {
    case "admissions": return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
    case "departments": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30";
    case "faculty": return "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30";
    case "notices": return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
    case "hostels": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
    case "hospital": return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";
    case "gallery": return "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400 border-pink-200 dark:border-pink-500/30";
    case "pages": return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  }
};

export default function SearchDialog() {
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // --- Keyboard Shortcuts & Body Scroll Lock ---
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Toggle on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      // Close on Escape
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    
    // Manage body scroll
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setSelectedIndex(0);
    }

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // --- Filtering Logic ---
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return MOCK_SEARCH_DATA.filter((item) => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.description.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery)
    ).slice(0, 8); // Limit results for clean UI
  }, [query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // --- Navigation & Selection Logic ---
  const handleSelect = (route: string) => {
    setIsOpen(false);
    router.push(route);
  };

  const handleInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (filteredResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
        break;
      case "Enter":
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelect(filteredResults[selectedIndex].route);
        }
        break;
    }
  };

  // --- Scroll Active Item into View ---
  useEffect(() => {
    if (listRef.current && isOpen) {
      const activeElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6">
      
      {/* Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog Container */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Global Search"
        className="relative w-full max-w-2xl flex flex-col bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Search Header & Input */}
        <div className="flex items-center px-4 py-3 border-b border-[var(--border-color)]">
          <Search className="w-5 h-5 text-[var(--text-color)] opacity-50 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search pages, faculty, notices, or departments..."
            className="flex-1 px-4 py-2 bg-transparent text-[var(--text-color)] placeholder:text-[var(--text-color)] placeholder:opacity-40 outline-none w-full text-base sm:text-lg"
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-[var(--text-color)] opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 flex-shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
          
          {query.trim() === "" ? (
            // Initial Empty State / Recent Searches Placeholder
            <div className="px-6 py-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[var(--text-color)] opacity-40" />
              </div>
              <p className="text-[var(--text-color)] opacity-60 font-medium">Type to start searching...</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-sm">
                <span className="text-xs text-[var(--text-color)] opacity-40 uppercase tracking-wider w-full mb-1">Quick Suggestions</span>
                <button onClick={() => setQuery("admissions")} className="px-3 py-1 text-xs rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] text-[var(--text-color)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Admissions</button>
                <button onClick={() => setQuery("faculty")} className="px-3 py-1 text-xs rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] text-[var(--text-color)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Faculty Directory</button>
                <button onClick={() => setQuery("notices")} className="px-3 py-1 text-xs rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] text-[var(--text-color)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Latest Notices</button>
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            // No Results State
            <div className="px-6 py-12 text-center">
              <p className="text-[var(--text-color)] opacity-90 font-medium mb-1">No results found for "{query}"</p>
              <p className="text-[var(--text-color)] opacity-50 text-sm">Try searching for something else or check your spelling.</p>
            </div>
          ) : (
            // Search Results List
            <ul ref={listRef} className="p-2" role="listbox">
              {filteredResults.map((result, index) => {
                const isSelected = index === selectedIndex;
                
                return (
                  <li
                    key={result.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(result.route)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-colors border-l-4 ${
                      isSelected 
                        ? "bg-black/5 dark:bg-white/5 border-indigo-500" 
                        : "border-transparent hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[var(--text-color)] truncate">
                          {result.title}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getTypeStyles(result.type)} flex-shrink-0`}>
                          {result.type}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-color)] opacity-60 truncate">
                        {result.description}
                      </p>
                    </div>
                    
                    {isSelected && (
                      <div className="hidden sm:flex items-center self-center flex-shrink-0 pl-2">
                        <span className="text-xs font-medium text-[var(--text-color)] opacity-40">
                          Press Enter to open
                        </span>
                        <svg className="w-4 h-4 ml-2 text-[var(--text-color)] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer Commands Indicator */}
        <div className="hidden sm:flex items-center justify-between px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-t border-[var(--border-color)]">
          <div className="flex items-center gap-4 text-xs text-[var(--text-color)] opacity-50 font-medium">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 border border-[var(--border-color)] font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 border border-[var(--border-color)] font-mono text-[10px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 border border-[var(--border-color)] font-mono text-[10px]">↵</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 border border-[var(--border-color)] font-mono text-[10px]">esc</kbd>
              <span>to close</span>
            </span>
          </div>
          
          <div className="text-xs text-[var(--text-color)] opacity-40 font-semibold">
            Institutional Search
          </div>
        </div>
      </div>
    </div>
  );
}
