"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HomeModernIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useToolAccess } from "@/lib/use-tool-access";

const TODO_KEY = "eprod-personal-dashboard-todos-v1";

type Todo = { id: string; text: string; done: boolean };

function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TODO_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as Todo[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

export default function PersonalDashboardPage() {
  const router = useRouter();
  const { ensureAccess } = useToolAccess();
  const [unlocked, setUnlocked] = useState(false);
  const [city, setCity] = useState("");
  const [weatherLine, setWeatherLine] = useState<string | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherErr, setWeatherErr] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [quote, setQuote] = useState("Focus on one meaningful task before noon.");
  const [quoteTheme, setQuoteTheme] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  const persistTodos = useCallback((next: Todo[]) => {
    setTodos(next);
    saveTodos(next);
  }, []);

  const unlock = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  const fetchWeather = async () => {
    const q = city.trim();
    if (!q) {
      setWeatherErr("Enter a city name.");
      return;
    }
    setWeatherLoading(true);
    setWeatherErr(null);
    setWeatherLine(null);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1`,
      );
      const geo = (await geoRes.json()) as {
        results?: Array<{ name: string; country?: string; latitude: number; longitude: number }>;
      };
      const hit = geo.results?.[0];
      if (!hit) {
        setWeatherErr("City not found.");
        return;
      }
      const wx = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&current=temperature_2m,weather_code&timezone=auto`,
      );
      const wxj = (await wx.json()) as {
        current?: { temperature_2m?: number; weather_code?: number };
      };
      const t = wxj.current?.temperature_2m;
      const code = wxj.current?.weather_code;
      if (t == null) {
        setWeatherErr("Weather data unavailable.");
        return;
      }
      setWeatherLine(`${hit.name}${hit.country ? `, ${hit.country}` : ""} — ${Math.round(t)}°C (code ${code ?? "—"})`);
    } catch {
      setWeatherErr("Could not load weather.");
    } finally {
      setWeatherLoading(false);
    }
  };

  const addTodo = () => {
    const t = newTodo.trim();
    if (!t) return;
    persistTodos([...todos, { id: crypto.randomUUID(), text: t, done: false }]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    persistTodos(todos.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  const removeTodo = (id: string) => {
    persistTodos(todos.filter((x) => x.id !== id));
  };

  const fetchQuote = async () => {
    if (!ensureAccess()) return;
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/focus-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: quoteTheme.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "subscription_required") {
          router.push("/pricing");
          return;
        }
        return;
      }
      if (data.text) setQuote(data.text);
    } catch {
      /* ignore */
    } finally {
      setQuoteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30">
            <HomeModernIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Personal dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Lightweight widgets: weather (Open-Meteo), local todos, and an optional AI focus line.
            </p>
          </div>
        </div>

        <Button type="button" onClick={unlock}>
          Unlock dashboard
        </Button>

        {unlocked && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-input bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground">Weather</h2>
              <Label htmlFor="city">City</Label>
              <div className="flex flex-wrap gap-2">
                <input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-10 min-w-[180px] flex-1 rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="Berlin"
                />
                <Button type="button" variant="secondary" onClick={fetchWeather} disabled={weatherLoading}>
                  {weatherLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load"}
                </Button>
              </div>
              {weatherErr && <p className="text-sm text-destructive">{weatherErr}</p>}
              {weatherLine && <p className="text-sm text-foreground">{weatherLine}</p>}
              <p className="text-xs text-muted-foreground">Data from Open-Meteo (no API key).</p>
            </div>

            <div className="space-y-3 rounded-xl border border-input bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground">Focus line</h2>
              <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm italic text-foreground">
                {quote}
              </p>
              <Label htmlFor="theme">Optional theme for AI line</Label>
              <input
                id="theme"
                value={quoteTheme}
                onChange={(e) => setQuoteTheme(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                placeholder="deep work, kindness, shipping"
              />
              <Button type="button" variant="secondary" onClick={fetchQuote} disabled={quoteLoading} className="gap-2">
                {quoteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "New AI focus line"}
              </Button>
            </div>

            <div className="space-y-3 rounded-xl border border-input bg-card p-6 md:col-span-2">
              <h2 className="text-sm font-semibold text-foreground">Todos (saved in this browser)</h2>
              <div className="flex flex-wrap gap-2">
                <input
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  className="h-10 min-w-[200px] flex-1 rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="Add a task…"
                />
                <Button type="button" variant="secondary" onClick={addTodo}>
                  Add
                </Button>
              </div>
              <ul className="space-y-2 text-sm">
                {todos.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggleTodo(t.id)}
                      className="size-4 rounded border-input"
                    />
                    <span className={t.done ? "flex-1 text-muted-foreground line-through" : "flex-1 text-foreground"}>
                      {t.text}
                    </span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeTodo(t.id)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
              {todos.length === 0 && <p className="text-xs text-muted-foreground">No todos yet.</p>}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
