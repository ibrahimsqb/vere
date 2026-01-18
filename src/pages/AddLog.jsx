import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AddLog() {
  const navigate = useNavigate();
  const [fragrances, setFragrances] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    fragrance_id: "",
    date: new Date().toISOString().split("T")[0],
    time_of_day: "Morning",
    mood: "",
    occasion: "",
    weather: "",
    rating: 3,
    notes: "",
  });

  useEffect(() => {
    fetchFragrances();
  }, []);

  async function fetchFragrances() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
        
    if (!user) {
      setFragrances([])
      return;
    }
    
    const {data, error} = await supabase
      .from("fragrances")
      .select("id, name, brand, notes")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if(!error && data) setFragrances(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("wear_logs").insert([
      {
        user_id: user.id,
        ...form,
      },
    ]);

    if (!error) {
      setSaved(true);
      // Reset form for another entry
      setForm({
        fragrance_id: "",
        date: new Date().toISOString().split("T")[0],
        time_of_day: "Morning",
        mood: "",
        occasion: "",
        weather: "",
        rating: 3,
        notes: "",
      });
      setExpanded(false);

      // Redirect after a moment
      setTimeout(() => navigate("/"), 1500);
    }
  }

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-gray-400 mb-8 hover:text-gray-600 transition tracking-wide"
        >
          ← BACK
        </button>

        {saved ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-black mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-light text-black mb-2">
              Log Saved
            </h2>
            <p className="text-sm text-gray-500 text-center">Redirecting...</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-serif font-light mb-10 text-black">
              Add Log
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Fragrance */}
              <div>
                <label className="text-xs text-gray-500 mb-3 block tracking-widest uppercase">
                  Fragrance
                </label>
                <select
                  required
                  className="w-full border-b border-gray-300 px-0 py-3 bg-white focus:outline-none focus:border-black transition text-sm"
                  value={form.fragrance_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;

                    // Find the selected fragrance object and preload its notes
                    const selectedFragrance = fragrances.find(
                      (f) => String(f.id) === selectedId
                    );

                    setForm((prev) => ({
                      ...prev,
                      fragrance_id: selectedId,
                      notes: selectedFragrance?.notes || "",
                    }));
                  }}
                >
                  <option value="">Select fragrance</option>
                  {fragrances.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.brand} — {f.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => navigate("/add-fragrance")}
                  className="text-xs text-gray-500 hover:text-black transition mt-3 tracking-wide"
                >
                  + ADD NEW FRAGRANCE
                </button>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs text-gray-500 mb-3 block tracking-widest uppercase">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-black transition"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              {/* Time of Day */}
              <div>
                <label className="text-xs text-gray-500 mb-4 block tracking-widest uppercase">
                  Time of Day
                </label>
                <div className="flex gap-4">
                  {["Morning", "Afternoon", "Evening"].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setForm({ ...form, time_of_day: t })}
                      className={`flex-1 py-3 border-b text-xs font-light transition ${
                        form.time_of_day === t
                          ? "border-black text-black"
                          : "border-gray-300 text-gray-500 hover:text-black"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional */}
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-gray-500 hover:text-black transition tracking-wide"
              >
                {expanded ? "HIDE DETAILS" : "ADD DETAILS"}
              </button>

              {expanded && (
                <div className="space-y-6 pt-4 border-t border-gray-200">
                  <input
                    placeholder="Mood"
                    className="w-full border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-black transition text-sm placeholder:text-gray-300"
                    onChange={(e) => setForm({ ...form, mood: e.target.value })}
                  />
                  <input
                    placeholder="Occasion"
                    className="w-full border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-black transition text-sm placeholder:text-gray-300"
                    onChange={(e) =>
                      setForm({ ...form, occasion: e.target.value })
                    }
                  />
                  <input
                    placeholder="Weather"
                    className="w-full border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-black transition text-sm placeholder:text-gray-300"
                    onChange={(e) =>
                      setForm({ ...form, weather: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Rating (1–5)"
                    className="w-full border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-black transition text-sm placeholder:text-gray-300"
                    onChange={(e) =>
                      setForm({ ...form, rating: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Notes"
                    rows="3"
                    className="w-full border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-black transition text-sm placeholder:text-gray-300 resize-none"
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-black text-white py-4 mt-10 text-sm font-light tracking-wide hover:opacity-80 transition"
              >
                SAVE LOG
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
