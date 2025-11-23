import { TaskDefinition } from './types';

export const TASKS: TaskDefinition[] = [
  // Morning
  { id: 'm_vacuum', label: 'Vacum', period: 'Morning' },
  { id: 'm_run', label: 'Correr', period: 'Morning' },
  { id: 'm_minoxidil_1', label: 'Minoxidil (1ª dose)', period: 'Morning' },
  { id: 'm_read', label: 'Ler', period: 'Morning' },
  { id: 'm_kegel', label: 'Kegel e alongamento', period: 'Morning' },
  { id: 'm_tidy', label: 'Organizar ambiente', period: 'Morning' },

  // Afternoon
  { id: 'a_prospect', label: 'Prospectar 100', period: 'Afternoon' },
  { id: 'a_post_videos', label: 'Postar três vídeos', period: 'Afternoon' },
  { id: 'a_minoxidil_2', label: 'Minoxidil (2ª dose)', period: 'Afternoon' },
  { id: 'a_last_meal', label: 'Última refeição', period: 'Afternoon' },

  // Night
  { id: 'n_cryo', label: 'Óleo de Rícino', period: 'Night' },
  { id: 'n_gym', label: 'Academia', period: 'Night' },
  { id: 'n_write', label: 'Escrever diário', period: 'Night' },
];

export const TOTAL_POSSIBLE_POINTS = TASKS.length;

export const COLOR_MAP = {
  Morning: {
    container: 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-amber-500/20',
    headerBg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    textTitle: 'text-amber-100',
    textLabel: 'text-slate-200',
    checkbox: 'bg-amber-500 border-amber-500',
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
    checkbox: 'bg-orange-500 border-orange-500',
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
    checkbox: 'bg-indigo-500 border-indigo-500',
    checkboxBorder: 'border-indigo-600/50',
    icon: 'text-indigo-400',
    hover: 'hover:bg-indigo-500/5',
  },
};