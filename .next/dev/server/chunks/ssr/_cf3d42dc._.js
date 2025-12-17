module.exports = [
"[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"601825c1ce798c77ae07c6930e3a294bdc9c1e2f2a":"pullReportAction","601988c3fb101e9d27b98c8bfc536938e860e50edc":"resubmitReport"},"",""] */ __turbopack_context__.s([
    "pullReportAction",
    ()=>pullReportAction,
    "resubmitReport",
    ()=>resubmitReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function pullReportAction(reportId, comment) {
    // ... (existing code) ...
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.rpc('pull_report', {
        p_report_id: reportId,
        p_comment: comment
    });
    if (error) return {
        error: `Action failed: ${error.message}`
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/report/${reportId}`);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/ledger/[id]`, 'layout');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/manage');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
    return {
        success: true
    };
}
async function resubmitReport(reportId, payload) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: 'Unauthorized'
    };
    // 1. Recalculate Approver Chain (Same logic as Submit)
    const { data: userProfile } = await supabase.from('profiles').select('role:role_id (approval_group_id)').eq('id', user.id).single();
    const myGroupId = userProfile?.role?.approval_group_id;
    let targetGroupId = null;
    if (myGroupId) {
        const { data: myGroup } = await supabase.from('approval_groups').select('next_approver_group_id').eq('id', myGroupId).single();
        targetGroupId = myGroup?.next_approver_group_id || null;
    }
    // 2. Check for Auto-Approval
    let status = 'pending_approval';
    let isAutoApproved = false;
    if (myGroupId && !targetGroupId) {
        status = 'completed';
        isAutoApproved = true;
    }
    // 3. Update Report
    const { error: updateError } = await supabase.from('demerit_reports').update({
        offense_type_id: payload.offenseTypeId,
        notes: payload.notes,
        report_explanation: payload.reportExplanation,
        date_of_offense: payload.dateOfOffense,
        status: status,
        current_approver_group_id: targetGroupId,
        revision_by_group_id: null // Clear the revision flag
    }).eq('id', reportId);
    if (updateError) return {
        error: updateError.message
    };
    // 4. Log
    await supabase.from('approval_log').insert({
        report_id: reportId,
        actor_id: user.id,
        action: 'resubmitted',
        comment: 'Report revised and resubmitted'
    });
    if (isAutoApproved) {
        await supabase.from('approval_log').insert({
            report_id: reportId,
            actor_id: user.id,
            action: 'approved',
            comment: 'Auto-approved (Final Authority)'
        });
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/report/${reportId}`);
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    pullReportAction,
    resubmitReport
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(pullReportAction, "601825c1ce798c77ae07c6930e3a294bdc9c1e2f2a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(resubmitReport, "601988c3fb101e9d27b98c8bfc536938e860e50edc", null);
}),
"[project]/.next-internal/server/app/report/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)");
;
;
}),
"[project]/.next-internal/server/app/report/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "601825c1ce798c77ae07c6930e3a294bdc9c1e2f2a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pullReportAction"],
    "601988c3fb101e9d27b98c8bfc536938e860e50edc",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resubmitReport"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$report$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/report/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_cf3d42dc._.js.map