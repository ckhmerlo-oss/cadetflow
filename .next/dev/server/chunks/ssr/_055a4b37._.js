module.exports = [
"[project]/app/sports/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"0056f82085b8a9696d7538953646288bff9ffd913c":"getGlobalUpcomingEvents","4020939cefe5ed57a621e116e4fae7b42139699381":"claimHeadCoach","4054e673984498214f2c0017bd88e2e13ce72d3eee":"getSportDetail","406da3cc3a7863d208c65296d2a20a9d8453b4070e":"searchCadets","408fdd430e78ed2c34877d73295eaadcfb25b907ca":"getSportsList","40945801c6a903306bf62a35b89a8a584588570bbc":"getUnassignedCadets","40eadd2b43fd360d4359d65c22f03ac48ffbe4b0e9":"searchFaculty","6060891285bef1542b3c8ef70074a0a73715b21da1":"removeCoach","6068b5e3a8a240c51dad114b9fc718ae2b8a54d71d":"removeEvent","60c86d0ef03983751c53ba7082803f97a5eb86c01e":"addEvent","60dc33324981360b154f2062090e84adbdad188b7a":"removeFromRoster","701e58f962f41130ecac5fe0e31518c93f33a2d7d4":"addToRoster","70301ed3650afacdc4e176b675b530fd7678292649":"addAssistantCoach"},"",""] */ __turbopack_context__.s([
    "addAssistantCoach",
    ()=>addAssistantCoach,
    "addEvent",
    ()=>addEvent,
    "addToRoster",
    ()=>addToRoster,
    "claimHeadCoach",
    ()=>claimHeadCoach,
    "getGlobalUpcomingEvents",
    ()=>getGlobalUpcomingEvents,
    "getSportDetail",
    ()=>getSportDetail,
    "getSportsList",
    ()=>getSportsList,
    "getUnassignedCadets",
    ()=>getUnassignedCadets,
    "removeCoach",
    ()=>removeCoach,
    "removeEvent",
    ()=>removeEvent,
    "removeFromRoster",
    ()=>removeFromRoster,
    "searchCadets",
    ()=>searchCadets,
    "searchFaculty",
    ()=>searchFaculty
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function getSportsList(season) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    let query = supabase.from('sports').select('id, name, season, is_active').order('name');
    if (season) query = query.eq('season', season);
    const { data: sports, error } = await query;
    if (error) return [];
    return sports.map((s)=>({
            ...s,
            coach_count: 0,
            athlete_count: 0
        }));
}
async function getGlobalUpcomingEvents() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data } = await supabase.from('sport_events').select('id, title, event_date, is_home, sport:sports(name)').gte('event_date', new Date().toISOString()).order('event_date', {
        ascending: true
    }).limit(6);
    return data?.map((e)=>({
            id: e.id,
            title: e.title,
            date: e.event_date,
            is_home: e.is_home,
            sport_name: e.sport?.name
        })) || [];
}
async function getSportDetail(sportId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: sport } = await supabase.from('sports').select('*').eq('id', sportId).single();
    if (!sport) return null;
    const { data: coaches } = await supabase.from('sport_coaches').select('id, role, profile:coach_id(id, first_name, last_name)').eq('sport_id', sportId);
    const { data: events } = await supabase.from('sport_events').select('*').eq('sport_id', sportId).order('event_date', {
        ascending: true
    });
    // --- ROSTER QUERY ---
    const colMap = {
        'Fall': 'sport_fall',
        'Winter': 'sport_winter',
        'Spring': 'sport_spring'
    };
    const targetCol = colMap[sport.season];
    // FIXED: 
    // 1. Used 'cached_tour_balance' (correct column name)
    // 2. Removed 'term_demerits' (does not exist on profiles table)
    const { data: roster, error: rosterError } = await supabase.from('profiles').select('id, first_name, last_name, cadet_rank, grade_level, cached_tour_balance, company:companies(company_name)').eq(targetCol, sport.name).order('last_name');
    if (rosterError) {
        console.error("Roster fetch error:", rosterError);
    }
    return {
        ...sport,
        coach_count: coaches?.length || 0,
        athlete_count: roster?.length || 0,
        coaches: coaches?.map((c)=>({
                id: c.id,
                user_id: c.profile.id,
                name: `${c.profile.last_name}, ${c.profile.first_name}`,
                role: c.role
            })) || [],
        events: events?.map((e)=>({
                ...e,
                date: e.event_date
            })) || [],
        roster: roster?.map((r)=>({
                id: r.id,
                first_name: r.first_name,
                last_name: r.last_name,
                rank: r.cadet_rank || '',
                company: r.company?.company_name || 'Unassigned',
                grade_level: r.grade_level || '-',
                current_tours: r.cached_tour_balance || 0
            })) || []
    };
}
async function searchCadets(query) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data } = await supabase.from('profiles').select('id, first_name, last_name, company:companies(company_name), role:roles!inner(default_role_level)').ilike('last_name', `${query}%`).lt('role.default_role_level', 50);
    //.limit(10)
    return data?.map((p)=>({
            id: p.id,
            label: `${p.last_name}, ${p.first_name} (${p.company?.company_name || 'N/A'})`
        })) || [];
}
async function searchFaculty(query) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data } = await supabase.from('profiles').select('id, first_name, last_name, role:roles!inner(default_role_level)').ilike('last_name', `${query}%`).gte('role.default_role_level', 50);
    //.limit(10)
    return data?.map((p)=>({
            id: p.id,
            label: `${p.last_name}, ${p.first_name} (Faculty)`
        })) || [];
}
async function claimHeadCoach(sportId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
        error: 'Unauthorized'
    };
    const { count } = await supabase.from('sport_coaches').select('*', {
        count: 'exact',
        head: true
    }).eq('sport_id', sportId);
    if (count && count > 0) return {
        error: "This sport already has a coach."
    };
    const { error } = await supabase.from('sport_coaches').insert({
        sport_id: sportId,
        coach_id: user.id,
        role: 'Head Coach'
    });
    if (!error) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/sports/${sportId}`);
    return {
        error: error?.message
    };
}
async function addAssistantCoach(sportId, userId, role = 'Assistant Coach') {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from('sport_coaches').insert({
        sport_id: sportId,
        coach_id: userId,
        role: role
    });
    if (!error) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/sports/${sportId}`);
    return {
        error: error?.message
    };
}
async function removeCoach(recordId, sportId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from('sport_coaches').delete().eq('id', recordId);
    if (!error) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/sports/${sportId}`);
    return {
        error: error?.message
    };
}
async function addToRoster(cadetId, sportName, season) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const colMap = {
        'Fall': 'sport_fall',
        'Winter': 'sport_winter',
        'Spring': 'sport_spring'
    };
    const targetCol = colMap[season];
    const { error } = await supabase.from('profiles').update({
        [targetCol]: sportName
    }).eq('id', cadetId);
    if (!error) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/sports`);
    return {
        error: error?.message
    };
}
async function removeFromRoster(cadetId, season) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const colMap = {
        'Fall': 'sport_fall',
        'Winter': 'sport_winter',
        'Spring': 'sport_spring'
    };
    const targetCol = colMap[season];
    const { error } = await supabase.from('profiles').update({
        [targetCol]: 'None'
    }).eq('id', cadetId);
    if (!error) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/sports`);
    return {
        error: error?.message
    };
}
async function addEvent(sportId, event) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from('sport_events').insert({
        sport_id: sportId,
        title: event.title,
        event_date: event.event_date,
        location: event.location,
        notes: event.notes,
        is_home: event.is_home
    });
    if (!error) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/sports/${sportId}`);
    return {
        error: error?.message
    };
}
async function removeEvent(eventId, sportId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from('sport_events').delete().eq('id', eventId);
    if (!error) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/sports/${sportId}`);
    return {
        error: error?.message
    };
}
async function getUnassignedCadets(season) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const colMap = {
        'Fall': 'sport_fall',
        'Winter': 'sport_winter',
        'Spring': 'sport_spring'
    };
    const targetCol = colMap[season];
    const { data } = await supabase.from('profiles').select('id, first_name, last_name, cadet_rank, company:companies(company_name), role:roles!inner(default_role_level)').or(`${targetCol}.is.null,${targetCol}.eq.None`).lt('role.default_role_level', 50).order('last_name');
    return data || [];
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getSportsList,
    getGlobalUpcomingEvents,
    getSportDetail,
    searchCadets,
    searchFaculty,
    claimHeadCoach,
    addAssistantCoach,
    removeCoach,
    addToRoster,
    removeFromRoster,
    addEvent,
    removeEvent,
    getUnassignedCadets
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getSportsList, "408fdd430e78ed2c34877d73295eaadcfb25b907ca", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getGlobalUpcomingEvents, "0056f82085b8a9696d7538953646288bff9ffd913c", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getSportDetail, "4054e673984498214f2c0017bd88e2e13ce72d3eee", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(searchCadets, "406da3cc3a7863d208c65296d2a20a9d8453b4070e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(searchFaculty, "40eadd2b43fd360d4359d65c22f03ac48ffbe4b0e9", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(claimHeadCoach, "4020939cefe5ed57a621e116e4fae7b42139699381", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(addAssistantCoach, "70301ed3650afacdc4e176b675b530fd7678292649", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(removeCoach, "6060891285bef1542b3c8ef70074a0a73715b21da1", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(addToRoster, "701e58f962f41130ecac5fe0e31518c93f33a2d7d4", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(removeFromRoster, "60dc33324981360b154f2062090e84adbdad188b7a", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(addEvent, "60c86d0ef03983751c53ba7082803f97a5eb86c01e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(removeEvent, "6068b5e3a8a240c51dad114b9fc718ae2b8a54d71d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getUnassignedCadets, "40945801c6a903306bf62a35b89a8a584588570bbc", null);
}),
"[project]/.next-internal/server/app/sports/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/sports/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/sports/actions.ts [app-rsc] (ecmascript)");
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
"[project]/.next-internal/server/app/sports/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/sports/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "0056f82085b8a9696d7538953646288bff9ffd913c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalUpcomingEvents"],
    "4020939cefe5ed57a621e116e4fae7b42139699381",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["claimHeadCoach"],
    "4054e673984498214f2c0017bd88e2e13ce72d3eee",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSportDetail"],
    "406da3cc3a7863d208c65296d2a20a9d8453b4070e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["searchCadets"],
    "408fdd430e78ed2c34877d73295eaadcfb25b907ca",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSportsList"],
    "40945801c6a903306bf62a35b89a8a584588570bbc",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getUnassignedCadets"],
    "40eadd2b43fd360d4359d65c22f03ac48ffbe4b0e9",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["searchFaculty"],
    "6060891285bef1542b3c8ef70074a0a73715b21da1",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeCoach"],
    "6068b5e3a8a240c51dad114b9fc718ae2b8a54d71d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeEvent"],
    "60c86d0ef03983751c53ba7082803f97a5eb86c01e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addEvent"],
    "60dc33324981360b154f2062090e84adbdad188b7a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeFromRoster"],
    "701e58f962f41130ecac5fe0e31518c93f33a2d7d4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addToRoster"],
    "70301ed3650afacdc4e176b675b530fd7678292649",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addAssistantCoach"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$sports$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/sports/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/app/sports/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sports$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/sports/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_055a4b37._.js.map