module.exports = [
"[project]/app/manage/roles/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"4016bb68d9cf66d294d1ba16e7a69df06b10582128":"deleteGroupAction","40a5568cc820ffe2098c17cccc97ba4d2a6ccce129":"deleteRoleAction","40d1742e2232c673b4b92bd7a1a01d3d91b6ef8390":"getGroupRoles","40f822964e4558426439eaf89829b99701c5e902f5":"getCompanyChain","70079b3c073a3793d07e63f99a88ba3a28fa1e70c4":"createGroupAction","78c1a20f4cc5bc2da7ea96c7a649be0cc1e65b0c41":"createRoleAction"},"",""] */ __turbopack_context__.s([
    "createGroupAction",
    ()=>createGroupAction,
    "createRoleAction",
    ()=>createRoleAction,
    "deleteGroupAction",
    ()=>deleteGroupAction,
    "deleteRoleAction",
    ()=>deleteRoleAction,
    "getCompanyChain",
    ()=>getCompanyChain,
    "getGroupRoles",
    ()=>getGroupRoles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
// --- SECURITY HELPER ---
// Returns true if authorized, throws error if not.
async function requireAuth(supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role:role_id(default_role_level)').eq('id', user.id).single();
    const roleLevel = profile?.role?.default_role_level || 0;
    // SECURITY POLICY: 
    // Only Staff (50+) or higher can configure the Chain of Command.
    // You can adjust this to 40 if Company Commanders should edit their own structure.
    if (roleLevel < 50) {
        throw new Error("Insufficient permissions: You must be Staff to edit the Chain of Command.");
    }
    return user;
}
async function getCompanyChain(companyId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // 1. Fetch groups
    const { data: companyGroups, error } = await supabase.from('approval_groups').select(`
      id, group_name, next_approver_group_id, company_id, is_final_authority,
      roles:roles(count)
    `).eq('company_id', companyId);
    if (error) {
        console.error('Error fetching chain:', error);
        return [];
    }
    // 2. Flatten
    const formattedGroups = companyGroups.map((g)=>({
            ...g,
            role_count: g.roles ? g.roles[0]?.count || 0 : 0
        }));
    // 3. Fetch external links (Final Authority nodes outside the company)
    const outgoingLinkIds = formattedGroups.map((g)=>g.next_approver_group_id).filter((id)=>id !== null);
    const existingIds = new Set(formattedGroups.map((g)=>g.id));
    const missingIds = outgoingLinkIds.filter((id)=>!existingIds.has(id));
    if (missingIds.length > 0) {
        const { data: externalGroups } = await supabase.from('approval_groups').select('id, group_name, next_approver_group_id, company_id, is_final_authority').in('id', missingIds);
        if (externalGroups) {
            formattedGroups.push(...externalGroups);
        }
    }
    return formattedGroups;
}
async function getGroupRoles(groupId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // View-only access is fine for logged in users
    const { data, error } = await supabase.from('roles').select('id, role_name, default_role_level').eq('approval_group_id', groupId).order('role_name');
    return {
        roles: data || [],
        error: error?.message
    };
}
async function createGroupAction(companyId, groupName, childGroupIdToApprove) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    try {
        await requireAuth(supabase);
    } catch (e) {
        return {
            error: e.message
        };
    }
    // 1. Get Child's current parent
    const { data: childGroup, error: fetchError } = await supabase.from('approval_groups').select('next_approver_group_id').eq('id', childGroupIdToApprove).single();
    if (fetchError || !childGroup) return {
        error: "Could not find the group you selected."
    };
    const oldParentId = childGroup.next_approver_group_id;
    // 2. Insert New Group
    const { data: newGroup, error: createError } = await supabase.from('approval_groups').insert({
        group_name: groupName,
        company_id: companyId,
        next_approver_group_id: oldParentId,
        is_final_authority: false
    }).select('id').single();
    if (createError) return {
        error: createError.message
    };
    // 3. Update Child
    const { error: updateError } = await supabase.from('approval_groups').update({
        next_approver_group_id: newGroup.id
    }).eq('id', childGroupIdToApprove);
    if (updateError) return {
        error: "Failed to re-link the chain."
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/manage/roles');
    return {
        success: true
    };
}
async function deleteGroupAction(groupId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    try {
        await requireAuth(supabase);
    } catch (e) {
        return {
            error: e.message
        };
    }
    // 1. Check if group has roles inside it
    // If we delete the group, the roles become orphans. Block this.
    const { count } = await supabase.from('roles').select('*', {
        count: 'exact',
        head: true
    }).eq('approval_group_id', groupId);
    if (count && count > 0) {
        return {
            error: "Cannot delete: This group still contains roles. Please move or delete them first."
        };
    }
    // 2. Get Target info
    const { data: targetGroup } = await supabase.from('approval_groups').select('next_approver_group_id').eq('id', groupId).single();
    if (!targetGroup) return {
        error: "Group not found"
    };
    const parentId = targetGroup.next_approver_group_id;
    // 3. Re-link children (Heal the chain)
    const { error: relinkError } = await supabase.from('approval_groups').update({
        next_approver_group_id: parentId
    }).eq('next_approver_group_id', groupId);
    if (relinkError) return {
        error: "Failed to re-link children groups."
    };
    // 4. Delete
    const { error: deleteError } = await supabase.from('approval_groups').delete().eq('id', groupId);
    if (deleteError) return {
        error: deleteError.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/manage/roles');
    return {
        success: true
    };
}
async function createRoleAction(companyId, groupId, roleName, defaultLevel) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    try {
        await requireAuth(supabase);
    } catch (e) {
        return {
            error: e.message
        };
    }
    const { error } = await supabase.from('roles').insert({
        company_id: companyId,
        approval_group_id: groupId,
        role_name: roleName,
        default_role_level: defaultLevel,
        // Auto-set permissions based on level
        can_manage_own_company_roster: defaultLevel >= 40,
        can_manage_all_rosters: defaultLevel >= 50
    });
    if (error) return {
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/manage/roles');
    return {
        success: true
    };
}
async function deleteRoleAction(roleId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    try {
        await requireAuth(supabase);
    } catch (e) {
        return {
            error: e.message
        };
    }
    // 1. CHECK FOR USAGE
    // If a cadet is assigned to this role, we must block deletion or we break the roster.
    const { count } = await supabase.from('profiles').select('*', {
        count: 'exact',
        head: true
    }).eq('role_id', roleId);
    if (count && count > 0) {
        return {
            error: `Cannot delete: ${count} cadet(s) are currently assigned to this role.`
        };
    }
    // 2. Delete
    const { error } = await supabase.from('roles').delete().eq('id', roleId);
    if (error) return {
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/manage/roles');
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getCompanyChain,
    getGroupRoles,
    createGroupAction,
    deleteGroupAction,
    createRoleAction,
    deleteRoleAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getCompanyChain, "40f822964e4558426439eaf89829b99701c5e902f5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getGroupRoles, "40d1742e2232c673b4b92bd7a1a01d3d91b6ef8390", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createGroupAction, "70079b3c073a3793d07e63f99a88ba3a28fa1e70c4", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteGroupAction, "4016bb68d9cf66d294d1ba16e7a69df06b10582128", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createRoleAction, "78c1a20f4cc5bc2da7ea96c7a649be0cc1e65b0c41", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteRoleAction, "40a5568cc820ffe2098c17cccc97ba4d2a6ccce129", null);
}),
"[project]/.next-internal/server/app/manage/roles/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/manage/roles/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/manage/roles/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/manage/roles/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/manage/roles/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "4016bb68d9cf66d294d1ba16e7a69df06b10582128",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteGroupAction"],
    "40a5568cc820ffe2098c17cccc97ba4d2a6ccce129",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteRoleAction"],
    "40d1742e2232c673b4b92bd7a1a01d3d91b6ef8390",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGroupRoles"],
    "40f822964e4558426439eaf89829b99701c5e902f5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyChain"],
    "70079b3c073a3793d07e63f99a88ba3a28fa1e70c4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createGroupAction"],
    "78c1a20f4cc5bc2da7ea96c7a649be0cc1e65b0c41",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createRoleAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$manage$2f$roles$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/manage/roles/page/actions.js { ACTIONS_MODULE0 => "[project]/app/manage/roles/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/manage/roles/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_9e750004._.js.map