module.exports = [
"[project]/app/manage/roles/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00ae9ae6ba58b134ae0dcbb1048b635e73b23ee2bd":"getAllApprovalGroups","4016bb68d9cf66d294d1ba16e7a69df06b10582128":"deleteGroupAction","4043f145d74fb551c0f220d4655fa7d3b096b01be1":"unassignRoleAction","40c44b7d62b9d33af21c6e0e829e12736ada41a06f":"getCompanyRoles","40d1742e2232c673b4b92bd7a1a01d3d91b6ef8390":"getGroupRoles","40f822964e4558426439eaf89829b99701c5e902f5":"getCompanyChain","608d78a921def9249bf4f244e6cff42c63651c6157":"assignRoleToGroupAction","78079b3c073a3793d07e63f99a88ba3a28fa1e70c4":"createGroupAction","781b8c91e00c51cec97ea6f3ef449d49978b40516a":"createSubordinateGroupAction"},"",""] */ __turbopack_context__.s([
    "assignRoleToGroupAction",
    ()=>assignRoleToGroupAction,
    "createGroupAction",
    ()=>createGroupAction,
    "createSubordinateGroupAction",
    ()=>createSubordinateGroupAction,
    "deleteGroupAction",
    ()=>deleteGroupAction,
    "getAllApprovalGroups",
    ()=>getAllApprovalGroups,
    "getCompanyChain",
    ()=>getCompanyChain,
    "getCompanyRoles",
    ()=>getCompanyRoles,
    "getGroupRoles",
    ()=>getGroupRoles,
    "unassignRoleAction",
    ()=>unassignRoleAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
// --- SECURITY HELPER ---
async function requireAuth(supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role:role_id(default_role_level)').eq('id', user.id).single();
    const roleLevel = profile?.role?.default_role_level || 0;
    if (roleLevel < 50) {
        throw new Error("Insufficient permissions: You must be Staff to edit the Chain of Command.");
    }
    return user;
}
async function getCompanyChain(companyId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: companyGroups, error } = await supabase.from('approval_groups').select(`
      id, group_name, next_approver_group_id, company_id, is_final_authority,
      roles:roles(count)
    `).eq('company_id', companyId);
    if (error) {
        console.error('Error fetching chain:', error);
        return [];
    }
    const formattedGroups = companyGroups.map((g)=>({
            ...g,
            role_count: g.roles ? g.roles[0]?.count || 0 : 0
        }));
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
    const { data, error } = await supabase.from('roles').select('id, role_name, default_role_level').eq('approval_group_id', groupId).order('role_name');
    return {
        roles: data || [],
        error: error?.message
    };
}
async function getAllApprovalGroups() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    try {
        await requireAuth(supabase);
    } catch (e) {
        return [];
    }
    const { data, error } = await supabase.from('approval_groups').select(`
      id, 
      group_name, 
      company:company_id (company_name)
    `).order('group_name');
    if (error) return [];
    return data.map((g)=>({
            id: g.id,
            label: `${g.group_name} (${g.company?.company_name || 'No Co.'})`
        }));
}
async function createGroupAction(companyId, groupName, childGroupIdToApprove, existingGroupId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    try {
        await requireAuth(supabase);
    } catch (e) {
        return {
            error: e.message
        };
    }
    let targetParentId = existingGroupId;
    if (!targetParentId) {
        if (!groupName) return {
            error: "Group Name is required for new groups."
        };
        let nextLink = null;
        if (childGroupIdToApprove) {
            const { data: child } = await supabase.from('approval_groups').select('next_approver_group_id').eq('id', childGroupIdToApprove).single();
            nextLink = child?.next_approver_group_id || null;
        }
        const { data: newGroup, error: createError } = await supabase.from('approval_groups').insert({
            group_name: groupName,
            company_id: companyId,
            next_approver_group_id: nextLink,
            is_final_authority: !nextLink
        }).select('id').single();
        if (createError) return {
            error: createError.message
        };
        targetParentId = newGroup.id;
    }
    if (childGroupIdToApprove && targetParentId) {
        const { error: updateError } = await supabase.from('approval_groups').update({
            next_approver_group_id: targetParentId,
            is_final_authority: false
        }).eq('id', childGroupIdToApprove);
        if (updateError) return {
            error: "Failed to re-link the chain."
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/manage/roles');
    return {
        success: true
    };
}
async function createSubordinateGroupAction(companyId, groupName, parentGroupId, existingGroupId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    try {
        await requireAuth(supabase);
    } catch (e) {
        return {
            error: e.message
        };
    }
    if (existingGroupId) {
        const { error } = await supabase.from('approval_groups').update({
            next_approver_group_id: parentGroupId,
            is_final_authority: false
        }).eq('id', existingGroupId);
        if (error) return {
            error: error.message
        };
    } else {
        if (!groupName) return {
            error: "Name required."
        };
        const { error } = await supabase.from('approval_groups').insert({
            group_name: groupName,
            company_id: companyId,
            next_approver_group_id: parentGroupId,
            is_final_authority: false
        });
        if (error) return {
            error: error.message
        };
    }
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
    const { count } = await supabase.from('roles').select('*', {
        count: 'exact',
        head: true
    }).eq('approval_group_id', groupId);
    if (count && count > 0) {
        return {
            error: "Cannot delete: This group still contains roles. Please move or delete them first."
        };
    }
    const { data: targetGroup } = await supabase.from('approval_groups').select('next_approver_group_id').eq('id', groupId).single();
    if (!targetGroup) return {
        error: "Group not found"
    };
    const parentId = targetGroup.next_approver_group_id;
    const { error: relinkError } = await supabase.from('approval_groups').update({
        next_approver_group_id: parentId,
        is_final_authority: parentId === null
    }).eq('next_approver_group_id', groupId);
    if (relinkError) return {
        error: "Failed to re-link children groups."
    };
    const { error: deleteError } = await supabase.from('approval_groups').delete().eq('id', groupId);
    if (deleteError) return {
        error: deleteError.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/manage/roles');
    return {
        success: true
    };
}
async function getCompanyRoles(companyId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // We want roles that are:
    // 1. Belonging to this company
    // 2. Not assigned to ANY approval group (approval_group_id IS NULL)
    // OR roles that belong to this group (to show current) - but RoleListModal fetches current separately.
    // So here we just want AVAILABLE roles.
    const { data, error } = await supabase.from('roles').select('id, role_name, default_role_level').eq('company_id', companyId).is('approval_group_id', null).order('role_name');
    return {
        roles: data || [],
        error: error?.message
    };
}
async function assignRoleToGroupAction(roleId, groupId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    try {
        await requireAuth(supabase);
    } catch (e) {
        return {
            error: e.message
        };
    }
    const { error } = await supabase.from('roles').update({
        approval_group_id: groupId
    }).eq('id', roleId);
    if (error) return {
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/manage/roles');
    return {
        success: true
    };
}
async function unassignRoleAction(roleId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    try {
        await requireAuth(supabase);
    } catch (e) {
        return {
            error: e.message
        };
    }
    const { error } = await supabase.from('roles').update({
        approval_group_id: null
    }).eq('id', roleId);
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
    getAllApprovalGroups,
    createGroupAction,
    createSubordinateGroupAction,
    deleteGroupAction,
    getCompanyRoles,
    assignRoleToGroupAction,
    unassignRoleAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getCompanyChain, "40f822964e4558426439eaf89829b99701c5e902f5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getGroupRoles, "40d1742e2232c673b4b92bd7a1a01d3d91b6ef8390", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getAllApprovalGroups, "00ae9ae6ba58b134ae0dcbb1048b635e73b23ee2bd", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createGroupAction, "78079b3c073a3793d07e63f99a88ba3a28fa1e70c4", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createSubordinateGroupAction, "781b8c91e00c51cec97ea6f3ef449d49978b40516a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteGroupAction, "4016bb68d9cf66d294d1ba16e7a69df06b10582128", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getCompanyRoles, "40c44b7d62b9d33af21c6e0e829e12736ada41a06f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(assignRoleToGroupAction, "608d78a921def9249bf4f244e6cff42c63651c6157", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(unassignRoleAction, "4043f145d74fb551c0f220d4655fa7d3b096b01be1", null);
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
;
;
;
}),
"[project]/.next-internal/server/app/manage/roles/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/manage/roles/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00ae9ae6ba58b134ae0dcbb1048b635e73b23ee2bd",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAllApprovalGroups"],
    "4016bb68d9cf66d294d1ba16e7a69df06b10582128",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteGroupAction"],
    "4043f145d74fb551c0f220d4655fa7d3b096b01be1",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["unassignRoleAction"],
    "40c44b7d62b9d33af21c6e0e829e12736ada41a06f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyRoles"],
    "40d1742e2232c673b4b92bd7a1a01d3d91b6ef8390",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGroupRoles"],
    "40f822964e4558426439eaf89829b99701c5e902f5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyChain"],
    "608d78a921def9249bf4f244e6cff42c63651c6157",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assignRoleToGroupAction"],
    "78079b3c073a3793d07e63f99a88ba3a28fa1e70c4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createGroupAction"],
    "781b8c91e00c51cec97ea6f3ef449d49978b40516a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createSubordinateGroupAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$manage$2f$roles$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/manage/roles/page/actions.js { ACTIONS_MODULE0 => "[project]/app/manage/roles/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$roles$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/manage/roles/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_9e750004._.js.map