import React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateDisplay } from '../services/utils';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentDate, onDateChange }) => {
  const handlePrevDay = () => {
    const date = new Date(currentDate + 'T12:00:00'); // Force noon
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(currentDate + 'T12:00:00'); // Force noon
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const displayDate = formatDateDisplay(currentDate);

  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/60 shadow-lg supports-[backdrop-filter]:bg-slate-950/60">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-inner">
            <CalendarDays className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Desafio 30 Dias
            </h1>
            <p className="text-xs text-slate-400 font-medium">Rastreador de Disciplina</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 rounded-full p-1.5 border border-slate-700/50 shadow-inner">
          <button
            onClick={handlePrevDay}
            className="p-2 hover:bg-slate-700 rounded-full transition-all text-slate-400 hover:text-white active:scale-95"
            aria-label="Dia anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="px-6 py-1 text-center min-w-[200px]">
            <span className="block text-sm font-semibold text-slate-200 capitalize">
              {displayDate}
            </span>
          </div>
          
          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-slate-700 rounded-full transition-all text-slate-400 hover:text-white active:scale-95"
            aria-label="Próximo dia"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;