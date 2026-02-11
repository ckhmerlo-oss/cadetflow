module.exports = [
"[project]/app/components/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40051c0b86095af35cc3db8d7f26d35ce2872481a5":"submitFeedback"},"",""] */ __turbopack_context__.s([
    "submitFeedback",
    ()=>submitFeedback
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function submitFeedback(data) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // 1. Save to Database
    const { error: dbError } = await supabase.from('feedback').insert({
        feedback_type: data.feedbackType,
        page_url: data.pageUrl,
        content: data.content
    });
    if (dbError) {
        console.error('Feedback DB Error:', dbError);
        return {
            success: false,
            error: 'Failed to save feedback to database.'
        };
    }
    // 2. Trigger Email Notification via Supabase Edge Function
    try {
        const emailPayload = {
            type: 'alert',
            recipients: [
                'merlock@fuma.org'
            ],
            subject: `[CadetFlow Feedback] ${data.feedbackType.toUpperCase()}`,
            htmlContent: `
        <h2>New Feedback Received</h2>
        <p><strong>Type:</strong> ${data.feedbackType}</p>
        <p><strong>Page:</strong> ${data.pageUrl}</p>
        <hr />
        <h3>Message:</h3>
        <blockquote style="background: #f9f9f9; border-left: 5px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
            ${data.content.replace(/\n/g, '<br/>')}
        </blockquote>
      `
        };
        // --- UPDATED: Use supabase.functions.invoke ---
        const { error: funcError } = await supabase.functions.invoke('send-email', {
            body: emailPayload
        });
        if (funcError) {
            console.error('Feedback Email Invocation Error:', funcError);
        // We don't fail the request here because the DB insert succeeded,
        // but you will now see this error in your Next.js Server Terminal.
        }
    } catch (err) {
        console.error('Unexpected Feedback Error:', err);
    }
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    submitFeedback
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(submitFeedback, "40051c0b86095af35cc3db8d7f26d35ce2872481a5", null);
}),
"[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40a3e1aea32ee98a024ec4a4e72f61a51e3be8f308":"approveReportAction","40b9efaf0f915c3047878b52c0028887a9970e0cf0":"rejectReportAction","60192ef86ff1a9f52338794329fc736417cb466ad9":"kickBackReportAction","601988c3fb101e9d27b98c8bfc536938e860e50edc":"resubmitReport","60415971ff989601457ebc0244a4a8ff71b4be2994":"pullReport","60b2e9c55889ac9c331e7fad367eb309d805d67e0f":"editAndApproveReport"},"",""] */ __turbopack_context__.s([
    "approveReportAction",
    ()=>approveReportAction,
    "editAndApproveReport",
    ()=>editAndApproveReport,
    "kickBackReportAction",
    ()=>kickBackReportAction,
    "pullReport",
    ()=>pullReport,
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
    // 1. Check User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error("DEBUG: No authenticated user found.");
        return {
            error: 'Unauthorized: No user session.'
        };
    }
    console.log(`DEBUG: Attempting approval for Report ${reportId} by User ${user.id}`);
    // 2. Fetch User's Role & Group
    // FIX: Changed 'name' to 'role_name' in the select string
    const { data: userProfile, error: profileError } = await supabase.from('profiles').select('id, role:roles(id, role_name, approval_group_id)').eq('id', user.id).eq('archived', false).single();
    if (profileError || !userProfile) {
        console.error("DEBUG: Could not fetch user profile/role", profileError);
        return {
            error: `Profile Error: ${profileError?.message || 'Profile not found'}`
        };
    }
    const myGroupId = userProfile.role?.approval_group_id;
    // FIX: Updated the log to read 'role_name'
    console.log(`DEBUG: User's Group ID: ${myGroupId} (Role: ${userProfile.role?.role_name})`);
    // 3. Fetch Report State (The "Lock" on the RLS Policy)
    const { data: report, error: reportError } = await supabase.from('demerit_reports').select('id, current_approver_group_id, status').eq('id', reportId).single();
    if (reportError || !report) {
        console.error("DEBUG: Could not fetch report", reportError);
        return {
            error: `Report Error: ${reportError?.message || 'Report not found'}`
        };
    }
    console.log(`DEBUG: Report's Current Group ID: ${report.current_approver_group_id}`);
    console.log(`DEBUG: Report Status: ${report.status}`);
    // 4. VERIFY PERMISSION MATCH
    // This is the logic your RLS "USING" clause uses. If this is false, RLS will block you.
    if (report.current_approver_group_id !== myGroupId) {
        const msg = `DEBUG MISMATCH: User Group (${myGroupId}) != Report Group (${report.current_approver_group_id})`;
        console.error(msg);
        return {
            error: `Permission Denied: You are in group ${myGroupId}, but report is with group ${report.current_approver_group_id}`
        };
    }
    // 5. Determine Next Step
    const { data: currentGroup } = await supabase.from('approval_groups').select('next_approver_group_id').eq('id', report.current_approver_group_id).single();
    const nextGroupId = currentGroup?.next_approver_group_id || null;
    const newStatus = nextGroupId ? 'pending_approval' : 'completed';
    console.log(`DEBUG: Advancing to Group: ${nextGroupId} | New Status: ${newStatus}`);
    // 6. Perform Update
    const { error: updateError } = await supabase.from('demerit_reports').update({
        status: newStatus,
        current_approver_group_id: nextGroupId
    }).eq('id', reportId);
    if (updateError) {
        console.error("DEBUG: Update Failed", updateError);
        // Return the raw database error to the UI
        return {
            error: `DB Update Failed: ${updateError.message} (Code: ${updateError.code})`
        };
    }
    // 7. Log Success
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
    const { data: profile } = await supabase.from('profiles').select('role:roles(approval_group_id)').eq('id', user.id).eq('archived', false).single();
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
async function pullReport(reportId, comment) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        success: false,
        error: 'Unauthorized'
    };
    const { data: report } = await supabase.from('demerit_reports').select('submitted_by, status').eq('id', reportId).single();
    if (!report) return {
        success: false,
        error: 'Report not found'
    };
    // Get User Role for Override
    const { data: profile } = await supabase.from('profiles').select('role:roles(default_role_level)').eq('id', user.id).eq('archived', false).single();
    const roleLevel = profile?.role?.default_role_level || 0;
    const isSubmitter = report.submitted_by === user.id;
    const isCommandant = roleLevel >= 90;
    // Guard Clause
    if (!isSubmitter && !isCommandant) {
        return {
            success: false,
            error: 'Permission Denied: You cannot pull this report.'
        };
    }
    // ---------------------------------------------
    if (report.status === 'pulled') {
        return {
            success: false,
            error: 'This report is already pulled.'
        };
    }
    // 2. Update to 'Pulled', Zero Demerits, Remove from Approval Chain
    const { error } = await supabase.from('demerit_reports').update({
        status: 'pulled',
        current_approver_group_id: null,
        demerits_effective: 0,
        revision_by_group_id: null // Ensure it doesn't appear in anyone's revision queue
    }).eq('id', reportId);
    if (error) {
        console.error('Pull Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
    // 3. Log the action
    await supabase.from('approval_log').insert({
        report_id: reportId,
        actor_id: user.id,
        action: 'pulled',
        comment: comment
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/report/${reportId}`);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/reports/submitted');
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
    const { data: userProfile } = await supabase.from('profiles').select('role:roles(approval_group_id)').eq('id', user.id).eq('archived', false).single();
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
    const { data: profile } = await supabase.from('profiles').select('role:roles(default_role_level)').eq('id', user.id).eq('archived', false).single();
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
    pullReport,
    resubmitReport,
    editAndApproveReport
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(approveReportAction, "40a3e1aea32ee98a024ec4a4e72f61a51e3be8f308", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(rejectReportAction, "40b9efaf0f915c3047878b52c0028887a9970e0cf0", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(kickBackReportAction, "60192ef86ff1a9f52338794329fc736417cb466ad9", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(pullReport, "60415971ff989601457ebc0244a4a8ff71b4be2994", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(resubmitReport, "601988c3fb101e9d27b98c8bfc536938e860e50edc", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(editAndApproveReport, "60b2e9c55889ac9c331e7fad367eb309d805d67e0f", null);
}),
"[project]/.next-internal/server/app/report/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/components/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/report/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/components/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40051c0b86095af35cc3db8d7f26d35ce2872481a5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["submitFeedback"],
    "40a3e1aea32ee98a024ec4a4e72f61a51e3be8f308",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["approveReportAction"],
    "40b9efaf0f915c3047878b52c0028887a9970e0cf0",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rejectReportAction"],
    "60192ef86ff1a9f52338794329fc736417cb466ad9",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["kickBackReportAction"],
    "601988c3fb101e9d27b98c8bfc536938e860e50edc",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resubmitReport"],
    "60415971ff989601457ebc0244a4a8ff71b4be2994",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pullReport"],
    "60b2e9c55889ac9c331e7fad367eb309d805d67e0f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["editAndApproveReport"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$report$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$components$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/report/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/app/components/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_ede708ab._.js.map