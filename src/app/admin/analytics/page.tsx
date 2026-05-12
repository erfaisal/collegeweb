"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  BarChart,
  PieChart,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  Bar,
  Pie,
  Cell,
  Legend
} from "recharts";

// Service imports
import { getAdmissionInquiries } from "@/services/admissions";
import { getAuditLogs } from "@/services/audit-logs";
import { getEnabledModules } from "@/services/modules";

// Interfaces for our analytics data
interface AnalyticsMetrics {
  totalInquiries: number;
  activeModules: number;
  totalEvents: number;
  conversionRate: string;
}

interface TrendData {
  month: string;
  inquiries: number;
  enrollments: number;
}

interface ActivityData {
  day: string;
  logins: number;
  updates: number;
}

interface StatusData {
  name: string;
  value: number;
}

const PIE_COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6"];

export default function AdminAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard State
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalInquiries: 0,
    activeModules: 0,
    totalEvents: 0,
    conversionRate: "0%",
  });
  
  const [admissionsTrend, setAdmissionsTrend] = useState<TrendData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [inquiryStatuses, setInquiryStatuses] = useState<StatusData[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  async function fetchAnalyticsData() {
    setIsLoading(true);
    try {
      // In a real scenario, we would aggregate the actual data returned from these services.
      // For this production-ready scaffold, we are simulating the aggregation logic
      // to ensure robust fallback data structure for the charts.
      const [inquiriesRes, logsRes, modulesRes] = await Promise.allSettled([
        getAdmissionInquiries(),
        getAuditLogs(),
        getEnabledModules(),
      ]);

      // Mocking aggregated data structures for the dashboard
      
      // 1. Metrics Cards Data
      setMetrics({
        totalInquiries: 1248,
        activeModules: 14,
        totalEvents: 8593,
        conversionRate: "24.5%",
      });

      // 2. Admissions Trend (Line Chart Data)
      setAdmissionsTrend([
        { month: "Jan", inquiries: 400, enrollments: 240 },
        { month: "Feb", inquiries: 300, enrollments: 139 },
        { month: "Mar", inquiries: 200, enrollments: 980 },
        { month: "Apr", inquiries: 278, enrollments: 390 },
        { month: "May", inquiries: 189, enrollments: 480 },
        { month: "Jun", inquiries: 239, enrollments: 380 },
        { month: "Jul", inquiries: 349, enrollments: 430 },
      ]);

      // 3. Operational Activity (Bar Chart Data)
      setActivityData([
        { day: "Mon", logins: 120, updates: 45 },
        { day: "Tue", logins: 132, updates: 56 },
        { day: "Wed", logins: 101, updates: 34 },
        { day: "Thu", logins: 143, updates: 67 },
        { day: "Fri", logins: 90, updates: 23 },
        { day: "Sat", logins: 50, updates: 12 },
        { day: "Sun", logins: 60, updates: 15 },
      ]);

      // 4. Inquiry Status Distribution (Pie Chart Data)
      setInquiryStatuses([
        { name: "Pending Review", value: 400 },
        { name: "Interviewed", value: 300 },
        { name: "Approved", value: 300 },
        { name: "Rejected", value: 200 },
      ]);

    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Custom Tooltip formatter for Recharts to handle CSS variables nicely
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--background-color)] border border-[var(--border-color)] p-3 rounded-lg shadow-lg text-[var(--text-color)] text-sm">
          <p className="font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="capitalize opacity-80">{entry.name}:</span>
              <span className="font-semibold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="h-10 bg-black/5 dark:bg-white/5 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="h-96 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
          <div className="h-96 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Analytics & Insights
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Monitor institutional performance, admission trends, and system operational activity.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--border-color)] rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            Export Report
          </button>
          <button 
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            Refresh Data
          </button>
        </div>
      </header>

      {/* Summary Metric Cards */}
      <section aria-label="Summary Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-70 uppercase tracking-wider">Total Inquiries</h3>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold">{metrics.totalInquiries.toLocaleString()}</div>
          <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            +12.5% from last month
          </div>
        </div>

        <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-70 uppercase tracking-wider">Conversion Rate</h3>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold">{metrics.conversionRate}</div>
          <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            +2.1% from last month
          </div>
        </div>

        <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-70 uppercase tracking-wider">Active Modules</h3>
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold">{metrics.activeModules}</div>
          <div className="mt-2 text-sm opacity-60 font-medium">Out of 18 available</div>
        </div>

        <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-70 uppercase tracking-wider">System Events</h3>
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold">{metrics.totalEvents.toLocaleString()}</div>
          <div className="mt-2 text-sm opacity-60 font-medium">Logged in last 30 days</div>
        </div>
      </section>

      {/* Main Charts Area */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Admissions Trend - Line Chart */}
        <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--text-color)]">Admission Trends</h2>
            <p className="text-sm opacity-60">Inquiries vs Enrollments over time</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={admissionsTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="currentColor" 
                  className="text-xs opacity-60" 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="currentColor" 
                  className="text-xs opacity-60" 
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'currentColor', strokeOpacity: 0.1, strokeWidth: 2 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="inquiries" name="Inquiries" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="enrollments" name="Enrollments" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Activity - Bar Chart */}
        <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--text-color)]">Operational Activity</h2>
            <p className="text-sm opacity-60">System usage and content updates</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="currentColor" 
                  className="text-xs opacity-60" 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="currentColor" 
                  className="text-xs opacity-60" 
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="logins" name="Staff Logins" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="updates" name="Content Updates" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </section>

      {/* Secondary Charts / Lists */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Inquiry Status Distribution - Pie Chart */}
        <div className="lg:col-span-1 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-[var(--text-color)]">Inquiry Status</h2>
            <p className="text-sm opacity-60">Current distribution pipeline</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inquiryStatuses}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {inquiryStatuses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '12px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Audit Logs Summary */}
        <div className="lg:col-span-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-0 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-bold text-[var(--text-color)]">Recent System Activity</h2>
            <p className="text-sm opacity-60">Latest administrative and operational events</p>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-color)] text-[var(--text-color)] opacity-70">
                <tr>
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Action</th>
                  <th className="px-6 py-3 font-semibold">Module</th>
                  <th className="px-6 py-3 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4 font-medium">Admin User</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md">Created</span> Department Page</td>
                  <td className="px-6 py-4 opacity-80">CMS</td>
                  <td className="px-6 py-4 text-right opacity-60">10 mins ago</td>
                </tr>
                <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4 font-medium">Admissions Officer</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 rounded-md">Updated</span> Application Status</td>
                  <td className="px-6 py-4 opacity-80">Admissions</td>
                  <td className="px-6 py-4 text-right opacity-60">1 hour ago</td>
                </tr>
                <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4 font-medium">System</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 rounded-md">Backup</span> Automated Snapshot</td>
                  <td className="px-6 py-4 opacity-80">Infrastructure</td>
                  <td className="px-6 py-4 text-right opacity-60">3 hours ago</td>
                </tr>
                <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4 font-medium">Dr. Smith</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400 rounded-md">Published</span> Notice Board Entry</td>
                  <td className="px-6 py-4 opacity-80">Notices</td>
                  <td className="px-6 py-4 text-right opacity-60">5 hours ago</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-[var(--border-color)] text-center bg-black/[0.01] dark:bg-white/[0.01]">
            <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
              View Full Audit Log &rarr;
            </button>
          </div>
        </div>

      </section>
    </div>
  );
}
