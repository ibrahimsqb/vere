import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyFragrances = () => {
  const [fragrances, setFragrances] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFragrances();
  }, []);

  async function fetchFragrances() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFragrances([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.from("fragrances").select("*").is("deleted_at", null).eq("user_id", user.id).order("created_at", { ascending: false });

    if (!error && data) setFragrances(data);
    setLoading(false);
  }

  const handleFragranceDelete = async (fragranceId) => {
    const confirmed = window.confirm("Remove this Fragrance?");
    if (!confirmed) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("fragrances").update({ deleted_at: new Date().toISOString() }).eq("id", fragranceId).eq("user_id", user.id);

    if (error) {
      console.log("Failed to delete fragrance:", error.message);
      return;
    }

    // setFragrances((prev) => prev.filter((fragrance) => fragrance.id !== fragranceId));
    await fetchFragrances();
  };

  const handleFragranceUpdate = async (fragranceId) => {
    navigate(`/edit-fragrance/${fragranceId}`);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white px-6 py-16 flex items-center justify-center">
        <p className="text-sm text-gray-400 tracking-wide">Loading your collection…</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="text-xs text-gray-400 hover:text-gray-600 transition tracking-wide">
            ← BACK
          </button>
          <button onClick={() => navigate("/add-fragrance")} className="text-xs font-light text-gray-700 hover:text-black transition tracking-wide">
            + ADD FRAGRANCE
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-light text-black tracking-wide">My Fragrances</h1>
          <p className="text-sm text-gray-500 mt-3">Your personal wardrobe of scents.</p>
        </div>

        {fragrances.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-2xl px-8 py-16 text-center">
            <p className="text-sm text-gray-400 mb-6">No fragrances yet. Start building your collection.</p>
            <button onClick={() => navigate("/add-fragrance")} className="text-xs font-light text-black hover:text-gray-600 transition tracking-wide">
              ADD YOUR FIRST FRAGRANCE →
            </button>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-widest font-semibold">Name</th>
                    <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-widest font-semibold">Brand</th>
                    <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-widest font-semibold">Type</th>
                    <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-widest font-semibold">Notes</th>
                    <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-widest font-semibold">Added</th>
                    <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-widest font-semibold text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {fragrances.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-5 text-sm text-black font-serif font-light">{f.name}</td>
                      <td className="px-6 py-5 text-sm text-gray-700">{f.brand}</td>
                      <td className="px-6 py-5 text-sm text-gray-700">{f.type}</td>
                      <td className="px-6 py-5 text-sm text-gray-500 max-w-xs truncate">{f.notes || "—"}</td>
                      <td className="px-6 py-5 text-sm text-gray-500">{new Date(f.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td className="px-6 py-5 text-sm text-right space-x-3">
                        <button onClick={() => handleFragranceUpdate(f.id)} className="text-xs text-gray-500 hover:text-black transition tracking-wide">
                          Edit
                        </button>
                        <button onClick={() => handleFragranceDelete(f.id)} className="text-xs text-gray-400 hover:text-red-500 transition tracking-wide">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFragrances;
