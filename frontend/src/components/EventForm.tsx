import React, { useState, useEffect } from "react";
import { type ChurchEvent } from "../types";
import { 
  X, CalendarDays, MapPin, Clock, Users, BookOpen, Layers, Info 
} from "lucide-react";
import { motion } from "motion/react";

interface EventFormProps {
  onSubmit: (eventData: Omit<ChurchEvent, "id" | "createdAt"> & { id?: string }) => Promise<void>;
  onClose: () => void;
  initialEvent: ChurchEvent | null;
}

const PRESET_MINISTRIES = [
  "Main Service",
  "Youth Fellowship",
  "Womens Guild",
  "Mens Fellowship",
  "Church School",
  "Choir",
  "Missions & Evangelism"
];

export default function EventForm({ onSubmit, onClose, initialEvent }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [ministry, setMinistry] = useState("Main Service");
  const [attendance, setAttendance] = useState<number>(100);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDescription(initialEvent.description || "");
      setDate(initialEvent.date);
      setTime(initialEvent.time || "09:00");
      setLocation(initialEvent.location || "");
      setMinistry(initialEvent.ministry || "Main Service");
      setAttendance(initialEvent.attendance || 0);
    } else {
      // Default date to today's date formatted
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
    }
  }, [initialEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please provide a valid event title.");
      return;
    }
    if (!date) {
      setErrorMsg("Please specify a valid scheduling date.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const eventPayload = {
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        location: location.trim() || "Main Sanctuary",
        ministry,
        attendance: Number(attendance) || 0,
        ...(initialEvent?.id ? { id: initialEvent.id } : {})
      };

      await onSubmit(eventPayload);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit event details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-slate-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-850">
          <div>
            <h3 className="text-sm font-bold font-serif tracking-tight">
              {initialEvent ? "Edit Liturgical Event Coordinates" : "Register New Liturgical Event"}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-0.5">
              PCEA St. Andrew's Parish Database
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center space-x-2 font-bold">
              <span>⚠️</span>
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
              Event Title / Service Name
            </label>
            <input
              type="text"
              placeholder="e.g. Woman's Guild Mid-Week Prayer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium placeholder-slate-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
              Liturgical Description & Notes
            </label>
            <textarea
              placeholder="Provide agenda, themes, special guests or scriptures..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium placeholder-slate-400 resize-none"
            />
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center">
                <CalendarDays className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Scheduled Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
              />
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Starting Hours (EAT)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
              />
            </div>

            {/* Ministry Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Assigned Ministry
              </label>
              <select
                value={ministry}
                onChange={(e) => setMinistry(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium text-slate-700 bg-white"
              >
                {PRESET_MINISTRIES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Target Attendance */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center">
                <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Attendance Counter
              </label>
              <input
                type="number"
                min={0}
                placeholder="Expected attendance count..."
                value={attendance}
                onChange={(e) => setAttendance(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
              />
            </div>

          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Event Coordinates / Venue Location
            </label>
            <input
              type="text"
              placeholder="e.g. Main Sanctuary, Youth Hall, online, etc."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium placeholder-slate-400"
            />
          </div>

          {/* Quick Informational Notice */}
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-start space-x-2">
            <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-slate-500 leading-normal font-medium">
              Registered events are immediately written to the PCEA server-side filesystem coordinate databank (`events.json`) to persist state across reboots.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center space-x-2"
            >
              <span>{isSubmitting ? "Submitting..." : initialEvent ? "Save Coordinates" : "Register Event"}</span>
            </button>
          </div>

        </form>

      </motion.div>
      
    </div>
  );
}
