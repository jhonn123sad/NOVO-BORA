import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import TaskCard from './components/TaskCard';
import Stats from './components/Stats';
import { TASKS } from './constants';
import { TaskMap, ChartDataPoint, Dream } from './types';
import { fetchDayLog, saveDayLog, fetchHistory, getPointsFromTasks, fetchDreams, createDream, deleteDream, uploadDreamImage } from './services/api';
import { getLocalDate } from './services/utils';
import { supabase } from './services/supabase';
import { X, ChevronLeft, ChevronRight, Zap, Settings, Trash2, Plus, Upload, Loader2, Save } from 'lucide-react';

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
  
  // Dreams State
  const [dreams, setDreams] = useState<Dream[]>(DEFAULT_DREAMS);
  const [showDreams, setShowDreams] = useState(false);
  const [currentDreamIndex, setCurrentDreamIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // New Dream Form State
  const [newDreamLabel, setNewDreamLabel] = useState('');
  const [newDreamFile, setNewDreamFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      // Load dreams from Supabase
      const dbDreams = await fetchDreams();
      if (dbDreams && dbDreams.length > 0) {
        setDreams(dbDreams);
      } else {
        // Fallback to the user's manual uploads if DB is empty
        setDreams(DEFAULT_DREAMS);
      }
    } catch (err) {
      console.error(err);
      // Ensure defaults load on error
      setDreams(DEFAULT_DREAMS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(currentDate);
  }, [currentDate, loadData]);

  // Preload images mechanism
  useEffect(() => {
    // This creates an invisible Image object for each dream URL, 
    // forcing the browser to cache them immediately.
    // When the user opens the modal, the image is served from disk cache instantly.
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

  // Dream Management
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDreamFile(e.target.files[0]);
    }
  };

  const handleUploadDream = async () => {
    if (!newDreamFile || !newDreamLabel) return;
    
    setIsUploading(true);
    try {
      // 1. Upload Image
      const publicUrl = await uploadDreamImage(newDreamFile);
      
      // 2. Save to DB
      const newDream = await createDream(newDreamLabel, publicUrl);
      
      // 3. Update Local State
      // If we were viewing defaults, replace with new DB item, otherwise append
      const isViewingDefaults = dreams.every(d => d.is_default);
      const updatedDreams = isViewingDefaults ? [newDream] : [...dreams, newDream];
      
      setDreams(updatedDreams);
      
      // Reset Form
      setNewDreamFile(null);
      setNewDreamLabel('');
      setIsEditMode(false); // Go back to view
      setCurrentDreamIndex(updatedDreams.length - 1); // Go to new dream
    } catch (error: any) {
      console.error('Error uploading dream:', error);
      alert(`Erro ao salvar: ${error.message || 'Verifique se criou o bucket e a tabela no Supabase.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDream = async (id: string | number) => {
    if (!confirm('Tem certeza que deseja apagar este sonho?')) return;
    
    try {
      await deleteDream(id);
      const updated = dreams.filter(d => d.id !== id);
      if (updated.length === 0) {
        setDreams(DEFAULT_DREAMS);
      } else {
        setDreams(updated);
        if (currentDreamIndex >= updated.length) {
          setCurrentDreamIndex(0);
        }
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Erro ao deletar.');
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
              onClick={(e) => {
                e.stopPropagation();
                setIsEditMode(!isEditMode);
              }}
              className={`p-2 rounded-full transition-colors ${isEditMode ? 'bg-yellow-500 text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              title="Gerenciar Sonhos"
            >
              <Settings className="w-6 h-6" />
            </button>
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
            {isEditMode ? (
              /* --- EDIT MODE --- */
              <div className="w-full h-full flex flex-col gap-6 overflow-y-auto p-4 md:p-8 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Gerenciar Sonhos</h2>
                  <div className="text-sm text-slate-400">Total: {dreams.length}</div>
                </div>

                {/* Add New Form */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-dashed border-slate-600 hover:border-indigo-500 transition-colors">
                   <h3 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                     <Plus className="w-5 h-5" /> Adicionar Novo Sonho
                   </h3>
                   <div className="flex flex-col md:flex-row gap-4">
                      <div 
                        className="flex-1 h-32 bg-slate-900/50 rounded-lg border border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-colors relative overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {newDreamFile ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                             <span className="text-indigo-400 font-medium truncate px-4">{newDreamFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-slate-500 mb-2" />
                            <span className="text-sm text-slate-500">Clique para selecionar imagem</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col gap-3">
                        <input 
                          type="text" 
                          placeholder="Título do sonho (ex: Minha Ferrari)"
                          className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                          value={newDreamLabel}
                          onChange={(e) => setNewDreamLabel(e.target.value)}
                        />
                        <button 
                          onClick={handleUploadDream}
                          disabled={!newDreamFile || !newDreamLabel || isUploading}
                          className="w-full mt-auto py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Salvar no Banco
                        </button>
                      </div>
                   </div>
                </div>

                {/* List Existing */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dreams.map((dream) => (
                    <div key={dream.id} className="group relative aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                      <img src={dream.image_url} alt={dream.label} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                        <p className="text-white font-medium truncate">{dream.label}</p>
                      </div>
                      {!dream.is_default && (
                        <button 
                          onClick={() => handleDeleteDream(dream.id)}
                          className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* --- VIEW MODE (CAROUSEL) --- */
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;