module.exports = [
"[project]/app/band/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"002a5258267312a42220e5fa8c7547e20e0a6976ed":"getBandRoster","60f71f0f5c19887422ef7ef5d3521be80caa4b7f4c":"updateBandDetails"},"",""] */ __turbopack_context__.s([
    "getBandRoster",
    ()=>getBandRoster,
    "updateBandDetails",
    ()=>updateBandDetails
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function getBandRoster() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from('profiles').select(`
      id, 
      first_name, 
      last_name, 
      cadet_rank, 
      grade_level,
      room_number,
      cached_tour_balance,
      email,
      company:companies(company_name),
      band_details(instrument, leadership_role, travel_notes),
      role:roles!inner(default_role_level)
    `).eq('is_in_band', true).lt('role.default_role_level', 50) // <--- FILTER: Only Role Level < 50 (Cadets)
    .order('last_name', {
        ascending: true
    });
    if (error) {
        console.error('Error fetching band roster:', error);
        return [];
    }
    // Map to ensure clean types
    return data.map((m)=>({
            ...m,
            company: Array.isArray(m.company) ? m.company[0] : m.company,
            band_details: Array.isArray(m.band_details) ? m.band_details[0] || null : m.band_details || null
        }));
}
async function updateBandDetails(cadetId, details) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from('band_details').upsert({
        cadet_id: cadetId,
        instrument: details.instrument,
        leadership_role: details.leadership_role,
        travel_notes: details.travel_notes
    }, {
        onConflict: 'cadet_id'
    });
    if (error) return {
        success: false,
        error: error.message
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/band');
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getBandRoster,
    updateBandDetails
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getBandRoster, "002a5258267312a42220e5fa8c7547e20e0a6976ed", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateBandDetails, "60f71f0f5c19887422ef7ef5d3521be80caa4b7f4c", null);
}),
"[project]/app/lib/options.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00764635eb9dddbdf1a11b0eb0832589f2b369c98c":"getProfileDropdowns","402d3ffc32185b509288c9f7306afee545f5d7a485":"getSportOptions","409adbff3d4ad1b27172c3c20be93f9650b137f675":"getFullAppOptions","40cac7acb9c250f9a55152b7b16bcd2ee687c3017f":"getAppOptions"},"",""] */ __turbopack_context__.s([
    "getAppOptions",
    ()=>getAppOptions,
    "getFullAppOptions",
    ()=>getFullAppOptions,
    "getProfileDropdowns",
    ()=>getProfileDropdowns,
    "getSportOptions",
    ()=>getSportOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function getAppOptions(category) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data } = await supabase.from('app_options').select('value').eq('category', category).eq('is_active', true).order('sort_order', {
        ascending: true
    });
    return (data || []).map((o)=>o.value);
}
async function getFullAppOptions(category) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data } = await supabase.from('app_options').select('*').eq('category', category).eq('is_active', true).order('group_name', {
        ascending: true
    }) // Group first
    .order('sort_order', {
        ascending: true
    }) // Then sort order
    ;
    return data || [];
}
async function getSportOptions(season) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data } = await supabase.from('sports').select('name').eq('season', season).eq('is_active', true).order('name');
    return [
        'None',
        ...(data || []).map((s)=>s.name)
    ];
}
async function getProfileDropdowns() {
    const [ranks, grades, conduct, probation, extracurriculars, fallSports, winterSports, springSports] = await Promise.all([
        getAppOptions('rank'),
        getAppOptions('grade'),
        getAppOptions('conduct'),
        getAppOptions('probation'),
        getAppOptions('extracurricular'),
        getSportOptions('Fall'),
        getSportOptions('Winter'),
        getSportOptions('Spring')
    ]);
    return {
        ranks,
        grades,
        conduct,
        probation,
        extracurriculars,
        fallSports,
        winterSports,
        springSports
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getAppOptions,
    getFullAppOptions,
    getSportOptions,
    getProfileDropdowns
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getAppOptions, "40cac7acb9c250f9a55152b7b16bcd2ee687c3017f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getFullAppOptions, "409adbff3d4ad1b27172c3c20be93f9650b137f675", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getSportOptions, "402d3ffc32185b509288c9f7306afee545f5d7a485", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getProfileDropdowns, "00764635eb9dddbdf1a11b0eb0832589f2b369c98c", null);
}),
"[project]/.next-internal/server/app/band/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/band/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/lib/options.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$band$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/band/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/options.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/band/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/band/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/lib/options.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "002a5258267312a42220e5fa8c7547e20e0a6976ed",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$band$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getBandRoster"],
    "00764635eb9dddbdf1a11b0eb0832589f2b369c98c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProfileDropdowns"],
    "402d3ffc32185b509288c9f7306afee545f5d7a485",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSportOptions"],
    "409adbff3d4ad1b27172c3c20be93f9650b137f675",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getFullAppOptions"],
    "40cac7acb9c250f9a55152b7b16bcd2ee687c3017f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAppOptions"],
    "60f71f0f5c19887422ef7ef5d3521be80caa4b7f4c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$band$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateBandDetails"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$band$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$band$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/band/page/actions.js { ACTIONS_MODULE0 => "[project]/app/band/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/lib/options.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$band$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/band/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/options.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_2709bc33._.js.map