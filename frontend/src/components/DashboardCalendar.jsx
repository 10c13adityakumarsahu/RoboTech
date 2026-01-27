import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, AlertCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function DashboardCalendar() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);

    useEffect(() => {
        // Fetch all events for now (assuming reasonable dataset size)
        // Ideally we filter by month range in the backend
        api.get("/events/")
            .then(res => {
                const list = res.data.results || res.data || [];
                setEvents(list);
            })
            .catch(err => console.error("Failed to load calendar events", err));
    }, []);

    /* ================= CALENDAR LOGIC ================= */
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Fill calendar grid
    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    /* ================= RENDER HELPERS ================= */
    const getEventsForDay = (date) => {
        if (!date) return [];
        return events.filter(e => {
            if (!e.event_date) return false;
            const eDate = new Date(e.event_date);
            return eDate.getDate() === date.getDate() &&
                eDate.getMonth() === date.getMonth() &&
                eDate.getFullYear() === date.getFullYear();
        });
    };

    const getDueForDay = (date) => {
        if (!date) return [];
        return events.filter(e => {
            if (!e.due_date) return false;
            const dDate = new Date(e.due_date);
            return dDate.getDate() === date.getDate() &&
                dDate.getMonth() === date.getMonth() &&
                dDate.getFullYear() === date.getFullYear();
        });
    };

    const MONTH_NAMES = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handleAddEvent = (date) => {
        // Format date as YYYY-MM-DDThh:mm for datetime-local input
        // Using local time manually to avoid timezone shifts
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
        navigate(`/portal/events/new?date=${encodeURIComponent(localISOTime)}`);
    }

    return (
        <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6 shadow-xl h-full flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {MONTH_NAMES[month]} <span className="text-gray-500">{year}</span>
                </h2>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={goToToday} className="px-3 py-1 text-xs font-bold text-gray-400 hover:text-white transition uppercase">
                        Today
                    </button>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* DAYS HEADER */}
            <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider py-2">
                        {d}
                    </div>
                ))}
            </div>

            {/* GRID */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-2">
                {days.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} className="bg-transparent" />;

                    const dayEvents = getEventsForDay(date);
                    const dueEvents = getDueForDay(date);
                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                        <div
                            key={date.toISOString()}
                            className={`
                            relative group p-2 rounded-xl min-h-[80px] sm:min-h-[100px] border transition-all
                            flex flex-col gap-1
                            ${isToday
                                    ? 'bg-indigo-500/10 border-indigo-500/50'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                                }
                        `}
                            onClick={() => handleAddEvent(date)}
                        >
                            {/* Day Number */}
                            <div className="flex justify-between items-start">
                                <span className={`text-sm font-medium ${isToday ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'}`}>
                                    {date.getDate()}
                                </span>

                                {/* Quick Add Button (Visible on Hover) */}
                                <button
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/20 rounded text-cyan-400"
                                    title="Add Event"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            {/* Events Dots/List */}
                            <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                                {dayEvents.map(ev => (
                                    <div key={ev.id}
                                        onClick={(e) => { e.stopPropagation(); navigate(`/portal/events/${ev.id}`); }}
                                        className="flex items-center gap-1 text-[10px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/20 truncate cursor-pointer hover:bg-cyan-500/20"
                                        title={ev.title}
                                    >
                                        <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
                                        <span className="truncate">{ev.title}</span>
                                    </div>
                                ))}
                                {dueEvents.map(ev => (
                                    <div key={`due-${ev.id}`}
                                        onClick={(e) => { e.stopPropagation(); navigate(`/portal/events/${ev.id}`); }}
                                        className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-300 px-1.5 py-0.5 rounded border border-red-500/20 truncate cursor-pointer hover:bg-red-500/20"
                                        title={`Due: ${ev.title}`}
                                    >
                                        <Clock size={8} className="shrink-0" />
                                        <span className="truncate">Due: {ev.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
