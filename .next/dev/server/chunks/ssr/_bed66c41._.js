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
    // 2. FETCH APPROVER CHAIN
    // Step A: Find the group the User belongs to
    const { data: userProfile } = await supabase.from('profiles').select('role:role_id (approval_group_id)').eq('id', user.id).eq('archived', false).single();
    const myGroupId = userProfile?.role?.approval_group_id;
    let targetGroupId = null;
    // Step B: Find the "Next Approver"
    if (myGroupId) {
        const { data: myGroup } = await supabase.from('approval_groups').select('next_approver_group_id').eq('id', myGroupId).single();
        targetGroupId = myGroup?.next_approver_group_id || null;
    }
    // 3. DETERMINE STATUS (Fix for Issue #1)
    // If the user has a group, but there is NO next group, they are the Final Approver (Commandant).
    // We auto-approve the report.
    let status = 'pending_approval';
    let isAutoApproved = false;
    if (myGroupId && !targetGroupId) {
        status = 'completed';
        isAutoApproved = true;
    }
    // 4. INSERT REPORT
    const combinedString = `${payload.dateOfOffense}T${payload.timeOfOffense}:00`;
    const { data: newReport, error: insertError } = await supabase.from('demerit_reports').insert({
        subject_cadet_id: payload.cadetId,
        submitted_by: user.id,
        offense_type_id: payload.offenseTypeId,
        date_of_offense: combinedString,
        notes: payload.notes,
        report_explanation: payload.explanation,
        demerits_effective: offense.demerits,
        status: status,
        current_approver_group_id: targetGroupId
    }).select('id').single();
    if (insertError || !newReport) {
        return {
            error: insertError?.message || "Failed to create report"
        };
    }
    // 5. LOGGING
    // Initial Submission Log
    await supabase.from('approval_log').insert({
        report_id: newReport.id,
        actor_id: user.id,
        action: 'submitted',
        comment: 'Report created',
        created_at: new Date().toISOString()
    });
    // If auto-approved, add a second log entry
    if (isAutoApproved) {
        await supabase.from('approval_log').insert({
            report_id: newReport.id,
            actor_id: user.id,
            action: 'approved',
            comment: 'Auto-approved (Final Authority)',
            created_at: new Date(Date.now() + 1000).toISOString() // +1 sec to ensure order
        });
    }
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
"[project]/.next-internal/server/app/submit/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/components/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/submit/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$submit$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/submit/actions.ts [app-rsc] (ecmascript)");
;
;
}),
"[project]/.next-internal/server/app/submit/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/components/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/submit/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40051c0b86095af35cc3db8d7f26d35ce2872481a5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["submitFeedback"],
    "40f919fd8d7486307a60549f7a4083a3a4a9d90a1a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$submit$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["submitReport"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$submit$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$components$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$submit$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/submit/page/actions.js { ACTIONS_MODULE0 => "[project]/app/components/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/submit/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$submit$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/submit/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_bed66c41._.js.map