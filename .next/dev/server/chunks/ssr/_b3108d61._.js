module.exports = [
"[project]/app/submit/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40f919fd8d7486307a60549f7a4083a3a4a9d90a1a":"submitReport"},"",""] */ __turbopack_context__.s([
    "submitReport",
    ()=>submitReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function submitReport(payload) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: 'Unauthorized'
    };
    // 1. Fetch Offense Details
    const { data: offense } = await supabase.from('offense_types').select('demerits').eq('id', payload.offenseTypeId).single();
    if (!offense) return {
        error: "Invalid Offense Type."
    };
    // 2. FETCH APPROVER CHAIN (Double-Hop Logic)
    // Step A: Find the group the User belongs to (e.g., "Alpha TAC")
    const { data: userProfile } = await supabase.from('profiles').select('role:role_id (approval_group_id)').eq('id', user.id).single();
    const myGroupId = userProfile?.role?.approval_group_id;
    let targetGroupId = null;
    // Step B: Find the "Next Approver" for that group (e.g., "Commandant")
    if (myGroupId) {
        const { data: myGroup } = await supabase.from('approval_groups').select('next_approver_group_id').eq('id', myGroupId).single();
        targetGroupId = myGroup?.next_approver_group_id || null;
    }
    // 3. CONSTRUCT TIMESTAMP
    const combinedString = `${payload.dateOfOffense}T${payload.timeOfOffense}:00`;
    // 4. INSERT REPORT (And select ID for logging)
    const { data: newReport, error: insertError } = await supabase.from('demerit_reports').insert({
        subject_cadet_id: payload.cadetId,
        submitted_by: user.id,
        offense_type_id: payload.offenseTypeId,
        date_of_offense: combinedString,
        notes: payload.notes,
        report_explanation: payload.explanation,
        demerits_effective: offense.demerits,
        status: 'pending_approval',
        current_approver_group_id: targetGroupId // <--- Assigned to Boss, not Self
    }).select('id').single();
    if (insertError || !newReport) {
        console.error("Submit Error:", insertError?.message);
        return {
            error: insertError?.message || "Failed to create report"
        };
    }
    // 5. INSERT LOG ENTRY (Fixing missing log)
    const { error: logError } = await supabase.from('approval_log').insert({
        report_id: newReport.id,
        actor_id: user.id,
        action: 'submitted',
        comment: 'Report created',
        created_at: new Date().toISOString()
    });
    if (logError) console.error("Log Error:", logError.message);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    submitReport
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(submitReport, "40f919fd8d7486307a60549f7a4083a3a4a9d90a1a", null);
}),
"[project]/.next-internal/server/app/submit/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/submit/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$submit$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/submit/actions.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/submit/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/submit/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40f919fd8d7486307a60549f7a4083a3a4a9d90a1a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$submit$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["submitReport"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$submit$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$submit$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/submit/page/actions.js { ACTIONS_MODULE0 => "[project]/app/submit/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$submit$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/submit/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_b3108d61._.js.map