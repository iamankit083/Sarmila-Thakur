export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-assistant-bubble">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-assistant-bubble-foreground/60 animate-bounce [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-assistant-bubble-foreground/60 animate-bounce [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-assistant-bubble-foreground/60 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
      <div className="rounded-2xl bg-assistant-bubble px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-assistant-bubble-foreground/40 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-assistant-bubble-foreground/40 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-assistant-bubble-foreground/40 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
