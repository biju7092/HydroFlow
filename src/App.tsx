/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Settings, 
  History, 
  Bell, 
  Trash2, 
  ChevronRight, 
  Droplets,
  Award,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import WaveProgress from "./components/WaveProgress";
import WeeklyStats from "./components/WeeklyStats";
import { cn } from "./lib/utils";

interface WaterEntry {
  id: string;
  time: string;
  amount: number;
}

interface DayLog {
  date: string;
  amount: number;
}

export default function App() {
  const [currentIntake, setCurrentIntake] = useState(0);
  const [goal, setGoal] = useState(2500);
  const [history, setHistory] = useState<WaterEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<DayLog[]>([]);
  const [reminderInterval, setReminderInterval] = useState(60); // minutes
  const [showSettings, setShowSettings] = useState(false);
  const [newGoal, setNewGoal] = useState(goal);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Initialize data
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const savedGoal = localStorage.getItem("hydroflow_goal");
    const savedIntake = localStorage.getItem(`hydroflow_intake_${today}`);
    const savedHistory = localStorage.getItem(`hydroflow_history_${today}`);
    const savedWeekly = localStorage.getItem("hydroflow_weekly");
    const savedInterval = localStorage.getItem("hydroflow_interval");

    if (savedGoal) {
      setGoal(Number(savedGoal));
      setNewGoal(Number(savedGoal));
    }
    if (savedIntake) setCurrentIntake(Number(savedIntake));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedInterval) setReminderInterval(Number(savedInterval));
    if (savedWeekly) setWeeklyData(JSON.parse(savedWeekly));

    // Check notification permission
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  // Update weekly data when intake changes
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    localStorage.setItem(`hydroflow_intake_${today}`, currentIntake.toString());
    localStorage.setItem(`hydroflow_history_${today}`, JSON.stringify(history));

    setWeeklyData(prev => {
      const existing = prev.find(d => d.date === today);
      let updated;
      if (existing) {
        updated = prev.map(d => d.date === today ? { ...d, amount: currentIntake } : d);
      } else {
        updated = [...prev, { date: today, amount: currentIntake }].slice(-14);
      }
      localStorage.setItem("hydroflow_weekly", JSON.stringify(updated));
      return updated;
    });
  }, [currentIntake, history]);

  const addWater = (amount: number) => {
    const entry: WaterEntry = {
      id: Math.random().toString(36).substr(2, 9),
      time: format(new Date(), "HH:mm"),
      amount
    };
    setCurrentIntake(prev => prev + amount);
    setHistory(prev => [entry, ...prev]);
  };

  const removeEntry = (id: string, amount: number) => {
    setHistory(prev => prev.filter(e => e.id !== id));
    setCurrentIntake(prev => Math.max(0, prev - amount));
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
  };

  const saveSettings = () => {
    setGoal(newGoal);
    localStorage.setItem("hydroflow_goal", newGoal.toString());
    localStorage.setItem("hydroflow_interval", reminderInterval.toString());
    setShowSettings(false);
  };

  // Notification logic
  useEffect(() => {
    if (!notificationsEnabled || reminderInterval <= 0) return;

    const interval = setInterval(() => {
      new Notification("Time to Hydrate!", {
        body: "Your body needs water. Take a sip!",
        icon: "/vite.svg"
      });
    }, reminderInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [notificationsEnabled, reminderInterval]);

  return (
    <div className="min-h-screen bg-[#050B18] text-white overflow-x-hidden selection:bg-blue-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-600/10 blur-[100px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-lg mx-auto px-6 py-12 flex flex-col items-center gap-10">
        {/* Header */}
        <header className="w-full flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-blue-50">HydroFlow</h1>
            <p className="text-blue-200/50 text-xs font-semibold uppercase tracking-widest">Hydration Track</p>
          </div>
          <motion.button 
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(true)}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-colors"
          >
            <Settings className="w-5 h-5 text-blue-200" />
          </motion.button>
        </header>

        {/* Progress Circle */}
        <section className="mt-4">
          <WaveProgress 
            progress={currentIntake / goal} 
            goal={goal} 
            current={currentIntake} 
          />
        </section>

        {/* Quick Add Buttons */}
        <section className="flex gap-4 w-full justify-center">
          {[250, 500, 750].map((amount) => (
            <motion.button
              key={amount}
              whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addWater(amount)}
              className="flex-1 max-w-[100px] py-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md flex flex-col items-center gap-2 group transition-all"
            >
              <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                {amount === 250 ? <Droplets size={20} /> : amount === 500 ? <Zap size={20} /> : <Award size={20} />}
              </div>
              <span className="text-xs font-bold">{amount}ml</span>
              <Plus size={12} className="text-white/20" />
            </motion.button>
          ))}
        </section>

        {/* Stats & History */}
        <section className="w-full space-y-6">
          <WeeklyStats data={weeklyData} goal={goal} />

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                History
              </h3>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Today</span>
            </div>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {history.length === 0 ? (
                  <p className="text-center py-10 text-white/20 text-sm italic">No entries yet. Start drinking!</p>
                ) : (
                  history.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                          <Droplets size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-blue-50">{entry.amount} ml</p>
                          <p className="text-[10px] font-bold text-white/30 uppercase">{entry.time}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeEntry(entry.id, entry.amount)}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0F172A] rounded-[40px] border border-white/10 p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Settings className="text-blue-400" />
                Settings
              </h2>

              <div className="space-y-8">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-3">Daily Goal (ml)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1000" 
                      max="5000" 
                      step="100"
                      value={newGoal}
                      onChange={(e) => setNewGoal(Number(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="font-mono text-xl font-bold min-w-[70px] text-right">{newGoal}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-3">Reminder Every (min)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="180" 
                      step="15"
                      value={reminderInterval}
                      onChange={(e) => setReminderInterval(Number(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="font-mono text-xl font-bold min-w-[70px] text-right">
                      {reminderInterval === 0 ? "Off" : reminderInterval}
                    </span>
                  </div>
                </div>

                <div>
                  <button 
                    onClick={requestNotifications}
                    className={cn(
                      "w-full py-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-bold text-sm",
                      notificationsEnabled 
                        ? "bg-green-500/10 border-green-500/30 text-green-400" 
                        : "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                    )}
                  >
                    <Bell size={18} />
                    {notificationsEnabled ? "Notifications Active" : "Enable Notifications"}
                  </button>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveSettings}
                    className="flex-1 py-4 rounded-2xl bg-blue-600 font-bold text-sm hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

