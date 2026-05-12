"use client";

import { useEffect, useState, ChangeEvent } from "react";

// Service imports (assumed implementations)
import {
  getAdmissionInquiries,
  updateAdmissionInquiry,
  deleteAdmissionInquiry,
} from "@/services/admissions";

export type AdmissionStatus = "new" | "contacted" | "pending" | "admitted" | "rejected";

export interface AdmissionInquiry {
  id: string;
  student_name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  status: AdmissionStatus;
  created_at: string;
}

const STATUS_OPTIONS: { value: AdmissionStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "pending", label: "Pending" },
  { value: "admitted", label: "Admitted" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminAdmissionsPage() {
  const [inquiries, setInquiries] = useState<AdmissionInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | "all">("all");
  
  const [selectedInquiry, setSelectedInquiry] = useState<AdmissionInquiry | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    try {
      setIsLoading(true);
      const data = await getAdmissionInquiries();
      // Sort by newest first
      const sortedData = (data || []).sort(
        (a: AdmissionInquiry, b: AdmissionInquiry) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setInquiries(sortedData);
    } catch (error) {
      console.error("Failed to fetch admission inquiries:", error);
      showMessage("error", "Failed to load admissions data.");
    } finally {
      setIsLoading(false);
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleStatusChange = async (id: string, newStatus: AdmissionStatus) => {
    try {
      setIsUpdating(true);
      setProcessingId(id);
      
      const inquiryToUpdate = inquiries.find((i) => i.id === id);
      if (!inquiryToUpdate) return;

      const updated = await updateAdmissionInquiry(id, { ...inquiryToUpdate, status: newStatus });
      
      setInquiries((prev) => prev.map((inq) => (inq.id === id ? updated : inq)));
      
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(updated);
      }
      
      showMessage("success", "Inquiry status updated successfully.");
    } catch (error) {
      console.error("Failed to update status:", error);
      showMessage("error", "Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this admission inquiry? This action cannot be undone.")) return;

    try {
      setProcessingId(id);
      await deleteAdmissionInquiry(id);
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
      
      showMessage("success", "Inquiry deleted successfully.");
    } catch (error) {
      console.error("Failed to delete inquiry:", error);
      showMessage("error", "Failed to delete inquiry.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusStyles = (status: AdmissionStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
      case "contacted":
        return "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
      case "admitted":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch = 
      inq.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || inq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[var(--background-color)]">
      
      {/* Header & Controls */}
      <header className="flex-shrink-0 border-b border-[var(--border-color)] p-4 sm:px-6 lg:px-8 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-color)]">
              Admissions CRM
            </h1>
            <p className="text-sm text-[var(--text-color)] opacity-70 mt-1">
              Manage prospective student inquiries and track application status.
            </p>
          </div>
          <div className="flex gap-3">
            {/* Future Integration: CSV Export */}
            <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <svg className="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Export CSV
            </button>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 opacity-40 text-[var(--text-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              type="search"
              placeholder="Search by name, email, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-shadow"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="status-filter" className="text-sm font-medium text-[var(--text-color)] opacity-80 whitespace-nowrap">
              Filter Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AdmissionStatus | "all")}
              className="w-full sm:w-auto px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main CRM Layout: Table + Conditional Detail View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Table Area */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 ${selectedInquiry ? 'hidden lg:block lg:w-2/3' : 'w-full'}`}>
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-black/5 dark:bg-white/5 rounded-lg border border-[var(--border-color)]"></div>
              ))}
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[var(--border-color)] rounded-xl bg-black/[0.01] dark:bg-white/[0.01]">
              <svg className="w-12 h-12 text-[var(--text-color)] opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-1">No Inquiries Found</h3>
              <p className="text-sm text-[var(--text-color)] opacity-60 max-w-sm">
                There are no admission inquiries matching your current filters. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-color)] text-[var(--text-color)] opacity-80">
                    <tr>
                      <th className="px-6 py-4 font-medium">Student / Contact</th>
                      <th className="px-6 py-4 font-medium">Course Interest</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Received</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {filteredInquiries.map((inq) => (
                      <tr 
                        key={inq.id} 
                        onClick={() => setSelectedInquiry(inq)}
                        className={`transition-colors cursor-pointer ${selectedInquiry?.id === inq.id ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : 'hover:bg-black/[0.01] dark:hover:bg-white/[0.01]'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[var(--text-color)]">{inq.student_name}</span>
                            <span className="text-xs text-[var(--text-color)] opacity-60 mt-0.5">{inq.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[var(--text-color)] font-medium opacity-90 truncate max-w-[200px] inline-block">
                            {inq.course}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${getStatusStyles(inq.status)}`}>
                            {inq.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <time dateTime={inq.created_at} className="text-[var(--text-color)] opacity-70 text-xs">
                            {formatDate(inq.created_at)}
                          </time>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInquiry(inq);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors text-sm focus:outline-none"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Detail Panel (Slide-over/Sidebar) */}
        {selectedInquiry && (
          <aside className="w-full lg:w-1/3 xl:w-[400px] border-l border-[var(--border-color)] bg-[var(--background-color)] flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20">
            <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[var(--border-color)] bg-black/[0.01] dark:bg-white/[0.01]">
              <h2 className="text-base font-semibold text-[var(--text-color)]">Inquiry Details</h2>
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-md text-[var(--text-color)] opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
                aria-label="Close details"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-8">
              
              {/* Profile/Contact Section */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 text-indigo-700 dark:text-indigo-300 font-bold text-lg uppercase">
                    {selectedInquiry.student_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-color)] text-lg">{selectedInquiry.student_name}</h3>
                    <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getStatusStyles(selectedInquiry.status)}`}>
                      {selectedInquiry.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl">
                  <div>
                    <span className="block text-xs font-semibold text-[var(--text-color)] opacity-50 uppercase tracking-wider mb-1">Email Address</span>
                    <a href={`mailto:${selectedInquiry.email}`} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[var(--text-color)] opacity-50 uppercase tracking-wider mb-1">Phone Number</span>
                    <a href={`tel:${selectedInquiry.phone}`} className="text-sm font-medium text-[var(--text-color)] opacity-90 hover:underline">
                      {selectedInquiry.phone || "Not provided"}
                    </a>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[var(--text-color)] opacity-50 uppercase tracking-wider mb-1">Received On</span>
                    <span className="text-sm font-medium text-[var(--text-color)] opacity-90">
                      {formatDate(selectedInquiry.created_at)}
                    </span>
                  </div>
                </div>
              </section>

              {/* Inquiry Details */}
              <section>
                <h3 className="text-sm font-bold text-[var(--text-color)] border-b border-[var(--border-color)] pb-2 mb-4">Application Information</h3>
                <div className="space-y-5">
                  <div>
                    <span className="block text-xs font-semibold text-[var(--text-color)] opacity-50 uppercase tracking-wider mb-1.5">Program of Interest</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium text-sm border border-indigo-100 dark:border-indigo-500/20">
                      {selectedInquiry.course}
                    </span>
                  </div>
                  
                  <div>
                    <span className="block text-xs font-semibold text-[var(--text-color)] opacity-50 uppercase tracking-wider mb-1.5">Applicant Message</span>
                    <div className="p-4 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] opacity-90 leading-relaxed whitespace-pre-wrap">
                      {selectedInquiry.message || "No message provided."}
                    </div>
                  </div>
                </div>
              </section>

              {/* Status Management */}
              <section className="pt-4 border-t border-[var(--border-color)]">
                <h3 className="text-sm font-bold text-[var(--text-color)] mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.filter(opt => opt.value !== "all").map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusChange(selectedInquiry.id, opt.value as AdmissionStatus)}
                      disabled={isUpdating || selectedInquiry.status === opt.value}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        selectedInquiry.status === opt.value
                          ? 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 cursor-not-allowed'
                          : 'bg-[var(--background-color)] border-[var(--border-color)] text-[var(--text-color)] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      Mark as {opt.label}
                    </button>
                  ))}
                </div>
              </section>

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[var(--border-color)] bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedInquiry.id)}
                disabled={processingId === selectedInquiry.id}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 focus:outline-none"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                {processingId === selectedInquiry.id ? "Deleting..." : "Delete Inquiry"}
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
