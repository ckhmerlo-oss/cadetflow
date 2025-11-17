module.exports = [
"[project]/app/profile/constants.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CADET_RANKS",
    ()=>CADET_RANKS,
    "CONDUCT_STATUSES",
    ()=>CONDUCT_STATUSES,
    "EDIT_AUTHORIZED_ROLES",
    ()=>EDIT_AUTHORIZED_ROLES,
    "FALL_SPORTS",
    ()=>FALL_SPORTS,
    "GRADE_LEVELS",
    ()=>GRADE_LEVELS,
    "PROBATION_STATUSES",
    ()=>PROBATION_STATUSES,
    "SPRING_SPORTS",
    ()=>SPRING_SPORTS,
    "STAR_TOUR_AUTHORIZED_ROLES",
    ()=>STAR_TOUR_AUTHORIZED_ROLES,
    "WINTER_SPORTS",
    ()=>WINTER_SPORTS
]);
const CADET_RANKS = [
    'c/PVT',
    'c/PV2',
    'c/PFC',
    'c/CPL',
    'c/SGT',
    'c/SSG',
    'c/SFC',
    'c/MSG',
    'c/1SG',
    'c/SGM',
    'c/CSM',
    'c/2LT',
    'c/1LT',
    'c/CPT',
    'c/MAJ',
    'c/LTC',
    'c/COL'
];
const FALL_SPORTS = [
    'None',
    'JV Football',
    'Varsity Football',
    'JV Soccer',
    'Varsity Soccer',
    'Cross Country',
    'Swimming (Off Season)',
    'PG Lacross',
    'PG Basketball',
    'PG Football',
    'PT'
];
const WINTER_SPORTS = [
    'None',
    'JV Basketball',
    'Varsity Basketball',
    'Wrestling',
    'Swimming',
    'Indoor Track',
    'PG Lacrosse',
    'PG Basketball',
    'PT'
];
const SPRING_SPORTS = [
    'None',
    'Baseball',
    'Varsity Lacrosse',
    'Track & Field',
    'Tennis',
    'Golf',
    'PG Basketball',
    'PG Lacrosse'
];
const CONDUCT_STATUSES = [
    'Exemplary',
    'Commendable',
    'Satisfactory',
    'Deficient',
    'Unsatisfactory'
];
const PROBATION_STATUSES = [
    'None',
    'Academic',
    'Disciplinary',
    'Honor',
    'Physical'
];
const GRADE_LEVELS = [
    '7th',
    '8th',
    '9th',
    '10th',
    '11th',
    '12th',
    'PG'
];
const EDIT_AUTHORIZED_ROLES = [
    'S1',
    'Command Sergeant Major',
    'TAC Officer',
    'Deputy Commandant',
    'Commandant',
    'Admin'
];
const STAR_TOUR_AUTHORIZED_ROLES = [
    'Commandant',
    'Deputy Commandant',
    'Admin'
];
}),
"[project]/app/profile/[id]/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60522fa0c1ab889549cd43ee3a6e075bf758d786b7":"updateCadetProfile"},"",""] */ __turbopack_context__.s([
    "updateCadetProfile",
    ()=>updateCadetProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$profile$2f$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/profile/constants.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
async function updateCadetProfile(cadetId, formData) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: 'Unauthorized'
    };
    const { data: editorProfile } = await supabase.from('profiles').select('role:role_id (role_name)').eq('id', user.id).single();
    const roleName = editorProfile?.role?.role_name || '';
    const canEdit = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$profile$2f$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EDIT_AUTHORIZED_ROLES"].includes(roleName) || roleName.includes('TAC') || roleName === 'Admin';
    if (!canEdit) return {
        error: 'You do not have permission to edit profiles.'
    };
    const updates = {
        cadet_rank: formData.get('cadet_rank')?.toString() || null,
        room_number: formData.get('room_number')?.toString() || null,
        grade_level: formData.get('grade_level')?.toString() || null,
        years_attended: parseInt(formData.get('years_attended')?.toString() || '0'),
        probation_status: formData.get('probation_status')?.toString() || null,
        sport_fall: formData.get('sport_fall')?.toString() || null,
        sport_winter: formData.get('sport_winter')?.toString() || null,
        sport_spring: formData.get('sport_spring')?.toString() || null
    };
    const canManageStarTours = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$profile$2f$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["STAR_TOUR_AUTHORIZED_ROLES"].includes(roleName);
    if (canManageStarTours) {
        updates.has_star_tours = formData.get('has_star_tours') === 'on';
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', cadetId);
    if (error) {
        console.error('Profile update error:', error.message);
        return {
            error: `Update failed: ${error.message}`
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/profile/${cadetId}`);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/reports/daily`);
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    updateCadetProfile
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateCadetProfile, "60522fa0c1ab889549cd43ee3a6e075bf758d786b7", null);
}),
"[project]/.next-internal/server/app/profile/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/profile/[id]/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$profile$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/profile/[id]/actions.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/profile/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/profile/[id]/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "60522fa0c1ab889549cd43ee3a6e075bf758d786b7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$profile$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateCadetProfile"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$profile$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$profile$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/profile/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/app/profile/[id]/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$profile$2f5b$id$5d2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/profile/[id]/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_06cbd6bf._.js.map