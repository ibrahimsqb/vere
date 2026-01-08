import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AddFragrance() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    brand: "",
    type: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("fragrances").insert([
      {
        user_id: user.id,
        name: form.name,
        brand: form.brand,
        type: form.type,
        notes: form.notes,
      },
    ]);

    setLoading(false);

    if (!error) {
      setSaved(true);
      setTimeout(() => navigate("/"), 1500);
    } else alert(error.message);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {saved ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-6">
              <svg className="w-16 h-16 text-black mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-light text-black mb-2">Fragrance Added</h2>
            <p className="text-sm text-gray-500 text-center">Redirecting...</p>
          </div>
        ) : (
          <div className="py-12">
            <button onClick={() => navigate(-1)} className="text-xs text-gray-400 mb-8 hover:text-gray-600 transition tracking-wide">
              ← BACK
            </button>
            <h1 className="text-3xl font-serif font-light text-black mb-12 text-center">Add Fragrance</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-xs text-gray-500 mb-3 tracking-widest uppercase">Fragrance Name</label>
                <input name="name" required onChange={handleChange} className="w-full border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-black transition text-sm placeholder:text-gray-300" placeholder="Aventus" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-3 tracking-widest uppercase">Brand</label>
                <input name="brand" required onChange={handleChange} className="w-full border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-black transition text-sm placeholder:text-gray-300" placeholder="Creed" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-3 tracking-widest uppercase">Type</label>
                <select name="type" onChange={handleChange} className="w-full border-b border-gray-300 px-0 py-3 bg-white focus:outline-none focus:border-black transition text-sm">
                  <option value="">Select</option>
                  <option>EDP</option>
                  <option>EDT</option>
                  <option>Parfum</option>
                  <option>Cologne</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-3 tracking-widest uppercase">Notes (Optional)</label>
                <textarea name="notes" onChange={handleChange} rows="3" className="w-full border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-black transition text-sm placeholder:text-gray-300 resize-none" placeholder="Bergamot, pineapple, oakmoss…" />
              </div>

              <button disabled={loading} className="w-full bg-black text-white py-4 text-sm font-light tracking-wide hover:opacity-80 transition disabled:opacity-50 mt-10">
                {loading ? "SAVING..." : "SAVE FRAGRANCE"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
