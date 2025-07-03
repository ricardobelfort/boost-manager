import { createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

export const supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_ANON_KEY);