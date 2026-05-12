"use client";

import { useEffect, useState, FormEvent, ChangeEvent, useRef } from "react";

// Service imports
import {
  getFacultyMembers,
  createFacultyMember,
  updateFacultyMember,
  deleteFacultyMember,
} from "@/services/faculty";
import { uploadMediaFile } from "@/services/media";

export interface FacultyMember {
  id?: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  bio: string;
  image_url: string;
  featured: boolean;
  visible: boolean;
  display_order: number;
  email: string;
  phone: string;
  linkedin_url: string;
  researchgate_url: string;
  google_scholar_url: string;
  experience_years: number;
  specialization: string;
  achievements: string;
  seo_title: string;
  seo_description: string;
}

const defaultFacultyMember: FacultyMember = {
  name: "",
  designation: "",
  department: "Computer Science",
  qualification: "",
  bio: "",
  image_url: "",
  featured: false,
  visible: true,
  display_order: 0,
  email: "",
  phone: "",
  linkedin_url: "",
  researchgate_url: "",
  google_scholar_url: "",
  experience_years: 0,
  specialization: "",
  achievements: "",
  seo_title: "",
  seo_description: "",
};

const DEPARTMENTS = [
  "All",
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Mathematics",
  "Physics",
  "Humanities",
  "Medical Sciences",
];

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<FacultyMember>(defaultFacultyMember);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFaculty();
  }, []);

  async function fetchFaculty() {
    try {
      setIsLoading(true);
      const data = await getFacultyMembers();
      const sortedData = (data || []).sort((a: FacultyMember, b: FacultyMember) => a.display_order - b.display_order);
      setFaculty(sortedData);
    } catch (error) {
      console.error("Failed to load faculty members:", error);
      showMessage("error", "Failed to load faculty directory.");
    } finally {
      setIsLoading(false);
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateNew = () => {
    setFormData({ ...defaultFacultyMember, display_order: faculty.length });
    setView("form");
    setMessage(null);
  };

  const handleEdit = (member: FacultyMember) => {
    setFormData({ ...member });
    setView("form");
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this faculty member? This action cannot be undone.")) return;

    try {
      setDeletingId(id);
      await deleteFacultyMember(id);
      setFaculty((prev) => prev.filter((f) => f.id !== id));
      showMessage("success", "Faculty member removed successfully.");
    } catch (error) {
      console.error("Failed to delete faculty member:", error);
      showMessage("error", "Failed to remove faculty member.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const currentItem = filteredFaculty[index];
    const targetItem = filteredFaculty[targetIndex];

    if (!currentItem || !targetItem) return;

    const currentAbsIndex = faculty.findIndex(f => f.id === currentItem.id);
    const targetAbsIndex = faculty.findIndex(f => f.id === targetItem.id);

    const newFaculty = [...faculty];
    const tempOrder = newFaculty[currentAbsIndex].display_order;
    newFaculty[currentAbsIndex].display_order = newFaculty[targetAbsIndex].display_order;
    newFaculty[targetAbsIndex].display_order = tempOrder;

    const temp = newFaculty[currentAbsIndex];
    newFaculty[currentAbsIndex] = newFaculty[targetAbsIndex];
    newFaculty[targetAbsIndex] = temp;

    newFaculty.sort((a, b) => a.display_order - b.display_order);
    setFaculty(newFaculty);

    try {
      if (currentItem.id && targetItem.id) {
        await Promise.all([
          updateFacultyMember(currentItem.id, { display_order: newFaculty[targetAbsIndex].display_order }),
          updateFacultyMember(targetItem.id, { display_order: newFaculty[currentAbsIndex].display_order })
        ]);
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      showMessage("error", "Failed to save the new order.");
      fetchFaculty(); // Revert on failure
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadedMedia = await uploadMediaFile(file);
      if (uploadedMedia && uploadedMedia.url) {
        setFormData((prev) => ({ ...prev, image_url: uploadedMedia.url }));
        showMessage("success", "Profile image uploaded successfully.");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      showMessage("error", "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      if (formData.id) {
        const updated = await updateFacultyMember(formData.id, formData);
        setFaculty((prev) => prev.map((f) => (f.id === formData.id ? updated : f)).sort((a, b) => a.display_order - b.display_order));
        showMessage("success", "Faculty profile updated successfully.");
      } else {
        const created = await createFacultyMember(formData);
        setFaculty((prev) => [...prev, created].sort((a, b) => a.display_order - b.display_order));
        showMessage("success", "Faculty member added successfully.");
      }
      setView("list");
    } catch (error) {
      console.error("Failed to save faculty member:", error);
      showMessage("error", "Failed to save profile. Please verify your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredFaculty = faculty.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDepartment === "All" || member.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const renderList = () => (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Faculty Directory
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Manage academic staff profiles, department assignments, and contact information.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          Add Faculty Member
        </button>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <input
              type="text"
              placeholder="Search name or designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 w-full sm:w-64 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/[0.01] dark:bg-white/[0.01] border-b border-[var(--border-color)] text-[var(--text-color)] opacity-80">
              <tr>
                <th className="px-6 py-4 font-medium w-20">Order</th>
                <th className="px-6 py-4 font-medium">Profile</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-color)] opacity-60">
                    No faculty members found.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((member, index) => (
                  <tr key={member.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-center justify-center w-8">
                        <button 
                          onClick={() => handleReorder(index, "up")}
                          disabled={index === 0}
                          className="text-[var(--text-color)] opacity-40 hover:opacity-100 disabled:opacity-20 transition-opacity focus:outline-none"
                          aria-label="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                        </button>
                        <span className="text-xs font-mono text-[var(--text-color)]">{member.display_order}</span>
                        <button 
                          onClick={() => handleReorder(index, "down")}
                          disabled={index === filteredFaculty.length - 1}
                          className="text-[var(--text-color)] opacity-40 hover:opacity-100 disabled:opacity-20 transition-opacity focus:outline-none"
                          aria-label="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] overflow-hidden flex-shrink-0">
                          {member.image_url ? (
                            <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-full h-full text-[var(--text-color)] opacity-30 p-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--text-color)]">{member.name}</span>
                          <span className="text-xs text-[var(--text-color)] opacity-60 mt-0.5">{member.designation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-md text-[var(--text-color)]">
                        {member.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-[var(--text-color)] opacity-80 gap-0.5">
                        <span className="truncate max-w-[150px]" title={member.email}>{member.email || "—"}</span>
                        <span>{member.phone || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {member.featured && <span className="text-xs border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded">Featured</span>}
                        {!member.visible && <span className="text-xs border border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded">Hidden</span>}
                        {member.visible && !member.featured && <span className="text-xs border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded">Active</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors focus:outline-none"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => member.id && handleDelete(member.id)}
                          disabled={deletingId === member.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50 focus:outline-none"
                        >
                          {deletingId === member.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12 max-w-7xl mx-auto">
      <header className="sticky top-0 z-20 -mx-4 px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-[var(--background-color)]/95 backdrop-blur-sm border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setView("list")}
            className="p-2 border border-[var(--border-color)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--text-color)]"
            aria-label="Back to list"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-color)]">
              {formData.id ? "Edit Faculty Profile" : "Add Faculty Member"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Personal Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="name" className="text-sm font-medium text-[var(--text-color)] opacity-90">Full Name *</label>
                <input
                  id="name" name="name" required
                  value={formData.name} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="e.g. Dr. Jane Smith"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="designation" className="text-sm font-medium text-[var(--text-color)] opacity-90">Designation *</label>
                <input
                  id="designation" name="designation" required
                  value={formData.designation} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="e.g. Professor, Head of Department"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="department" className="text-sm font-medium text-[var(--text-color)] opacity-90">Department</label>
                <select
                  id="department" name="department"
                  value={formData.department} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                >
                  {DEPARTMENTS.filter(d => d !== "All").map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-[var(--text-color)] opacity-90">Official Email</label>
                <input
                  id="email" name="email" type="email"
                  value={formData.email} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-[var(--text-color)] opacity-90">Contact Number</label>
                <input
                  id="phone" name="phone" type="tel"
                  value={formData.phone} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Academic & Professional Info</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="qualification" className="text-sm font-medium text-[var(--text-color)] opacity-90">Highest Qualification</label>
                <input
                  id="qualification" name="qualification"
                  value={formData.qualification} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="e.g. Ph.D. in Computer Science"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="experience_years" className="text-sm font-medium text-[var(--text-color)] opacity-90">Years of Experience</label>
                <input
                  id="experience_years" name="experience_years" type="number" min="0"
                  value={formData.experience_years} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="specialization" className="text-sm font-medium text-[var(--text-color)] opacity-90">Areas of Specialization</label>
                <input
                  id="specialization" name="specialization"
                  value={formData.specialization} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="e.g. Machine Learning, AI, Data Science"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="bio" className="text-sm font-medium text-[var(--text-color)] opacity-90">Biography</label>
                <textarea
                  id="bio" name="bio" rows={4}
                  value={formData.bio} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
                  placeholder="Brief overview of the faculty member's career and interests..."
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="achievements" className="text-sm font-medium text-[var(--text-color)] opacity-90">Key Achievements / Publications (HTML)</label>
                <textarea
                  id="achievements" name="achievements" rows={4}
                  value={formData.achievements} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm resize-y"
                  placeholder="<ul><li>Published paper in...</li></ul>"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Research & Social Links</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="linkedin_url" className="text-sm font-medium text-[var(--text-color)] opacity-90">LinkedIn URL</label>
                <input
                  id="linkedin_url" name="linkedin_url" type="url"
                  value={formData.linkedin_url} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="google_scholar_url" className="text-sm font-medium text-[var(--text-color)] opacity-90">Google Scholar URL</label>
                <input
                  id="google_scholar_url" name="google_scholar_url" type="url"
                  value={formData.google_scholar_url} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="researchgate_url" className="text-sm font-medium text-[var(--text-color)] opacity-90">ResearchGate URL</label>
                <input
                  id="researchgate_url" name="researchgate_url" type="url"
                  value={formData.researchgate_url} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Profile Image</h2>
            
            <div className="flex flex-col gap-4 items-center">
              <div className="w-40 h-40 rounded-full border-4 border-[var(--border-color)] bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center relative group">
                {formData.image_url ? (
                  <>
                    <img src={formData.image_url} alt="Profile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                        aria-label="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <svg className="w-16 h-16 text-[var(--text-color)] opacity-30" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                )}
              </div>
              
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50 text-[var(--text-color)] w-full"
              >
                {isUploading ? "Uploading..." : "Upload Photo"}
              </button>
              
              <div className="w-full space-y-1.5 mt-2">
                <label htmlFor="image_url" className="text-xs font-medium text-[var(--text-color)] opacity-80 text-center block">Or enter image URL</label>
                <input
                  id="image_url" name="image_url" type="url"
                  value={formData.image_url} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm text-center"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Visibility & Order</h2>

            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox" name="visible"
                    checked={formData.visible} onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                </div>
                <span className="text-sm font-medium text-[var(--text-color)]">Visible to Public</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox" name="featured"
                    checked={formData.featured} onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--text-color)]">Featured Profile</span>
                  <span className="text-xs text-[var(--text-color)] opacity-60">Highlights on department pages</span>
                </div>
              </label>
            </div>

            <div className="pt-4 mt-2 border-t border-[var(--border-color)]">
              <label htmlFor="display_order" className="text-sm font-medium text-[var(--text-color)] opacity-90 block mb-1.5">Display Order / Hierarchy</label>
              <input
                id="display_order" name="display_order" type="number" min="0"
                value={formData.display_order} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
              <p className="text-xs text-[var(--text-color)] opacity-60 mt-1">Lower numbers appear first (e.g., HOD = 0)</p>
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">SEO Configuration</h2>

            <div className="space-y-1.5">
              <label htmlFor="seo_title" className="text-sm font-medium text-[var(--text-color)] opacity-90">SEO Title</label>
              <input
                id="seo_title" name="seo_title"
                value={formData.seo_title} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="seo_description" className="text-sm font-medium text-[var(--text-color)] opacity-90">SEO Description</label>
              <textarea
                id="seo_description" name="seo_description" rows={3}
                value={formData.seo_description} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
              />
            </div>
          </div>

        </div>
      </div>
    </form>
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-black/10 dark:bg-white/10 rounded w-1/4"></div>
        <div className="h-96 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
      </div>
    );
  }

  return view === "list" ? renderList() : renderForm();
}
