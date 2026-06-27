#!/usr/bin/env python3
"""Generate Blue Book v3.6 offense catalog SQL migration."""

import uuid
from pathlib import Path

NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "cadetflow.bluebook.v3.6")

# (offense_group, offense_name, offense_code, demerits, policy_category)
OFFENSES: list[tuple[str, str, str, int, int]] = [
    # --- Category I (3 demerits) ---
    ("Appearance", "In need of a shave or haircut", "1", 3, 1),
    ("Appearance", "Out of uniform", "1", 3, 1),
    ("Appearance", "Unauthorized uniform", "1", 3, 1),
    ("Appearance", "Hands in pockets", "1", 3, 1),
    ("Appearance", "Unclean uniform", "1", 3, 1),
    ("Appearance", "In need of repair (uniform)", "1", 3, 1),
    ("Appearance", "Improper fitting uniform", "1", 3, 1),
    ("Appearance", "Improper wearing of hat, pants, etc.", "1", 3, 1),
    ("Arms (Rifle/Sabre)", "Unattended", "1", 3, 1),
    ("Behavior in Class", "Failure to comply", "1", 3, 1),
    ("Behavior in Class", "Late assignment submission", "1", 3, 1),
    ("Behavior in Class", "Reading/viewing unauthorized materials", "1", 3, 1),
    ("Behavior in Class", "Talking out of turn", "1", 3, 1),
    ("Campus", "Eating food outside of designated meal areas", "1", 3, 1),
    ("Campus", "Overdue library book", "1", 3, 1),
    ("Conduct", "Cutting in line", "1", 3, 1),
    ("Conduct", "Failure to comply", "1", 3, 1),
    ("Conduct", "Failure to salute", "1", 3, 1),
    ("Conduct", "Gear adrift", "1", 3, 1),
    ("Conduct", "Late to any required activity", "1", 3, 1),
    ("Conduct", "Talking while at-ease", "1", 3, 1),
    ("Conduct", "Unnecessary comments", "1", 3, 1),
    ("Conduct", "Running in non-athletic uniform", "1", 3, 1),
    ("Room/Barracks", "Door/Bed covering", "1", 3, 1),
    ("Room/Barracks", "Room in disorder", "1", 3, 1),
    ("Room/Barracks", "Talking out of window", "1", 3, 1),
    ("Room/Barracks", "Too many cadets in room (4 maximum)", "1", 3, 1),
    ("Room/Barracks", "Unprepared for check off/inspection", "1", 3, 1),
    ("When in Ranks", "Chewing gum", "1", 3, 1),
    ("When in Ranks", "Eating", "1", 3, 1),
    ("When in Ranks", "Inattention", "1", 3, 1),
    ("When in Ranks", "Moving", "1", 3, 1),
    ("When in Ranks", "Talking", "1", 3, 1),
    # --- Category II (6 demerits) ---
    ("Behavior in Class", "Failure to do assignment", "2a", 6, 2),
    ("Behavior in Class", "Sleeping", "2a", 6, 2),
    ("Chapel", "Computer use", "2a", 6, 2),
    ("Chapel", "Eating/Drinking", "2a", 6, 2),
    ("Chapel", "Talking", "2a", 6, 2),
    ("Chapel", "Sleeping", "2a", 6, 2),
    ("Chapel", "Reading unauthorized material", "2a", 6, 2),
    ("Study C.Q.", "C.Q. violation", "2b", 10, 2),
    ("Computers", "AUP violation", "2a", 6, 2),
    ("Computers", "Improper computer use", "2a", 6, 2),
    ("Computers", "Unsecured laptop", "2a", 6, 2),
    ("Conduct", "Absent any required activity", "2a", 6, 2),
    ("Conduct", "Buying/Selling Items", "2a", 6, 2),
    ("Conduct", "Creating a disturbance", "2a", 6, 2),
    ("Conduct", "Horseplay", "2a", 6, 2),
    ("Conduct", "Immature actions", "2a", 6, 2),
    ("Conduct", "Improper judgment/comments", "2a", 6, 2),
    ("Conduct", "Throwing snowballs (except when authorized)", "2a", 6, 2),
    ("Conduct", "Impolite behavior", "2a", 6, 2),
    ("Duty", "Careless performance of duty", "2a", 6, 2),
    ("Equipment/Property", "Intentional misuse of Academy property", "2a", 6, 2),
    ("Equipment/Property", "Civilian clothes", "2a", 6, 2),
    ("Equipment/Property", "Unauthorized items", "2a", 6, 2),
    ("Equipment/Property", "Unauthorized alteration of uniform", "2a", 6, 2),
    ("Leaves/Day Passes", "Improper leave or day pass procedure", "2a", 6, 2),
    ("Dining Hall", "Improper procedure", "2a", 6, 2),
    ("Dining Hall", "Taking food or drink from the dining hall", "2a", 6, 2),
    ("Room/Barracks", "Abuse of late lights", "2a", 6, 2),
    ("Room/Barracks", "Throwing anything out of window", "2a", 6, 2),
    ("Room/Barracks", "Unsecured room", "2a", 6, 2),
    ("Taps", "Light on after", "2a", 6, 2),
    ("Taps", "Out of bed after", "2a", 6, 2),
    ("Taps", "Computer use after", "2a", 6, 2),
    # --- Category II (10 demerits) ---
    ("Arms (Rifle/Sabre)", "Failure to report loss of", "2b", 10, 2),
    ("Arms (Rifle/Sabre)", "Misuse of", "2b", 10, 2),
    ("Attitude", "Lackadaisical", "2b", 10, 2),
    ("Conduct", "Refusal to comply", "2b", 10, 2),
    ("Conduct", "Improper conduct during parade", "2b", 10, 2),
    ("Conduct", "Vulgarity, profanity, lewd gesture", "2b", 10, 2),
    ("Duty", "Inaccurate report", "2b", 10, 2),
    ("Duty", "Neglect of duty", "2b", 10, 2),
    ("Hygiene", "Gross personal hygiene", "2b", 10, 2),
    ("Infirmary", "Missed medication", "2b", 10, 2),
    ("Off Limits", "Off limits area on campus", "2b", 10, 2),
    ("Room/Barracks", "Entering/exiting through window", "2b", 10, 2),
    ("Room/Barracks", "In bed after reveille/during class day", "2b", 10, 2),
    # --- Category III (15 demerits — Blue Book minimum; Commandant may adjust) ---
    ("AWOL", "Less than 24 hours", "3a", 15, 3),
    ("AWOL", "Over 24 hours, less than 48", "3a", 15, 3),
    ("AWOL", "Over 48 hours, less than 72", "3a", 15, 3),
    ("Computers", "AUP violation (Category III)", "3a", 15, 3),
    ("Computers", "Tampering with computer in any way", "3a", 15, 3),
    ("Conduct", "Abuse of authority", "3a", 15, 3),
    ("Conduct", "Unauthorized automobile in area", "3a", 15, 3),
    ("Conduct", "Conduct unbecoming a cadet", "3a", 15, 3),
    ("Conduct", "Safety violation", "3a", 15, 3),
    ("Conduct", "Creating/participating in a disorder", "3a", 15, 3),
    ("Conduct", "Disrespect to Cadet Officer/NCO", "3a", 15, 3),
    ("Conduct", "Disrespect to Faculty Officer", "3a", 15, 3),
    ("Conduct", "Possession/use of intoxicants", "3a", 15, 3),
    ("Conduct", "Failure to fulfill commitment", "3a", 15, 3),
    ("Conduct", "Fighting/Striking another cadet", "3a", 15, 3),
    ("Conduct", "Use/possession of fireworks/explosives", "3a", 15, 3),
    ("Conduct", "Indecent Exposure", "3a", 15, 3),
    ("Conduct", "Insubordination to Cadet Officer/NCO", "3a", 15, 3),
    ("Conduct", "Insubordination to Faculty Officer", "3a", 15, 3),
    ("Conduct", "Possession of Pornography", "3a", 15, 3),
    ("Conduct", "Provoking an incident", "3a", 15, 3),
    ("Conduct", "Reckless driving", "3a", 15, 3),
    ("Conduct", "Possession/use of cell phone", "3a", 15, 3),
    ("Conduct", "Refusing to obey an order from Cadet Officer/NCO", "3a", 15, 3),
    ("Conduct", "Refusing to obey an order from Faculty Officer", "3a", 15, 3),
    ("Conduct", "Direct Disobedience", "3a", 15, 3),
    ("Conduct", "Threatening", "3a", 15, 3),
    ("Conduct", "Unchaperoned female guest on campus", "3a", 15, 3),
    ("Duty", "Neglect of duty (Category III)", "3a", 15, 3),
    ("Duty", "Withholding information", "3a", 15, 3),
    ("Equipment/Property", "Damage/destruction of Academy property", "3a", 15, 3),
    ("Leaves/Day Passes", "Late returning from leave/day pass", "3a", 15, 3),
    ("Leaves/Day Passes", "Absent scheduled parade", "3a", 15, 3),
    ("Dining Hall", "Throwing food", "3a", 15, 3),
    ("Off-Limits", "Any off-limits area off campus", "3a", 15, 3),
    ("Room/Barracks", "Cooking in", "3a", 15, 3),
    ("Room/Barracks", "In another cadet's room, occupant not present", "3a", 15, 3),
    ("Taps", "Out of barracks after", "3a", 15, 3),
    ("Taps", "Out of the company area after", "3a", 15, 3),
    ("Tobacco", "Distribution of nicotine/vape products", "3a", 15, 3),
    ("Tobacco", "Possession/use of nicotine/vape products", "3a", 15, 3),
    # --- Category III Tribunal (35 demerits — serious; Commandant may adjust) ---
    ("Tribunal", "AWOL Over 72 hours", "3c", 35, 3),
    ("Tribunal", "Fighting/Manhandling/Physical Assault", "3c", 35, 3),
    ("Tribunal", "Possession or use of Drugs/Intoxicants/Paraphernalia", "3c", 35, 3),
    ("Tribunal", "Sexual-related activity", "3c", 35, 3),
    ("Tribunal", "Hazing", "3c", 35, 3),
    ("Tribunal", "Inciting a riot", "3c", 35, 3),
    # --- Honor Code Violations ---
    ("Honor Code Violations", "Lying", "3c", 35, 3),
    ("Honor Code Violations", "Cheating", "3c", 35, 3),
    ("Honor Code Violations", "Stealing", "3c", 35, 3),
    ("Honor Code Violations", "Failure to report Honor Violation", "3c", 35, 3),
    ("Honor Code Violations", "Falsifying documents", "3c", 35, 3),
]

