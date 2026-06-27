"""Generate 20260715000001_diagnostic_error_messages.sql from latest function sources."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIG = ROOT / "supabase" / "migrations"


def extract_func(text: str, name: str) -> str | None:
    pat = rf"create or replace function public\.{name}\("
    m = re.search(pat, text, re.I)
    if not m:
        return None
    start = m.start()
    end = text.find("$$;", m.end())
    if end == -1:
        return None
    return text[start : end + 3]


def main() -> None:
    out: list[str] = []

    handle_approval = """CREATE OR REPLACE FUNCTION public.handle_approval(report_id_to_approve uuid, approval_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO public
AS $function$
DECLARE
  current_group_id uuid;
  next_group_id uuid;
BEGIN
  SELECT current_approver_group_id
  INTO current_group_id
  FROM public.demerit_reports
  WHERE id = report_id_to_approve;

  IF NOT public.is_member_of_approver_group(current_group_id) THEN
    RAISE EXCEPTION '[handle_approval] Permission denied — not current approver for report';
  END IF;

  SELECT next_approver_group_id
  INTO next_group_id
  FROM public.approval_groups
  WHERE id = current_group_id;

  IF next_group_id IS NULL THEN
    UPDATE public.demerit_reports
    SET status = 'completed', current_approver_group_id = NULL
    WHERE id = report_id_to_approve;
  ELSE
    UPDATE public.demerit_reports
    SET current_approver_group_id = next_group_id
    WHERE id = report_id_to_approve;
  END IF;

  INSERT INTO public.approval_log (report_id, actor_id, "action", comment)
  VALUES (report_id_to_approve, auth.uid(), 'approved', approval_comment);
END;
$function$;"""
    out.append(handle_approval)

    day08 = (MIG / "20260701000001_day08_work_orders.sql").read_text(encoding="utf-8")
    faculty = (MIG / "20260703000001_work_order_faculty_and_routing.sql").read_text(encoding="utf-8")
    day09 = (MIG / "20260705000001_day09_room_inspections.sql").read_text(encoding="utf-8")
    movein = (MIG / "20260710000001_move_in_parent_invites.sql").read_text(encoding="utf-8")
    day07 = (MIG / "20260626000001_day07_period_queries.sql").read_text(encoding="utf-8")
    archive = (MIG / "20260625000001_archive_roster_email_fixes.sql").read_text(encoding="utf-8")
    day05 = (MIG / "20260619000002_day05_category_restrictions.sql").read_text(encoding="utf-8")
    day02 = (MIG / "20260615000001_day02_oversight_and_classes.sql").read_text(encoding="utf-8")
    pull = (MIG / "20251125161040_PullReportPermissionsFix.sql").read_text(encoding="utf-8")

    specs: list[tuple[str, str, str | None]] = [
        ("transition_work_order", day08, "transition"),
        ("create_work_order", faculty, "create_wo"),
        ("assign_barracks_bunk", day09, "assign_bunk"),
        ("compare_room_inspection_forms", day09, "compare"),
        ("save_room_inspection_form", movein, "save_form"),
        ("close_school_year", day09, "close_year"),
        ("get_cadet_period_stats", day07, "period_stats"),
        ("list_cadets_by_conduct", day07, "list_conduct"),
        ("archive_cadet_profile", archive, "archive"),
        ("add_manual_oversight", archive, "add_oversight"),
        ("remove_manual_oversight", day02, "remove_oversight"),
    ]

    for fn, src, kind in specs:
        body = extract_func(src, fn)
        if not body:
            raise SystemExit(f"Missing function: {fn}")

        if kind == "transition":
            body = re.sub(
                r"raise exception 'Unauthorized'",
                "raise exception '[transition_work_order] Unauthorized'",
                body,
                flags=re.I,
            )
            body = re.sub(
                r"raise exception 'Work order not found'",
                "raise exception '[transition_work_order] Work order not found'",
                body,
                flags=re.I,
            )
            body = re.sub(
                r"raise exception 'Permission denied'",
                "raise exception '[transition_work_order] Permission denied — action=% status=%', p_action, v_wo.status",
                body,
                flags=re.I,
            )
            body = re.sub(
                r"raise exception 'Invalid status transition'",
                "raise exception '[transition_work_order] Invalid transition — status=% action=%', v_wo.status, p_action",
                body,
                flags=re.I,
            )
            body = re.sub(
                r"raise exception 'Assignee is required'",
                "raise exception '[transition_work_order] Assignee is required'",
                body,
                flags=re.I,
            )
            body = re.sub(
                r"raise exception 'Assignee must be a maintenance manager'",
                "raise exception '[transition_work_order] Assignee must be a maintenance manager'",
                body,
                flags=re.I,
            )
            body = re.sub(
                r"raise exception 'Valid priority is required'",
                "raise exception '[transition_work_order] Valid priority is required'",
                body,
                flags=re.I,
            )
            body = re.sub(
                r"raise exception 'Note is required'",
                "raise exception '[transition_work_order] Note is required'",
                body,
                flags=re.I,
            )
            body = re.sub(
                r"raise exception 'Unknown action: %', p_action",
                "raise exception '[transition_work_order] Unknown action: %', p_action",
                body,
                flags=re.I,
            )
        elif kind == "assign_bunk":
            body = re.sub(
                r"raise exception 'Permission denied'",
                "raise exception '[assign_barracks_bunk] Permission denied'",
                body,
                flags=re.I,
            )
            body = re.sub(
                r"raise exception 'Cannot assign archived cadet to room'",
                "raise exception '[assign_barracks_bunk] Cannot assign archived cadet to room'",
                body,
                flags=re.I,
            )
        elif kind == "compare":
            body = re.sub(
                r"raise exception 'Move-in form not found'",
                "raise exception '[compare_room_inspection_forms] Move-in form not found'",
                body,
                flags=re.I,
            )
        elif kind == "save_form":
            body = re.sub(
                r"raise exception 'Permission denied'",
                "raise exception '[save_room_inspection_form] Permission denied'",
                body,
                flags=re.I,
            )
            body = re.sub(
                r"raise exception 'Move-out forms require TAC'",
                "raise exception '[save_room_inspection_form] Move-out requires TAC'",
                body,
                flags=re.I,
            )
        elif kind == "close_year":
            body = re.sub(
                r"raise exception '([^']*(?:''[^']*)*)'",
                lambda m: (
                    f"raise exception '[close_school_year] {m.group(1)}'"
                    if not m.group(1).startswith("[")
                    else m.group(0)
                ),
                body,
                flags=re.I,
            )
        elif kind == "period_stats":
            body = re.sub(
                r"raise exception 'Permission denied'",
                "raise exception '[get_cadet_period_stats] Permission denied — viewer cannot access cadet history'",
                body,
                flags=re.I,
            )
        elif kind == "list_conduct":
            body = re.sub(
                r"raise exception 'Permission denied'",
                "raise exception '[list_cadets_by_conduct] Permission denied — company scope'",
                body,
                flags=re.I,
            )
        elif kind == "archive":
            body = body.replace(
                "raise exception 'Departure classification is required (non_return, withdrawn, suspended, dismissal)'",
                "raise exception '[archive_cadet_profile] departure_classification required (non_return, withdrawn, suspended, dismissal)'",
            )
        elif kind == "add_oversight":
            body = re.sub(
                r"if not public\.is_teacher_staff\(\) then\s+raise exception 'Permission denied';",
                "if not public.is_teacher_staff() then\n      raise exception '[add_manual_oversight] Permission denied — cadet cannot self-assign';",
                body,
                flags=re.I,
            )
            body = re.sub(
                r"raise exception 'Permission denied'",
                "raise exception '[add_manual_oversight] Permission denied'",
                body,
                flags=re.I,
            )
        elif kind == "remove_oversight":
            body = re.sub(
                r"raise exception 'Permission denied'",
                "raise exception '[remove_manual_oversight] Permission denied'",
                body,
                flags=re.I,
            )
        elif kind == "create_wo":
            replacements = {
                "Unauthorized": "[create_work_order] Unauthorized",
                "Insufficient permissions to submit work orders": "[create_work_order] Insufficient permissions to submit work orders",
                "Barracks room is required": "[create_work_order] Barracks room required for issue_type=barracks",
                "Location is required for non-barracks issues": "[create_work_order] Location is required for non-barracks issues",
                "Description is required": "[create_work_order] Description is required",
                "Invalid issue type": "[create_work_order] Invalid issue type",
            }
            for old, new in replacements.items():
                body = body.replace(f"raise exception '{old}'", f"raise exception '{new}'")

        out.append(body)

    pull_body = pull.replace(
        "RAISE EXCEPTION 'Permission Denied: Only the original issuer or Commandant Staff/Admins can pull this report.';",
        "RAISE EXCEPTION '[pull_report] Permission Denied — Only the original issuer or Commandant Staff/Admins can pull this report.';",
    )
    pull_body = pull_body.replace(
        "RAISE EXCEPTION 'Report not found.';",
        "RAISE EXCEPTION '[pull_report] Report not found.';",
    )
    pull_body = pull_body.replace(
        "RAISE EXCEPTION 'A comment is required to pull a report.';",
        "RAISE EXCEPTION '[pull_report] A comment is required to pull a report.';",
    )
    pull_match = re.search(
        r"CREATE OR REPLACE FUNCTION public\.pull_report[\s\S]+?\$function\$\s*;",
        pull_body,
        re.I,
    )
    if not pull_match:
        raise SystemExit("Missing pull_report")
    out.append(pull_match.group(0).strip())

    cat = extract_func(day05, "enforce_demerit_report_category")
    if not cat:
        raise SystemExit("Missing enforce_demerit_report_category")
    cat = cat.replace(
        "raise exception 'Invalid offense type.'",
        "raise exception '[enforce_demerit_report_category] Invalid offense type.'",
    )
    cat = cat.replace(
        "raise exception 'Category III Demerit Reports require Company TAC authority.'",
        "raise exception '[enforce_demerit_report_category] Category III Demerit Reports require Company TAC authority.'",
    )
    cat = cat.replace(
        "raise exception 'Category II Demerit Reports require Company TAC authority.'",
        "raise exception '[enforce_demerit_report_category] Category II Demerit Reports require Company TAC authority.'",
    )
    cat = cat.replace(
        "raise exception 'Your role is not authorized to submit this category of Demerit Report.'",
        "raise exception '[enforce_demerit_report_category] Your role is not authorized to submit this category of Demerit Report.'",
    )
    out.append(cat)

    path = MIG / "20260715000001_diagnostic_error_messages.sql"
    path.write_text(
        "-- Days 1-9 diagnostic error message prefixes for breakable RPCs\n\n"
        + "\n\n".join(out)
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {path} ({len(out)} blocks)")


if __name__ == "__main__":
    main()
