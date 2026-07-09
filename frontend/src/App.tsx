import React, { useState, useEffect } from "react";
import { type ChurchEvent } from "./types";
import Dashboard from "./components/Dashboard";
import EventForm from "./components/EventForm";
import { 
  Plus, CalendarDays, RefreshCw, Layers, Sparkles, BookOpen, Clock, Phone, Mail, MapPin, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Pull environment variable from Vercel/Vite config, fallback to production Render API url
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://stanseventsystem-api.onrender.com";

export default function App() {
  // Application state controllers
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendance: 0,
    ministryCounts: {} as { [key: string]: number },
    upcomingCount: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper to trigger brief top-level notification toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Pull both events and statistics from connected backend APIs concurrently
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      const [eventsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/events/`),
        fetch(`${API_BASE_URL}/api/events/stats/`)
      ]);

      if (!eventsRes.ok) throw new Error("Failed to load cataloged events");
      if (!statsRes.ok) throw new Error("Failed to load dashboard statistics");

      const eventsData = await eventsRes.json();
      const statsData = await statsRes.json();

      setEvents(eventsData);
      setStats(statsData);

    } catch (error) {
      console.error("Networking error coordinating St. Andrew backend:", error);
      triggerToast("Error: Could not connect to the database server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // API Call: Create or Update Event
  const handleSubmitEvent = async (eventData: Omit<ChurchEvent, "id" | "createdAt"> & { id?: string }) => {
    try {
      const isEdit = !!eventData.id;
      const url = isEdit ? `${API_BASE_URL}/api/events/${eventData.id}/` : `${API_BASE_URL}/api/events/`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.message || "Submission rejected by server");
      }

      triggerToast(isEdit ? "Event successfully updated inside parish database." : "New church event registered successfully!");
      setIsFormOpen(false);
      setEditingEvent(null);
      
      // Refresh current dataset instantly
      await fetchAllData();
    } catch (err: any) {
      triggerToast(`Network Failure: ${err.message}`);
      throw err;
    }
  };

  // API Call: Delete Event
  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}/`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Unable to decommission event from server");
      }

      triggerToast("Event successfully decommissioned from church schedule.");
      await fetchAllData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to finalize deletion.");
    }
  };

  // Trigger modal helper for editing
  const handleTriggerEdit = (event: ChurchEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  // Trigger modal helper for adding new
  const handleTriggerAdd = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      
      {/* Dynamic Floating Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-5 left-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-bold border border-slate-800"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parish Top Header Navigation Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/10 hover:rotate-6 transition-all duration-300">
              <span className="font-extrabold text-lg tracking-widest font-serif">A</span>
            </div>
            
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-black tracking-tight text-slate-800 uppercase">PCEA St. Andrew's</span>
                <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-1.5 py-0.5 rounded-md uppercase font-mono tracking-wide">Parish</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Event Management & Coordinates System</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Kenya / Local East African Time display */}
            <div className="hidden md:flex flex-col items-end text-right font-mono text-xs text-slate-500">
              <span className="font-bold flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                Nairobi, EAT time
              </span>
              <span className="text-[10px] text-slate-400">PCEA St Andrew's Parish</span>
            </div>

            <button
              onClick={fetchAllData}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Refresh Parish Database Sync"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>

            <button
              id="top-add-event-btn"
              onClick={handleTriggerAdd}
              className="px-4.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>

        </div>
      </header>

      {/* Primary Workspace container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 text-xs font-bold tracking-wider uppercase animate-pulse">
              Synchronizing with PCEA Church Database...
            </p>
          </div>
        ) : (
          <Dashboard
            events={events}
            stats={stats}
            onAddEvent={handleTriggerAdd}
            onEditEvent={handleTriggerEdit}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </main>

      {/* Liturgical event design modal form */}
      <AnimatePresence>
        {isFormOpen && (
          <EventForm
            onSubmit={handleSubmitEvent}
            onClose={() => {
              setIsFormOpen(false);
              setEditingEvent(null);
            }}
            initialEvent={editingEvent}
          />
        )}
      </AnimatePresence>

      {/* Parish footer brand board */}
      <footer className="bg-slate-900 text-slate-400 font-medium py-12 border-t border-slate-800 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-slate-950 font-black">
                  A
                </div>
                <span className="font-bold text-white tracking-wide">PCEA St. Andrew's Church</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Empowering ministries through modern technology coordinates. Secure REST API connected to automatic filesystem persistence for live demonstration stability.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase">Parish Contacts</h4>
              <ul className="space-y-2 text-slate-500 text-xs">
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-slate-500" />
                  +254 (020) 272 2624
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-slate-500" />
                  info@pceastandrews.org
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                  State House Road, Nairobi, Kenya
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase">Interactive Parish Calendaring</h4>
              <p className="text-slate-500 leading-relaxed text-xs">
                To specify ministry identifiers, input the standard Hex identifier codes. The Presbyterian Church of East Africa ensures clean coordination across all active elder sessions.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} PCEA St. Andrew's Church Parish. All administrative scheduling coordinates reserved.
            </div>
            <div className="flex items-center space-x-4">
              <span>Fullstack Express + React Portal</span>
              <span>&bull;</span>
              <span>Nairobi Presbytery Secretariat</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}