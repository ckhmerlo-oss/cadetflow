module.exports = [
"[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40a3e1aea32ee98a024ec4a4e72f61a51e3be8f308":"approveReportAction","40b9efaf0f915c3047878b52c0028887a9970e0cf0":"rejectReportAction","601825c1ce798c77ae07c6930e3a294bdc9c1e2f2a":"pullReportAction","60192ef86ff1a9f52338794329fc736417cb466ad9":"kickBackReportAction","601988c3fb101e9d27b98c8bfc536938e860e50edc":"resubmitReport","60b2e9c55889ac9c331e7fad367eb309d805d67e0f":"editAndApproveReport"},"",""] */ __turbopack_context__.s([
    "approveReportAction",
    ()=>approveReportAction,
    "editAndApproveReport",
    ()=>editAndApproveReport,
    "kickBackReportAction",
    ()=>kickBackReportAction,
    "pullReportAction",
    ()=>pullReportAction,
    "rejectReportAction",
    ()=>rejectReportAction,
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
async function approveReportAction(reportId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: 'Unauthorized'
    };
    // Fetch current report state to find next approver
    const { data: report } = await supabase.from('demerit_reports').select('current_approver_group_id').eq('id', reportId).single();
    if (!report) return {
        error: 'Report not found'
    };
    // Find the next group in the chain
    const { data: currentGroup } = await supabase.from('approval_groups').select('next_approver_group_id').eq('id', report.current_approver_group_id).single();
    const nextGroupId = currentGroup?.next_approver_group_id || null;
    const newStatus = nextGroupId ? 'pending_approval' : 'completed';
    const { error } = await supabase.from('demerit_reports').update({
        status: newStatus,
        current_approver_group_id: nextGroupId
    }).eq('id', reportId);
    if (error) return {
        error: error.message
    };
    // Log it
    await supabase.from('approval_log').insert({
        report_id: reportId,
        actor_id: user.id,
        action: 'approved',
        comment: 'Approved'
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/report/${reportId}`);
    return {
        success: true
    };
}
async function rejectReportAction(reportId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: 'Unauthorized'
    };
    const { error } = await supabase.from('demerit_reports').update({
        status: 'rejected',
        current_approver_group_id: null
    }).eq('id', reportId);
    if (error) return {
        error: error.message
    };
    await supabase.from('approval_log').insert({
        report_id: reportId,
        actor_id: user.id,
        action: 'rejected',
        comment: 'Rejected by approver'
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/report/${reportId}`);
    return {
        success: true
    };
}
async function kickBackReportAction(reportId, reason) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: 'Unauthorized'
    };
    // Get user's group to mark who kicked it back
    const { data: profile } = await supabase.from('profiles').select('role:roles(approval_group_id)').eq('id', user.id).single();
    const myGroupId = profile?.role?.approval_group_id;
    const { error } = await supabase.from('demerit_reports').update({
        status: 'needs_revision',
        revision_by_group_id: myGroupId
    }).eq('id', reportId);
    if (error) return {
        error: error.message
    };
    await supabase.from('approval_log').insert({
        report_id: reportId,
        actor_id: user.id,
        action: 'Kicked Back for Revision',
        comment: reason
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/report/${reportId}`);
    return {
        success: true
    };
}
async function pullReportAction(reportId, comment) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('demerit_reports').update({
        status: 'pulled',
        current_approver_group_id: null
    }).eq('id', reportId);
    if (error) return {
        error: error.message
    };
    await supabase.from('approval_log').insert({
        report_id: reportId,
        actor_id: user?.id,
        action: 'pulled',
        comment: comment
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/report/${reportId}`);
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
    // Recalculate Approver Chain
    const { data: userProfile } = await supabase.from('profiles').select('role:roles(approval_group_id)').eq('id', user.id).single();
    const myGroupId = userProfile?.role?.approval_group_id;
    let targetGroupId = null;
    if (myGroupId) {
        const { data: myGroup } = await supabase.from('approval_groups').select('next_approver_group_id').eq('id', myGroupId).single();
        targetGroupId = myGroup?.next_approver_group_id || null;
    }
    let status = 'pending_approval';
    if (myGroupId && !targetGroupId) {
        status = 'completed';
    }
    const { error: updateError } = await supabase.from('demerit_reports').update({
        offense_type_id: payload.offenseTypeId,
        notes: payload.notes,
        report_explanation: payload.reportExplanation,
        date_of_offense: payload.dateOfOffense,
        status: status,
        current_approver_group_id: targetGroupId,
        revision_by_group_id: null
    }).eq('id', reportId);
    if (updateError) return {
        error: updateError.message
    };
    await supabase.from('approval_log').insert({
        report_id: reportId,
        actor_id: user.id,
        action: 'resubmitted',
        comment: 'Report revised and resubmitted'
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/report/${reportId}`);
    return {
        success: true
    };
}
async function editAndApproveReport(reportId, payload) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: 'Unauthorized'
    };
    // Verify Permission
    const { data: profile } = await supabase.from('profiles').select('role:roles(default_role_level)').eq('id', user.id).single();
    const roleLevel = profile?.role?.default_role_level || 0;
    if (roleLevel < 90) return {
        error: 'Insufficient permissions'
    };
    // Force Complete
    const { error: updateError } = await supabase.from('demerit_reports').update({
        offense_type_id: payload.offenseTypeId,
        notes: payload.notes,
        report_explanation: payload.reportExplanation,
        date_of_offense: payload.dateOfOffense,
        status: 'completed',
        current_approver_group_id: null,
        revision_by_group_id: null
    }).eq('id', reportId);
    if (updateError) return {
        error: updateError.message
    };
    await supabase.from('approval_log').insert({
        report_id: reportId,
        actor_id: user.id,
        action: 'edited_and_approved',
        comment: 'Report edited and immediately approved by authority'
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/report/${reportId}`);
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    approveReportAction,
    rejectReportAction,
    kickBackReportAction,
    pullReportAction,
    resubmitReport,
    editAndApproveReport
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(approveReportAction, "40a3e1aea32ee98a024ec4a4e72f61a51e3be8f308", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(rejectReportAction, "40b9efaf0f915c3047878b52c0028887a9970e0cf0", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(kickBackReportAction, "60192ef86ff1a9f52338794329fc736417cb466ad9", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(pullReportAction, "601825c1ce798c77ae07c6930e3a294bdc9c1e2f2a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(resubmitReport, "601988c3fb101e9d27b98c8bfc536938e860e50edc", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(editAndApproveReport, "60b2e9c55889ac9c331e7fad367eb309d805d67e0f", null);
}),
"[project]/.next-internal/server/app/report/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/report/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40a3e1aea32ee98a024ec4a4e72f61a51e3be8f308",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["approveReportAction"],
    "40b9efaf0f915c3047878b52c0028887a9970e0cf0",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rejectReportAction"],
    "601825c1ce798c77ae07c6930e3a294bdc9c1e2f2a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pullReportAction"],
    "60192ef86ff1a9f52338794329fc736417cb466ad9",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["kickBackReportAction"],
    "601988c3fb101e9d27b98c8bfc536938e860e50edc",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resubmitReport"],
    "60b2e9c55889ac9c331e7fad367eb309d805d67e0f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["editAndApproveReport"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$report$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/report/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_cf3d42dc._.js.map