"use client";
import { useEffect } from "react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase/client";

// Counts one visit per browser session for the admin dashboard.
export default function VisitTracker() {
  useEffect(() => {
    if (!hasSupabaseConfig) return;
    try {
      if (sessionStorage.getItem("4everr:visit")) return;
      sessionStorage.setItem("4everr:visit", "1");
      supabase().rpc("track_visit").then(() => {});
    } catch {}
  }, []);
  return null;
}
