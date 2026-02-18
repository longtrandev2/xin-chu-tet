"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured, type Wish } from "@/utils/supabase";

export function useWishes() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishes = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("wishes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setWishes(data || []);
    } catch (err) {
      console.error("Error fetching wishes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Realtime subscription
  useEffect(() => {
    fetchWishes();

    if (!supabase || !isSupabaseConfigured) return;

    const channel = supabase
      .channel("wishes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wishes" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setWishes((prev) => [payload.new as Wish, ...prev].slice(0, 50));
          } else if (payload.eventType === "UPDATE") {
            setWishes((prev) =>
              prev.map((w) =>
                w.id === (payload.new as Wish).id ? (payload.new as Wish) : w
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [fetchWishes]);

  const addWish = async (wish: {
    name: string;
    wish_text: string;
    word: string;
    poem?: string;
    pos_x: number;
    pos_y: number;
  }) => {
    if (!supabase || !isSupabaseConfigured) {
      console.warn("Supabase chưa được cấu hình. Vui lòng thêm env vars.");
      return null;
    }
    const { data, error } = await supabase
      .from("wishes")
      .insert([{ ...wish, poem: wish.poem || "", likes: 0 }])
      .select()
      .single();

    if (error) throw error;
    return data as Wish;
  };

  const likeWish = async (wishId: string, currentLikes: number) => {
    if (!supabase || !isSupabaseConfigured) return;
    const { error } = await supabase
      .from("wishes")
      .update({ likes: currentLikes + 1 })
      .eq("id", wishId);

    if (error) throw error;
  };

  return { wishes, loading, addWish, likeWish, refetch: fetchWishes };
}
