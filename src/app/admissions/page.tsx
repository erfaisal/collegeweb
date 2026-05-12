"use client";

import { useState, FormEvent, MouseEvent } from "react";

// Service import (assumed implementation)
import { createAdmissionInquiry } from "@/services/admissions";

const COURSES = [
  "B.Tech in Computer Science & Engineering",
  "B.Tech in Artificial Intelligence",
  "Bachelor of Business Administration (BBA)",
  "Master of Business Administration (MBA)",
  "Bachelor of Medicine, Bachelor of Surgery (MBBS)",
  "B.A. in Psychology & Humanities",
  "B.Sc. in Biotechnology",
];

const COUNTRY_CODES = [
  { code: "+1", label: "USA/CAN" },
  { code: "+44", label: "UK" },
  { code: "+91", label: "IND" },
  { code: "+61", label: "AUS" },
  { code: "+971", label: "UAE" },
  { code: "+65", label: "SGP" },
];

export default function AdmissionsPage() {
  const [formData, setFormData] = useState({
    student_name: "",
    email: "",
    phone_code: "+1",
    phone: "",
    course: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Custom Dropdown States
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseSelect = (course: string) => {
    setFormData((prev) => ({ ...prev, course }));
    setIsCourseDropdownOpen(false);
  };

  const handlePhoneCodeSelect = (code: string) => {
    setFormData((prev) => ({ ...prev, phone_code: code }));
    setIsPhoneDropdownOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Basic Validation
    if (!formData.student_name || !formData.email || !formData.phone || !formData.course) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setStatus("submitting");

    try {
      // Format payload to combine phone code and number for the service
      const payload = {
        student_name: formData.student_name,
        email: formData.email,
        phone: `${formData.phone_code} ${formData.phone}`,
        course: formData.course,
        message: formData.message,
      };

      await createAdmissionInquiry(payload);
      setStatus("success");
      setFormData({
        student_name: "",
        email: "",
        phone_code: "+1",
        phone: "",
        course: "",
        message: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
      setErrorMessage("Failed to submit your inquiry. Please try again or contact support.");
    }
  };

  const scrollToForm = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.getElementById("admission-form-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] selection:bg-indigo-500/30 font-sans">
      
      {/* Hero Banner Section */}
      <section className="relative cms-section flex items-center justify-center min-h-[70vh] bg-indigo-900 overflow-hidden text-center border-b border-[var(--border-color)]">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="cms-container relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
          <span className="inline-block px-3 py-1 mb-6 text-sm font-bold tracking-wider uppercase text-indigo-200 bg-indigo-800/50 rounded-full border border-indigo-500/30 backdrop-blur-sm">
            Admissions 2024-2025
          </span>
          <h1 className="cms-heading text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-md">
            Begin Your Journey to Excellence
          </h1>
          <p className="text-lg sm:text-2xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Join a global community of innovators, leaders, and thinkers. Applications for the upcoming academic year are now open.
          </p>
          <button
            onClick={scrollToForm}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-indigo-900 bg-white hover:bg-indigo-50 rounded-xl shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            Apply Now
            <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </button>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="cms-section py-16 sm:py-24 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="cms-heading text-3xl sm:text-4xl font-bold tracking-tight">Why Choose Our Institution?</h2>
            <div className="w-20 h-1.5 bg-indigo-600 dark:bg-indigo-500 mx-auto mt-6 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "World-Class Faculty", desc: "Learn from industry experts, renowned researchers, and dedicated educators committed to your success.", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14v6" },
              { title: "Global Opportunities", desc: "Gain international exposure through our extensive network of partner universities and global exchange programs.", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { title: "Career Placement", desc: "Benefit from our robust career services, internships, and partnerships with leading Fortune 500 companies.", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }
            ].map((feature, idx) => (
              <div key={idx} className="cms-card bg-[var(--background-color)] p-8 rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={feature.icon}></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="opacity-70 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Programs Snippet */}
      <section className="cms-section py-16 sm:py-24 border-t border-[var(--border-color)]">
        <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="cms-heading text-3xl sm:text-4xl font-bold tracking-tight mb-4">Academic Programs</h2>
              <p className="opacity-70 max-w-2xl text-lg">Discover degree programs designed to equip you with the knowledge and skills needed for tomorrow's challenges.</p>
            </div>
            <button className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline whitespace-nowrap">
              View All Programs &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Engineering & Technology", "Business & Management", "Medical & Health Sciences", "Arts, Humanities & Social Sciences"].map((category, idx) => (
              <div key={idx} className="group relative p-6 bg-black/[0.03] dark:bg-white/[0.03] rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-indigo-500/30 transition-colors">
                <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{category}</h3>
                <p className="opacity-60 text-sm">Explore programs &rarr;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application / Inquiry Form Section */}
      <section id="admission-form-section" className="cms-section py-16 sm:py-24 bg-black/[0.02] dark:bg-white/[0.02] border-t border-[var(--border-color)] relative scroll-mt-10">
        <div className="cms-container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
            
            {/* Form Left Side - Info */}
            <div className="lg:w-2/5 bg-indigo-900 text-white p-10 sm:p-12 lg:p-16 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div className="relative z-10 flex-1">
                <h3 className="text-3xl font-bold mb-6">Take the Next Step</h3>
                <p className="text-indigo-100 text-lg leading-relaxed mb-10">
                  Fill out the inquiry form to receive detailed information about your program of interest, scholarship opportunities, and the admission process.
                </p>
                <ul className="space-y-6 text-indigo-100">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-indigo-400 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span>admissions@institution.edu</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-indigo-400 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <span>+1 (800) 123-4567</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-indigo-400 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>123 University Avenue<br/>Innovation District<br/>Global City, 10001</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Form Right Side */}
            <div className="lg:w-3/5 p-10 sm:p-12 lg:p-16 relative">
              {status === "success" ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path></svg>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Application Received!</h3>
                  <p className="opacity-70 text-lg mb-8 max-w-md mx-auto">
                    Thank you, {formData.student_name}. Your inquiry has been submitted successfully. An admissions counselor will be in touch with you shortly.
                  </p>
                  <button 
                    onClick={() => setStatus("idle")}
                    className="px-6 py-3 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold mb-2">Admissions Inquiry Form</h3>
                  <p className="opacity-70 text-sm mb-8">All fields marked with an asterisk (*) are required.</p>

                  {errorMessage && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium flex items-center">
                      <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {errorMessage}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="student_name" className="text-sm font-semibold opacity-90">Full Name *</label>
                    <input
                      id="student_name" name="student_name" type="text" required
                      value={formData.student_name} onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:opacity-40"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-semibold opacity-90">Email Address *</label>
                    <input
                      id="email" name="email" type="email" required
                      value={formData.email} onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:opacity-40"
                      placeholder="johndoe@example.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-semibold opacity-90">Phone Number *</label>
                    <div className="flex relative">
                      
                      {/* Custom Country Code Dropdown */}
                      <div className="relative flex-shrink-0 z-20">
                        <button
                          type="button"
                          onClick={() => setIsPhoneDropdownOpen(!isPhoneDropdownOpen)}
                          className="h-full px-4 py-3 bg-black/[0.04] dark:bg-white/[0.04] border border-r-0 border-[var(--border-color)] rounded-l-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-medium flex items-center justify-between min-w-[90px]"
                          aria-haspopup="listbox"
                          aria-expanded={isPhoneDropdownOpen}
                        >
                          <span>{formData.phone_code}</span>
                          <svg className={`w-4 h-4 ml-2 transition-transform opacity-60 ${isPhoneDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>

                        {isPhoneDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsPhoneDropdownOpen(false)}></div>
                            <ul 
                              className="absolute z-20 top-full left-0 mt-2 w-48 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto"
                              role="listbox"
                            >
                              {COUNTRY_CODES.map((item) => (
                                <li key={item.code} role="option" aria-selected={formData.phone_code === item.code}>
                                  <button
                                    type="button"
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex justify-between items-center ${formData.phone_code === item.code ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 font-medium' : ''}`}
                                    onClick={() => handlePhoneCodeSelect(item.code)}
                                  >
                                    <span className="font-mono">{item.code}</span>
                                    <span className="opacity-60 text-xs">{item.label}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>

                      <input
                        id="phone" name="phone" type="tel" required
                        value={formData.phone} onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-r-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:opacity-40"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 relative z-10">
                    <label id="course-label" className="text-sm font-semibold opacity-90">Program of Interest *</label>
                    
                    {/* Custom Course Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                        aria-labelledby="course-label"
                        aria-haspopup="listbox"
                        aria-expanded={isCourseDropdownOpen}
                        className={`w-full text-left px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all flex items-center justify-between ${!formData.course ? 'opacity-50' : ''}`}
                      >
                        <span className="truncate">{formData.course || "Select a program..."}</span>
                        <svg className={`w-5 h-5 flex-shrink-0 transition-transform ${isCourseDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>

                      {isCourseDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsCourseDropdownOpen(false)}></div>
                          <ul 
                            className="absolute z-20 top-full left-0 mt-2 w-full bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden py-1 max-h-64 overflow-y-auto"
                            role="listbox"
                            aria-labelledby="course-label"
                          >
                            {COURSES.map((course) => (
                              <li key={course} role="option" aria-selected={formData.course === course}>
                                <button
                                  type="button"
                                  className={`w-full text-left px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-[var(--border-color)] last:border-0 ${formData.course === course ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 font-semibold' : ''}`}
                                  onClick={() => handleCourseSelect(course)}
                                >
                                  {course}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-sm font-semibold opacity-90">Questions / Message (Optional)</label>
                    <textarea
                      id="message" name="message" rows={4}
                      value={formData.message} onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-y placeholder:opacity-40"
                      placeholder="Let us know if you have any specific queries..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full cms-button inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                  >
                    {status === "submitting" ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Application...
                      </>
                    ) : "Submit Inquiry"}
                  </button>

                  <p className="text-xs opacity-60 text-center mt-6">
                    By submitting this form, you agree to our Privacy Policy and consent to being contacted regarding your inquiry.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <section className="bg-indigo-50 dark:bg-indigo-900/10 border-t border-[var(--border-color)] py-12">
        <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6">
          <div>
            <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">Need immediate assistance?</h2>
            <p className="text-indigo-700 dark:text-indigo-300">Our admission counselors are available Monday-Friday, 9 AM - 5 PM.</p>
          </div>
          <a href="tel:+18001234567" className="inline-flex items-center justify-center px-6 py-3 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-400 dark:hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            Call +1 (800) 123-4567
          </a>
        </div>
      </section>
      
    </main>
  );
}
