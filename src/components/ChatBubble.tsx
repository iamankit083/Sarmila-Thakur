import ReactMarkdown from "react-markdown";
import type { Msg } from "@/lib/chat-stream";
import { User, Bot } from "lucide-react";

export function ChatBubble({ message }: { message: Msg }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-user-bubble" : "bg-assistant-bubble"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-user-bubble-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-assistant-bubble-foreground" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-user-bubble text-user-bubble-foreground"
            : "bg-assistant-bubble text-assistant-bubble-foreground"
        }`}
      >
        {isUser ? (
          <p className="text-[0.9375rem] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="chat-prose">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
