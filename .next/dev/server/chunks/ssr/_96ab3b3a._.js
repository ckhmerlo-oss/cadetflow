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
"[project]/app/admin/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"400bac5072b2551d4bd28c32bf2e33039b2da0bb73":"updateAdminRoleAction","401f2a511d0b58b3c3417f75c84cb385686a805049":"createCompanyAction","409cbb727408449410bfea660db2abfb11797904d6":"createAdminRoleAction","40dcef34cc16fdbc2c174e912844adf0f3f625342d":"deleteAdminRoleAction","40f9e26d10a4fa3408cc94a726980f8ab3047bd1fe":"deleteCompanyAction","608e5914a99cd89e1d3e43764c86a13361e1288d2c":"adminResetPassword","60db55b4eb1149ee07264a3af590f26770f2a274b8":"toggleUserArchiveStatus"},"",""] */ __turbopack_context__.s([
    "adminResetPassword",
    ()=>adminResetPassword,
    "createAdminRoleAction",
    ()=>createAdminRoleAction,
    "createCompanyAction",
    ()=>createCompanyAction,
    "deleteAdminRoleAction",
    ()=>deleteAdminRoleAction,
    "deleteCompanyAction",
    ()=>deleteCompanyAction,
    "toggleUserArchiveStatus",
    ()=>toggleUserArchiveStatus,
    "updateAdminRoleAction",
    ()=>updateAdminRoleAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
