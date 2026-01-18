import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import AddLog from "./pages/AddLog";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddFragrance from "./pages/FragranceForm";
import MyFragrances from "./pages/MyFragrances";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-log" element={<AddLog />} />
        <Route path="/add-fragrance" element={<AddFragrance />} />
        <Route path="/my-fragrances" element={<MyFragrances />} />
        <Route path="/edit-fragrance/:id" element={<AddFragrance />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
