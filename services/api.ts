import { supabase } from './supabase';
import { DailyLog, TaskMap, ChartDataPoint, Dream } from '../types';
import { TASKS } from '../constants';

// --- TASKS & LOGS ---

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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching day:', error);
    return { date, tasks: {}, points: 0 };
  }

  if (data && data.length > 0) {
    const record = data[0];
    return {
      date: record.date,
      tasks: record.tasks || {},
      points: record.points || 0,
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

  return (data || []).reverse().map((item: any) => ({
    date: item.date,
    points: item.points,
  }));
};

// --- DREAMS ---

export const fetchDreams = async (): Promise<Dream[]> => {
  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    // Se a tabela não existir ainda, retorna array vazio para usar defaults
    console.warn('Error fetching dreams (table might not exist yet):', error.message);
    return [];
  }

  return data.map(d => ({
    id: d.id,
    label: d.label,
    image_url: d.image_url,
    is_default: false
  }));
};

export const uploadDreamImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('dream-assets')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('dream-assets')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const createDream = async (label: string, image_url: string): Promise<Dream> => {
  const { data, error } = await supabase
    .from('dreams')
    .insert([{ label, image_url }])
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    label: data.label,
    image_url: data.image_url,
    is_default: false
  };
};

export const deleteDream = async (id: number | string) => {
  const { error } = await supabase
    .from('dreams')
    .delete()
    .eq('id', id);

  if (error) throw error;
};