async function adminResetPassword(prevState, formData) {
    const userId = formData.get('userId');
    const newPassword = formData.get('newPassword');
    if (!userId || !newPassword) {
        return {
            error: 'User ID and New Password are required.',
            success: false
        };
    }
    if (newPassword.length < 6) {
        return {
            error: 'Password must be at least 6 characters.',
            success: false
        };
    }
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        // Standard permission check
        const { data: profile, error: profileError } = await supabase.from('profiles').select('role:role_id(default_role_level)').eq('id', user.id).single();
        if (profileError) throw new Error('Could not verify user profile.');
        const roleLevel = profile?.role?.default_role_level || 0;
        if (roleLevel < 90) throw new Error('Permission denied: Admin rights required.');
        // Create Admin Client for Auth operations
        const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://ejzvpknayvkggswejgkm.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY);
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: newPassword
        });
        if (error) throw error;
        return {
            error: null,
            success: true
        };
    } catch (error) {
        return {
            error: `Failed to reset: ${error.message}`,
            success: false
        };
    }
}
async function createCompanyAction(formData) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const name = formData.get('name');
    if (!name.trim()) return {
        error: "Company Name is required"
    };
    // 1. Auth & Permission Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: "Unauthorized"
    };
    const { data: profile } = await supabase.from('profiles').select('role:role_id(default_role_level)').eq('id', user.id).single();
    const roleLevel = profile?.role?.default_role_level || 0;
    if (roleLevel < 90) return {
        error: "Permission Denied"
    };
    // 2. Insert
    const { error } = await supabase.from('companies').insert({
        company_name: name.trim()
    });
    if (error) return {
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin');
    return {
        success: true
    };
}
async function deleteCompanyAction(companyId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // 1. Auth & Permission Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: "Unauthorized"
    };
    const { data: profile } = await supabase.from('profiles').select('role:role_id(default_role_level)').eq('id', user.id).single();
    const roleLevel = profile?.role?.default_role_level || 0;
    if (roleLevel < 90) return {
        error: "Permission Denied"
    };
    // 2. Delete
    const { error } = await supabase.from('companies').delete().eq('id', companyId);
    if (error) {
        // Handle FK constraints nicely
        if (error.code === '23503') {
            return {
                error: "Cannot delete: This company has cadets or staff assigned to it."
            };
        }
        return {
            error: error.message
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin');
    return {
        success: true
    };
}
async function createAdminRoleAction(formData) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const roleName = formData.get('roleName');
    const defaultLevel = parseInt(formData.get('defaultLevel')) || 0;
    const companyId = formData.get('companyId') || null;
    const approvalGroupId = formData.get('approvalGroupId') || null // <--- NEW
    ;
    const canManageOwn = formData.get('canManageOwn') === 'on';
    const canManageAll = formData.get('canManageAll') === 'on';
    if (!roleName.trim()) return {
        error: "Role Name is required"
    };
    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: "Unauthorized"
    };
    const { data: profile } = await supabase.from('profiles').select('role:role_id(default_role_level)').eq('id', user.id).single();
    const roleLevel = profile?.role?.default_role_level || 0;
    if (roleLevel < 90) return {
        error: "Permission Denied"
    };
    // 2. Insert
    const { error } = await supabase.from('roles').insert({
        role_name: roleName.trim(),
        default_role_level: defaultLevel,
        company_id: companyId,
        approval_group_id: approvalGroupId,
        can_manage_own_company_roster: canManageOwn,
        can_manage_all_rosters: canManageAll
    });
    if (error) return {
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin');
    return {
        success: true
    };
}
async function updateAdminRoleAction(formData) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const roleId = formData.get('roleId');
    const roleName = formData.get('roleName');
    const defaultLevel = parseInt(formData.get('defaultLevel')) || 0;
    const companyId = formData.get('companyId') || null;
    const approvalGroupId = formData.get('approvalGroupId') || null // <--- NEW
    ;
    const canManageOwn = formData.get('canManageOwn') === 'on';
    const canManageAll = formData.get('canManageAll') === 'on';
    if (!roleId) return {
        error: "Role ID is required"
    };
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: "Unauthorized"
    };
    const { data: profile } = await supabase.from('profiles').select('role:role_id(default_role_level)').eq('id', user.id).single();
    const roleLevel = profile?.role?.default_role_level || 0;
    if (roleLevel < 90) return {
        error: "Permission Denied"
    };
    const { error } = await supabase.from('roles').update({
        role_name: roleName.trim(),
        default_role_level: defaultLevel,
        company_id: companyId,
        approval_group_id: approvalGroupId,
        can_manage_own_company_roster: canManageOwn,
        can_manage_all_rosters: canManageAll
    }).eq('id', roleId);
    if (error) return {
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin');
    return {
        success: true
    };
}
async function deleteAdminRoleAction(roleId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: "Unauthorized"
    };
    const { data: profile } = await supabase.from('profiles').select('role:role_id(default_role_level)').eq('id', user.id).single();
    const roleLevel = profile?.role?.default_role_level || 0;
    if (roleLevel < 90) return {
        error: "Permission Denied"
    };
    const { count } = await supabase.from('profiles').select('*', {
        count: 'exact',
        head: true
    }).eq('role_id', roleId);
    if (count && count > 0) {
        return {
            error: `Cannot delete: ${count} users are currently assigned to this role.`
        };
    }
    const { error } = await supabase.from('roles').delete().eq('id', roleId);
    if (error) return {
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin');
    return {
        success: true
    };
}
async function toggleUserArchiveStatus(targetUserId, setArchived) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // 1. Auth & Permission Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: "Unauthorized"
    };
    const { data: profile } = await supabase.from('profiles').select('role:role_id(default_role_level)').eq('id', user.id).single();
    const roleLevel = profile?.role?.default_role_level || 0;
    if (roleLevel < 90) return {
        error: "Permission Denied: Admins only."
    };
    // 2. Prepare Updates
    const updates = {
        archived: setArchived
    };
    // IF ARCHIVING: Unassign Company and Role so they don't block slots
    if (setArchived) {
        updates.company_id = null;
        updates.role_id = null;
    }
    // 3. Execute Update
    const { error } = await supabase.from('profiles').update(updates).eq('id', targetUserId);
    if (error) return {
        error: error.message
    };
    // 4. Revalidate
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/roster'); // Ensure public roster updates
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    adminResetPassword,
    createCompanyAction,
    deleteCompanyAction,
    createAdminRoleAction,
    updateAdminRoleAction,
    deleteAdminRoleAction,
    toggleUserArchiveStatus
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(adminResetPassword, "608e5914a99cd89e1d3e43764c86a13361e1288d2c", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createCompanyAction, "401f2a511d0b58b3c3417f75c84cb385686a805049", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteCompanyAction, "40f9e26d10a4fa3408cc94a726980f8ab3047bd1fe", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createAdminRoleAction, "409cbb727408449410bfea660db2abfb11797904d6", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateAdminRoleAction, "400bac5072b2551d4bd28c32bf2e33039b2da0bb73", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteAdminRoleAction, "40dcef34cc16fdbc2c174e912844adf0f3f625342d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(toggleUserArchiveStatus, "60db55b4eb1149ee07264a3af590f26770f2a274b8", null);
}),
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
"[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/components/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/admin/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/app/lib/server.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/server.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/components/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/admin/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/app/lib/server.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "003d249914f0fdaa5f07fe719abbebf0ccd70635ef",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["triggerActionItemAlert"],
    "008dc5435b98ffe40db1157649db299a98f1175d9c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["triggerTourSheetAlert"],
    "00bbeb251e9c0d92f5c1d1ca0bd9f7292fb081a58d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["triggerGreenSheetBlast"],
    "40051c0b86095af35cc3db8d7f26d35ce2872481a5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["submitFeedback"],
    "400bac5072b2551d4bd28c32bf2e33039b2da0bb73",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateAdminRoleAction"],
    "401f2a511d0b58b3c3417f75c84cb385686a805049",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createCompanyAction"],
    "409cbb727408449410bfea660db2abfb11797904d6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAdminRoleAction"],
    "40dcef34cc16fdbc2c174e912844adf0f3f625342d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteAdminRoleAction"],
    "40f9e26d10a4fa3408cc94a726980f8ab3047bd1fe",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteCompanyAction"],
    "608e5914a99cd89e1d3e43764c86a13361e1288d2c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminResetPassword"],
    "60db55b4eb1149ee07264a3af590f26770f2a274b8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toggleUserArchiveStatus"],
    "702af6792a7a9ca515664333f0db916ad72c57b298",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendTestEmail"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$components$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => "[project]/app/components/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/admin/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/app/lib/server.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/server.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_96ab3b3a._.js.map