module.exports = [
"[project]/app/incidents/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00e4f1a0ba0cc7d8a046021ef05aa736acf6732c44":"getFacultyList","406e64145935d3c85c96a65916dd8989009b3202e5":"getIncidents","408344156e4ed25a1fde2a16b1330b0e00502be22b":"getIncident","40ea4824ebb15e230302cbedc00d4d62f0c65d0aa6":"submitIncident","7035c2aaaf1773684eb282a8a9910abbd39397ec48":"resolveAsHandled","7076eee2a0cf223033228c5b7d0ef86c0eebc0d9f7":"convertToDemerit"},"",""] */ __turbopack_context__.s([
    "convertToDemerit",
    ()=>convertToDemerit,
    "getFacultyList",
    ()=>getFacultyList,
    "getIncident",
    ()=>getIncident,
    "getIncidents",
    ()=>getIncidents,
    "resolveAsHandled",
    ()=>resolveAsHandled,
    "submitIncident",
    ()=>submitIncident
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function getIncidents(filter = 'pending') {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    // Get Viewer Profile
    const { data: viewer } = await supabase.from('profiles').select('company_id, role:roles!inner(default_role_level)').eq('id', user.id).single();
    const roleLevel = viewer?.role?.default_role_level || 0;
    const viewerCompanyId = viewer?.company_id;
    // Base Query
    let query = supabase.from('incident_reports').select(`
      *,
      reporter:profiles!reporter_id(first_name, last_name),
      subject:profiles!subject_cadet_id(first_name, last_name, company_id, company:companies(company_name)),
      resolver:profiles!resolved_by(first_name, last_name),
      handler:profiles!handled_by_id(first_name, last_name)
    `).order('created_at', {
        ascending: false
    });
    if (filter === 'pending') query = query.eq('status', 'pending');
    else if (filter === 'resolved') query = query.in('status', [
        'handled',
        'converted'
    ]);
    const { data, error } = await query;
    if (error) {
        console.error('Error fetching incidents:', error);
        return [];
    }
    let result = data;
    // FILTER: If TAC (65-89), only show own company
    // Admins (90+) see all. Faculty (50-64) see own submissions (handled by RLS usually, but safe to filter here too).
    if (roleLevel >= 65 && roleLevel < 90) {
        result = result.filter((r)=>r.subject?.company_id === viewerCompanyId);
    }
    return result;
}
async function submitIncident(payload) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: 'Unauthorized'
    };
    const rows = payload.cadetIds.map((cadetId)=>({
            reporter_id: user.id,
            subject_cadet_id: cadetId,
            description: payload.description,
            location: payload.location,
            incident_time: payload.incident_time,
            action_taken: payload.action_taken || null,
            status: 'pending'
        }));
    const { error } = await supabase.from('incident_reports').insert(rows);
    if (error) return {
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/incidents');
    return {
        success: true
    };
}
async function resolveAsHandled(incidentId, notes, handledById) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: 'Unauthorized'
    };
    // 1. Update Incident
    const { data: incident, error: updateError } = await supabase.from('incident_reports').update({
        status: 'handled',
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
        resolution_notes: notes,
        handled_by_id: handledById
    }).eq('id', incidentId).select().single();
    if (updateError) return {
        error: updateError.message
    };
    // 2. Log to Ledger (0 value history)
    const { error: ledgerError } = await supabase.from('tour_ledger').insert({
        cadet_id: incident.subject_cadet_id,
        staff_id: handledById,
        amount: 0,
        action: 'adjustment',
        comment: `Incident Handled: ${notes}`
    });
    if (ledgerError) console.error("Ledger logging failed:", ledgerError);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/incidents');
    return {
        success: true
    };
}
async function convertToDemerit(incidentId, offenseTypeId, greenSheetSummary) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: 'Unauthorized'
    };
    // 1. Get Incident Data
    const { data: incident } = await supabase.from('incident_reports').select('*').eq('id', incidentId).single();
    if (!incident) return {
        error: "Incident not found"
    };
    // 2. Get Offense Details
    const { data: offense } = await supabase.from('offense_types').select('demerits').eq('id', offenseTypeId).single();
    if (!offense) return {
        error: "Offense type not found"
    };
    // 3. FETCH APPROVAL CHAIN (Double-Hop)
    const { data: userProfile } = await supabase.from('profiles').select('role:role_id (approval_group_id)').eq('id', user.id).single();
    const myGroupId = userProfile?.role?.approval_group_id;
    let nextGroupId = null;
    if (myGroupId) {
        const { data: myGroup } = await supabase.from('approval_groups').select('next_approver_group_id').eq('id', myGroupId).single();
        nextGroupId = myGroup?.next_approver_group_id || null;
    }
    // --- FIX: FORCE EASTERN TIME DATE STRING ---
    // We create a date object from the incident time
    const incidentDateObj = new Date(incident.incident_time);
    // We format it specifically to 'en-CA' (which gives YYYY-MM-DD) 
    // AND force the timeZone to New York. This ensures 8pm EST is still "Today", not "Tomorrow" (UTC).
    const safeDateOfOffense = incidentDateObj.toLocaleDateString('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    // --------------------------------
    // 4. Create Report
    const { data: newReport, error: insertError } = await supabase.from('demerit_reports').insert({
        subject_cadet_id: incident.subject_cadet_id,
        offense_type_id: offenseTypeId,
        submitted_by: incident.reporter_id,
        date_of_offense: safeDateOfOffense,
        notes: greenSheetSummary,
        report_explanation: incident.description,
        demerits_effective: offense.demerits,
        status: 'pending_approval',
        linked_incident_id: incidentId,
        current_approver_group_id: nextGroupId
    }).select('id').single();
    if (insertError || !newReport) {
        console.error("Conversion Error:", insertError);
        return {
            error: "Failed to create report: " + insertError?.message
        };
    }
    // 5. INSERT LOGS
    // A. "Submitted" Log (Backdated)
    await supabase.from('approval_log').insert({
        report_id: newReport.id,
        actor_id: incident.reporter_id,
        action: 'submitted',
        comment: 'Original Incident Report filed.',
        created_at: incident.created_at
    });
    // B. "Converted" Log (Current Time)
    await supabase.from('approval_log').insert({
        report_id: newReport.id,
        actor_id: user.id,
        action: 'converted',
        comment: `Converted to demerit report. (Explanation moved to private narrative)`,
        created_at: new Date().toISOString()
    });
    // 6. Close Incident
    await supabase.from('incident_reports').update({
        status: 'converted',
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
        resolution_notes: "Converted to Demerit Report"
    }).eq('id', incidentId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/incidents');
    return {
        success: true
    };
}
async function getFacultyList() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // Fetch everyone level 50+ (Faculty, TACs, Admin)
    const { data } = await supabase.from('profiles').select(`
            id, 
            first_name, 
            last_name, 
            role:roles!inner(default_role_level, role_name)
        `).gte('role.default_role_level', 50).order('last_name');
    return data?.map((p)=>({
            id: p.id,
            // Label includes role to verify who is who
            label: `${p.last_name}, ${p.first_name} (${p.role.role_name})`
        })) || [];
}
async function getIncident(id) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from('incident_reports').select(`
      *,
      reporter:profiles!reporter_id(first_name, last_name),
      subject:profiles!subject_cadet_id(first_name, last_name, company:companies(company_name)),
      resolver:profiles!resolved_by(first_name, last_name),
      handler:profiles!handled_by_id(first_name, last_name)
    `).eq('id', id).single();
    if (error) return null;
    return data;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getIncidents,
    submitIncident,
    resolveAsHandled,
    convertToDemerit,
    getFacultyList,
    getIncident
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getIncidents, "406e64145935d3c85c96a65916dd8989009b3202e5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(submitIncident, "40ea4824ebb15e230302cbedc00d4d62f0c65d0aa6", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(resolveAsHandled, "7035c2aaaf1773684eb282a8a9910abbd39397ec48", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(convertToDemerit, "7076eee2a0cf223033228c5b7d0ef86c0eebc0d9f7", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getFacultyList, "00e4f1a0ba0cc7d8a046021ef05aa736acf6732c44", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getIncident, "408344156e4ed25a1fde2a16b1330b0e00502be22b", null);
}),
"[project]/.next-internal/server/app/action-items/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/incidents/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/incidents/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/action-items/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/incidents/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00e4f1a0ba0cc7d8a046021ef05aa736acf6732c44",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getFacultyList"],
    "406e64145935d3c85c96a65916dd8989009b3202e5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getIncidents"],
    "408344156e4ed25a1fde2a16b1330b0e00502be22b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getIncident"],
    "40ea4824ebb15e230302cbedc00d4d62f0c65d0aa6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["submitIncident"],
    "7035c2aaaf1773684eb282a8a9910abbd39397ec48",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAsHandled"],
    "7076eee2a0cf223033228c5b7d0ef86c0eebc0d9f7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convertToDemerit"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$action$2d$items$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$incidents$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/action-items/page/actions.js { ACTIONS_MODULE0 => "[project]/app/incidents/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/incidents/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_170ada6a._.js.map