import type { Conversation } from "@/hooks/useConversations";
import {
  MessageSquarePlus,
  Trash2,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onSignOut: () => void;
  onClose?: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
  userEmail?: string;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onSignOut,
  onClose,
  darkMode,
  onToggleDark,
  userEmail,
}: ChatSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-sidebar-primary" />
          <span className="font-semibold text-sm">ChatBot</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNew}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            title="New chat"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
        {conversations.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No conversations yet
          </p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
              c.id === activeId
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
            }`}
            onClick={() => onSelect(c.id)}
          >
            <span className="flex-1 truncate">{c.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleDark}
            className="text-xs text-sidebar-foreground hover:bg-sidebar-accent gap-2"
          >
            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {darkMode ? "Light mode" : "Dark mode"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSignOut}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        {userEmail && (
          <p className="truncate text-xs text-muted-foreground px-2">{userEmail}</p>
        )}
      </div>
    </div>
  );
}
