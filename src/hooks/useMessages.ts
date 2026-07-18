import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Msg } from "@/lib/chat-stream";

export interface DbMessage {
  id: string;
  role: string;
  content: string;
  conversation_id: string;
  created_at: string;
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!conversationId) { setMessages([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages(
      (data ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))
    );
    setLoading(false);
  }, [conversationId]);

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!conversationId) return;
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role,
      content,
    });
  };

  const addLocal = (msg: Msg) => setMessages((prev) => [...prev, msg]);

  const updateLastAssistant = (content: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant") {
        return prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content } : m
        );
      }
      return [...prev, { role: "assistant" as const, content }];
    });
  };

  const clear = () => setMessages([]);

  return { messages, loading, load, saveMessage, addLocal, updateLastAssistant, clear };
}
