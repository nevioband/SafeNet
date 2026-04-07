import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm'

const SUPABASE_URL = 'https://dygrabyaiyessqmjdprc.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Z3JhYnlhaXllc3NxbWpkcHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTkzMzMsImV4cCI6MjA5MTA3NTMzM30.l4fAwsz3deB3rZuA5EOG-_9doe2ohXunv1KwFezR2ss'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
