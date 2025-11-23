import { supabase } from './supabase';
import { DailyLog, TaskMap, ChartDataPoint } from '../types';
import { TASKS } from '../constants';

export const getPointsFromTasks = (tasks: TaskMap): number => {
  let points = 0;
  Object.keys(tasks).forEach((key) => {
    if (tasks[key]) points++;
  });
  return points;
};

export const fetchDayLog = async (date: string): Promise<DailyLog> => {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching day:', error);
  }

  // Return existing data or default empty structure
  if (data) {
    return {
      date: data.date,
      tasks: data.tasks || {},
      points: data.points || 0,
    };
  }

  return {
    date,
    tasks: {},
    points: 0,
  };
};

export const saveDayLog = async (date: string, tasks: TaskMap) => {
  const points = getPointsFromTasks(tasks);
  
  const { error } = await supabase
    .from('daily_logs')
    .upsert(
      { date, tasks, points },
      { onConflict: 'date' }
    );

  if (error) {
    console.error('Error saving log:', error);
    throw error;
  }
};

export const fetchHistory = async (limit = 30): Promise<ChartDataPoint[]> => {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('date, points')
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching history:', error);
    return [];
  }

  // Sort back to ascending for the chart
  return (data || []).reverse().map((item: any) => ({
    date: item.date,
    points: item.points,
  }));
};
