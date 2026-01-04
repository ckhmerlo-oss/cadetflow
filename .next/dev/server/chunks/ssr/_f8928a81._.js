module.exports = [
"[project]/app/lib/server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"003d249914f0fdaa5f07fe719abbebf0ccd70635ef":"triggerActionItemAlert","008dc5435b98ffe40db1157649db299a98f1175d9c":"triggerTourSheetAlert","00bbeb251e9c0d92f5c1d1ca0bd9f7292fb081a58d":"triggerGreenSheetBlast","60a9354997d0e98c4e1f47b9fe010afd97424d1759":"dispatchEmail","702af6792a7a9ca515664333f0db916ad72c57b298":"sendTestEmail"},"",""] */ __turbopack_context__.s([
    "dispatchEmail",
    ()=>dispatchEmail,
    "sendTestEmail",
    ()=>sendTestEmail,
    "triggerActionItemAlert",
    ()=>triggerActionItemAlert,
    "triggerGreenSheetBlast",
    ()=>triggerGreenSheetBlast,
    "triggerTourSheetAlert",
    ()=>triggerTourSheetAlert
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
const getAdmin = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://ejzvpknayvkggswejgkm.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY);
async function dispatchEmail(type, payload) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { session } } = await supabase.auth.getSession();
    // 1. Check Settings
    let settingKey = '';
    if (type === 'greensheet') settingKey = 'enable_email_blasts';
    if (type === 'alert') settingKey = 'enable_alert_ed'; // General bucket for alerts
    if (settingKey) {
        const { data: setting } = await supabase.from('system_settings').select('value').eq('key', settingKey).single();
        if (setting && setting.value === false) {
            console.log(`🚫 Email blocked by setting: ${settingKey}`);
            return {
                success: false,
                error: 'Disabled globally in settings'
            };
        }
    }
    // 2. Send via Edge Function
    try {
        const response = await fetch(`${("TURBOPACK compile-time value", "https://ejzvpknayvkggswejgkm.supabase.co")}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqenZwa25heXZrZ2dzd2VqZ2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzc1ODMsImV4cCI6MjA3NzQxMzU4M30.Bmf6dl5raXm1Y4Mrdctz6d8kfFOKkiCFmrm85YgKoJ8")}`
            },
            body: JSON.stringify({
                type,
                ...payload
            })
        });
        if (!response.ok) {
            const err = await response.text();
            console.error("Email Dispatch Failed:", err);
            return {
                success: false,
                error: err
            };
        }
        return {
            success: true
        };
    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
}
// --- HELPER: Filter IDs by Preference ---
async function filterRecipientsByPreference(userIds, preferenceCol) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: validPreferences } = await supabase.from('user_preferences').select('user_id').in('user_id', userIds).eq(preferenceCol, true);
    if (!validPreferences) return [];
    return validPreferences.map((p)=>p.user_id);
}
async function sendTestEmail(recipientsStr, subject, body) {
    const recipients = recipientsStr.split(',').map((e)=>e.trim()).filter((e)=>e.length > 0 && e.includes('@'));
    if (recipients.length === 0) return {
        success: false,
        error: "No valid email addresses found."
    };
    if (!subject) return {
        success: false,
        error: "Subject is required."
    };
    return dispatchEmail('test', {
        recipients,
        subject: `[TEST] ${subject}`,
        htmlContent: `
            <div style="font-family: sans-serif; padding: 20px; border: 2px dashed #ccc; background: #f9f9f9;">
                <h3 style="color: #555; margin-top: 0;">Test Email from CadetFlow</h3>
                <p style="white-space: pre-wrap;">${body}</p>
                <hr />
                <p style="font-size: 12px; color: #999;">Sent by Admin for testing purposes.</p>
            </div>
        `
    });
}
async function triggerGreenSheetBlast() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const admin = getAdmin();
    // 1. Get Content
    const { data: html, error: htmlError } = await supabase.rpc('generate_daily_email_html');
    if (htmlError || !html) return {
        success: false,
        error: "Failed to generate report HTML"
    };
    // 2. Get Faculty IDs
    const { data: facultyIds, error: facultyError } = await supabase.rpc('get_faculty_user_ids');
    if (facultyError || !facultyIds || facultyIds.length === 0) return {
        success: false,
        error: "No faculty found"
    };
    const candidateIds = facultyIds.map((f)=>f.id);
    // 3. Check Preferences
    const authorizedIds = await filterRecipientsByPreference(candidateIds, 'email_green_sheet');
    if (authorizedIds.length === 0) return {
        success: true,
        message: "No faculty have opted in."
    };
    // 4. Map to Emails
    const { data: users } = await admin.auth.admin.listUsers();
    const recipients = users.users.filter((u)=>authorizedIds.includes(u.id)).map((u)=>u.email).filter(Boolean);
    if (recipients.length === 0) return {
        success: false,
        error: "No valid emails found for authorized faculty."
    };
    return dispatchEmail('greensheet', {
        recipients,
        subject: `Daily Report - ${new Date().toLocaleDateString()}`,
        htmlContent: html
    });
}
async function triggerTourSheetAlert() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const admin = getAdmin();
    // 1. Get Debtors
    const { data: debtors, error: dbError } = await supabase.rpc('get_tour_sheet_debtors');
    if (dbError) return {
        success: false,
        error: dbError.message
    };
    if (!debtors || debtors.length === 0) return {
        success: true,
        message: "No one on the tour sheet."
    };
    // 2. Check Preferences
    const debtorIds = debtors.map((d)=>d.id);
    const authorizedIds = await filterRecipientsByPreference(debtorIds, 'email_tour_reminder');
    // 3. Map & Send
    const { data: users } = await admin.auth.admin.listUsers();
    let sentCount = 0;
    let lastError = null;
    for (const debtor of debtors){
        if (!authorizedIds.includes(debtor.id)) continue;
        const user = users.users.find((u)=>u.id === debtor.id);
        if (user?.email) {
            const res = await dispatchEmail('alert', {
                recipients: [
                    user.email
                ],
                subject: `Action Required: You are on the Tour Sheet`,
                htmlContent: `
                <h3>Tour Sheet Notification</h3>
                <p>You currently have a balance of <strong>${debtor.balance} Tours</strong>.</p>
                <p>You are required to march until this balance is cleared.</p>
              `
            });
            if (res.success) sentCount++;
            else lastError = res.error;
        }
    }
    // If we sent some, consider it a success, otherwise report error if 0 sent but people existed
    if (sentCount === 0 && authorizedIds.length > 0 && lastError) {
        return {
            success: false,
            error: lastError
        };
    }
    return {
        success: true,
        sent: sentCount
    };
}
async function triggerActionItemAlert() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const admin = getAdmin();
    const { data: activeUsers, error: dbError } = await supabase.rpc('get_users_with_pending_actions');
    if (dbError) return {
        success: false,
        error: dbError.message
    };
    if (!activeUsers || activeUsers.length === 0) return {
        success: true,
        message: "No pending actions."
    };
    const { data: users } = await admin.auth.admin.listUsers();
    let sentCount = 0;
    let lastError = null;
    for (const record of activeUsers){
        // Check Preferences (Manual check since logic is complex 'OR')
        const { data: prefs } = await supabase.from('user_preferences').select('email_new_report, email_status_change').eq('user_id', record.user_id).single();
        // If both are OFF, skip. If either is 'immediate' or 'digest', we nudge them.
        if (!prefs || prefs.email_new_report === 'off' && prefs.email_status_change === 'off') {
            continue;
        }
        const user = users.users.find((u)=>u.id === record.user_id);
        if (user?.email) {
            const items = [];
            if (record.approval_count > 0) items.push(`${record.approval_count} reports to approve`);
            if (record.revision_count > 0) items.push(`${record.revision_count} reports returned for revision`);
            if (record.appeal_count > 0) items.push(`${record.appeal_count} appeal updates`);
            const res = await dispatchEmail('alert', {
                recipients: [
                    user.email
                ],
                subject: `CadetFlow: You have ${record.approval_count + record.revision_count + record.appeal_count} Action Items`,
                htmlContent: `
                <h3>Action Required</h3>
                <p>You have pending items in your CadetFlow dashboard:</p>
                <ul>${items.map((i)=>`<li>${i}</li>`).join('')}</ul>
                <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}">Go to Dashboard</a></p>
              `
            });
            if (res.success) sentCount++;
            else lastError = res.error;
        }
    }
    if (sentCount === 0 && lastError) {
        return {
            success: false,
            error: lastError
        };
    }
    return {
        success: true,
        sent: sentCount
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    dispatchEmail,
    sendTestEmail,
    triggerGreenSheetBlast,
    triggerTourSheetAlert,
    triggerActionItemAlert
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(dispatchEmail, "60a9354997d0e98c4e1f47b9fe010afd97424d1759", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(sendTestEmail, "702af6792a7a9ca515664333f0db916ad72c57b298", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(triggerGreenSheetBlast, "00bbeb251e9c0d92f5c1d1ca0bd9f7292fb081a58d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(triggerTourSheetAlert, "008dc5435b98ffe40db1157649db299a98f1175d9c", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(triggerActionItemAlert, "003d249914f0fdaa5f07fe719abbebf0ccd70635ef", null);
}),
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
"[project]/.next-internal/server/app/report/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/lib/server.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/report/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/lib/server.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00bbeb251e9c0d92f5c1d1ca0bd9f7292fb081a58d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["triggerGreenSheetBlast"],
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
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$report$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/report/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/app/lib/server.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/report/[id]/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_f8928a81._.js.map