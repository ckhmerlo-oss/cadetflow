(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/reports/daily/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DailyReportsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function DailyReportsPage() {
    _s();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('green');
    const [greenSheet, setGreenSheet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [tourSheet, setTourSheet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [userRole, setUserRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isPosting, setIsPosting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoggingTours, setIsLoggingTours] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [modalOpen, setModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedCadet, setSelectedCadet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedTourCadets, setSelectedTourCadets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [toursToLog, setToursToLog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(3);
    const [logComment, setLogComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        key: 'date',
        direction: 'desc'
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DailyReportsPage.useEffect": ()=>{
            const date = new Date();
            const formattedDate = date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });
            if (activeTab === 'green') document.title = `Green Sheet ${formattedDate}`;
            else document.title = `Tour Sheet ${formattedDate}`;
            return ({
                "DailyReportsPage.useEffect": ()=>{
                    document.title = 'CadetFlow';
                }
            })["DailyReportsPage.useEffect"];
        }
    }["DailyReportsPage.useEffect"], [
        activeTab
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DailyReportsPage.useEffect": ()=>{
            async function getReports() {
                setLoading(true);
                setError(null);
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('roles:role_id ( role_name )').eq('id', user.id).single();
                    if (profile && profile.roles) {
                        setUserRole(profile.roles.role_name || '');
                    }
                }
                const [greenRes, tourRes] = await Promise.all([
                    supabase.rpc('get_unposted_green_sheet'),
                    supabase.rpc('get_tour_sheet')
                ]);
                if (greenRes.error) {
                    setError("You do not have permission to view these reports.");
                } else {
                    setGreenSheet(greenRes.data || []);
                }
                if (tourRes.error && !greenRes.error) {
                    setError(tourRes.error.message);
                } else if (tourRes.data) {
                    setTourSheet(tourRes.data);
                }
                setLoading(false);
            }
            getReports();
        }
    }["DailyReportsPage.useEffect"], [
        supabase
    ]);
    const handleSort = (key)=>{
        setSortConfig((current)=>({
                key,
                direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
            }));
    };
    const handleSelectTourRow = (id)=>{
        const newSet = new Set(selectedTourCadets);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedTourCadets(newSet);
    };
    const handleSelectAllTourRows = ()=>{
        const eligibleCadets = processedTourSheet.filter((c)=>!c.tours_logged_today).map((c)=>c.cadet_id);
        if (selectedTourCadets.size === eligibleCadets.length) {
            setSelectedTourCadets(new Set());
        } else {
            setSelectedTourCadets(new Set(eligibleCadets));
        }
    };
    const SortIcon = ({ column })=>{
        if (sortConfig.key !== column) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-gray-300 ml-1 print:hidden",
            children: "⇅"
        }, void 0, false, {
            fileName: "[project]/app/reports/daily/page.tsx",
            lineNumber: 128,
            columnNumber: 43
        }, this);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-indigo-600 dark:text-indigo-400 ml-1 print:hidden",
            children: sortConfig.direction === 'asc' ? '↑' : '↓'
        }, void 0, false, {
            fileName: "[project]/app/reports/daily/page.tsx",
            lineNumber: 129,
            columnNumber: 12
        }, this);
    };
    const processedGreenSheet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DailyReportsPage.useMemo[processedGreenSheet]": ()=>{
            const lowerSearch = searchTerm.toLowerCase();
            let data = greenSheet.filter({
                "DailyReportsPage.useMemo[processedGreenSheet].data": (item)=>!lowerSearch || item.subject_name.toLowerCase().includes(lowerSearch) || item.offense_name.toLowerCase().includes(lowerSearch) || item.company_name && item.company_name.toLowerCase().includes(lowerSearch)
            }["DailyReportsPage.useMemo[processedGreenSheet].data"]);
            data.sort({
                "DailyReportsPage.useMemo[processedGreenSheet]": (a, b)=>{
                    let valA = '', valB = '';
                    switch(sortConfig.key){
                        case 'subject':
                            valA = a.subject_name;
                            valB = b.subject_name;
                            break;
                        case 'company':
                            valA = a.company_name || '';
                            valB = b.company_name || '';
                            break;
                        case 'offense':
                            valA = a.offense_name;
                            valB = b.offense_name;
                            break;
                        case 'cat':
                            valA = a.policy_category;
                            valB = b.policy_category;
                            break;
                        case 'demerits':
                            valA = a.demerits;
                            valB = b.demerits;
                            break;
                        case 'submitter':
                            valA = a.submitter_name;
                            valB = b.submitter_name;
                            break;
                        case 'date':
                            valA = new Date(a.date_of_offense).getTime();
                            valB = new Date(b.date_of_offense).getTime();
                            break;
                        default:
                            return 0;
                    }
                    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                }
            }["DailyReportsPage.useMemo[processedGreenSheet]"]);
            return data;
        }
    }["DailyReportsPage.useMemo[processedGreenSheet]"], [
        greenSheet,
        searchTerm,
        sortConfig
    ]);
    const processedTourSheet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DailyReportsPage.useMemo[processedTourSheet]": ()=>{
            const lowerSearch = searchTerm.toLowerCase();
            let data = tourSheet.filter({
                "DailyReportsPage.useMemo[processedTourSheet].data": (item)=>!lowerSearch || item.last_name.toLowerCase().includes(lowerSearch) || item.first_name.toLowerCase().includes(lowerSearch) || item.company_name.toLowerCase().includes(lowerSearch)
            }["DailyReportsPage.useMemo[processedTourSheet].data"]);
            data.sort({
                "DailyReportsPage.useMemo[processedTourSheet]": (a, b)=>{
                    let valA = '', valB = '';
                    switch(sortConfig.key){
                        case 'subject':
                            valA = a.last_name;
                            valB = b.last_name;
                            break;
                        case 'company':
                            valA = a.company_name;
                            valB = b.company_name;
                            break;
                        case 'total_tours':
                            valA = a.total_tours;
                            valB = b.total_tours;
                            break;
                        default:
                            return 0;
                    }
                    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                }
            }["DailyReportsPage.useMemo[processedTourSheet]"]);
            return data;
        }
    }["DailyReportsPage.useMemo[processedTourSheet]"], [
        tourSheet,
        searchTerm,
        sortConfig
    ]);
    async function handleMarkAsPosted() {
        if (greenSheet.length === 0 || !window.confirm("Mark all currently unposted reports as posted?")) return;
        setIsPosting(true);
        const { error } = await supabase.rpc('mark_green_sheet_as_posted', {
            p_report_ids: greenSheet.map((r)=>r.report_id)
        });
        if (error) alert(error.message);
        else {
            setGreenSheet([]);
            alert("Posted successfully.");
        }
        setIsPosting(false);
    }
    async function handleLogTours() {
        if (toursToLog <= 0) return;
        if (selectedCadet && !selectedTourCadets.size) {
            if (toursToLog > selectedCadet.total_tours && !selectedCadet.has_star_tours) {
                alert(`Cannot log ${toursToLog} tours. Only ${selectedCadet.total_tours} remaining.`);
                return;
            }
        }
        setIsLoggingTours(true);
        let successCount = 0;
        let errorMsg = '';
        const targets = selectedCadet ? [
            selectedCadet.cadet_id
        ] : Array.from(selectedTourCadets);
        const promises = targets.map((cadetId)=>supabase.rpc('log_served_tours', {
                p_cadet_id: cadetId,
                p_tours_served: toursToLog,
                p_comment: logComment
            }));
        const results = await Promise.all(promises);
        results.forEach((res)=>{
            if (res.error) errorMsg = res.error.message;
            else successCount++;
        });
        if (errorMsg && successCount === 0) {
            alert(`Failed: ${errorMsg}`);
        } else {
            const affectedIds = new Set(targets);
            setTourSheet((prev)=>prev.map((c)=>affectedIds.has(c.cadet_id) ? {
                        ...c,
                        total_tours: c.total_tours - toursToLog,
                        tours_logged_today: true
                    } : c).filter((c)=>c.total_tours > 0 || c.has_star_tours));
            closeModal();
            setSelectedTourCadets(new Set());
        }
        setIsLoggingTours(false);
    }
    function openTourModal(cadet) {
        if (cadet) {
            setSelectedCadet(cadet);
        } else {
            setSelectedCadet(null);
        }
        setToursToLog(3);
        setLogComment('');
        setModalOpen(true);
    }
    function closeModal() {
        setModalOpen(false);
        setSelectedCadet(null);
    }
    const formatDate = (d)=>new Date(new Date(d).getTime() + new Date(d).getTimezoneOffset() * 60000).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit'
        });
    const canPost = [
        'Commandant',
        'Deputy Commandant',
        'Admin'
    ].includes(userRole);
    const canLog = userRole.includes('TAC') || canPost;
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 text-center text-gray-500 dark:text-gray-400",
        children: "Loading daily reports..."
    }, void 0, false, {
        fileName: "[project]/app/reports/daily/page.tsx",
        lineNumber: 233,
        columnNumber: 23
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 text-center text-red-600 dark:text-red-400",
        children: error
    }, void 0, false, {
        fileName: "[project]/app/reports/daily/page.tsx",
        lineNumber: 234,
        columnNumber: 21
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "ca50e6d014e17e6d",
                children: "@media print{@page{margin:.25in}body{color:#000!important;background-color:#fff!important}header,.no-print,.printable-section:not(.print-active){display:none!important}main{margin:0;padding:0}.print-container{max-width:none!important;margin:0!important;padding:0!important}.flow-root,.overflow-x-auto,.inline-block{width:100%!important;min-width:100%!important;display:block!important;overflow:visible!important}.printable-table{border-collapse:collapse;page-break-inside:auto;width:100%}.printable-table thead{display:table-header-group}.printable-table tbody tr{page-break-inside:avoid}.printable-table th,.printable-table td{text-align:left;vertical-align:top;word-wrap:break-word;border:1px solid #000;padding:.2rem .25rem;font-size:8pt}.printable-table th{background-color:#eee}.printable-table th,.printable-table td{display:table-cell!important}.col-cadet{width:18%}.col-co{width:5%}.col-offense{width:25%}.col-cat{width:4%}.col-demerits{width:6%}.col-submitter{width:15%}.col-notes{width:22%}.col-date{width:5%}.col-tour-cadet{width:30%}.col-tour-co{width:15%}.col-tour-total{width:10%}.col-tour-served{width:15%}.col-tour-notes{width:30%}.fill-in-box{height:2.5em}.col-check,.cell-check{display:none}}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "tour-daily-table",
                className: "jsx-ca50e6d014e17e6d" + " " + "mt-8 flex flex-col",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-ca50e6d014e17e6d" + " " + "w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 print-container",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-ca50e6d014e17e6d" + " " + "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-ca50e6d014e17e6d",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "jsx-ca50e6d014e17e6d" + " " + "text-3xl font-bold text-gray-900 dark:text-white",
                                            children: "Reports"
                                        }, void 0, false, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 270,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "jsx-ca50e6d014e17e6d" + " " + "text-sm text-gray-500 dark:text-gray-400",
                                            children: "Daily administrative summaries."
                                        }, void 0, false, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 271,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/reports/daily/page.tsx",
                                    lineNumber: 269,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-ca50e6d014e17e6d" + " " + "flex flex-col sm:flex-row gap-2 w-full sm:w-auto",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            placeholder: "Search reports...",
                                            value: searchTerm,
                                            onChange: (e)=>setSearchTerm(e.target.value),
                                            className: "jsx-ca50e6d014e17e6d" + " " + "block w-full sm:w-64 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm py-2 px-3 text-sm"
                                        }, void 0, false, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 274,
                                            columnNumber: 14
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>window.print(),
                                            className: "jsx-ca50e6d014e17e6d" + " " + "py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex-shrink-0",
                                            children: [
                                                "Print ",
                                                activeTab === 'green' ? 'Green Sheet' : 'Tour Sheet'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 281,
                                            columnNumber: 14
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/reports/daily/page.tsx",
                                    lineNumber: 273,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/reports/daily/page.tsx",
                            lineNumber: 268,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            id: "daily-tabs",
                            className: "jsx-ca50e6d014e17e6d" + " " + "mt-6 border-b border-gray-200 dark:border-gray-700 no-print",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                "aria-label": "Tabs",
                                className: "jsx-ca50e6d014e17e6d" + " " + "-mb-px flex space-x-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('green'),
                                        className: "jsx-ca50e6d014e17e6d" + " " + `border-b-2 px-3 py-2 text-sm font-medium ${activeTab === 'green' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                                        children: "Green Sheet"
                                    }, void 0, false, {
                                        fileName: "[project]/app/reports/daily/page.tsx",
                                        lineNumber: 289,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('tour'),
                                        className: "jsx-ca50e6d014e17e6d" + " " + `border-b-2 px-3 py-2 text-sm font-medium ${activeTab === 'tour' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                                        children: "Tour Sheet"
                                    }, void 0, false, {
                                        fileName: "[project]/app/reports/daily/page.tsx",
                                        lineNumber: 290,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/reports/daily/page.tsx",
                                lineNumber: 288,
                                columnNumber: 11
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/reports/daily/page.tsx",
                            lineNumber: 287,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            id: "daily-content-area",
                            className: "jsx-ca50e6d014e17e6d",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                    id: "green-sheet-container",
                                    className: "jsx-ca50e6d014e17e6d" + " " + `mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow printable-section ${activeTab === 'green' ? 'print-active' : 'hidden no-print'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-ca50e6d014e17e6d" + " " + "flex justify-between items-center no-print mb-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "jsx-ca50e6d014e17e6d" + " " + "text-2xl font-semibold text-gray-800 dark:text-white",
                                                    children: [
                                                        "Unposted Green Sheet (",
                                                        processedGreenSheet.length,
                                                        ")",
                                                        searchTerm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-ca50e6d014e17e6d" + " " + "text-sm font-normal text-gray-500 ml-2",
                                                            children: "(Filtered)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                            lineNumber: 300,
                                                            columnNumber: 36
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                    lineNumber: 298,
                                                    columnNumber: 17
                                                }, this),
                                                canPost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleMarkAsPosted,
                                                    disabled: isPosting || greenSheet.length === 0,
                                                    className: "jsx-ca50e6d014e17e6d" + " " + "py-2 px-3 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400",
                                                    children: isPosting ? 'Posting...' : `Mark All ${greenSheet.length} as Posted`
                                                }, void 0, false, {
                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                    lineNumber: 303,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 297,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "jsx-ca50e6d014e17e6d" + " " + "hidden print:block",
                                            children: [
                                                "Green Sheet - ",
                                                new Date().toLocaleDateString()
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 308,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-ca50e6d014e17e6d" + " " + "mt-4 flow-root",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-ca50e6d014e17e6d" + " " + "-mx-2 -my-2 overflow-x-auto sm:-mx-4 lg:-mx-6",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-ca50e6d014e17e6d" + " " + "inline-block min-w-full w-full py-2 align-middle sm:px-4 lg:px-6",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                        className: "jsx-ca50e6d014e17e6d" + " " + "min-w-full w-full printable-table border-collapse border border-gray-300 dark:border-gray-700",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                                className: "jsx-ca50e6d014e17e6d" + " " + "bg-gray-50 dark:bg-gray-700",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                    className: "jsx-ca50e6d014e17e6d",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            onClick: ()=>handleSort('subject'),
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-cadet cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                            children: [
                                                                                "Cadet ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                                    column: "subject",
                                                                                    className: "jsx-ca50e6d014e17e6d"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 316,
                                                                                    columnNumber: 261
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 316,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            onClick: ()=>handleSort('company'),
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "hidden md:table-cell p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-co cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                            children: [
                                                                                "CO ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                                    column: "company",
                                                                                    className: "jsx-ca50e6d014e17e6d"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 319,
                                                                                    columnNumber: 276
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 319,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            onClick: ()=>handleSort('offense'),
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-offense cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                            children: [
                                                                                "Offense ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                                    column: "offense",
                                                                                    className: "jsx-ca50e6d014e17e6d"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 321,
                                                                                    columnNumber: 265
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 321,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            onClick: ()=>handleSort('cat'),
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "hidden lg:table-cell p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-cat cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                            children: [
                                                                                "Cat ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                                    column: "cat",
                                                                                    className: "jsx-ca50e6d014e17e6d"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 323,
                                                                                    columnNumber: 274
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 323,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            onClick: ()=>handleSort('demerits'),
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-demerits cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                            children: [
                                                                                "Dem ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                                    column: "demerits",
                                                                                    className: "jsx-ca50e6d014e17e6d"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 325,
                                                                                    columnNumber: 263
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 325,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            onClick: ()=>handleSort('submitter'),
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "hidden md:table-cell p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-submitter cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                            children: [
                                                                                "By ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                                    column: "submitter",
                                                                                    className: "jsx-ca50e6d014e17e6d"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 327,
                                                                                    columnNumber: 285
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 327,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "hidden lg:table-cell p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-notes",
                                                                            children: "Notes"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 329,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            onClick: ()=>handleSort('date'),
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "hidden sm:table-cell p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-date cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                            children: [
                                                                                "Date ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                                    column: "date",
                                                                                    className: "jsx-ca50e6d014e17e6d"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 331,
                                                                                    columnNumber: 277
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 331,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 314,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 313,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                                className: "jsx-ca50e6d014e17e6d" + " " + "bg-white dark:bg-gray-800",
                                                                children: processedGreenSheet.length > 0 ? processedGreenSheet.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                        onClick: ()=>router.push(`/report/${r.report_id}`),
                                                                        className: "jsx-ca50e6d014e17e6d" + " " + "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600",
                                                                                children: r.subject_name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 341,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "hidden md:table-cell p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                                children: r.company_name || '-'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 342,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                                children: r.offense_name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 343,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "hidden lg:table-cell p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                                children: r.policy_category
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 344,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                                children: r.demerits
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 345,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "hidden md:table-cell p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                                children: r.submitter_name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 346,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "hidden lg:table-cell p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 max-w-xs break-words",
                                                                                children: r.notes
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 347,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "hidden sm:table-cell p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                                children: formatDate(r.date_of_offense)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 348,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, r.report_id, true, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 336,
                                                                        columnNumber: 25
                                                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                    className: "jsx-ca50e6d014e17e6d" + " " + "no-print",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        colSpan: 8,
                                                                        className: "jsx-ca50e6d014e17e6d" + " " + "p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                        children: searchTerm ? 'No reports match filter.' : 'No unposted demerits.'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 350,
                                                                        columnNumber: 55
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 350,
                                                                    columnNumber: 30
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 334,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                        lineNumber: 312,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                    lineNumber: 311,
                                                    columnNumber: 80
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 311,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 310,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/reports/daily/page.tsx",
                                    lineNumber: 296,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                    className: "jsx-ca50e6d014e17e6d" + " " + `mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow printable-section ${activeTab === 'tour' ? 'print-active' : 'hidden no-print'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-ca50e6d014e17e6d" + " " + "no-print mb-4 flex justify-between items-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "jsx-ca50e6d014e17e6d" + " " + "text-2xl font-semibold text-gray-800 dark:text-white",
                                                    children: [
                                                        "Tour Sheet (",
                                                        processedTourSheet.length,
                                                        ")",
                                                        searchTerm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-ca50e6d014e17e6d" + " " + "text-sm font-normal text-gray-500 ml-2",
                                                            children: "(Filtered)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                            lineNumber: 362,
                                                            columnNumber: 36
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                    lineNumber: 360,
                                                    columnNumber: 17
                                                }, this),
                                                canLog && selectedTourCadets.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    id: "tour-bulk-log-btn",
                                                    onClick: ()=>openTourModal(),
                                                    className: "jsx-ca50e6d014e17e6d" + " " + "py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 text-sm font-medium",
                                                    children: [
                                                        "Bulk Log for ",
                                                        selectedTourCadets.size,
                                                        " Cadets"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                    lineNumber: 366,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 359,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "jsx-ca50e6d014e17e6d" + " " + "hidden print:block",
                                            children: [
                                                "Tour Sheet - ",
                                                new Date().toLocaleDateString()
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 375,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-ca50e6d014e17e6d" + " " + "mt-4 flow-root",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-ca50e6d014e17e6d" + " " + "-mx-2 -my-2 overflow-x-auto sm:-mx-4 lg:-mx-6",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-ca50e6d014e17e6d" + " " + "inline-block min-w-full w-full py-2 align-middle sm:px-4 lg:px-6",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                        className: "jsx-ca50e6d014e17e6d" + " " + "min-w-full w-full printable-table border-collapse border border-gray-300 dark:border-gray-700",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                                className: "jsx-ca50e6d014e17e6d" + " " + "bg-gray-50 dark:bg-gray-700",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                    className: "jsx-ca50e6d014e17e6d",
                                                                    children: [
                                                                        canLog && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-center w-10 border border-gray-300 dark:border-gray-600 col-check no-print",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                type: "checkbox",
                                                                                onChange: handleSelectAllTourRows,
                                                                                checked: processedTourSheet.filter((c)=>!c.tours_logged_today).length > 0 && selectedTourCadets.size === processedTourSheet.filter((c)=>!c.tours_logged_today).length,
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 383,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 382,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            onClick: ()=>handleSort('subject'),
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-tour-cadet cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-1/3",
                                                                            children: [
                                                                                "Cadet ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                                    column: "subject",
                                                                                    className: "jsx-ca50e6d014e17e6d"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 395,
                                                                                    columnNumber: 272
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 395,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            onClick: ()=>handleSort('company'),
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "hidden md:table-cell p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-tour-co cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-1/4",
                                                                            children: [
                                                                                "Company ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                                    column: "company",
                                                                                    className: "jsx-ca50e6d014e17e6d"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 396,
                                                                                    columnNumber: 292
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 396,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            onClick: ()=>handleSort('total_tours'),
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-tour-total cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-1/6",
                                                                            children: [
                                                                                "Total ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                                    column: "total_tours",
                                                                                    className: "jsx-ca50e6d014e17e6d"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 397,
                                                                                    columnNumber: 276
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 397,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white print:table-cell hidden border border-gray-300 dark:border-gray-600 col-tour-served",
                                                                            children: "Served"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 398,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white print:table-cell hidden border border-gray-300 dark:border-gray-600 col-tour-notes",
                                                                            children: "Notes"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 399,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "relative p-2 no-print border-l border-gray-300 dark:border-gray-600 w-auto",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "sr-only",
                                                                                children: "Actions"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 400,
                                                                                columnNumber: 116
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 400,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 380,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 379,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                                className: "jsx-ca50e6d014e17e6d" + " " + "bg-white dark:bg-gray-800",
                                                                children: processedTourSheet.length > 0 ? processedTourSheet.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                        className: "jsx-ca50e6d014e17e6d" + " " + `
                                ${c.has_star_tours ? 'bg-red-50 dark:bg-red-900/20' : ''} 
                                ${c.tours_logged_today ? 'opacity-50 bg-gray-50 dark:bg-gray-900/50' : ''}
                            `,
                                                                        children: [
                                                                            canLog && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-center border border-gray-300 dark:border-gray-600 cell-check no-print",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                    type: "checkbox",
                                                                                    checked: selectedTourCadets.has(c.cadet_id),
                                                                                    onChange: ()=>handleSelectTourRow(c.cadet_id),
                                                                                    disabled: c.tours_logged_today,
                                                                                    className: "jsx-ca50e6d014e17e6d" + " " + "rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 414,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 413,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "jsx-ca50e6d014e17e6d" + " " + "flex items-center gap-2",
                                                                                    children: [
                                                                                        c.has_star_tours && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            "aria-hidden": "true",
                                                                                            title: "Star Tours Assigned",
                                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "font-bold text-lg leading-none text-red-600 dark:text-red-400",
                                                                                            children: "∗"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                                            lineNumber: 426,
                                                                                            columnNumber: 33
                                                                                        }, this),
                                                                                        c.tours_logged_today && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "jsx-ca50e6d014e17e6d" + " " + "text-green-600 dark:text-green-400 font-bold text-xs border border-green-600 dark:border-green-400 px-1 rounded no-print",
                                                                                            children: "✓"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                                            lineNumber: 431,
                                                                                            columnNumber: 37
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "jsx-ca50e6d014e17e6d",
                                                                                            children: [
                                                                                                c.last_name,
                                                                                                ", ",
                                                                                                c.first_name
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                                            lineNumber: 435,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 424,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 423,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "hidden md:table-cell p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                                children: c.company_name || '-'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 439,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "p-2 text-sm font-bold text-red-600 dark:text-red-400 border border-gray-300 dark:border-gray-600",
                                                                                children: c.has_star_tours ? '*' : c.total_tours
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 440,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "p-2 print:table-cell hidden fill-in-box border border-gray-300 dark:border-gray-600"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 443,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "p-2 print:table-cell hidden fill-in-box border border-gray-300 dark:border-gray-600"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 444,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "jsx-ca50e6d014e17e6d" + " " + "relative p-2 text-right text-sm font-medium no-print border border-gray-300 dark:border-gray-600",
                                                                                children: canLog && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>openTourModal(c),
                                                                                    className: "jsx-ca50e6d014e17e6d" + " " + "text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 disabled:text-gray-400",
                                                                                    children: "Log"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 447,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                                lineNumber: 445,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, c.cadet_id, true, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 405,
                                                                        columnNumber: 25
                                                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                    className: "jsx-ca50e6d014e17e6d" + " " + "no-print",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        colSpan: 7,
                                                                        className: "jsx-ca50e6d014e17e6d" + " " + "p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                        children: searchTerm ? 'No cadets match filter.' : 'No cadets on ED.'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 456,
                                                                        columnNumber: 55
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 456,
                                                                    columnNumber: 30
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 403,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                        lineNumber: 378,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                    lineNumber: 377,
                                                    columnNumber: 80
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 377,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 376,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/reports/daily/page.tsx",
                                    lineNumber: 358,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/reports/daily/page.tsx",
                            lineNumber: 294,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/reports/daily/page.tsx",
                    lineNumber: 267,
                    columnNumber: 8
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/reports/daily/page.tsx",
                lineNumber: 266,
                columnNumber: 7
            }, this),
            modalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "aria-labelledby": "modal-title",
                role: "dialog",
                "aria-modal": "true",
                className: "jsx-ca50e6d014e17e6d" + " " + "relative z-10 no-print",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-ca50e6d014e17e6d" + " " + "fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900/75 transition-opacity"
                    }, void 0, false, {
                        fileName: "[project]/app/reports/daily/page.tsx",
                        lineNumber: 469,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-ca50e6d014e17e6d" + " " + "fixed inset-0 z-10 overflow-y-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-ca50e6d014e17e6d" + " " + "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-ca50e6d014e17e6d" + " " + "relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-ca50e6d014e17e6d" + " " + "bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                id: "modal-title",
                                                className: "jsx-ca50e6d014e17e6d" + " " + "text-lg font-medium leading-6 text-gray-900 dark:text-white",
                                                children: selectedCadet ? `Log Served Tours: ${selectedCadet.last_name}` : `Bulk Log Tours (${selectedTourCadets.size} Cadets)`
                                            }, void 0, false, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 475,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "jsx-ca50e6d014e17e6d" + " " + "text-sm text-gray-500 dark:text-gray-400",
                                                children: selectedCadet ? `Current Balance: ${selectedCadet.has_star_tours ? '*' : selectedCadet.total_tours} tours` : `This will deduct tours from all selected cadets.`
                                            }, void 0, false, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 482,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-ca50e6d014e17e6d" + " " + "mt-4 space-y-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-ca50e6d014e17e6d",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "jsx-ca50e6d014e17e6d" + " " + "block text-sm font-medium text-gray-700 dark:text-gray-300",
                                                                children: "Tours Served"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 491,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "number",
                                                                value: toursToLog,
                                                                onChange: (e)=>setToursToLog(Number(e.target.value)),
                                                                className: "jsx-ca50e6d014e17e6d" + " " + "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 492,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                        lineNumber: 490,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-ca50e6d014e17e6d",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "jsx-ca50e6d014e17e6d" + " " + "block text-sm font-medium text-gray-700 dark:text-gray-300",
                                                                children: "Notes"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 495,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                placeholder: "e.g., 'Good behavior'",
                                                                value: logComment,
                                                                onChange: (e)=>setLogComment(e.target.value),
                                                                className: "jsx-ca50e6d014e17e6d" + " " + "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 496,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                        lineNumber: 494,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 489,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/reports/daily/page.tsx",
                                        lineNumber: 473,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-ca50e6d014e17e6d" + " " + "bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                disabled: isLoggingTours,
                                                onClick: handleLogTours,
                                                className: "jsx-ca50e6d014e17e6d" + " " + "inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400",
                                                children: isLoggingTours ? 'Logging...' : 'Confirm Log'
                                            }, void 0, false, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 501,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: closeModal,
                                                className: "jsx-ca50e6d014e17e6d" + " " + "mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 502,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/reports/daily/page.tsx",
                                        lineNumber: 500,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/reports/daily/page.tsx",
                                lineNumber: 472,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/reports/daily/page.tsx",
                            lineNumber: 471,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/reports/daily/page.tsx",
                        lineNumber: 470,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/reports/daily/page.tsx",
                lineNumber: 468,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(DailyReportsPage, "8fo9QboWUZVFksROrC1XSDFNIpM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = DailyReportsPage;
var _c;
__turbopack_context__.k.register(_c, "DailyReportsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_reports_daily_page_tsx_2ad5d83c._.js.map