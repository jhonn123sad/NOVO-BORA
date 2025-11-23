import { TaskDefinition } from './types';

export const TASKS: TaskDefinition[] = [
  // Morning
  { id: 'vacuum', label: 'Aspirar a casa', period: 'Morning' },
  { id: 'run', label: 'Correr', period: 'Morning' },
  { id: 'minoxidil_1', label: 'Minoxidil (1ª dose)', period: 'Morning' },
  { id: 'read', label: 'Ler', period: 'Morning' },
  { id: 'kegel', label: 'Kegel e alongamento', period: 'Morning' },
  { id: 'tidy', label: 'Organizar ambiente', period: 'Morning' },

  // Afternoon
  { id: 'prospect', label: 'Prospecção (sem parar)', period: 'Afternoon' },
  { id: 'post_videos', label: 'Postar três vídeos', period: 'Afternoon' },
  { id: 'minoxidil_2', label: 'Minoxidil (2ª dose)', period: 'Afternoon' },
  { id: 'last_meal', label: 'Última refeição', period: 'Afternoon' },

  // Night
  { id: 'cryo', label: 'Crioterapia', period: 'Night' },
  { id: 'gym', label: 'Academia', period: 'Night' },
  { id: 'write', label: 'Escrever diário', period: 'Night' },
];

export const TOTAL_POSSIBLE_POINTS = TASKS.length;

export const COLOR_MAP = {
  Morning: {
    container: 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-amber-500/20',
    headerBg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    textTitle: 'text-amber-100',
    textLabel: 'text-slate-200',
    checkbox: 'accent-amber-500',
    checkboxBorder: 'border-amber-600/50',
    icon: 'text-amber-400',
    hover: 'hover:bg-amber-500/5',
  },
  Afternoon: {
    container: 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-orange-500/20',
    headerBg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    textTitle: 'text-orange-100',
    textLabel: 'text-slate-200',
    checkbox: 'accent-orange-500',
    checkboxBorder: 'border-orange-600/50',
    icon: 'text-orange-400',
    hover: 'hover:bg-orange-500/5',
  },
  Night: {
    container: 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-indigo-500/20',
    headerBg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    textTitle: 'text-indigo-100',
    textLabel: 'text-slate-200',
    checkbox: 'accent-indigo-500',
    checkboxBorder: 'border-indigo-600/50',
    icon: 'text-indigo-400',
    hover: 'hover:bg-indigo-500/5',
  },
};