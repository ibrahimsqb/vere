import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AddLog from "./AddLog";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [todayLogs, setTodayLogs] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [expandedLog, setExpandedLog] = useState(null);

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchLogs();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  async function fetchLogs() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Today's logs (all of them)
    const { data: todayDataArray, error: todayError } = await supabase.from("wear_logs").select("id, fragrance_id, date, time_of_day, mood, occasion, weather, rating, notes, fragrances(name, brand)").eq("user_id", user.id).eq("date", today).order("created_at", { ascending: false });

    if (todayError) {
      console.error("Error fetching today's logs:", todayError);
    }

    if (todayDataArray) {
      const formatted = todayDataArray.map((log) => ({
        ...log,
        fragrance_name: `${log.fragrances.brand} — ${log.fragrances.name}`,
      }));
      setTodayLogs(formatted);
    } else {
      setTodayLogs([]);
    }

    // Recent logs (past 7 days, excluding today)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    const sevenDaysAgo = pastDate.toISOString().split("T")[0];

    const { data: recentData, error: recentError } = await supabase.from("wear_logs").select("id, fragrance_id, date, time_of_day, mood, rating, fragrances(name, brand)").eq("user_id", user.id).lt("date", today).gte("date", sevenDaysAgo).order("date", { ascending: false });

    if (recentError) {
      console.error("Error fetching recent logs:", recentError);
    }

    if (recentData) {
      const formattedRecent = recentData.map((log) => ({
        ...log,
        fragrance_name: `${log.fragrances.brand} — ${log.fragrances.name}`,
      }));
      setRecentLogs(formattedRecent);
    } else {
      setRecentLogs([]);
    }
  }

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Brand */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-serif font-light text-black tracking-wide">VÉRÉ</h1>
          <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-black transition tracking-wide">
            SIGN OUT
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-12">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>

        <button onClick={() => navigate("/add-fragrance")} className="text-xs font-light text-gray-700 hover:text-black transition mb-12 tracking-wide">
          + ADD FRAGRANCE
        </button>

        {/* Today */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-light text-gray-500 tracking-widest uppercase">Today</h2>
            <button onClick={() => navigate("/add-log")} className="text-xs text-black hover:text-gray-600 transition tracking-wide font-light">
              + ADD LOG
            </button>
          </div>

          {todayLogs.length > 0 ? (
            <div className="space-y-0">
              {todayLogs.map((log) => (
                <div key={log.id} className="border-b border-gray-200 py-5 last:border-b-0">
                  <button onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} className="w-full text-left hover:text-gray-600 transition group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-lg font-serif font-light text-black group-hover:text-gray-700 transition">{log.fragrance_name}</p>
                        <p className="text-xs text-gray-400 mt-1">{log.time_of_day}</p>
                      </div>
                      <span className="text-xs text-gray-300 ml-4">{expandedLog === log.id ? "−" : "+"}</span>
                    </div>
                  </button>

                  {expandedLog === log.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      {log.mood && (
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500 uppercase tracking-widest">Mood</span>
                          <span className="text-sm text-black">{log.mood}</span>
                        </div>
                      )}
                      {log.occasion && (
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500 uppercase tracking-widest">Occasion</span>
                          <span className="text-sm text-black">{log.occasion}</span>
                        </div>
                      )}
                      {log.weather && (
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500 uppercase tracking-widest">Weather</span>
                          <span className="text-sm text-black">{log.weather}</span>
                        </div>
                      )}
                      {log.rating && (
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500 uppercase tracking-widest">Rating</span>
                          <span className="text-sm text-black">{log.rating}/5</span>
                        </div>
                      )}
                      {log.notes && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Notes</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{log.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="border-b border-gray-200 pb-6 py-6 text-center">
              <p className="text-sm text-gray-400 mb-4">No fragrance logged today</p>
              <button onClick={() => navigate("/add-log")} className="text-xs font-light text-black hover:text-gray-600 transition tracking-wide">
                START LOGGING →
              </button>
            </div>
          )}
        </section>

        {/* Recent */}
        {recentLogs.length > 0 && (
          <section>
            <h2 className="text-xs font-light text-gray-500 mb-6 tracking-widest uppercase">Last 7 Days</h2>

            <div className="space-y-0">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-center border-b border-gray-200 py-4 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-serif text-black text-base font-light">{log.fragrance_name}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(log.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-xs text-gray-400">{log.time_of_day}</span>
                      {log.rating && <span className="text-xs text-gray-400">★ {log.rating}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