# Seed demo report remapping: old placeholder id -> blue book offense key
SEED_REMAP = {
    "e0000000-0000-0000-0000-000000000001": ("Appearance", "Unclean uniform"),
    "e0000000-0000-0000-0000-000000000002": ("Room/Barracks", "Room in disorder"),
    "e0000000-0000-0000-0000-000000000003": ("Conduct", "Disrespect to Cadet Officer/NCO"),
    "e0000000-0000-0000-0000-000000000004": ("Conduct", "Late to any required activity"),
    "e0000000-0000-0000-0000-000000000005": ("Room/Barracks", "Unprepared for check off/inspection"),
}


def offense_id(group: str, name: str, policy_category: int) -> str:
    key = f"{group}|{name}|{policy_category}"
    return str(uuid.uuid5(NAMESPACE, key))


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def main() -> None:
    id_by_key: dict[tuple[str, str, int], str] = {}
    for group, name, code, demerits, cat in OFFENSES:
        id_by_key[(group, name, cat)] = offense_id(group, name, cat)

    rows: list[str] = []
    for group, name, code, demerits, cat in OFFENSES:
        oid = id_by_key[(group, name, cat)]
        rows.append(
            f"  ('{oid}', '{sql_escape(group)}', '{sql_escape(name)}', "
            f"'{code}', {demerits}, {cat})"
        )

    remap_updates: list[str] = []
    for old_id, (group, name) in SEED_REMAP.items():
        cat = next(c for g, n, _, _, c in OFFENSES if g == group and n == name)
        new_id = id_by_key[(group, name, cat)]
        remap_updates.append(
            f"UPDATE public.demerit_reports SET offense_type_id = '{new_id}'::uuid "
            f"WHERE offense_type_id = '{old_id}'::uuid;"
        )

    placeholder_ids = ", ".join(f"'{oid}'::uuid" for oid in SEED_REMAP)

    sql = f"""-- Blue Book 2025 v3.6 offense catalog (Section 4, pp. 21–24)
-- Generated by scripts/generate_blue_book_offenses.py — re-run script to regenerate.

BEGIN;

-- Natural key for idempotent upserts
CREATE UNIQUE INDEX IF NOT EXISTS offense_types_group_name_policy_category_key
  ON public.offense_types (offense_group, offense_name, policy_category);

INSERT INTO public.offense_types (
  id, offense_group, offense_name, offense_code, demerits, policy_category
)
VALUES
{",\n".join(rows)}
ON CONFLICT (offense_group, offense_name, policy_category) DO UPDATE
SET
  offense_code = EXCLUDED.offense_code,
  demerits = EXCLUDED.demerits;

-- Remap seed/demo reports off legacy placeholder offenses
{chr(10).join(remap_updates)}

-- Remove legacy placeholder offenses when no longer referenced
DELETE FROM public.offense_types
WHERE id IN ({placeholder_ids})
  AND NOT EXISTS (
    SELECT 1 FROM public.demerit_reports dr WHERE dr.offense_type_id = offense_types.id
  );

COMMIT;
"""

    out = Path(__file__).resolve().parents[1] / "supabase" / "migrations" / "20260621000001_blue_book_offense_catalog.sql"
    out.write_text(sql, encoding="utf-8")
    print(f"Wrote {len(OFFENSES)} offenses to {out}")


if __name__ == "__main__":
    main()
