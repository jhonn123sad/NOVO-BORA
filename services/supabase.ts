import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oaflhpwhrdaaqjvmdvyl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZmxocHdocmRhYXFqdm1kdnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NjA2MDksImV4cCI6MjA3OTQzNjYwOX0.tZ6OciLdfh65RAkzmCSteSIeqovI1IkWPZyM8MPvqQo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
