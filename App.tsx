import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TaskCard from './components/TaskCard';
import Stats from './components/Stats';
import { TASKS } from './constants';
import { TaskMap, ChartDataPoint, Dream } from './types';
import { fetchDayLog, saveDayLog, fetchHistory, getPointsFromTasks } from './services/api';
import { getLocalDate } from './services/utils';
import { supabase } from './services/supabase';
import { X, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const PROJECT_URL = 'https://oaflhpwhrdaaqjvmdvyl.supabase.co';
const STORAGE_PATH = `${PROJECT_URL}/storage/v1/object/public/dream-assets`;

// Default dreams mapping directly to the files uploaded by the user in Supabase Storage
const DEFAULT_DREAMS: Dream[] = [
  {
    id: 'd1',
    image_url: `${STORAGE_PATH}/dream-imperio.jpg`,
    label: "Construir um Império",
    is_default: true
  },
  {
    id: 'd2',
    image_url: `${STORAGE_PATH}/dream-milhao.jpg`,
    label: "Primeiro Milhão",
    is_default: true
  },
  {
    id: 'd3',
    image_url: `${STORAGE_PATH}/dream-familia.jpg`,
    label: "Minha Família",
    is_default: true
  },
  {
    id: 'd4',
    image_url: `${STORAGE_PATH}/dream-amigos.jpg`,
    label: "Amigos Leais",
    is_default: true
  },
  {
    id: 'd5',
    image_url: `${STORAGE_PATH}/dream-nomade.jpg`,
    label: "Liberdade Geográfica",
    is_default: true
  },
  {
    id: 'd6',
    image_url: `${STORAGE_PATH}/dream-ousadia.jpg`,
    label: "Ousadia Máxima",
    is_default: true
  },
  {
    id: 'd7',
    image_url: `${STORAGE_PATH}/dream-perigoso.jpg`,
    label: "Ser Perigoso",
    is_default: true
  },
  {
    id: 'd8',
    image_url: `${STORAGE_PATH}/dream-seguidores.jpg`,
    label: "Influência",
    is_default: true
  }
];

const App: React.FC = () => {
  // Use local utility for date to avoid timezone bugs
  const [currentDate, setCurrentDate] = useState<string>(getLocalDate);
  const [tasks, setTasks] = useState<TaskMap>({});
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dreams State - Fixed to defaults only
  const [dreams] = useState<Dream[]>(DEFAULT_DREAMS);
  const [showDreams, setShowDreams] = useState(false);
  const [currentDreamIndex, setCurrentDreamIndex] = useState(0);
  
  const currentPoints = getPointsFromTasks(tasks);

  const morningTasks = TASKS.filter(t => t.period === 'Morning');
  const afternoonTasks = TASKS.filter(t => t.period === 'Afternoon');
  const nightTasks = TASKS.filter(t => t.period === 'Night');

  // Load Data
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

  useEffect(() => {
    loadData(currentDate);
  }, [currentDate, loadData]);

  // Preload images mechanism
  useEffect(() => {
    if (dreams.length > 0) {
      dreams.forEach((dream) => {
        const img = new Image();
        img.src = dream.image_url;
      });
    }
  }, [dreams]);

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
          if (payload.new && (payload.new as any).date === currentDate) {
             setTasks((payload.new as any).tasks);
          }
          fetchHistory().then(setHistory);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDate]);

  const handleToggleTask = async (taskId: string) => {
    const newTasks = {
      ...tasks,
      [taskId]: !tasks[taskId]
    };
    setTasks(newTasks);

    try {
      await saveDayLog(currentDate, newTasks);
    } catch (error) {
      console.error("Failed to save", error);
      setTasks(tasks); 
    }
  };

  // Dream Navigation
  const nextDream = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentDreamIndex((prev) => (prev + 1) % dreams.length);
  };

  const prevDream = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentDreamIndex((prev) => (prev - 1 + dreams.length) % dreams.length);
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
        
        {/* Rules Section */}
        <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/30 to-slate-900/80 border border-rose-500/20 p-6 shadow-2xl backdrop-blur-md">
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

        {/* Motivation Button */}
        <div className="mb-10 flex justify-center">
          <button
            onClick={() => {
              setCurrentDreamIndex(0);
              setShowDreams(true);
            }}
            className="group relative flex items-center gap-3 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-black uppercase tracking-widest text-sm md:text-base rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all duration-300 hover:-translate-y-1"
          >
            <Zap className="w-5 h-5 fill-black" />
            Lembre-se dos seus sonhos (NÃO SEJA FRACO)
          </button>
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

      {/* Dreams Modal */}
      {showDreams && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-200"
          onClick={() => setShowDreams(false)}
        >
          {/* Top Controls */}
          <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
            <button 
              onClick={() => setShowDreams(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div 
            className="relative w-full max-w-6xl h-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-2xl group border border-white/5 bg-slate-900/50">
              <div className="relative w-full h-full flex items-center justify-center p-2 md:p-6">
                {dreams.length > 0 && (
                  <img
                    key={dreams[currentDreamIndex].id} 
                    src={dreams[currentDreamIndex].image_url}
                    alt={dreams[currentDreamIndex].label}
                    className="relative z-10 w-auto h-auto max-w-full max-h-full object-contain shadow-2xl drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-lg animate-in zoom-in duration-300"
                    loading="eager"
                    // @ts-ignore
                    fetchPriority="high"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('placehold.co')) return;
                      target.src = 'https://placehold.co/800x600/1e293b/FFF?text=Erro+na+Imagem';
                    }}
                  />
                )}
              </div>
              
              {/* Controls Overlay */}
              <div className="absolute inset-0 z-20 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <button 
                  onClick={prevDream}
                  className="pointer-events-auto p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={nextDream}
                  className="pointer-events-auto p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all hover:scale-110"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

              {/* Mobile Tap Areas */}
              <div className="absolute inset-y-0 left-0 w-1/4 z-30 md:hidden" onClick={prevDream}></div>
              <div className="absolute inset-y-0 right-0 w-1/4 z-30 md:hidden" onClick={nextDream}></div>
            </div>

            {/* Caption */}
            {dreams.length > 0 && (
              <div key={currentDreamIndex} className="mt-8 text-center animate-in slide-in-from-bottom-4 duration-500">
                <div className="inline-block px-3 py-1 mb-3 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-mono tracking-widest uppercase">
                  Visão {currentDreamIndex + 1} / {dreams.length}
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-wider drop-shadow-lg max-w-3xl mx-auto leading-tight">
                  {dreams[currentDreamIndex].label}
                </h3>
              </div>
            )}
            
            {/* Thumbnails Indicator */}
            <div className="flex gap-2 mt-6 overflow-x-auto max-w-full pb-2 px-4 justify-center">
              {dreams.map((dream, idx) => (
                <button
                  key={dream.id}
                  onClick={() => setCurrentDreamIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentDreamIndex 
                      ? 'w-8 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                      : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;