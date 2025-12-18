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
"[project]/app/reports/daily/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"400d13bc0b933642abcda76849a481afcdc7118b1a":"markReportAsPosted","4056525d1a228364898c1e551c99fb235c5bf76497":"getGreenSheetData","40c8a00bbfb22febf39e206a72a3284266a368f6ec":"unpostReport","40eb077abf2308cce444b06f75682395c85b4507e2":"publishGreenSheet"},"",""] */ __turbopack_context__.s([
    "getGreenSheetData",
    ()=>getGreenSheetData,
    "markReportAsPosted",
    ()=>markReportAsPosted,
    "publishGreenSheet",
    ()=>publishGreenSheet,
    "unpostReport",
    ()=>unpostReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function getGreenSheetData(dateStr) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    let query = supabase.from('demerit_reports').select(`
      id,
      date_of_offense,
      demerits_effective,
      notes,
      posted_at,
      subject:subject_cadet_id (first_name, last_name, cadet_rank, company:companies(company_name)),
      offense_type:offense_type_id (offense_name, policy_category),
      submitter:submitted_by (first_name, last_name)
    `).eq('status', 'completed').order('subject(last_name)', {
        ascending: true
    });
    if (dateStr) {
        // HISTORY MODE: Fetch items posted on this specific day
        const start = `${dateStr}T00:00:00.000Z`;
        const end = `${dateStr}T23:59:59.999Z`;
        query = query.gte('posted_at', start).lte('posted_at', end);
    } else {
        // PENDING MODE: Not yet posted
        query = query.is('posted_at', null);
    }
    const { data, error } = await query;
    if (error) {
        console.error('Error fetching green sheet:', error);
        return [];
    }
    // Flatten to match your existing GreenSheetReport type
    return data.map((r)=>{
        const sub = Array.isArray(r.subject) ? r.subject[0] : r.subject;
        const off = Array.isArray(r.offense_type) ? r.offense_type[0] : r.offense_type;
        const submitter = Array.isArray(r.submitter) ? r.submitter[0] : r.submitter;
        const comp = sub?.company ? Array.isArray(sub.company) ? sub.company[0] : sub.company : null;
        return {
            report_id: r.id,
            subject_name: `${sub?.last_name || 'Unknown'}, ${sub?.first_name || ''}`,
            company_name: comp?.company_name || null,
            offense_name: off?.offense_name || 'Unknown',
            policy_category: off?.policy_category || 0,
            demerits: r.demerits_effective,
            submitter_name: `${submitter?.last_name || 'System'}, ${submitter?.first_name ? submitter.first_name[0] + '.' : ''}`,
            date_of_offense: r.date_of_offense,
            notes: r.notes,
            posted_at: r.posted_at
        };
    });
}
async function publishGreenSheet(reportIds) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const now = new Date().toISOString();
    const { error } = await supabase.from('demerit_reports').update({
        posted_at: now
    }).in('id', reportIds);
    if (error) return {
        success: false,
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/reports/daily');
    return {
        success: true
    };
}
async function markReportAsPosted(reportId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const now = new Date().toISOString();
    const { error } = await supabase.from('demerit_reports').update({
        posted_at: now
    }).eq('id', reportId);
    if (error) return {
        success: false,
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/reports/daily');
    return {
        success: true
    };
}
async function unpostReport(reportId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from('demerit_reports').update({
        posted_at: null
    }).eq('id', reportId);
    if (error) return {
        success: false,
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/reports/daily');
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getGreenSheetData,
    publishGreenSheet,
    markReportAsPosted,
    unpostReport
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getGreenSheetData, "4056525d1a228364898c1e551c99fb235c5bf76497", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(publishGreenSheet, "40eb077abf2308cce444b06f75682395c85b4507e2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(markReportAsPosted, "400d13bc0b933642abcda76849a481afcdc7118b1a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(unpostReport, "40c8a00bbfb22febf39e206a72a3284266a368f6ec", null);
}),
"[project]/.next-internal/server/app/reports/daily/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/lib/server.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/reports/daily/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$reports$2f$daily$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/reports/daily/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
}),
"[project]/.next-internal/server/app/reports/daily/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/lib/server.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/reports/daily/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00bbeb251e9c0d92f5c1d1ca0bd9f7292fb081a58d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["triggerGreenSheetBlast"],
    "400d13bc0b933642abcda76849a481afcdc7118b1a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$reports$2f$daily$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["markReportAsPosted"],
    "4056525d1a228364898c1e551c99fb235c5bf76497",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$reports$2f$daily$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGreenSheetData"],
    "40c8a00bbfb22febf39e206a72a3284266a368f6ec",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$reports$2f$daily$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["unpostReport"],
    "40eb077abf2308cce444b06f75682395c85b4507e2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$reports$2f$daily$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["publishGreenSheet"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$reports$2f$daily$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$reports$2f$daily$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/reports/daily/page/actions.js { ACTIONS_MODULE0 => "[project]/app/lib/server.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/reports/daily/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$reports$2f$daily$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/reports/daily/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_2117d0da._.js.map