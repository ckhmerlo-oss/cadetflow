-- 1. Create Sports Metadata Table
CREATE TABLE public.sports (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    season text NOT NULL CHECK (season IN ('Fall', 'Winter', 'Spring')),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (name, season)
);

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

-- 2. Create Coaches Join Table
CREATE TABLE public.sport_coaches (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
    coach_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text DEFAULT 'Head Coach', -- 'Head Coach', 'Assistant', etc.
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (sport_id, coach_id)
);

ALTER TABLE public.sport_coaches ENABLE ROW LEVEL SECURITY;

-- 3. Create Events Table
CREATE TABLE public.sport_events (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
    title text NOT NULL,
    event_date timestamp with time zone NOT NULL,
    location text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

ALTER TABLE public.sport_events ENABLE ROW LEVEL SECURITY;

-- 4. Update Preferences for Coach Notifications
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS email_team_alert public.notification_frequency DEFAULT 'immediate';

-- 5. Seed Sports Data (Based on your constants)
INSERT INTO public.sports (name, season) VALUES
-- Fall
('JV Football', 'Fall'), ('Varsity Football', 'Fall'), ('JV Soccer', 'Fall'), 
('Varsity Soccer', 'Fall'), ('Cross Country', 'Fall'), ('Swimming (Off Season)', 'Fall'), 
('PG Lacrosse', 'Fall'), ('PG Basketball', 'Fall'), ('PG Football', 'Fall'), ('PT', 'Fall'),
-- Winter
('JV Basketball', 'Winter'), ('Varsity Basketball', 'Winter'), ('Wrestling', 'Winter'), 
('Swimming', 'Winter'), ('Indoor Track', 'Winter'), ('PT', 'Winter'),
-- Spring
('Baseball', 'Spring'), ('Varsity Lacrosse', 'Spring'), ('Track & Field', 'Spring'), 
('Tennis', 'Spring'), ('Golf', 'Spring');

-- 6. RLS Policies

-- Sports: Readable by all, Editable by Admins
CREATE POLICY "Everyone can view sports" ON public.sports FOR SELECT USING (true);
CREATE POLICY "Admins manage sports" ON public.sports FOR ALL USING (public.get_my_role_level() >= 90);

-- Coaches: Readable by all, Claimable by Faculty (50+)
CREATE POLICY "Everyone can view coaches" ON public.sport_coaches FOR SELECT USING (true);
CREATE POLICY "Faculty can claim coaching" ON public.sport_coaches FOR INSERT 
WITH CHECK (public.get_my_role_level() >= 50);
CREATE POLICY "Coaches can remove themselves" ON public.sport_coaches FOR DELETE 
USING (coach_id = auth.uid() OR public.get_my_role_level() >= 90);

-- Events: Readable by all, Editable by Coaches of that sport
CREATE POLICY "Everyone can view events" ON public.sport_events FOR SELECT USING (true);
CREATE POLICY "Coaches manage events" ON public.sport_events FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.sport_coaches 
        WHERE sport_id = public.sport_events.sport_id AND coach_id = auth.uid()
    ) OR public.get_my_role_level() >= 90
);

-- 7. Notification Trigger Logic
-- Trigger: When a report is filed, check if the cadet plays a sport, notify the coaches.

CREATE OR REPLACE FUNCTION public.notify_coaches_on_report()
RETURNS TRIGGER AS $$
DECLARE
    v_cadet record;
    v_sport_id uuid;
    v_coach record;
BEGIN
    -- Get Cadet's Sports Profile
    SELECT * INTO v_cadet FROM public.profiles WHERE id = NEW.subject_cadet_id;
    
    -- Check Fall
    IF v_cadet.sport_fall IS NOT NULL AND v_cadet.sport_fall != 'None' THEN
        SELECT id INTO v_sport_id FROM public.sports WHERE name = v_cadet.sport_fall AND season = 'Fall';
        IF v_sport_id IS NOT NULL THEN
            FOR v_coach IN SELECT coach_id FROM public.sport_coaches WHERE sport_id = v_sport_id LOOP
                INSERT INTO public.notification_queue (user_id, event_type, subject, message, link_url)
                VALUES (
                    v_coach.coach_id, 
                    'team_alert', 
                    'Misconduct Report: ' || v_cadet.last_name,
                    'A report has been filed against ' || v_cadet.first_name || ' ' || v_cadet.last_name || ' (' || v_cadet.sport_fall || ').',
                    '/report/' || NEW.id
                );
            END LOOP;
        END IF;
    END IF;

    -- Repeat logic for Winter/Spring if needed, or refine to checking "Current Season" only
    -- (Simplified for this example to just Fall/Active season logic could be added)

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_report_notify_coach
AFTER INSERT ON public.demerit_reports
FOR EACH ROW EXECUTE FUNCTION public.notify_coaches_on_report();