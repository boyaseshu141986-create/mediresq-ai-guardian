import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAssistant } from "@/lib/ai-service";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — MediResQ AI" },
      {
        name: "description",
        content:
          "Ask the MediResQ Assistant about shortage risk, expiring batches, surplus stock, reorder quantities and transfers.",
      },
      { property: "og:title", content: "AI Assistant — MediResQ AI" },
      {
        property: "og:description",
        content: "Chat with the MediResQ Assistant about your hospital supply chain.",
      },
    ],
  }),
  component: AssistantPage,
});

type Msg = { role: "user" | "bot"; text: string };

const suggestions = [
  "Which medicines are at high shortage risk?",
  "Which medicines expire soon?",
  "Which hospital has excess insulin?",
  "How much stock should we reorder?",
  "Show critical alerts.",
  "What transfers do you recommend?",
];

function AssistantPage() {
  const { items } = useStore();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hello — I'm the MediResQ Assistant. I can answer questions about stock levels, shortage risk, expiry, surplus across hospitals, reorders and transfers. I don't provide clinical or diagnostic advice.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: askAssistant(text, items) }]);
      setTyping(false);
    }, 650);
  };

  return (
    <AppShell title="MediResQ Assistant" subtitle="Ask questions about your supply chain data">
      <div className="surface-card flex h-[calc(100vh-13rem)] min-h-[520px] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                  m.role === "user" ? "bg-muted" : "brand-gradient text-primary-foreground"
                }`}
              >
                {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
              </span>
              <div
                className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-muted/50"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <span className="brand-gradient flex size-8 items-center justify-center rounded-xl text-primary-foreground">
                <Bot className="size-4" />
              </span>
              <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted/50 px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${d * 0.12}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border p-3 sm:p-4">
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about stock, risk, expiry or transfers…"
            />
            <Button type="submit" size="icon" aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
