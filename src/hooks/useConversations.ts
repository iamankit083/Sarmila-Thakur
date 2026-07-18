import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    setConversations(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: userId })
      .select()
      .single();
    if (error) throw error;
    setConversations((prev) => [data, ...prev]);
    return data;
  };

  const updateTitle = async (id: string, title: string) => {
    await supabase.from("conversations").update({ title }).eq("id", id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  };

  const remove = async (id: string) => {
    await supabase.from("conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  return { conversations, loading, create, updateTitle, remove, reload: load };
}
