import React, { useState } from "react";
import { type ChurchEvent } from "../types";
import { 
  CalendarDays, MapPin, Clock, Users, Search, Filter, Edit2, Trash2, Plus, 
  Sparkles, Layers, Award, FileText, CheckCircle2, AlertCircle, Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  events: ChurchEvent[];
  stats: {
    totalEvents: number;
    totalAttendance: number;
    ministryCounts: { [key: string]: number };
    upcomingCount: number;
  };
  onAddEvent: () => void;
  onEditEvent: (event: ChurchEvent) => void;
  onDeleteEvent: (id: string) => void;
}

// Ministry color mapping helper
export const getMinistryColor = (ministry: string) => {
  const min = ministry.toLowerCase();
  if (min.includes("youth")) return { bg: "bg-teal-50 text-teal-700 border-teal-200", badge: "bg-teal-500" };
  if (min.includes("women") || min.includes("guild")) return { bg: "bg-rose-50 text-rose-700 border-rose-200", badge: "bg-rose-500" };
  if (min.includes("men") || min.includes("fellowship")) return { bg: "bg-blue-50 text-blue-700 border-blue-200", badge: "bg-blue-500" };
  if (min.includes("school") || min.includes("child")) return { bg: "bg-amber-50 text-amber-700 border-amber-200", badge: "bg-amber-500" };
  if (min.includes("choir") || min.includes("music")) return { bg: "bg-violet-50 text-violet-700 border-violet-200", badge: "bg-violet-500" };
  if (min.includes("main") || min.includes("service") || min.includes("sanctuary")) return { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", badge: "bg-indigo-500" };
  return { bg: "bg-slate-100 text-slate-700 border-slate-200", badge: "bg-slate-400" };
};

export default function Dashboard({ 
  events, 
  stats, 
  onAddEvent, 
  onEditEvent, 
  onDeleteEvent 
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMinistry, setSelectedMinistry] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"date-asc" | "date-desc" | "attendance">("date-asc");

  // Get unique list of ministries for filter
  const allMinistries = ["All", ...Array.from(new Set(events.map(e => e.ministry).filter(Boolean)))];

  // Filter and Sort events
  const filteredEvents = events
    .filter(evt => {
      const matchesSearch = 
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMinistry = selectedMinistry === "All" || evt.ministry === selectedMinistry;
      
      return matchesSearch && matchesMinistry;
    })
    .sort((a, b) => {
      if (sortBy === "date-asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "date-desc") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return (b.attendance || 0) - (a.attendance || 0);
      }
    });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Dynamic Welcome Hero Section */}
      <div className="bg-radial from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 rounded-full bg-emerald-600/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Parish Administration Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
              St. Andrew's Scheduling & Analytics
            </h1>
            <p className="text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Plan services, manage community attendances, and coordinate ministry schedules across our Presbyterian parish.
            </p>
          </div>
          
          <button
            onClick={onAddEvent}
            className="self-start md:self-center px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all duration-300 shadow-lg shadow-indigo-600/20 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Performance Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Events */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase">Cataloged Events</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalEvents || 0}</p>
          </div>
        </div>

        {/* Total Attendance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase">Aggregate Attendance</p>
            <p className="text-2xl font-black text-slate-800">{(stats.totalAttendance || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Upcoming events counter */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase">Active & Upcoming</p>
            <p className="text-2xl font-black text-slate-800">{stats.upcomingCount || 0}</p>
          </div>
        </div>

        {/* Main service proportion / Active Ministries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase">Registered Ministries</p>
            <p className="text-2xl font-black text-slate-800">
              {Object.keys(stats.ministryCounts || {}).length}
            </p>
          </div>
        </div>

      </div>

      {/* Main Events Board Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Filters & Ministry Analysis */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Filter Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-2">
              Refinement Controls
            </h3>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Search Events</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Title, location, keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Ministry Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Filter by Ministry</label>
              <div className="flex flex-wrap gap-1.5">
                {allMinistries.map(min => {
                  const isSelected = selectedMinistry === min;
                  return (
                    <button
                      key={min}
                      onClick={() => setSelectedMinistry(min)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                        isSelected 
                          ? "bg-slate-900 text-white border-transparent" 
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/50"
                      }`}
                    >
                      {min}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Sort Sequence</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium text-slate-700 bg-white"
              >
                <option value="date-asc">Chronological (Earliest First)</option>
                <option value="date-desc">Recent / Upcoming First</option>
                <option value="attendance">By Expected Attendance</option>
              </select>
            </div>
          </div>

          {/* Ministry Metrics breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Ministry Breakdowns</span>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </h3>

            <div className="space-y-3">
              {Object.keys(stats.ministryCounts || {}).length === 0 ? (
                <p className="text-slate-400 text-[11px] text-center py-4">No events registered in databases.</p>
              ) : (
                Object.entries(stats.ministryCounts || {}).map(([ministry, count]) => {
                  const style = getMinistryColor(ministry);
                  const total = stats.totalEvents || 1;
                  const percentage = Math.round((count / total) * 100);

                  return (
                    <div key={ministry} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">{ministry}</span>
                        <span className="font-mono text-slate-400 font-bold">{count} {count === 1 ? 'event' : 'events'} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                        <div 
                          className={`h-full ${style.badge}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Notice Tip */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-start space-x-3">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
              Updating attendances and scheduling dates will live-recompute metrics across parish dashboard components instantly.
            </p>
          </div>

        </div>

        {/* Dynamic Events Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase">
                Liturgical Events Scheduled
              </h2>
              <p className="text-xs text-slate-400">
                Found {filteredEvents.length} events matching current query
              </p>
            </div>

            <div className="text-slate-400 text-xs font-semibold">
              EAT Local Server Sync
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm/30">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <AlertCircle className="w-8 h-8 text-slate-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">No Scheduled Parish Events Found</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  We couldn't find any events matching your refined search criteria or selected ministry filters.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedMinistry("All");
                }}
                className="px-4 py-2 border border-slate-200 hover:border-indigo-500 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors bg-white"
              >
                Clear All Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((evt) => {
                  const style = getMinistryColor(evt.ministry);
                  
                  // Friendly Date display
                  const dateObj = new Date(evt.date);
                  const formattedDate = dateObj.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  });

                  return (
                    <motion.div
                      key={evt.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                    >
                      <div className="space-y-3">
                        {/* Event Header Badging */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${style.bg} tracking-wide`}>
                            {evt.ministry}
                          </span>
                          
                          {/* Quick Admin Action overlay */}
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => onEditEvent(evt)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                              title="Edit Event Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${evt.title}"?`)) {
                                  onDeleteEvent(evt.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                              title="Decommission Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                            {evt.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                            {evt.description || "No description provided for this liturgical event."}
                          </p>
                        </div>
                      </div>

                      {/* Info coordinates footer */}
                      <div className="border-t border-slate-50 mt-4 pt-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                          
                          <div className="flex items-center space-x-1.5 font-medium">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{formattedDate}</span>
                          </div>

                          <div className="flex items-center space-x-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{evt.time || "00:00"} Hours</span>
                          </div>

                          <div className="flex items-center space-x-1.5 font-medium col-span-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{evt.location || "Parish Grounds"}</span>
                          </div>

                        </div>

                        {/* Attendance Counter Pill */}
                        <div className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-100 rounded-lg p-2 mt-1">
                          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] flex items-center">
                            <Users className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                            Registered Attendance
                          </span>
                          <span className="font-mono font-bold text-slate-700">
                            {evt.attendance || 0} worshipers
                          </span>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
