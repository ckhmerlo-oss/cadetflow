-- Clear legacy academic_terms before Day 02 adds school_year/term_number uniqueness.
-- Local environments repopulate terms via supabase/seed.sql after migrations apply.
DELETE FROM public.academic_terms;
