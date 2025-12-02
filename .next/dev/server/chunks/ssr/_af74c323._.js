module.exports = [
"[project]/app/manage/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"603a47877742303afc33baf0bf80c9229af4e52ef8":"bulkAssignCompany","60532683f7b9907727bf29a27c70ffe98877d06a86":"bulkAssignRole","60d62aff1f884c156897a47f4cc30feb26912543b5":"updateUserRole"},"",""] */ __turbopack_context__.s([
    "bulkAssignCompany",
    ()=>bulkAssignCompany,
    "bulkAssignRole",
    ()=>bulkAssignRole,
    "updateUserRole",
    ()=>updateUserRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
// --- HELPER ---
async function getActorWithPermissions(supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from('profiles').select(`
      id, 
      company_id, 
      role:role_id (
        role_name, 
        default_role_level, 
        can_manage_all_rosters, 
        can_manage_own_company_roster
      )
    `).eq('id', user.id).single();
    if (!profile || !profile.role) return null;
    const role = profile.role;
    return {
        userId: profile.id,
        companyId: profile.company_id,
        roleLevel: role.default_role_level || 0,
        canManageAll: role.can_manage_all_rosters || false,
        canManageOwn: role.can_manage_own_company_roster || false,
        roleName: role.role_name
    };
}
async function updateUserRole(userId, roleId) {
    // If clearing a role (null), we treat it as assigning roleId "" or similar
    // But bulkAssignRole expects a string.
    // If roleId is null, we are essentially unassigning.
    // Let's handle null separately or ensure bulkAssignRole handles it.
    if (!roleId) {
        // Unassign logic could be separate, or we pass a special flag?
        // For now, let's assume roleId is required for assignment.
        // To unassign, we might need a separate action or allow null.
        // Let's keep it simple: This action is for ASSIGNING.
        return {
            error: "Role ID is required."
        };
    }
    return bulkAssignRole([
        userId
    ], roleId);
}
async function bulkAssignRole(userIds, roleId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const actor = await getActorWithPermissions(supabase);
    if (!actor) return {
        error: "Unauthorized"
    };
    // 1. FETCH TARGET ROLE DETAILS
    const { data: targetRole } = await supabase.from('roles').select('default_role_level, company_id').eq('id', roleId).single();
    if (!targetRole) return {
        error: "Role not found."
    };
    const targetRoleLevel = targetRole.default_role_level || 0;
    // 2. HIERARCHY CHECK
    // You cannot assign a role that is equal to or higher than your own.
    if (targetRoleLevel >= actor.roleLevel) {
        return {
            error: `Permission Denied: You cannot assign a role of level ${targetRoleLevel} (your level is ${actor.roleLevel}).`
        };
    }
    // 3. SCOPE CHECK
    if (actor.canManageAll) {
    // Allowed globally
    } else if (actor.canManageOwn) {
        // a) Role must belong to the actor's company (or be generic/global if that's allowed, but usually specific)
        // Strict mode: Role must be in actor's company
        if (targetRole.company_id && targetRole.company_id !== actor.companyId) {
            return {
                error: "Permission Denied: You cannot assign roles from another company."
            };
        }
        // b) Target Users must be in actor's company OR unassigned
        const { data: targets } = await supabase.from('profiles').select('id, company_id').in('id', userIds);
        if (!targets) return {
            error: "Could not verify targets."
        };
        const allValid = targets.every((t)=>t.company_id === actor.companyId || t.company_id === null);
        if (!allValid) {
            return {
                error: "Permission Denied: You can only manage cadets within your own company or claim unassigned cadets."
            };
        }
    } else {
        return {
            error: "Unauthorized: You do not have roster management permissions."
        };
    }
    // 4. EXECUTE
    // We use the standard client because we assume the RLS policy (from 5_roster_permissions_and_rls.sql) 
    // correctly allows updates if (can_manage_own AND (target.company = my_company OR target.company IS NULL))
    const { error } = await supabase.from('profiles').update({
        role_id: roleId
    }).in('id', userIds);
    if (error) return {
        error: `Database Error: ${error.message}`
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/manage');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/roster');
    return {
        success: true
    };
}
async function bulkAssignCompany(userIds, companyId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const actor = await getActorWithPermissions(supabase);
    if (!actor) return {
        error: "Unauthorized"
    };
    // 1. SCOPE CHECK
    if (actor.canManageAll) {
    // Global allowed
    } else if (actor.canManageOwn) {
        // Can only move TO own company
        if (companyId !== actor.companyId) {
            return {
                error: "Permission Denied: You can only assign cadets to your own company."
            };
        }
        // Verify targets are Unassigned or in Own Company
        const { data: targets } = await supabase.from('profiles').select('company_id').in('id', userIds);
        if (!targets) return {
            error: "Could not verify targets."
        };
        const allValid = targets.every((t)=>t.company_id === actor.companyId || t.company_id === null);
        if (!allValid) {
            return {
                error: "Permission Denied: You can only claim unassigned cadets or move cadets already in your company."
            };
        }
    } else {
        return {
            error: "Unauthorized."
        };
    }
    // 2. EXECUTE
    const { error } = await supabase.from('profiles').update({
        company_id: companyId
    }).in('id', userIds);
    if (error) return {
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/manage');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/roster');
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    updateUserRole,
    bulkAssignRole,
    bulkAssignCompany
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateUserRole, "60d62aff1f884c156897a47f4cc30feb26912543b5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(bulkAssignRole, "60532683f7b9907727bf29a27c70ffe98877d06a86", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(bulkAssignCompany, "603a47877742303afc33baf0bf80c9229af4e52ef8", null);
}),
"[project]/.next-internal/server/app/roster/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/manage/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/manage/actions.ts [app-rsc] (ecmascript)");
;
;
}),
"[project]/.next-internal/server/app/roster/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/manage/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "603a47877742303afc33baf0bf80c9229af4e52ef8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["bulkAssignCompany"],
    "60532683f7b9907727bf29a27c70ffe98877d06a86",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["bulkAssignRole"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$roster$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$manage$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/roster/page/actions.js { ACTIONS_MODULE0 => "[project]/app/manage/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/manage/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_af74c323._.js.map