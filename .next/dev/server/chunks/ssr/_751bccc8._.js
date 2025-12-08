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
    // 1. Check Settings (Skipped for 'test')
    let settingKey = '';
    if (type === 'greensheet') settingKey = 'enable_email_blasts';
    if (type === 'alert') settingKey = 'enable_alert_ed';
    if (settingKey) {
        const { data: setting } = await supabase.from('system_settings').select('value').eq('key', settingKey).single();
        if (setting && setting.value === false) {
            console.log(`🚫 Email blocked by setting: ${settingKey}`);
            return {
                success: false,
                reason: 'Disabled globally'
            };
        }
    }
    // 2. Send via Edge Function
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
}
async function sendTestEmail(recipientsStr, subject, body) {
    // 1. Parse Recipients
    const recipients = recipientsStr.split(',').map((e)=>e.trim()).filter((e)=>e.length > 0 && e.includes('@'));
    if (recipients.length === 0) return {
        success: false,
        error: "No valid email addresses found."
    };
    if (!subject) return {
        success: false,
        error: "Subject is required."
    };
    // 2. Dispatch
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
// ... (Existing Trigger Functions: triggerGreenSheetBlast, triggerTourSheetAlert, triggerActionItemAlert remain unchanged) ...
// --- RE-EXPORTING EXISTING FUNCTIONS TO MAINTAIN FILE INTEGRITY ---
async function filterRecipientsByPreference(userIds, preferenceCol) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: validPreferences } = await supabase.from('user_preferences').select('user_id').in('user_id', userIds).eq(preferenceCol, true);
    if (!validPreferences) return [];
    return validPreferences.map((p)=>p.user_id);
}
async function triggerGreenSheetBlast() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const admin = getAdmin();
    const { data: html } = await supabase.rpc('generate_daily_email_html');
    if (!html) return {
        error: "Failed to generate HTML"
    };
    const { data: facultyIds } = await supabase.rpc('get_faculty_user_ids');
    if (!facultyIds || facultyIds.length === 0) return {
        error: "No faculty found"
    };
    const candidateIds = facultyIds.map((f)=>f.id);
    const authorizedIds = await filterRecipientsByPreference(candidateIds, 'email_green_sheet');
    if (authorizedIds.length === 0) return {
        success: true,
        message: "No faculty have opted in."
    };
    const { data: users } = await admin.auth.admin.listUsers();
    const recipients = users.users.filter((u)=>authorizedIds.includes(u.id)).map((u)=>u.email).filter(Boolean);
    return dispatchEmail('greensheet', {
        recipients,
        subject: `Daily Report - ${new Date().toLocaleDateString()}`,
        htmlContent: html
    });
}
async function triggerTourSheetAlert() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const admin = getAdmin();
    const { data: debtors } = await supabase.rpc('get_tour_sheet_debtors');
    if (!debtors || debtors.length === 0) return {
        success: true,
        message: "No one on the tour sheet."
    };
    const debtorIds = debtors.map((d)=>d.id);
    const authorizedIds = await filterRecipientsByPreference(debtorIds, 'email_tour_reminder');
    const { data: users } = await admin.auth.admin.listUsers();
    let sentCount = 0;
    for (const debtor of debtors){
        if (!authorizedIds.includes(debtor.id)) continue;
        const user = users.users.find((u)=>u.id === debtor.id);
        if (user?.email) {
            await dispatchEmail('alert', {
                recipients: [
                    user.email
                ],
                subject: `Action Required: You are on the Tour Sheet`,
                htmlContent: `<h3>Tour Sheet Notification</h3><p>You currently have a balance of <strong>${debtor.balance} Tours</strong>.</p><p>You are required to march until this balance is cleared.</p>`
            });
            sentCount++;
        }
    }
    return {
        success: true,
        sent: sentCount
    };
}
async function triggerActionItemAlert() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const admin = getAdmin();
    const { data: activeUsers } = await supabase.rpc('get_users_with_pending_actions');
    if (!activeUsers || activeUsers.length === 0) return {
        success: true,
        message: "No pending actions."
    };
    const { data: users } = await admin.auth.admin.listUsers();
    let sentCount = 0;
    for (const record of activeUsers){
        const { data: prefs } = await supabase.from('user_preferences').select('email_new_report, email_status_change').eq('user_id', record.user_id).single();
        if (!prefs || prefs.email_new_report === 'off' && prefs.email_status_change === 'off') continue;
        const user = users.users.find((u)=>u.id === record.user_id);
        if (user?.email) {
            const items = [];
            if (record.approval_count > 0) items.push(`${record.approval_count} reports to approve`);
            if (record.revision_count > 0) items.push(`${record.revision_count} reports returned for revision`);
            if (record.appeal_count > 0) items.push(`${record.appeal_count} appeal updates`);
            await dispatchEmail('alert', {
                recipients: [
                    user.email
                ],
                subject: `CadetFlow: You have ${record.approval_count + record.revision_count + record.appeal_count} Action Items`,
                htmlContent: `<h3>Action Required</h3><p>You have pending items in your CadetFlow dashboard:</p><ul>${items.map((i)=>`<li>${i}</li>`).join('')}</ul><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}">Go to Dashboard</a></p>`
            });
            sentCount++;
        }
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
"[project]/.next-internal/server/app/reports/daily/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/lib/server.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/server.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/reports/daily/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/lib/server.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00bbeb251e9c0d92f5c1d1ca0bd9f7292fb081a58d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["triggerGreenSheetBlast"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$reports$2f$daily$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/reports/daily/page/actions.js { ACTIONS_MODULE0 => "[project]/app/lib/server.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/server.ts [app-rsc] (ecmascript)");
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable import/no-extraneous-dependencies */ Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "registerServerReference", {
    enumerable: true,
    get: function() {
        return _server.registerServerReference;
    }
});
const _server = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)"); //# sourceMappingURL=server-reference.js.map
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This function ensures that all the exported values are valid server actions,
// during the runtime. By definition all actions are required to be async
// functions, but here we can only check that they are functions.
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ensureServerEntryExports", {
    enumerable: true,
    get: function() {
        return ensureServerEntryExports;
    }
});
function ensureServerEntryExports(actions) {
    for(let i = 0; i < actions.length; i++){
        const action = actions[i];
        if (typeof action !== 'function') {
            throw Object.defineProperty(new Error(`A "use server" file can only export async functions, found ${typeof action}.\nRead more: https://nextjs.org/docs/messages/invalid-use-server-value`), "__NEXT_ERROR_CODE", {
                value: "E352",
                enumerable: false,
                configurable: true
            });
        }
    }
} //# sourceMappingURL=action-validate.js.map
}),
];

//# sourceMappingURL=_751bccc8._.js.map