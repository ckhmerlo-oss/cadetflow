module.exports = [
"[project]/app/reports/daily/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DailyReportsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function DailyReportsPage() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('green');
    const [greenSheet, setGreenSheet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [tourSheet, setTourSheet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Permissions State
    const [userRole, setUserRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isPosting, setIsPosting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoggingTours, setIsLoggingTours] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Modal State
    const [modalOpen, setModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedCadet, setSelectedCadet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedTourCadets, setSelectedTourCadets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [toursToLog, setToursToLog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(3);
    const [logComment, setLogComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // --- Filtering & Sorting State ---
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        key: 'date',
        direction: 'desc'
    });
    // --- Set Document Title for Printing ---
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
        if (activeTab === 'green') document.title = `Green Sheet ${formattedDate}`;
        else document.title = `Tour Sheet ${formattedDate}`;
        return ()=>{
            document.title = 'CadetFlow';
        };
    }, [
        activeTab
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
    }, [
        supabase
    ]);
    // --- Handlers ---
    const handleSort = (key)=>{
        setSortConfig((current)=>({
                key,
                direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
            }));
    };
    // Bulk Select Handlers
    const handleSelectTourRow = (id)=>{
        const newSet = new Set(selectedTourCadets);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedTourCadets(newSet);
    };
    const handleSelectAllTourRows = ()=>{
        // Only select rows that have NOT been logged today
        const eligibleCadets = processedTourSheet.filter((c)=>!c.tours_logged_today).map((c)=>c.cadet_id);
        if (selectedTourCadets.size === eligibleCadets.length) {
            setSelectedTourCadets(new Set());
        } else {
            setSelectedTourCadets(new Set(eligibleCadets));
        }
    };
    // Sort Indicator Component
    const SortIcon = ({ column })=>{
        if (sortConfig.key !== column) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-gray-300 ml-1 print:hidden",
            children: "⇅"
        }, void 0, false, {
            fileName: "[project]/app/reports/daily/page.tsx",
            lineNumber: 138,
            columnNumber: 43
        }, this);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-indigo-600 dark:text-indigo-400 ml-1 print:hidden",
            children: sortConfig.direction === 'asc' ? '↑' : '↓'
        }, void 0, false, {
            fileName: "[project]/app/reports/daily/page.tsx",
            lineNumber: 139,
            columnNumber: 12
        }, this);
    };
    // --- Processed Lists (Filter & Sort) ---
    const processedGreenSheet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const lowerSearch = searchTerm.toLowerCase();
        let data = greenSheet.filter((item)=>!lowerSearch || item.subject_name.toLowerCase().includes(lowerSearch) || item.offense_name.toLowerCase().includes(lowerSearch) || item.company_name && item.company_name.toLowerCase().includes(lowerSearch));
        data.sort((a, b)=>{
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
        });
        return data;
    }, [
        greenSheet,
        searchTerm,
        sortConfig
    ]);
    const processedTourSheet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const lowerSearch = searchTerm.toLowerCase();
        let data = tourSheet.filter((item)=>!lowerSearch || item.last_name.toLowerCase().includes(lowerSearch) || item.first_name.toLowerCase().includes(lowerSearch) || item.company_name.toLowerCase().includes(lowerSearch));
        data.sort((a, b)=>{
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
        });
        return data;
    }, [
        tourSheet,
        searchTerm,
        sortConfig
    ]);
    // --- Action Handlers ---
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
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 text-center text-gray-500 dark:text-gray-400",
        children: "Loading daily reports..."
    }, void 0, false, {
        fileName: "[project]/app/reports/daily/page.tsx",
        lineNumber: 275,
        columnNumber: 23
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 text-center text-red-600 dark:text-red-400",
        children: error
    }, void 0, false, {
        fileName: "[project]/app/reports/daily/page.tsx",
        lineNumber: 276,
        columnNumber: 21
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "91434ad331695927",
                children: "@media print{@page{margin:.25in}body{color:#000!important;background-color:#fff!important}header,.no-print,.printable-section:not(.print-active){display:none!important}main{margin:0;padding:0}.print-container{max-width:none!important;margin:0!important;padding:0!important}.flow-root,.overflow-x-auto,.inline-block{width:100%!important;min-width:100%!important;display:block!important;overflow:visible!important}.printable-table{border-collapse:collapse;page-break-inside:auto;width:100%}.printable-table thead{display:table-header-group}.printable-table tbody tr{page-break-inside:avoid}.printable-table th,.printable-table td{text-align:left;vertical-align:top;word-wrap:break-word;border:1px solid #000;padding:.2rem .25rem;font-size:8pt}.printable-table th{background-color:#eee}.col-cadet{width:18%}.col-co{width:5%}.col-offense{width:25%}.col-cat{width:4%}.col-demerits{width:6%}.col-submitter{width:15%}.col-notes{width:22%}.col-date{width:5%}.col-tour-cadet{width:30%}.col-tour-co{width:15%}.col-tour-total{width:10%}.col-tour-served{width:15%}.col-tour-notes{width:30%}.fill-in-box{height:2.5em}.col-check,.cell-check{display:none}}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "tour-daily-table",
                className: "jsx-91434ad331695927" + " " + "mt-8 flex flex-col",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-91434ad331695927" + " " + "max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 print-container",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-91434ad331695927" + " " + "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-91434ad331695927",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "jsx-91434ad331695927" + " " + "text-3xl font-bold text-gray-900 dark:text-white",
                                            children: "Reports"
                                        }, void 0, false, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 321,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "jsx-91434ad331695927" + " " + "text-sm text-gray-500 dark:text-gray-400",
                                            children: "Daily administrative summaries."
                                        }, void 0, false, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 322,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/reports/daily/page.tsx",
                                    lineNumber: 320,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-91434ad331695927" + " " + "flex flex-col sm:flex-row gap-2 w-full sm:w-auto",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            placeholder: "Search reports...",
                                            value: searchTerm,
                                            onChange: (e)=>setSearchTerm(e.target.value),
                                            className: "jsx-91434ad331695927" + " " + "block w-full sm:w-64 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm py-2 px-3 text-sm"
                                        }, void 0, false, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 325,
                                            columnNumber: 14
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>window.print(),
                                            className: "jsx-91434ad331695927" + " " + "py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex-shrink-0",
                                            children: [
                                                "Print ",
                                                activeTab === 'green' ? 'Green Sheet' : 'Tour Sheet'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 332,
                                            columnNumber: 14
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/reports/daily/page.tsx",
                                    lineNumber: 324,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/reports/daily/page.tsx",
                            lineNumber: 319,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-91434ad331695927" + " " + "mt-6 border-b border-gray-200 dark:border-gray-700 no-print",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                "aria-label": "Tabs",
                                className: "jsx-91434ad331695927" + " " + "-mb-px flex space-x-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('green'),
                                        className: "jsx-91434ad331695927" + " " + `border-b-2 px-3 py-2 text-sm font-medium ${activeTab === 'green' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                                        children: "Green Sheet"
                                    }, void 0, false, {
                                        fileName: "[project]/app/reports/daily/page.tsx",
                                        lineNumber: 340,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('tour'),
                                        className: "jsx-91434ad331695927" + " " + `border-b-2 px-3 py-2 text-sm font-medium ${activeTab === 'tour' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                                        children: "Tour Sheet"
                                    }, void 0, false, {
                                        fileName: "[project]/app/reports/daily/page.tsx",
                                        lineNumber: 341,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/reports/daily/page.tsx",
                                lineNumber: 339,
                                columnNumber: 11
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/reports/daily/page.tsx",
                            lineNumber: 338,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            id: "green-sheet-container",
                            className: "jsx-91434ad331695927" + " " + `mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow printable-section ${activeTab === 'green' ? 'print-active' : 'hidden no-print'}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-91434ad331695927" + " " + "flex justify-between items-center no-print mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "jsx-91434ad331695927" + " " + "text-2xl font-semibold text-gray-800 dark:text-white",
                                            children: [
                                                "Unposted Green Sheet (",
                                                processedGreenSheet.length,
                                                ")",
                                                searchTerm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-91434ad331695927" + " " + "text-sm font-normal text-gray-500 ml-2",
                                                    children: "(Filtered)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                    lineNumber: 351,
                                                    columnNumber: 32
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 349,
                                            columnNumber: 13
                                        }, this),
                                        canPost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleMarkAsPosted,
                                            disabled: isPosting || greenSheet.length === 0,
                                            className: "jsx-91434ad331695927" + " " + "py-2 px-3 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400",
                                            children: isPosting ? 'Posting...' : `Mark All ${greenSheet.length} as Posted`
                                        }, void 0, false, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 354,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/reports/daily/page.tsx",
                                    lineNumber: 348,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "jsx-91434ad331695927" + " " + "hidden print:block",
                                    children: [
                                        "Green Sheet - ",
                                        new Date().toLocaleDateString()
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/reports/daily/page.tsx",
                                    lineNumber: 359,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-91434ad331695927" + " " + "mt-4 flow-root",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-91434ad331695927" + " " + "-mx-2 -my-2 overflow-x-auto sm:-mx-4 lg:-mx-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-91434ad331695927" + " " + "inline-block min-w-full py-2 align-middle sm:px-4 lg:px-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                className: "jsx-91434ad331695927" + " " + "min-w-full printable-table border-collapse border border-gray-300 dark:border-gray-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                        className: "jsx-91434ad331695927" + " " + "bg-gray-50 dark:bg-gray-700",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "jsx-91434ad331695927",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    onClick: ()=>handleSort('subject'),
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-cadet cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                    children: [
                                                                        "Cadet ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                            column: "subject",
                                                                            className: "jsx-91434ad331695927"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 366,
                                                                            columnNumber: 259
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 366,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    onClick: ()=>handleSort('company'),
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-co cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                    children: [
                                                                        "CO ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                            column: "company",
                                                                            className: "jsx-91434ad331695927"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 367,
                                                                            columnNumber: 253
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 367,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    onClick: ()=>handleSort('offense'),
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-offense cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                    children: [
                                                                        "Offense ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                            column: "offense",
                                                                            className: "jsx-91434ad331695927"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 368,
                                                                            columnNumber: 263
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 368,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    onClick: ()=>handleSort('cat'),
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-cat cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                    children: [
                                                                        "Cat ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                            column: "cat",
                                                                            className: "jsx-91434ad331695927"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 369,
                                                                            columnNumber: 251
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 369,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    onClick: ()=>handleSort('demerits'),
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-demerits cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                    children: [
                                                                        "Dem ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                            column: "demerits",
                                                                            className: "jsx-91434ad331695927"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 370,
                                                                            columnNumber: 261
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 370,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    onClick: ()=>handleSort('submitter'),
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-submitter cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                    children: [
                                                                        "By ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                            column: "submitter",
                                                                            className: "jsx-91434ad331695927"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 371,
                                                                            columnNumber: 262
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 371,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-notes",
                                                                    children: "Notes"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 372,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    onClick: ()=>handleSort('date'),
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-date cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                    children: [
                                                                        "Date ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                            column: "date",
                                                                            className: "jsx-91434ad331695927"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 373,
                                                                            columnNumber: 254
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 373,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                            lineNumber: 365,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                        lineNumber: 364,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                        className: "jsx-91434ad331695927" + " " + "bg-white dark:bg-gray-800",
                                                        children: processedGreenSheet.length > 0 ? processedGreenSheet.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                onClick: ()=>router.push(`/report/${r.report_id}`),
                                                                className: "jsx-91434ad331695927" + " " + "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600",
                                                                        children: r.subject_name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 383,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                        children: r.company_name || '-'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 384,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                        children: r.offense_name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 385,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                        children: r.policy_category
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 386,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                        children: r.demerits
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 387,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                        children: r.submitter_name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 388,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 max-w-xs break-words",
                                                                        children: r.notes
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 389,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                        children: formatDate(r.date_of_offense)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 390,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, r.report_id, true, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 378,
                                                                columnNumber: 23
                                                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "jsx-91434ad331695927" + " " + "no-print",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                colSpan: 8,
                                                                className: "jsx-91434ad331695927" + " " + "p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                children: searchTerm ? 'No reports match filter.' : 'No unposted demerits.'
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 392,
                                                                columnNumber: 51
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                            lineNumber: 392,
                                                            columnNumber: 26
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                        lineNumber: 376,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 363,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 362,
                                            columnNumber: 76
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/reports/daily/page.tsx",
                                        lineNumber: 362,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/reports/daily/page.tsx",
                                    lineNumber: 361,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/reports/daily/page.tsx",
                            lineNumber: 347,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "jsx-91434ad331695927" + " " + `mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow printable-section ${activeTab === 'tour' ? 'print-active' : 'hidden no-print'}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-91434ad331695927" + " " + "no-print mb-4 flex justify-between items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "jsx-91434ad331695927" + " " + "text-2xl font-semibold text-gray-800 dark:text-white",
                                            children: [
                                                "Tour Sheet (",
                                                processedTourSheet.length,
                                                ")",
                                                searchTerm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-91434ad331695927" + " " + "text-sm font-normal text-gray-500 ml-2",
                                                    children: "(Filtered)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                    lineNumber: 404,
                                                    columnNumber: 32
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 402,
                                            columnNumber: 14
                                        }, this),
                                        canLog && selectedTourCadets.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>openTourModal(),
                                            className: "jsx-91434ad331695927" + " " + "py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 text-sm font-medium",
                                            children: [
                                                "Bulk Log for ",
                                                selectedTourCadets.size,
                                                " Cadets"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 408,
                                            columnNumber: 18
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/reports/daily/page.tsx",
                                    lineNumber: 401,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "jsx-91434ad331695927" + " " + "hidden print:block",
                                    children: [
                                        "Tour Sheet - ",
                                        new Date().toLocaleDateString()
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/reports/daily/page.tsx",
                                    lineNumber: 416,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-91434ad331695927" + " " + "mt-4 flow-root",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-91434ad331695927" + " " + "-mx-2 -my-2 overflow-x-auto sm:-mx-4 lg:-mx-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-91434ad331695927" + " " + "inline-block min-w-full py-2 align-middle sm:px-4 lg:px-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                className: "jsx-91434ad331695927" + " " + "min-w-full printable-table border-collapse border border-gray-300 dark:border-gray-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                        className: "jsx-91434ad331695927" + " " + "bg-gray-50 dark:bg-gray-700",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "jsx-91434ad331695927",
                                                            children: [
                                                                canLog && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-center w-10 border border-gray-300 dark:border-gray-600 col-check no-print",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "checkbox",
                                                                        onChange: handleSelectAllTourRows,
                                                                        checked: processedTourSheet.filter((c)=>!c.tours_logged_today).length > 0 && selectedTourCadets.size === processedTourSheet.filter((c)=>!c.tours_logged_today).length,
                                                                        className: "jsx-91434ad331695927" + " " + "rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 424,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 423,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    onClick: ()=>handleSort('subject'),
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-tour-cadet cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                    children: [
                                                                        "Cadet ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                            column: "subject",
                                                                            className: "jsx-91434ad331695927"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 435,
                                                                            columnNumber: 264
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 435,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    onClick: ()=>handleSort('company'),
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-tour-co cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                    children: [
                                                                        "Company ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                            column: "company",
                                                                            className: "jsx-91434ad331695927"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 436,
                                                                            columnNumber: 263
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 436,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    onClick: ()=>handleSort('total_tours'),
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-tour-total cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                                    children: [
                                                                        "Total ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                            column: "total_tours",
                                                                            className: "jsx-91434ad331695927"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 437,
                                                                            columnNumber: 268
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 437,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white print:table-cell hidden border border-gray-300 dark:border-gray-600 col-tour-served",
                                                                    children: "Served"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 438,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "jsx-91434ad331695927" + " " + "p-2 text-left text-sm font-semibold text-gray-900 dark:text-white print:table-cell hidden border border-gray-300 dark:border-gray-600 col-tour-notes",
                                                                    children: "Notes"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 439,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "jsx-91434ad331695927" + " " + "relative p-2 no-print border-l border-gray-300 dark:border-gray-600",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-91434ad331695927" + " " + "sr-only",
                                                                        children: "Actions"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 440,
                                                                        columnNumber: 107
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                    lineNumber: 440,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                            lineNumber: 421,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                        lineNumber: 420,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                        className: "jsx-91434ad331695927" + " " + "bg-white dark:bg-gray-800",
                                                        children: processedTourSheet.length > 0 ? processedTourSheet.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                className: "jsx-91434ad331695927" + " " + `
                            ${c.has_star_tours ? 'bg-red-50 dark:bg-red-900/20' : ''} 
                            ${c.tours_logged_today ? 'opacity-50 bg-gray-50 dark:bg-gray-900/50' : ''}
                        `,
                                                                children: [
                                                                    canLog && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 text-center border border-gray-300 dark:border-gray-600 cell-check no-print",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "checkbox",
                                                                            checked: selectedTourCadets.has(c.cadet_id),
                                                                            onChange: ()=>handleSelectTourRow(c.cadet_id),
                                                                            disabled: c.tours_logged_today,
                                                                            className: "jsx-91434ad331695927" + " " + "rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 454,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 453,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-91434ad331695927" + " " + "flex items-center gap-2",
                                                                            children: [
                                                                                c.has_star_tours && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "aria-hidden": "true",
                                                                                    title: "Star Tours Assigned",
                                                                                    className: "jsx-91434ad331695927" + " " + "font-bold text-lg leading-none text-red-600 dark:text-red-400",
                                                                                    children: "∗"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 466,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                c.tours_logged_today && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "jsx-91434ad331695927" + " " + "text-green-600 dark:text-green-400 font-bold text-xs border border-green-600 dark:border-green-400 px-1 rounded no-print",
                                                                                    children: "✓"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 471,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "jsx-91434ad331695927",
                                                                                    children: [
                                                                                        c.last_name,
                                                                                        ", ",
                                                                                        c.first_name
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/reports/daily/page.tsx",
                                                                                    lineNumber: 475,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 464,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 463,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                        children: c.company_name || '-'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 478,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 text-sm font-bold text-red-600 dark:text-red-400 border border-gray-300 dark:border-gray-600",
                                                                        children: c.has_star_tours ? '*' : c.total_tours
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 479,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 print:table-cell hidden fill-in-box border border-gray-300 dark:border-gray-600"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 482,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "p-2 print:table-cell hidden fill-in-box border border-gray-300 dark:border-gray-600"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 483,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "jsx-91434ad331695927" + " " + "relative p-2 text-right text-sm font-medium no-print border border-gray-300 dark:border-gray-600",
                                                                        children: canLog && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>openTourModal(c),
                                                                            className: "jsx-91434ad331695927" + " " + "text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 disabled:text-gray-400",
                                                                            children: "Log"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                                            lineNumber: 486,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                                        lineNumber: 484,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, c.cadet_id, true, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 445,
                                                                columnNumber: 23
                                                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "jsx-91434ad331695927" + " " + "no-print",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                colSpan: 7,
                                                                className: "jsx-91434ad331695927" + " " + "p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
                                                                children: searchTerm ? 'No cadets match filter.' : 'No cadets on ED.'
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 495,
                                                                columnNumber: 51
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/reports/daily/page.tsx",
                                                            lineNumber: 495,
                                                            columnNumber: 26
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                        lineNumber: 443,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 419,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/reports/daily/page.tsx",
                                            lineNumber: 418,
                                            columnNumber: 76
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/reports/daily/page.tsx",
                                        lineNumber: 418,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/reports/daily/page.tsx",
                                    lineNumber: 417,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/reports/daily/page.tsx",
                            lineNumber: 400,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/reports/daily/page.tsx",
                    lineNumber: 318,
                    columnNumber: 8
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/reports/daily/page.tsx",
                lineNumber: 315,
                columnNumber: 7
            }, this),
            modalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "aria-labelledby": "modal-title",
                role: "dialog",
                "aria-modal": "true",
                className: "jsx-91434ad331695927" + " " + "relative z-10 no-print",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-91434ad331695927" + " " + "fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900/75 transition-opacity"
                    }, void 0, false, {
                        fileName: "[project]/app/reports/daily/page.tsx",
                        lineNumber: 507,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-91434ad331695927" + " " + "fixed inset-0 z-10 overflow-y-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-91434ad331695927" + " " + "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-91434ad331695927" + " " + "relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-91434ad331695927" + " " + "bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                id: "modal-title",
                                                className: "jsx-91434ad331695927" + " " + "text-lg font-medium leading-6 text-gray-900 dark:text-white",
                                                children: selectedCadet ? `Log Served Tours: ${selectedCadet.last_name}` : `Bulk Log Tours (${selectedTourCadets.size} Cadets)`
                                            }, void 0, false, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 513,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "jsx-91434ad331695927" + " " + "text-sm text-gray-500 dark:text-gray-400",
                                                children: selectedCadet ? `Current Balance: ${selectedCadet.has_star_tours ? '*' : selectedCadet.total_tours} tours` : `This will deduct tours from all selected cadets.`
                                            }, void 0, false, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 520,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-91434ad331695927" + " " + "mt-4 space-y-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-91434ad331695927",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "jsx-91434ad331695927" + " " + "block text-sm font-medium text-gray-700 dark:text-gray-300",
                                                                children: "Tours Served"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 529,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "number",
                                                                value: toursToLog,
                                                                onChange: (e)=>setToursToLog(Number(e.target.value)),
                                                                className: "jsx-91434ad331695927" + " " + "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 530,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                        lineNumber: 528,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-91434ad331695927",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "jsx-91434ad331695927" + " " + "block text-sm font-medium text-gray-700 dark:text-gray-300",
                                                                children: "Notes"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 533,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                placeholder: "e.g., 'Good behavior'",
                                                                value: logComment,
                                                                onChange: (e)=>setLogComment(e.target.value),
                                                                className: "jsx-91434ad331695927" + " " + "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                                lineNumber: 534,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/reports/daily/page.tsx",
                                                        lineNumber: 532,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 527,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/reports/daily/page.tsx",
                                        lineNumber: 511,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-91434ad331695927" + " " + "bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                disabled: isLoggingTours,
                                                onClick: handleLogTours,
                                                className: "jsx-91434ad331695927" + " " + "inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400",
                                                children: isLoggingTours ? 'Logging...' : 'Confirm Log'
                                            }, void 0, false, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 539,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: closeModal,
                                                className: "jsx-91434ad331695927" + " " + "mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/app/reports/daily/page.tsx",
                                                lineNumber: 540,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/reports/daily/page.tsx",
                                        lineNumber: 538,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/reports/daily/page.tsx",
                                lineNumber: 510,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/reports/daily/page.tsx",
                            lineNumber: 509,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/reports/daily/page.tsx",
                        lineNumber: 508,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/reports/daily/page.tsx",
                lineNumber: 506,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=app_reports_daily_page_tsx_d423d8cc._.js.map