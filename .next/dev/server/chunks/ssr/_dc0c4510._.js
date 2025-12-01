module.exports = [
"[project]/app/admin/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"400bac5072b2551d4bd28c32bf2e33039b2da0bb73":"updateAdminRoleAction","401f2a511d0b58b3c3417f75c84cb385686a805049":"createCompanyAction","409cbb727408449410bfea660db2abfb11797904d6":"createAdminRoleAction","40dcef34cc16fdbc2c174e912844adf0f3f625342d":"deleteAdminRoleAction","40f9e26d10a4fa3408cc94a726980f8ab3047bd1fe":"deleteCompanyAction","608e5914a99cd89e1d3e43764c86a13361e1288d2c":"adminResetPassword"},"",""] */ __turbopack_context__.s([
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
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    adminResetPassword,
    createCompanyAction,
    deleteCompanyAction,
    createAdminRoleAction,
    updateAdminRoleAction,
    deleteAdminRoleAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(adminResetPassword, "608e5914a99cd89e1d3e43764c86a13361e1288d2c", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createCompanyAction, "401f2a511d0b58b3c3417f75c84cb385686a805049", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteCompanyAction, "40f9e26d10a4fa3408cc94a726980f8ab3047bd1fe", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createAdminRoleAction, "409cbb727408449410bfea660db2abfb11797904d6", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateAdminRoleAction, "400bac5072b2551d4bd28c32bf2e33039b2da0bb73", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteAdminRoleAction, "40dcef34cc16fdbc2c174e912844adf0f3f625342d", null);
}),
"[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/admin/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/admin/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
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
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminResetPassword"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => "[project]/app/admin/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_dc0c4510._.js.map