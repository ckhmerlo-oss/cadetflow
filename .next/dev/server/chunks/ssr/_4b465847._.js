module.exports = [
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
"[project]/.next-internal/server/app/profile/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/lib/options.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/options.ts [app-rsc] (ecmascript)");
;
;
;
;
}),
"[project]/.next-internal/server/app/profile/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/lib/options.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00764635eb9dddbdf1a11b0eb0832589f2b369c98c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProfileDropdowns"],
    "402d3ffc32185b509288c9f7306afee545f5d7a485",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSportOptions"],
    "409adbff3d4ad1b27172c3c20be93f9650b137f675",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getFullAppOptions"],
    "40cac7acb9c250f9a55152b7b16bcd2ee687c3017f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAppOptions"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$profile$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/profile/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/app/lib/options.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/options.ts [app-rsc] (ecmascript)");
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

//# sourceMappingURL=_4b465847._.js.map