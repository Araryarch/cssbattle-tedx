"use client";

import Header from "@/components/Header";
import { useUser } from "@/components/UserProvider";
import { Switch } from "@headlessui/react";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export default function SettingsPage() {
  const { user, loading } = useUser();
  const [darkGrid, setDarkGrid] = useState(true);
  const [soundFx, setSoundFx] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 space-y-10">
        <header className="flex items-center gap-3">
          <SlidersHorizontal className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">
              Battle <span className="text-primary">Settings</span>
            </h1>
            <p className="text-zinc-500 mt-1">
              Personalize how the arena feels for you.
            </p>
          </div>
        </header>

        {loading ? (
          <p className="text-zinc-500">Loading settings...</p>
        ) : !user ? (
          <p className="text-zinc-500">
            You are not logged in. Login to save your preferences.
          </p>
        ) : (
          <section className="space-y-6">
            <div className="p-6 rounded-xl border border-white/10 bg-zinc-900/40 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                Interface
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dark grid background</p>
                  <p className="text-xs text-zinc-500">
                    Use a darker grid behind preview canvas.
                  </p>
                </div>
                <Switch
                  checked={darkGrid}
                  onChange={setDarkGrid}
                  className={`${
                    darkGrid ? "bg-primary" : "bg-zinc-700"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      darkGrid ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-white/10 bg-zinc-900/40 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                Experience
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sound effects</p>
                  <p className="text-xs text-zinc-500">
                    Play subtle feedback sounds for actions.
                  </p>
                </div>
                <Switch
                  checked={soundFx}
                  onChange={setSoundFx}
                  className={`${
                    soundFx ? "bg-primary" : "bg-zinc-700"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      soundFx ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              (Note: these settings are client-side only for now and not yet
              persisted to your account.)
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

