import React from 'react';
import { Period, TaskDefinition, TaskMap } from '../types';
import { COLOR_MAP } from '../constants';
import { Sun, Sunset, Moon } from 'lucide-react';

interface TaskCardProps {
  period: Period;
  tasks: TaskDefinition[];
  statusMap: TaskMap;
  onToggle: (taskId: string) => void;
}

const ICONS = {
  Morning: Sun,
  Afternoon: Sunset,
  Night: Moon,
};

const PERIOD_TRANSLATIONS = {
  Morning: 'Manhã',
  Afternoon: 'Tarde',
  Night: 'Noite',
};

const TaskCard: React.FC<TaskCardProps> = ({ period, tasks, statusMap, onToggle }) => {
  const styles = COLOR_MAP[period];
  const Icon = ICONS[period];

  return (
    <div className={`rounded-2xl border ${styles.container} backdrop-blur-sm overflow-hidden flex flex-col shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-opacity-50`}>
      {/* Header do Card */}
      <div className={`flex items-center gap-3 px-6 py-4 border-b ${styles.border} ${styles.headerBg}`}>
        <div className={`p-2 rounded-lg bg-slate-950/30 border border-white/5 shadow-inner`}>
          <Icon className={`w-5 h-5 ${styles.icon}`} />
        </div>
        <h2 className={`font-bold text-lg tracking-wide ${styles.textTitle}`}>{PERIOD_TRANSLATIONS[period]}</h2>
      </div>

      {/* Lista de Tarefas */}
      <div className="flex flex-col gap-1 p-4">
        {tasks.map((task) => {
          const isChecked = !!statusMap[task.id];
          return (
            <label
              key={task.id}
              className={`
                flex items-center gap-4 cursor-pointer p-3 rounded-xl transition-all duration-200
                ${styles.hover} 
                ${isChecked ? 'bg-slate-800/30' : 'bg-transparent'}
              `}
            >
              <div className="relative flex items-center justify-center shrink-0">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(task.id)}
                  className={`
                    appearance-none w-6 h-6 border-2 rounded-lg
                    bg-slate-950/50 checked:bg-current transition-all duration-300 ease-out
                    focus:ring-0 focus:ring-offset-0 cursor-pointer
                    ${isChecked ? styles.checkbox : 'border-slate-600 hover:border-slate-500'}
                    ${styles.checkboxBorder}
                  `}
                />
                {isChecked && (
                  <svg
                    className="w-4 h-4 absolute text-white pointer-events-none drop-shadow-md animate-in zoom-in duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className={`text-sm md:text-base font-medium select-none transition-all duration-300 ${isChecked ? 'text-slate-500 line-through' : styles.textLabel}`}>
                {task.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default TaskCard;