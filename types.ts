export type Period = 'Morning' | 'Afternoon' | 'Night';

export interface TaskDefinition {
  id: string;
  label: string;
  period: Period;
}

export interface TaskMap {
  [taskId: string]: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  tasks: TaskMap;
  points: number;
}

export interface ChartDataPoint {
  date: string;
  points: number;
}
