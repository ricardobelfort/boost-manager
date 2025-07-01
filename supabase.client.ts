import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://nqaipmnlcoioqqqzcghu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xYWlwbW5sY29pb3FxcXpjZ2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMjc0MTAsImV4cCI6MjA2NjkwMzQxMH0.iG79kCCWM9C0qvKMx198kjdnWL4YkwPJAEk-sPneGRM'
);
// Pegue a URL e a chave no painel do Supabase (Project settings > API)