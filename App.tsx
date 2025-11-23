import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TaskCard from './components/TaskCard';
import Stats from './components/Stats';
import { TASKS } from './constants';
import { TaskMap, ChartDataPoint } from './types';
import { fetchDayLog, saveDayLog, fetchHistory, getPointsFromTasks } from './services/api';
import { getLocalDate } from './services/utils';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  // Use local utility for date to avoid timezone bugs
  const [currentDate, setCurrentDate] = useState<string>(getLocalDate);
  const [tasks, setTasks] = useState<TaskMap>({});
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentPoints = getPointsFromTasks(tasks);

  // Group tasks for rendering
  const morningTasks = TASKS.filter(t => t.period === 'Morning');
  const afternoonTasks = TASKS.filter(t => t.period === 'Afternoon');
  const nightTasks = TASKS.filter(t => t.period === 'Night');

  // Load data for selected date
  const loadData = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      const dayData = await fetchDayLog(date);
      setTasks(dayData.tasks);
      
      const historyData = await fetchHistory();
      setHistory(historyData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Load & Date Change
  useEffect(() => {
    loadData(currentDate);
  }, [currentDate, loadData]);

  // Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('daily_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_logs',
        },
        (payload) => {
          // If the change affects the current date being viewed
          if (payload.new && (payload.new as any).date === currentDate) {
             setTasks((payload.new as any).tasks);
          }
          // Refresh history regardless, as a past/future date might have changed affecting the chart
          fetchHistory().then(setHistory);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDate]);

  // Handle Task Toggle
  const handleToggleTask = async (taskId: string) => {
    // Optimistic Update
    const newTasks = {
      ...tasks,
      [taskId]: !tasks[taskId]
    };
    setTasks(newTasks);

    // Persist
    try {
      await saveDayLog(currentDate, newTasks);
    } catch (error) {
      // Revert on error
      console.error("Failed to save", error);
      setTasks(tasks); 
    }
  };

  const RULES = [
    "Horário pra acordar 4:30 TODOS OS DIAS",
    "Não desperdiçar tempo",
    "Fazer dinheiro",
    "SERVIR",
    "OUSADIA MÁXIMA",
    "Subir o grau de PNL e anti frágil TODOS OS DIAS",
    "Confie em Deus"
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-16 font-sans selection:bg-indigo-500/30">
      <Header 
        currentDate={currentDate} 
        onDateChange={setCurrentDate} 
      />

      <main className="max-w-6xl mx-auto px-4 pt-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
        
        {/* Seção de Regras Inegociáveis */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/30 to-slate-900/80 border border-rose-500/20 p-6 shadow-2xl backdrop-blur-md">
          {/* Efeito de brilho de fundo */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <h2 className="relative flex items-center justify-center gap-4 text-xl md:text-2xl font-black text-rose-100 tracking-[0.2em] uppercase mb-8 text-center drop-shadow-sm">
            <span className="hidden md:block w-12 h-[1px] bg-gradient-to-r from-transparent to-rose-500/50"></span>
            Regras Inegociáveis
            <span className="hidden md:block w-12 h-[1px] bg-gradient-to-l from-transparent to-rose-500/50"></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 max-w-5xl mx-auto">
            {RULES.map((rule, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <span className="font-mono text-rose-500 font-bold text-lg leading-tight opacity-80 group-hover:opacity-100 transition-opacity">
                  {String(index + 1).padStart(2, '0')}.
                </span>
                <p className="text-sm md:text-base font-bold text-slate-300 uppercase tracking-wide leading-tight group-hover:text-white transition-colors">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[30vh]">
            <div className="relative">
              <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-200"></div>
              <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-indigo-500 border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <TaskCard 
                period="Morning" 
                tasks={morningTasks} 
                statusMap={tasks} 
                onToggle={handleToggleTask} 
              />
              <TaskCard 
                period="Afternoon" 
                tasks={afternoonTasks} 
                statusMap={tasks} 
                onToggle={handleToggleTask} 
              />
              <TaskCard 
                period="Night" 
                tasks={nightTasks} 
                statusMap={tasks} 
                onToggle={handleToggleTask} 
              />
            </div>

            <Stats currentPoints={currentPoints} history={history} />
          </>
        )}
      </main>
    </div>
  );
};

export default App;