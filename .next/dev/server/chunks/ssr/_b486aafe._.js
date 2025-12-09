module.exports = [
"[project]/app/manage/probation/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"008fbc271881ddee72adfba1676c6cc41077ba8b77":"getAllCadetsForSelection","00fdd36ebe821b6e761053b3c7bc8507c31cafecbf":"getProbationList","70071ecd57b17bfb5f2dc2705ccda0a55905c97ca6":"updateCadetProbation"},"",""] */ __turbopack_context__.s([
    "getAllCadetsForSelection",
    ()=>getAllCadetsForSelection,
    "getProbationList",
    ()=>getProbationList,
    "updateCadetProbation",
    ()=>updateCadetProbation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function getProbationList() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from('profiles').select(`
      id, first_name, last_name, probation_status, probation_notes, grade_level,
      company:companies(company_name)
    `).neq('probation_status', 'None').not('probation_status', 'is', null).order('last_name', {
        ascending: true
    });
    if (error) {
        console.error('Error fetching probation list:', error);
        return [];
    }
    return data.map((p)=>({
            id: p.id,
            first_name: p.first_name,
            last_name: p.last_name,
            company_name: p.company?.company_name || 'Unassigned',
            probation_status: p.probation_status,
            probation_notes: p.probation_notes,
            grade_level: p.grade_level
        }));
}
async function getAllCadetsForSelection() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from('profiles').select(`
      id, 
      first_name, 
      last_name, 
      company:companies(company_name),
      role:roles!inner(default_role_level)
    `).lt('role.default_role_level', 50) // <--- CHANGED HERE
    .order('last_name');
    if (error) {
        console.error('Error fetching cadet selection list:', error);
        return [];
    }
    return data.map((p)=>({
            id: p.id,
            label: `${p.last_name}, ${p.first_name} (${p.company?.company_name || 'N/A'})`
        }));
}
async function updateCadetProbation(cadetId, status, notes) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // 1. Verify Permissions (TAC Officer / Role Level 65+)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: 'Unauthorized'
    };
    const { data: viewer } = await supabase.from('profiles').select('role:role_id(default_role_level)').eq('id', user.id).single();
    const level = viewer?.role?.default_role_level || 0;
    if (level < 65) return {
        error: 'Insufficient permissions (Level 65+ required)'
    };
    // 2. Perform Update
    const { error } = await supabase.from('profiles').update({
        probation_status: status,
        probation_notes: notes
    }).eq('id', cadetId);
    if (error) return {
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/manage/probation');
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getProbationList,
    getAllCadetsForSelection,
    updateCadetProbation
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getProbationList, "00fdd36ebe821b6e761053b3c7bc8507c31cafecbf", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getAllCadetsForSelection, "008fbc271881ddee72adfba1676c6cc41077ba8b77", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateCadetProbation, "70071ecd57b17bfb5f2dc2705ccda0a55905c97ca6", null);
}),
"[project]/.next-internal/server/app/manage/probation/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/manage/probation/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$probation$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/manage/probation/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
}),
"[project]/.next-internal/server/app/manage/probation/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/manage/probation/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "008fbc271881ddee72adfba1676c6cc41077ba8b77",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$probation$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAllCadetsForSelection"],
    "00fdd36ebe821b6e761053b3c7bc8507c31cafecbf",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$probation$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProbationList"],
    "70071ecd57b17bfb5f2dc2705ccda0a55905c97ca6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$probation$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateCadetProbation"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$manage$2f$probation$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$manage$2f$probation$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/manage/probation/page/actions.js { ACTIONS_MODULE0 => "[project]/app/manage/probation/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$probation$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/manage/probation/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_b486aafe._.js.map