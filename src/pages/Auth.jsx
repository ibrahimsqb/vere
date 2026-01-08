import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    setLoading(true);
    setError("");

    const { error } = isSignUp ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <h1 className="text-4xl font-serif font-light text-black text-center mb-2 tracking-wide">VÉRÉ</h1>
        <p className="text-center text-sm text-gray-500 mb-12">A personal fragrance journal</p>

        {/* Error */}
        {error && <p className="text-sm text-red-500 mb-6 text-center">{error}</p>}

        {/* Email */}
        <div className="mb-8">
          <label className="block text-xs text-gray-500 mb-3 tracking-widest uppercase">Email</label>
          <input type="email" className="w-full border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-black transition text-sm placeholder:text-gray-300" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
        </div>

        {/* Password */}
        <div className="mb-10">
          <label className="block text-xs text-gray-500 mb-3 tracking-widest uppercase">Password</label>
          <input type="password" className="w-full border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-black transition text-sm placeholder:text-gray-300" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {/* Button */}
        <button onClick={handleAuth} disabled={loading} className="w-full bg-black text-white py-4 text-sm font-light tracking-wide hover:opacity-80 transition disabled:opacity-50">
          {loading ? "PLEASE WAIT..." : isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
        </button>

        {/* Toggle */}
        <p className="text-center text-sm text-gray-500 mt-8">
          {isSignUp ? "Already have an account?" : "New to VÉRÉ?"}
          <button onClick={() => setIsSignUp(!isSignUp)} className="ml-2 text-black hover:text-gray-600 text-xs tracking-wide">
            {isSignUp ? "SIGN IN" : "CREATE ONE"}
          </button>
        </p>
      </div>
    </div>
  );
}
