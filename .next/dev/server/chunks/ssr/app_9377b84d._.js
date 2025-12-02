module.exports = [
"[project]/app/manage/RosterClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RosterClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
'use client';
;
;
;
const CONDUCT_ORDER = [
    'Exemplary',
    'Commendable',
    'Satisfactory',
    'Deficient',
    'Unsatisfactory'
];
function RosterClient({ initialData, canEditProfiles, companies, onReassign, variant = 'cadet', canManage }) {
    const [openCadetId, setOpenCadetId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [filterCompany, setFilterCompany] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [filterGrade, setFilterGrade] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [filterConduct, setFilterConduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        key: 'last_name',
        direction: 'ascending'
    });
    const handleRowClick = (cadetId)=>{
        setOpenCadetId((prevId)=>prevId === cadetId ? null : cadetId);
    };
    // --- Helpers ---
    const getCompanyAbbr = (name)=>{
        if (!name) return '-';
        if (name === 'Battalion Staff') return 'BN';
        // Band Company -> B? Or Band? Usually 'Band' is short enough, but 'B' fits the pattern.
        // Assuming First Letter for standard companies
        return name.charAt(0);
    };
    const filteredAndSortedCadets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        let filteredData = [
            ...initialData
        ];
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filteredData = filteredData.filter((item)=>item.first_name.toLowerCase().includes(lowerSearch) || item.last_name.toLowerCase().includes(lowerSearch) || item.cadet_rank && item.cadet_rank.toLowerCase().includes(lowerSearch) || item.role_name && item.role_name.toLowerCase().includes(lowerSearch) || item.email && item.email.toLowerCase().includes(lowerSearch));
        }
        if (filterCompany !== 'all') {
            filteredData = filteredData.filter((c)=>c.company_name === filterCompany);
        }
        if (variant === 'cadet') {
            if (filterGrade !== 'all') filteredData = filteredData.filter((c)=>c.grade_level === filterGrade);
            if (filterConduct !== 'all') filteredData = filteredData.filter((c)=>c.conduct_status === filterConduct);
        }
        filteredData.sort((a, b)=>{
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue == null) return 1;
            if (bValue == null) return -1;
            return aValue < bValue ? sortConfig.direction === 'ascending' ? -1 : 1 : aValue > bValue ? sortConfig.direction === 'ascending' ? 1 : -1 : 0;
        });
        return filteredData;
    }, [
        initialData,
        searchTerm,
        filterCompany,
        filterGrade,
        filterConduct,
        sortConfig,
        variant
    ]);
    const requestSort = (key)=>{
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({
            key,
            direction
        });
    };
    const getSortIndicator = (key)=>sortConfig.key === key ? sortConfig.direction === 'ascending' ? ' ▲' : ' ▼' : null;
    const getConductColor = (status)=>{
        if (!status) return 'bg-gray-100 text-gray-800';
        if (status === 'Exemplary') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        if (status === 'Commendable') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (status === 'Satisfactory') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        if (status === 'Deficient') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };
    const formatTimeAgo = (dateStr)=>{
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };
    const uniqueCompanies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...new Set(initialData.map((c)=>c.company_name).filter(Boolean).sort())
        ], [
        initialData
    ]);
    const uniqueGrades = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...new Set(initialData.map((c)=>c.grade_level).filter(Boolean).sort())
        ], [
        initialData
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "roster-controls",
                className: "p-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gray-200 dark:border-gray-700 no-print",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: searchTerm,
                        onChange: (e)=>setSearchTerm(e.target.value),
                        placeholder: variant === 'cadet' ? "Search..." : "Search email...",
                        className: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                    }, void 0, false, {
                        fileName: "[project]/app/manage/RosterClient.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: filterCompany,
                        onChange: (e)=>setFilterCompany(e.target.value),
                        className: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "all",
                                children: "All Cos"
                            }, void 0, false, {
                                fileName: "[project]/app/manage/RosterClient.tsx",
                                lineNumber: 155,
                                columnNumber: 11
                            }, this),
                            uniqueCompanies.map((co)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: String(co),
                                    children: String(co)
                                }, String(co), false, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 156,
                                    columnNumber: 38
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/manage/RosterClient.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this),
                    variant === 'cadet' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: filterGrade,
                                onChange: (e)=>setFilterGrade(e.target.value),
                                className: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: "All Grades"
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                        lineNumber: 162,
                                        columnNumber: 15
                                    }, this),
                                    uniqueGrades.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: String(g),
                                            children: String(g)
                                        }, String(g), false, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 163,
                                            columnNumber: 38
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/manage/RosterClient.tsx",
                                lineNumber: 161,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: filterConduct,
                                onChange: (e)=>setFilterConduct(e.target.value),
                                className: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: "All Conduct"
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                        lineNumber: 166,
                                        columnNumber: 15
                                    }, this),
                                    CONDUCT_ORDER.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: c,
                                            children: c
                                        }, c, false, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 167,
                                            columnNumber: 39
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/manage/RosterClient.tsx",
                                lineNumber: 165,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/app/manage/RosterClient.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                id: "roster-table-content",
                className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700 printable-table",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                        className: "bg-gray-50 dark:bg-gray-700/50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                variant === 'cadet' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "hidden md:table-cell px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                    onClick: ()=>requestSort('cadet_rank'),
                                    children: [
                                        "Rank ",
                                        getSortIndicator('cadet_rank')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 178,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "hidden md:table-cell px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                    onClick: ()=>requestSort('email'),
                                    children: [
                                        "Email ",
                                        getSortIndicator('email')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 180,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                    onClick: ()=>requestSort('last_name'),
                                    children: [
                                        "Name ",
                                        getSortIndicator('last_name')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 184,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-2 md:px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                    onClick: ()=>requestSort('company_name'),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "md:hidden",
                                            children: "Co"
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 188,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "hidden md:inline",
                                            children: "Company"
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 189,
                                            columnNumber: 17
                                        }, this),
                                        getSortIndicator('company_name')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 187,
                                    columnNumber: 13
                                }, this),
                                variant === 'cadet' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-2 md:px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                    onClick: ()=>requestSort('grade_level'),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "md:hidden",
                                            children: "Gr"
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 196,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "hidden md:inline",
                                            children: "Grade"
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 197,
                                            columnNumber: 17
                                        }, this),
                                        getSortIndicator('grade_level')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 195,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "hidden lg:table-cell px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                    onClick: ()=>requestSort('role_name'),
                                    children: [
                                        "Role ",
                                        getSortIndicator('role_name')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 203,
                                    columnNumber: 13
                                }, this),
                                variant === 'cadet' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            scope: "col",
                                            className: "hidden xl:table-cell px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                            onClick: ()=>requestSort('room_number'),
                                            children: [
                                                "Room ",
                                                getSortIndicator('room_number')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 208,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            scope: "col",
                                            className: "hidden md:table-cell px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                            onClick: ()=>requestSort('conduct_status'),
                                            children: [
                                                "Conduct ",
                                                getSortIndicator('conduct_status')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 211,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "relative px-4 md:px-6 py-3",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "sr-only",
                                        children: "Expand"
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                        lineNumber: 216,
                                        columnNumber: 68
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 216,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/manage/RosterClient.tsx",
                            lineNumber: 175,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/manage/RosterClient.tsx",
                        lineNumber: 174,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                        className: "divide-y divide-gray-200 dark:divide-gray-700",
                        children: filteredAndSortedCadets.map((person)=>{
                            const isAdmin = variant === 'faculty' && (person.role_level || 0) >= 90;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        onClick: ()=>handleRowClick(person.id),
                                        className: `
                    hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors
                    ${isAdmin ? 'bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-amber-400' : ''}
                    ${openCadetId === person.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''}
                `,
                                        children: [
                                            variant === 'cadet' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200",
                                                children: person.cadet_rank || '-'
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 235,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono",
                                                children: person.email || '-'
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 237,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white",
                                                children: [
                                                    person.last_name,
                                                    ", ",
                                                    person.first_name,
                                                    isAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 uppercase tracking-wide",
                                                        children: "Admin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 243,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 241,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-2 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "md:hidden font-bold",
                                                        children: getCompanyAbbr(person.company_name)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 248,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "hidden md:inline",
                                                        children: person.company_name || '-'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 247,
                                                columnNumber: 17
                                            }, this),
                                            variant === 'cadet' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-2 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400",
                                                    children: person.grade_level || '-'
                                                }, void 0, false, {
                                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                                    lineNumber: 255,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400",
                                                children: person.role_name
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 260,
                                                columnNumber: 17
                                            }, this),
                                            variant === 'cadet' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400",
                                                        children: person.room_number || '-'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 265,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getConductColor(person.conduct_status)}`,
                                                            children: person.conduct_status
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                                            lineNumber: 268,
                                                            columnNumber: 94
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 268,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-gray-400",
                                                    children: openCadetId === person.id ? '▲' : '▼'
                                                }, void 0, false, {
                                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                                    lineNumber: 274,
                                                    columnNumber: 20
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 273,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                        lineNumber: 225,
                                        columnNumber: 15
                                    }, this),
                                    openCadetId === person.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "bg-gray-50 dark:bg-gray-700/30 print-hide",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            colSpan: variant === 'cadet' ? 8 : 5,
                                            className: "px-3 md:px-6 py-4 md:py-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                                children: variant === 'cadet' ? 'Key Metrics' : 'Faculty Info'
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                lineNumber: 288,
                                                                columnNumber: 25
                                                            }, this),
                                                            variant === 'cadet' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-3 md:grid-cols-1 gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 text-center md:text-left md:flex md:justify-between md:items-center",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block md:inline text-[10px] md:text-sm text-gray-500 dark:text-gray-400 uppercase md:normal-case",
                                                                                children: "Term"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 294,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block md:inline text-sm md:text-base font-bold text-gray-900 dark:text-white",
                                                                                children: person.term_demerits
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 295,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 293,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 text-center md:text-left md:flex md:justify-between md:items-center",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block md:inline text-[10px] md:text-sm text-gray-500 dark:text-gray-400 uppercase md:normal-case",
                                                                                children: "Year"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 298,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block md:inline text-sm md:text-base font-bold text-gray-900 dark:text-white",
                                                                                children: person.year_demerits
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 299,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 297,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 text-center md:text-left md:flex md:justify-between md:items-center",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block md:inline text-[10px] md:text-sm text-gray-500 dark:text-gray-400 uppercase md:normal-case",
                                                                                children: "Tours"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 302,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: `block md:inline text-sm md:text-base font-bold ${person.has_star_tours || (person.current_tour_balance || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`,
                                                                                children: person.has_star_tours ? '*' : person.current_tour_balance
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 303,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 301,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                lineNumber: 292,
                                                                columnNumber: 27
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 text-sm",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "truncate",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                            children: "Email:"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                                                            lineNumber: 310,
                                                                            columnNumber: 53
                                                                        }, this),
                                                                        " ",
                                                                        person.email
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                                                    lineNumber: 310,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                lineNumber: 309,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 287,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-2",
                                                        children: variant === 'cadet' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                    className: "text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                                    children: "Recent Activity"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                                                    lineNumber: 319,
                                                                    columnNumber: 29
                                                                }, this),
                                                                person.recent_reports && person.recent_reports.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-700",
                                                                    children: person.recent_reports.map((report)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "p-2 flex justify-between items-center text-xs",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "truncate pr-2",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "font-medium text-gray-800 dark:text-gray-200",
                                                                                            children: report.offense_name
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                            lineNumber: 325,
                                                                                            columnNumber: 39
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "ml-2 text-gray-400 uppercase text-[10px]",
                                                                                            children: report.status.replace('_', ' ')
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                            lineNumber: 326,
                                                                                            columnNumber: 39
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                    lineNumber: 324,
                                                                                    columnNumber: 37
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-gray-500 whitespace-nowrap",
                                                                                    children: formatTimeAgo(report.created_at)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                    lineNumber: 328,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            ]
                                                                        }, report.id, true, {
                                                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                                                            lineNumber: 323,
                                                                            columnNumber: 35
                                                                        }, this))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                                                    lineNumber: 321,
                                                                    columnNumber: 31
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 text-center text-xs text-gray-400 italic",
                                                                    children: "No recent reports."
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                                                    lineNumber: 333,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 316,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                                children: "Actions"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                lineNumber: 343,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-col gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                        href: `/profile/${person.id}`,
                                                                        className: "block w-full text-center py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700",
                                                                        children: "View Profile"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 345,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    variant === 'cadet' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                        href: `/ledger/${person.id}`,
                                                                        className: "block w-full text-center py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700",
                                                                        children: "View Ledger"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 349,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    (canManage || canEditProfiles) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: (e)=>{
                                                                            e.stopPropagation();
                                                                            onReassign(person.id);
                                                                        },
                                                                        className: "block w-full text-center py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40",
                                                                        children: "Re-Assign"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 354,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                lineNumber: 344,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 342,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 284,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 283,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                        lineNumber: 282,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, person.id, true, {
                                fileName: "[project]/app/manage/RosterClient.tsx",
                                lineNumber: 224,
                                columnNumber: 13
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/manage/RosterClient.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/manage/RosterClient.tsx",
                lineNumber: 173,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/manage/RosterClient.tsx",
        lineNumber: 149,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/profile/constants.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/app/manage/data:0c9cb7 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"603a47877742303afc33baf0bf80c9229af4e52ef8":"bulkAssignCompany"},"app/manage/actions.ts",""] */ __turbopack_context__.s([
    "bulkAssignCompany",
    ()=>bulkAssignCompany
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var bulkAssignCompany = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("603a47877742303afc33baf0bf80c9229af4e52ef8", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "bulkAssignCompany"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gSEVMUEVSIC0tLVxyXG5hc3luYyBmdW5jdGlvbiBnZXRBY3RvcldpdGhQZXJtaXNzaW9ucyhzdXBhYmFzZTogYW55KSB7XHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiBudWxsXHJcblxyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KGBcclxuICAgICAgaWQsIFxyXG4gICAgICBjb21wYW55X2lkLCBcclxuICAgICAgcm9sZTpyb2xlX2lkIChcclxuICAgICAgICByb2xlX25hbWUsIFxyXG4gICAgICAgIGRlZmF1bHRfcm9sZV9sZXZlbCwgXHJcbiAgICAgICAgY2FuX21hbmFnZV9hbGxfcm9zdGVycywgXHJcbiAgICAgICAgY2FuX21hbmFnZV9vd25fY29tcGFueV9yb3N0ZXJcclxuICAgICAgKVxyXG4gICAgYClcclxuICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmICghcHJvZmlsZSB8fCAhcHJvZmlsZS5yb2xlKSByZXR1cm4gbnVsbFxyXG5cclxuICBjb25zdCByb2xlID0gcHJvZmlsZS5yb2xlIGFzIGFueVxyXG4gIHJldHVybiB7XHJcbiAgICB1c2VySWQ6IHByb2ZpbGUuaWQsXHJcbiAgICBjb21wYW55SWQ6IHByb2ZpbGUuY29tcGFueV9pZCxcclxuICAgIHJvbGVMZXZlbDogcm9sZS5kZWZhdWx0X3JvbGVfbGV2ZWwgfHwgMCxcclxuICAgIGNhbk1hbmFnZUFsbDogcm9sZS5jYW5fbWFuYWdlX2FsbF9yb3N0ZXJzIHx8IGZhbHNlLFxyXG4gICAgY2FuTWFuYWdlT3duOiByb2xlLmNhbl9tYW5hZ2Vfb3duX2NvbXBhbnlfcm9zdGVyIHx8IGZhbHNlLFxyXG4gICAgcm9sZU5hbWU6IHJvbGUucm9sZV9uYW1lXHJcbiAgfVxyXG59XHJcblxyXG4vLyAtLS0gQUNUSU9OUyAtLS1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVVc2VyUm9sZSh1c2VySWQ6IHN0cmluZywgcm9sZUlkOiBzdHJpbmcgfCBudWxsKSB7XHJcbiAgLy8gSWYgY2xlYXJpbmcgYSByb2xlIChudWxsKSwgd2UgdHJlYXQgaXQgYXMgYXNzaWduaW5nIHJvbGVJZCBcIlwiIG9yIHNpbWlsYXJcclxuICAvLyBCdXQgYnVsa0Fzc2lnblJvbGUgZXhwZWN0cyBhIHN0cmluZy5cclxuICAvLyBJZiByb2xlSWQgaXMgbnVsbCwgd2UgYXJlIGVzc2VudGlhbGx5IHVuYXNzaWduaW5nLlxyXG4gIC8vIExldCdzIGhhbmRsZSBudWxsIHNlcGFyYXRlbHkgb3IgZW5zdXJlIGJ1bGtBc3NpZ25Sb2xlIGhhbmRsZXMgaXQuXHJcbiAgaWYgKCFyb2xlSWQpIHtcclxuICAgICAgLy8gVW5hc3NpZ24gbG9naWMgY291bGQgYmUgc2VwYXJhdGUsIG9yIHdlIHBhc3MgYSBzcGVjaWFsIGZsYWc/XHJcbiAgICAgIC8vIEZvciBub3csIGxldCdzIGFzc3VtZSByb2xlSWQgaXMgcmVxdWlyZWQgZm9yIGFzc2lnbm1lbnQuXHJcbiAgICAgIC8vIFRvIHVuYXNzaWduLCB3ZSBtaWdodCBuZWVkIGEgc2VwYXJhdGUgYWN0aW9uIG9yIGFsbG93IG51bGwuXHJcbiAgICAgIC8vIExldCdzIGtlZXAgaXQgc2ltcGxlOiBUaGlzIGFjdGlvbiBpcyBmb3IgQVNTSUdOSU5HLlxyXG4gICAgICByZXR1cm4geyBlcnJvcjogXCJSb2xlIElEIGlzIHJlcXVpcmVkLlwiIH1cclxuICB9XHJcbiAgcmV0dXJuIGJ1bGtBc3NpZ25Sb2xlKFt1c2VySWRdLCByb2xlSWQpXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWxrQXNzaWduUm9sZSh1c2VySWRzOiBzdHJpbmdbXSwgcm9sZUlkOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgYWN0b3IgPSBhd2FpdCBnZXRBY3RvcldpdGhQZXJtaXNzaW9ucyhzdXBhYmFzZSlcclxuICBcclxuICBpZiAoIWFjdG9yKSByZXR1cm4geyBlcnJvcjogXCJVbmF1dGhvcml6ZWRcIiB9XHJcblxyXG4gIC8vIDEuIEZFVENIIFRBUkdFVCBST0xFIERFVEFJTFNcclxuICBjb25zdCB7IGRhdGE6IHRhcmdldFJvbGUgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgncm9sZXMnKVxyXG4gICAgLnNlbGVjdCgnZGVmYXVsdF9yb2xlX2xldmVsLCBjb21wYW55X2lkJylcclxuICAgIC5lcSgnaWQnLCByb2xlSWQpXHJcbiAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gIGlmICghdGFyZ2V0Um9sZSkgcmV0dXJuIHsgZXJyb3I6IFwiUm9sZSBub3QgZm91bmQuXCIgfVxyXG5cclxuICBjb25zdCB0YXJnZXRSb2xlTGV2ZWwgPSB0YXJnZXRSb2xlLmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgXHJcbiAgLy8gMi4gSElFUkFSQ0hZIENIRUNLXHJcbiAgLy8gWW91IGNhbm5vdCBhc3NpZ24gYSByb2xlIHRoYXQgaXMgZXF1YWwgdG8gb3IgaGlnaGVyIHRoYW4geW91ciBvd24uXHJcbiAgaWYgKHRhcmdldFJvbGVMZXZlbCA+PSBhY3Rvci5yb2xlTGV2ZWwpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiBgUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBjYW5ub3QgYXNzaWduIGEgcm9sZSBvZiBsZXZlbCAke3RhcmdldFJvbGVMZXZlbH0gKHlvdXIgbGV2ZWwgaXMgJHthY3Rvci5yb2xlTGV2ZWx9KS5gIH1cclxuICB9XHJcblxyXG4gIC8vIDMuIFNDT1BFIENIRUNLXHJcbiAgaWYgKGFjdG9yLmNhbk1hbmFnZUFsbCkge1xyXG4gICAgLy8gQWxsb3dlZCBnbG9iYWxseVxyXG4gIH0gZWxzZSBpZiAoYWN0b3IuY2FuTWFuYWdlT3duKSB7XHJcbiAgICAvLyBhKSBSb2xlIG11c3QgYmVsb25nIHRvIHRoZSBhY3RvcidzIGNvbXBhbnkgKG9yIGJlIGdlbmVyaWMvZ2xvYmFsIGlmIHRoYXQncyBhbGxvd2VkLCBidXQgdXN1YWxseSBzcGVjaWZpYylcclxuICAgIC8vIFN0cmljdCBtb2RlOiBSb2xlIG11c3QgYmUgaW4gYWN0b3IncyBjb21wYW55XHJcbiAgICBpZiAodGFyZ2V0Um9sZS5jb21wYW55X2lkICYmIHRhcmdldFJvbGUuY29tcGFueV9pZCAhPT0gYWN0b3IuY29tcGFueUlkKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBjYW5ub3QgYXNzaWduIHJvbGVzIGZyb20gYW5vdGhlciBjb21wYW55LlwiIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBiKSBUYXJnZXQgVXNlcnMgbXVzdCBiZSBpbiBhY3RvcidzIGNvbXBhbnkgT1IgdW5hc3NpZ25lZFxyXG4gICAgY29uc3QgeyBkYXRhOiB0YXJnZXRzIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgICAuc2VsZWN0KCdpZCwgY29tcGFueV9pZCcpXHJcbiAgICAgIC5pbignaWQnLCB1c2VySWRzKVxyXG5cclxuICAgIGlmICghdGFyZ2V0cykgcmV0dXJuIHsgZXJyb3I6IFwiQ291bGQgbm90IHZlcmlmeSB0YXJnZXRzLlwiIH1cclxuXHJcbiAgICBjb25zdCBhbGxWYWxpZCA9IHRhcmdldHMuZXZlcnkodCA9PiB0LmNvbXBhbnlfaWQgPT09IGFjdG9yLmNvbXBhbnlJZCB8fCB0LmNvbXBhbnlfaWQgPT09IG51bGwpXHJcbiAgICBcclxuICAgIGlmICghYWxsVmFsaWQpIHtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBjYW4gb25seSBtYW5hZ2UgY2FkZXRzIHdpdGhpbiB5b3VyIG93biBjb21wYW55IG9yIGNsYWltIHVuYXNzaWduZWQgY2FkZXRzLlwiIH1cclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IFwiVW5hdXRob3JpemVkOiBZb3UgZG8gbm90IGhhdmUgcm9zdGVyIG1hbmFnZW1lbnQgcGVybWlzc2lvbnMuXCIgfVxyXG4gIH1cclxuXHJcbiAgLy8gNC4gRVhFQ1VURVxyXG4gIC8vIFdlIHVzZSB0aGUgc3RhbmRhcmQgY2xpZW50IGJlY2F1c2Ugd2UgYXNzdW1lIHRoZSBSTFMgcG9saWN5IChmcm9tIDVfcm9zdGVyX3Blcm1pc3Npb25zX2FuZF9ybHMuc3FsKSBcclxuICAvLyBjb3JyZWN0bHkgYWxsb3dzIHVwZGF0ZXMgaWYgKGNhbl9tYW5hZ2Vfb3duIEFORCAodGFyZ2V0LmNvbXBhbnkgPSBteV9jb21wYW55IE9SIHRhcmdldC5jb21wYW55IElTIE5VTEwpKVxyXG4gIFxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgLnVwZGF0ZSh7IHJvbGVfaWQ6IHJvbGVJZCB9KVxyXG4gICAgLmluKCdpZCcsIHVzZXJJZHMpXHJcblxyXG4gIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGBEYXRhYmFzZSBFcnJvcjogJHtlcnJvci5tZXNzYWdlfWAgfVxyXG5cclxuICByZXZhbGlkYXRlUGF0aCgnL21hbmFnZScpXHJcbiAgcmV2YWxpZGF0ZVBhdGgoJy9yb3N0ZXInKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVsa0Fzc2lnbkNvbXBhbnkodXNlcklkczogc3RyaW5nW10sIGNvbXBhbnlJZDogc3RyaW5nKSB7XHJcbiAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gIGNvbnN0IGFjdG9yID0gYXdhaXQgZ2V0QWN0b3JXaXRoUGVybWlzc2lvbnMoc3VwYWJhc2UpXHJcbiAgXHJcbiAgaWYgKCFhY3RvcikgcmV0dXJuIHsgZXJyb3I6IFwiVW5hdXRob3JpemVkXCIgfVxyXG5cclxuICAvLyAxLiBTQ09QRSBDSEVDS1xyXG4gIGlmIChhY3Rvci5jYW5NYW5hZ2VBbGwpIHtcclxuICAgICAvLyBHbG9iYWwgYWxsb3dlZFxyXG4gIH0gZWxzZSBpZiAoYWN0b3IuY2FuTWFuYWdlT3duKSB7XHJcbiAgICAgLy8gQ2FuIG9ubHkgbW92ZSBUTyBvd24gY29tcGFueVxyXG4gICAgIGlmIChjb21wYW55SWQgIT09IGFjdG9yLmNvbXBhbnlJZCkge1xyXG4gICAgICAgIHJldHVybiB7IGVycm9yOiBcIlBlcm1pc3Npb24gRGVuaWVkOiBZb3UgY2FuIG9ubHkgYXNzaWduIGNhZGV0cyB0byB5b3VyIG93biBjb21wYW55LlwiIH1cclxuICAgICB9XHJcblxyXG4gICAgIC8vIFZlcmlmeSB0YXJnZXRzIGFyZSBVbmFzc2lnbmVkIG9yIGluIE93biBDb21wYW55XHJcbiAgICAgY29uc3QgeyBkYXRhOiB0YXJnZXRzIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgICAgIC5zZWxlY3QoJ2NvbXBhbnlfaWQnKVxyXG4gICAgICAgLmluKCdpZCcsIHVzZXJJZHMpXHJcblxyXG4gICAgIGlmICghdGFyZ2V0cykgcmV0dXJuIHsgZXJyb3I6IFwiQ291bGQgbm90IHZlcmlmeSB0YXJnZXRzLlwiIH1cclxuXHJcbiAgICAgY29uc3QgYWxsVmFsaWQgPSB0YXJnZXRzLmV2ZXJ5KHQgPT4gdC5jb21wYW55X2lkID09PSBhY3Rvci5jb21wYW55SWQgfHwgdC5jb21wYW55X2lkID09PSBudWxsKVxyXG4gICAgIGlmICghYWxsVmFsaWQpIHtcclxuICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBjYW4gb25seSBjbGFpbSB1bmFzc2lnbmVkIGNhZGV0cyBvciBtb3ZlIGNhZGV0cyBhbHJlYWR5IGluIHlvdXIgY29tcGFueS5cIiB9XHJcbiAgICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICAgcmV0dXJuIHsgZXJyb3I6IFwiVW5hdXRob3JpemVkLlwiIH1cclxuICB9XHJcblxyXG4gIC8vIDIuIEVYRUNVVEVcclxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgIC51cGRhdGUoeyBjb21wYW55X2lkOiBjb21wYW55SWQgfSlcclxuICAgIC5pbignaWQnLCB1c2VySWRzKVxyXG5cclxuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoJy9tYW5hZ2UnKVxyXG4gIHJldmFsaWRhdGVQYXRoKCcvcm9zdGVyJylcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiZ1NBeUhzQiJ9
}),
"[project]/app/manage/data:3ba46c [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60532683f7b9907727bf29a27c70ffe98877d06a86":"bulkAssignRole"},"app/manage/actions.ts",""] */ __turbopack_context__.s([
    "bulkAssignRole",
    ()=>bulkAssignRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var bulkAssignRole = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("60532683f7b9907727bf29a27c70ffe98877d06a86", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "bulkAssignRole"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gSEVMUEVSIC0tLVxyXG5hc3luYyBmdW5jdGlvbiBnZXRBY3RvcldpdGhQZXJtaXNzaW9ucyhzdXBhYmFzZTogYW55KSB7XHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiBudWxsXHJcblxyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KGBcclxuICAgICAgaWQsIFxyXG4gICAgICBjb21wYW55X2lkLCBcclxuICAgICAgcm9sZTpyb2xlX2lkIChcclxuICAgICAgICByb2xlX25hbWUsIFxyXG4gICAgICAgIGRlZmF1bHRfcm9sZV9sZXZlbCwgXHJcbiAgICAgICAgY2FuX21hbmFnZV9hbGxfcm9zdGVycywgXHJcbiAgICAgICAgY2FuX21hbmFnZV9vd25fY29tcGFueV9yb3N0ZXJcclxuICAgICAgKVxyXG4gICAgYClcclxuICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmICghcHJvZmlsZSB8fCAhcHJvZmlsZS5yb2xlKSByZXR1cm4gbnVsbFxyXG5cclxuICBjb25zdCByb2xlID0gcHJvZmlsZS5yb2xlIGFzIGFueVxyXG4gIHJldHVybiB7XHJcbiAgICB1c2VySWQ6IHByb2ZpbGUuaWQsXHJcbiAgICBjb21wYW55SWQ6IHByb2ZpbGUuY29tcGFueV9pZCxcclxuICAgIHJvbGVMZXZlbDogcm9sZS5kZWZhdWx0X3JvbGVfbGV2ZWwgfHwgMCxcclxuICAgIGNhbk1hbmFnZUFsbDogcm9sZS5jYW5fbWFuYWdlX2FsbF9yb3N0ZXJzIHx8IGZhbHNlLFxyXG4gICAgY2FuTWFuYWdlT3duOiByb2xlLmNhbl9tYW5hZ2Vfb3duX2NvbXBhbnlfcm9zdGVyIHx8IGZhbHNlLFxyXG4gICAgcm9sZU5hbWU6IHJvbGUucm9sZV9uYW1lXHJcbiAgfVxyXG59XHJcblxyXG4vLyAtLS0gQUNUSU9OUyAtLS1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVVc2VyUm9sZSh1c2VySWQ6IHN0cmluZywgcm9sZUlkOiBzdHJpbmcgfCBudWxsKSB7XHJcbiAgLy8gSWYgY2xlYXJpbmcgYSByb2xlIChudWxsKSwgd2UgdHJlYXQgaXQgYXMgYXNzaWduaW5nIHJvbGVJZCBcIlwiIG9yIHNpbWlsYXJcclxuICAvLyBCdXQgYnVsa0Fzc2lnblJvbGUgZXhwZWN0cyBhIHN0cmluZy5cclxuICAvLyBJZiByb2xlSWQgaXMgbnVsbCwgd2UgYXJlIGVzc2VudGlhbGx5IHVuYXNzaWduaW5nLlxyXG4gIC8vIExldCdzIGhhbmRsZSBudWxsIHNlcGFyYXRlbHkgb3IgZW5zdXJlIGJ1bGtBc3NpZ25Sb2xlIGhhbmRsZXMgaXQuXHJcbiAgaWYgKCFyb2xlSWQpIHtcclxuICAgICAgLy8gVW5hc3NpZ24gbG9naWMgY291bGQgYmUgc2VwYXJhdGUsIG9yIHdlIHBhc3MgYSBzcGVjaWFsIGZsYWc/XHJcbiAgICAgIC8vIEZvciBub3csIGxldCdzIGFzc3VtZSByb2xlSWQgaXMgcmVxdWlyZWQgZm9yIGFzc2lnbm1lbnQuXHJcbiAgICAgIC8vIFRvIHVuYXNzaWduLCB3ZSBtaWdodCBuZWVkIGEgc2VwYXJhdGUgYWN0aW9uIG9yIGFsbG93IG51bGwuXHJcbiAgICAgIC8vIExldCdzIGtlZXAgaXQgc2ltcGxlOiBUaGlzIGFjdGlvbiBpcyBmb3IgQVNTSUdOSU5HLlxyXG4gICAgICByZXR1cm4geyBlcnJvcjogXCJSb2xlIElEIGlzIHJlcXVpcmVkLlwiIH1cclxuICB9XHJcbiAgcmV0dXJuIGJ1bGtBc3NpZ25Sb2xlKFt1c2VySWRdLCByb2xlSWQpXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWxrQXNzaWduUm9sZSh1c2VySWRzOiBzdHJpbmdbXSwgcm9sZUlkOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgYWN0b3IgPSBhd2FpdCBnZXRBY3RvcldpdGhQZXJtaXNzaW9ucyhzdXBhYmFzZSlcclxuICBcclxuICBpZiAoIWFjdG9yKSByZXR1cm4geyBlcnJvcjogXCJVbmF1dGhvcml6ZWRcIiB9XHJcblxyXG4gIC8vIDEuIEZFVENIIFRBUkdFVCBST0xFIERFVEFJTFNcclxuICBjb25zdCB7IGRhdGE6IHRhcmdldFJvbGUgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgncm9sZXMnKVxyXG4gICAgLnNlbGVjdCgnZGVmYXVsdF9yb2xlX2xldmVsLCBjb21wYW55X2lkJylcclxuICAgIC5lcSgnaWQnLCByb2xlSWQpXHJcbiAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gIGlmICghdGFyZ2V0Um9sZSkgcmV0dXJuIHsgZXJyb3I6IFwiUm9sZSBub3QgZm91bmQuXCIgfVxyXG5cclxuICBjb25zdCB0YXJnZXRSb2xlTGV2ZWwgPSB0YXJnZXRSb2xlLmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgXHJcbiAgLy8gMi4gSElFUkFSQ0hZIENIRUNLXHJcbiAgLy8gWW91IGNhbm5vdCBhc3NpZ24gYSByb2xlIHRoYXQgaXMgZXF1YWwgdG8gb3IgaGlnaGVyIHRoYW4geW91ciBvd24uXHJcbiAgaWYgKHRhcmdldFJvbGVMZXZlbCA+PSBhY3Rvci5yb2xlTGV2ZWwpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiBgUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBjYW5ub3QgYXNzaWduIGEgcm9sZSBvZiBsZXZlbCAke3RhcmdldFJvbGVMZXZlbH0gKHlvdXIgbGV2ZWwgaXMgJHthY3Rvci5yb2xlTGV2ZWx9KS5gIH1cclxuICB9XHJcblxyXG4gIC8vIDMuIFNDT1BFIENIRUNLXHJcbiAgaWYgKGFjdG9yLmNhbk1hbmFnZUFsbCkge1xyXG4gICAgLy8gQWxsb3dlZCBnbG9iYWxseVxyXG4gIH0gZWxzZSBpZiAoYWN0b3IuY2FuTWFuYWdlT3duKSB7XHJcbiAgICAvLyBhKSBSb2xlIG11c3QgYmVsb25nIHRvIHRoZSBhY3RvcidzIGNvbXBhbnkgKG9yIGJlIGdlbmVyaWMvZ2xvYmFsIGlmIHRoYXQncyBhbGxvd2VkLCBidXQgdXN1YWxseSBzcGVjaWZpYylcclxuICAgIC8vIFN0cmljdCBtb2RlOiBSb2xlIG11c3QgYmUgaW4gYWN0b3IncyBjb21wYW55XHJcbiAgICBpZiAodGFyZ2V0Um9sZS5jb21wYW55X2lkICYmIHRhcmdldFJvbGUuY29tcGFueV9pZCAhPT0gYWN0b3IuY29tcGFueUlkKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBjYW5ub3QgYXNzaWduIHJvbGVzIGZyb20gYW5vdGhlciBjb21wYW55LlwiIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBiKSBUYXJnZXQgVXNlcnMgbXVzdCBiZSBpbiBhY3RvcidzIGNvbXBhbnkgT1IgdW5hc3NpZ25lZFxyXG4gICAgY29uc3QgeyBkYXRhOiB0YXJnZXRzIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgICAuc2VsZWN0KCdpZCwgY29tcGFueV9pZCcpXHJcbiAgICAgIC5pbignaWQnLCB1c2VySWRzKVxyXG5cclxuICAgIGlmICghdGFyZ2V0cykgcmV0dXJuIHsgZXJyb3I6IFwiQ291bGQgbm90IHZlcmlmeSB0YXJnZXRzLlwiIH1cclxuXHJcbiAgICBjb25zdCBhbGxWYWxpZCA9IHRhcmdldHMuZXZlcnkodCA9PiB0LmNvbXBhbnlfaWQgPT09IGFjdG9yLmNvbXBhbnlJZCB8fCB0LmNvbXBhbnlfaWQgPT09IG51bGwpXHJcbiAgICBcclxuICAgIGlmICghYWxsVmFsaWQpIHtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBjYW4gb25seSBtYW5hZ2UgY2FkZXRzIHdpdGhpbiB5b3VyIG93biBjb21wYW55IG9yIGNsYWltIHVuYXNzaWduZWQgY2FkZXRzLlwiIH1cclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIHsgZXJyb3I6IFwiVW5hdXRob3JpemVkOiBZb3UgZG8gbm90IGhhdmUgcm9zdGVyIG1hbmFnZW1lbnQgcGVybWlzc2lvbnMuXCIgfVxyXG4gIH1cclxuXHJcbiAgLy8gNC4gRVhFQ1VURVxyXG4gIC8vIFdlIHVzZSB0aGUgc3RhbmRhcmQgY2xpZW50IGJlY2F1c2Ugd2UgYXNzdW1lIHRoZSBSTFMgcG9saWN5IChmcm9tIDVfcm9zdGVyX3Blcm1pc3Npb25zX2FuZF9ybHMuc3FsKSBcclxuICAvLyBjb3JyZWN0bHkgYWxsb3dzIHVwZGF0ZXMgaWYgKGNhbl9tYW5hZ2Vfb3duIEFORCAodGFyZ2V0LmNvbXBhbnkgPSBteV9jb21wYW55IE9SIHRhcmdldC5jb21wYW55IElTIE5VTEwpKVxyXG4gIFxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgLnVwZGF0ZSh7IHJvbGVfaWQ6IHJvbGVJZCB9KVxyXG4gICAgLmluKCdpZCcsIHVzZXJJZHMpXHJcblxyXG4gIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGBEYXRhYmFzZSBFcnJvcjogJHtlcnJvci5tZXNzYWdlfWAgfVxyXG5cclxuICByZXZhbGlkYXRlUGF0aCgnL21hbmFnZScpXHJcbiAgcmV2YWxpZGF0ZVBhdGgoJy9yb3N0ZXInKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVsa0Fzc2lnbkNvbXBhbnkodXNlcklkczogc3RyaW5nW10sIGNvbXBhbnlJZDogc3RyaW5nKSB7XHJcbiAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gIGNvbnN0IGFjdG9yID0gYXdhaXQgZ2V0QWN0b3JXaXRoUGVybWlzc2lvbnMoc3VwYWJhc2UpXHJcbiAgXHJcbiAgaWYgKCFhY3RvcikgcmV0dXJuIHsgZXJyb3I6IFwiVW5hdXRob3JpemVkXCIgfVxyXG5cclxuICAvLyAxLiBTQ09QRSBDSEVDS1xyXG4gIGlmIChhY3Rvci5jYW5NYW5hZ2VBbGwpIHtcclxuICAgICAvLyBHbG9iYWwgYWxsb3dlZFxyXG4gIH0gZWxzZSBpZiAoYWN0b3IuY2FuTWFuYWdlT3duKSB7XHJcbiAgICAgLy8gQ2FuIG9ubHkgbW92ZSBUTyBvd24gY29tcGFueVxyXG4gICAgIGlmIChjb21wYW55SWQgIT09IGFjdG9yLmNvbXBhbnlJZCkge1xyXG4gICAgICAgIHJldHVybiB7IGVycm9yOiBcIlBlcm1pc3Npb24gRGVuaWVkOiBZb3UgY2FuIG9ubHkgYXNzaWduIGNhZGV0cyB0byB5b3VyIG93biBjb21wYW55LlwiIH1cclxuICAgICB9XHJcblxyXG4gICAgIC8vIFZlcmlmeSB0YXJnZXRzIGFyZSBVbmFzc2lnbmVkIG9yIGluIE93biBDb21wYW55XHJcbiAgICAgY29uc3QgeyBkYXRhOiB0YXJnZXRzIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgICAgIC5zZWxlY3QoJ2NvbXBhbnlfaWQnKVxyXG4gICAgICAgLmluKCdpZCcsIHVzZXJJZHMpXHJcblxyXG4gICAgIGlmICghdGFyZ2V0cykgcmV0dXJuIHsgZXJyb3I6IFwiQ291bGQgbm90IHZlcmlmeSB0YXJnZXRzLlwiIH1cclxuXHJcbiAgICAgY29uc3QgYWxsVmFsaWQgPSB0YXJnZXRzLmV2ZXJ5KHQgPT4gdC5jb21wYW55X2lkID09PSBhY3Rvci5jb21wYW55SWQgfHwgdC5jb21wYW55X2lkID09PSBudWxsKVxyXG4gICAgIGlmICghYWxsVmFsaWQpIHtcclxuICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBjYW4gb25seSBjbGFpbSB1bmFzc2lnbmVkIGNhZGV0cyBvciBtb3ZlIGNhZGV0cyBhbHJlYWR5IGluIHlvdXIgY29tcGFueS5cIiB9XHJcbiAgICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICAgcmV0dXJuIHsgZXJyb3I6IFwiVW5hdXRob3JpemVkLlwiIH1cclxuICB9XHJcblxyXG4gIC8vIDIuIEVYRUNVVEVcclxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgIC51cGRhdGUoeyBjb21wYW55X2lkOiBjb21wYW55SWQgfSlcclxuICAgIC5pbignaWQnLCB1c2VySWRzKVxyXG5cclxuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoJy9tYW5hZ2UnKVxyXG4gIHJldmFsaWRhdGVQYXRoKCcvcm9zdGVyJylcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiNlJBdURzQiJ9
}),
"[project]/app/manage/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ManagePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$RosterClient$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/manage/RosterClient.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$profile$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/profile/constants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$data$3a$0c9cb7__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/manage/data:0c9cb7 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$data$3a$3ba46c__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/manage/data:3ba46c [app-ssr] (ecmascript) <text/javascript>");
'use client';
;
;
;
;
;
;
;
;
;
function ManagePage() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('roster');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [companies, setCompanies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [roles, setRoles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [unassigned, setUnassigned] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [rosterData, setRosterData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [facultyData, setFacultyData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [canEditProfiles, setCanEditProfiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // NEW: Explicit Manage Permission State
    const [canManage, setCanManage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAdmin, setIsAdmin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedIds, setSelectedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        key: 'created_at',
        direction: 'desc'
    });
    const [modalOpen, setModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [targetCompanyId, setTargetCompanyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [targetRoleId, setTargetRoleId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const fetchData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                setError("You must be logged in.");
                return;
            }
            const { data: viewerProfile } = await supabase.from('profiles').select(`
           company:companies(id, company_name),
           role:role_id (role_name, default_role_level, can_manage_all_rosters, can_manage_own_company_roster)
        `).eq('id', user.id).single();
            const roleData = viewerProfile?.role;
            const roleName = roleData?.role_name || '';
            const roleLevel = roleData?.default_role_level || 0;
            const canManageAll = roleData?.can_manage_all_rosters || false;
            const canManageOwn = roleData?.can_manage_own_company_roster || false;
            const viewerCompanyName = viewerProfile?.company?.company_name;
            const isSiteAdmin = roleName === 'Admin' || roleLevel >= 90;
            setIsAdmin(isSiteAdmin);
            setCanEditProfiles(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$profile$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EDIT_AUTHORIZED_ROLES"].includes(roleName) || roleName.includes('TAC') || isSiteAdmin);
            // Set Manage Permission
            setCanManage(canManageAll || canManageOwn || isSiteAdmin);
            const promises = [
                supabase.from('companies').select('*').order('company_name'),
                supabase.from('roles').select('*').order('default_role_level', {
                    ascending: false
                }),
                supabase.rpc('get_unassigned_users'),
                supabase.rpc('get_full_roster')
            ];
            if (isSiteAdmin) {
                promises.push(supabase.rpc('get_faculty_roster'));
            }
            const results = await Promise.all(promises);
            const companiesRes = results[0];
            const rolesRes = results[1];
            const unassignedRes = results[2];
            const fullRosterRes = results[3];
            const facultyRes = isSiteAdmin ? results[4] : {
                data: [],
                error: null
            };
            if (companiesRes.data) setCompanies(companiesRes.data);
            if (rolesRes.data) setRoles(rolesRes.data);
            if (fullRosterRes.error) console.error("Error fetching roster:", fullRosterRes.error.message);
            else {
                let allCadets = fullRosterRes.data;
                if (!canManageAll && canManageOwn && viewerCompanyName) {
                    allCadets = allCadets.filter((c)=>c.company_name === viewerCompanyName);
                }
                setRosterData(allCadets);
            }
            if (unassignedRes.error) console.error("Error fetching unassigned:", unassignedRes.error.message);
            else setUnassigned(unassignedRes.data);
            if (facultyRes.error) console.error("Error fetching faculty:", facultyRes.error.message);
            else setFacultyData(facultyRes.data);
        } catch (err) {
            setError(err.message);
        } finally{
            setLoading(false);
        }
    }, [
        supabase
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchData();
    }, [
        fetchData
    ]);
    const sortedUnassigned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const sorted = [
            ...unassigned
        ];
        sorted.sort((a, b)=>{
            let valA = '';
            let valB = '';
            switch(sortConfig.key){
                case 'name':
                    valA = `${a.last_name}, ${a.first_name}`;
                    valB = `${b.last_name}, ${b.first_name}`;
                    break;
                case 'created_at':
                    valA = new Date(a.created_at).getTime();
                    valB = new Date(b.created_at).getTime();
                    break;
                case 'company':
                    valA = a.company_name || '';
                    valB = b.company_name || '';
                    break;
                case 'role':
                    valA = a.role_name || '';
                    valB = b.role_name || '';
                    break;
            }
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [
        unassigned,
        sortConfig
    ]);
    const handleSort = (key)=>{
        setSortConfig((current)=>({
                key,
                direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
            }));
    };
    const SortIcon = ({ column })=>{
        if (sortConfig.key !== column) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-gray-300 ml-1",
            children: "⇅"
        }, void 0, false, {
            fileName: "[project]/app/manage/page.tsx",
            lineNumber: 171,
            columnNumber: 43
        }, this);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-indigo-600 dark:text-indigo-400 ml-1",
            children: sortConfig.direction === 'asc' ? '↑' : '↓'
        }, void 0, false, {
            fileName: "[project]/app/manage/page.tsx",
            lineNumber: 172,
            columnNumber: 12
        }, this);
    };
    const handlePrintRoster = ()=>window.print();
    const handleSelectRow = (id)=>{
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };
    const handleSelectAll = ()=>{
        if (selectedIds.size === unassigned.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(unassigned.map((u)=>u.user_id)));
        }
    };
    const handleReassign = (cadetId)=>{
        setSelectedIds(new Set([
            cadetId
        ]));
        openModal();
    };
    const openModal = ()=>{
        setTargetCompanyId('');
        setTargetRoleId('');
        setModalOpen(true);
    };
    const availableRoles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!targetCompanyId) return roles;
        return roles.filter((r)=>r.company_id === targetCompanyId || r.company_id === null);
    }, [
        roles,
        targetCompanyId
    ]);
    const handleRoleChange = (newRoleId)=>{
        setTargetRoleId(newRoleId);
        if (!newRoleId) return;
        const selectedRole = roles.find((r)=>r.id === newRoleId);
        if (selectedRole && selectedRole.company_id) {
            setTargetCompanyId(selectedRole.company_id);
        }
    };
    const getModalTitle = ()=>{
        if (selectedIds.size === 1) {
            const id = Array.from(selectedIds)[0];
            const u = unassigned.find((x)=>x.user_id === id) || rosterData.find((x)=>x.id === id) || facultyData.find((x)=>x.id === id);
            if (u) return `Re-Assign ${u.last_name}`;
        }
        return "Bulk Assignment";
    };
    const handleSubmitAssignment = async ()=>{
        if (!targetCompanyId && !targetRoleId) {
            alert("Please select at least a Company OR a Role to assign.");
            return;
        }
        if (selectedIds.size === 0) return;
        setIsSubmitting(true);
        const idsToUpdate = Array.from(selectedIds);
        const promises = [];
        if (targetCompanyId) promises.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$data$3a$0c9cb7__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["bulkAssignCompany"])(idsToUpdate, targetCompanyId));
        if (targetRoleId) promises.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$data$3a$3ba46c__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["bulkAssignRole"])(idsToUpdate, targetRoleId));
        const results = await Promise.all(promises);
        const errors = results.filter((r)=>r.error).map((r)=>r.error);
        if (errors.length > 0) {
            alert(`One or more errors occurred:\n${errors.join('\n')}`);
        } else {
            setSelectedIds(new Set());
            setModalOpen(false);
            await fetchData();
        }
        setIsSubmitting(false);
    };
    if (loading && unassigned.length === 0 && rosterData.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto p-8 text-center text-gray-500",
            children: "Loading roster data..."
        }, void 0, false, {
            fileName: "[project]/app/manage/page.tsx",
            lineNumber: 253,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "21e72d2f241fbad9",
                children: "@media print{body{color:#000!important;background-color:#fff!important}header,.no-print,div[aria-label=Tabs]{display:none!important}#printable-roster,body>div,body>main{visibility:visible!important;display:block!important}}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-21e72d2f241fbad9" + " " + "max-w-7xl mx-auto p-4 sm:p-6 lg:p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-21e72d2f241fbad9" + " " + "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 no-print",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-21e72d2f241fbad9",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "jsx-21e72d2f241fbad9" + " " + "text-3xl font-bold text-gray-900 dark:text-white",
                                        children: "Roster Management"
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/page.tsx",
                                        lineNumber: 270,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-21e72d2f241fbad9" + " " + "text-gray-500 dark:text-gray-400 mt-1",
                                        children: "Assign cadets to roles."
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/page.tsx",
                                        lineNumber: 271,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 269,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/manage/roles",
                                className: "flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        className: "jsx-21e72d2f241fbad9" + " " + "h-5 w-5",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
                                            className: "jsx-21e72d2f241fbad9"
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 276,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/page.tsx",
                                        lineNumber: 275,
                                        columnNumber: 13
                                    }, this),
                                    "Configure Chain of Command"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 274,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/manage/page.tsx",
                        lineNumber: 268,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "tour-roster-filters",
                        className: "jsx-21e72d2f241fbad9" + " " + "mb-6 border-b border-gray-200 dark:border-gray-700 no-print",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            "aria-label": "Tabs",
                            className: "jsx-21e72d2f241fbad9" + " " + "-mb-px flex space-x-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab('roster'),
                                    className: "jsx-21e72d2f241fbad9" + " " + `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'roster' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                                    children: "Cadet Roster"
                                }, void 0, false, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 284,
                                    columnNumber: 13
                                }, this),
                                isAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab('faculty'),
                                    className: "jsx-21e72d2f241fbad9" + " " + `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'faculty' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                                    children: "Faculty & Staff"
                                }, void 0, false, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 289,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab('unassigned'),
                                    className: "jsx-21e72d2f241fbad9" + " " + `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'unassigned' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                                    children: [
                                        "Unassigned",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "jsx-21e72d2f241fbad9" + " " + "ml-1.5 inline-block py-0.5 px-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                                            children: unassigned.length
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 296,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 294,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/manage/page.tsx",
                            lineNumber: 283,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/manage/page.tsx",
                        lineNumber: 282,
                        columnNumber: 9
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-21e72d2f241fbad9" + " " + "mb-6 p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200",
                        children: [
                            "Error: ",
                            error
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/manage/page.tsx",
                        lineNumber: 301,
                        columnNumber: 19
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "printable-roster",
                        className: "jsx-21e72d2f241fbad9" + " " + ((activeTab === 'roster' ? '' : 'hidden') || ""),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-21e72d2f241fbad9" + " " + "flex justify-end mb-4 no-print",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handlePrintRoster,
                                    className: "jsx-21e72d2f241fbad9" + " " + "text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline",
                                    children: "Print Roster"
                                }, void 0, false, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 306,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 305,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$RosterClient$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                initialData: rosterData,
                                canEditProfiles: canEditProfiles,
                                canManage: canManage,
                                companies: companies,
                                onReassign: handleReassign,
                                variant: "cadet"
                            }, void 0, false, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 309,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/manage/page.tsx",
                        lineNumber: 304,
                        columnNumber: 9
                    }, this),
                    isAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-21e72d2f241fbad9" + " " + ((activeTab === 'faculty' ? '' : 'hidden') || ""),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-21e72d2f241fbad9" + " " + "mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "jsx-21e72d2f241fbad9" + " " + "text-sm text-blue-800 dark:text-blue-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "jsx-21e72d2f241fbad9",
                                            children: "Restricted View:"
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 324,
                                            columnNumber: 19
                                        }, this),
                                        " You are viewing the Faculty & Staff roster. This data is only visible to role level 90+."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 323,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 322,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$RosterClient$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                initialData: facultyData,
                                canEditProfiles: canEditProfiles,
                                canManage: canManage,
                                companies: companies,
                                onReassign: handleReassign,
                                variant: "faculty"
                            }, void 0, false, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 327,
                                columnNumber: 14
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/manage/page.tsx",
                        lineNumber: 321,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-21e72d2f241fbad9" + " " + `no-print ${activeTab === 'unassigned' ? '' : 'hidden'}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-21e72d2f241fbad9" + " " + "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-21e72d2f241fbad9" + " " + "p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-900/50",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-21e72d2f241fbad9" + " " + "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: unassigned.length > 0 && selectedIds.size === unassigned.length,
                                                    onChange: handleSelectAll,
                                                    className: "jsx-21e72d2f241fbad9" + " " + "rounded border-gray-300 dark:border-gray-600"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 337,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-21e72d2f241fbad9" + " " + "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                    children: [
                                                        selectedIds.size,
                                                        " selected"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 338,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 336,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-21e72d2f241fbad9" + " " + "flex gap-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: openModal,
                                                disabled: selectedIds.size === 0,
                                                className: "jsx-21e72d2f241fbad9" + " " + "px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm flex items-center gap-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-21e72d2f241fbad9",
                                                    children: "Assign Selected..."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 341,
                                                    columnNumber: 231
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/page.tsx",
                                                lineNumber: 341,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 340,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 335,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-21e72d2f241fbad9" + " " + "overflow-x-auto",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "jsx-21e72d2f241fbad9" + " " + "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                className: "jsx-21e72d2f241fbad9" + " " + "bg-gray-50 dark:bg-gray-700/50",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "jsx-21e72d2f241fbad9",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            scope: "col",
                                                            className: "jsx-21e72d2f241fbad9" + " " + "w-12 px-6 py-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 348,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            scope: "col",
                                                            onClick: ()=>handleSort('name'),
                                                            className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                            children: [
                                                                "Name ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                    column: "name",
                                                                    className: "jsx-21e72d2f241fbad9"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 349,
                                                                    columnNumber: 241
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 349,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            scope: "col",
                                                            onClick: ()=>handleSort('created_at'),
                                                            className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                            children: [
                                                                "Date Joined ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                    column: "created_at",
                                                                    className: "jsx-21e72d2f241fbad9"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 350,
                                                                    columnNumber: 254
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 350,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            scope: "col",
                                                            onClick: ()=>handleSort('company'),
                                                            className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                            children: [
                                                                "Company ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                    column: "company",
                                                                    className: "jsx-21e72d2f241fbad9"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 351,
                                                                    columnNumber: 247
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 351,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            scope: "col",
                                                            onClick: ()=>handleSort('role'),
                                                            className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                            children: [
                                                                "Role ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                    column: "role",
                                                                    className: "jsx-21e72d2f241fbad9"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 352,
                                                                    columnNumber: 241
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 352,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 347,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/page.tsx",
                                                lineNumber: 346,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                className: "jsx-21e72d2f241fbad9" + " " + "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700",
                                                children: sortedUnassigned.length > 0 ? sortedUnassigned.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        onClick: ()=>{
                                                            setSelectedIds(new Set([
                                                                u.user_id
                                                            ]));
                                                            openModal();
                                                        },
                                                        className: "jsx-21e72d2f241fbad9" + " " + "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                onClick: (e)=>e.stopPropagation(),
                                                                className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-4 whitespace-nowrap",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "checkbox",
                                                                    checked: selectedIds.has(u.user_id),
                                                                    onChange: ()=>handleSelectRow(u.user_id),
                                                                    onClick: (e)=>e.stopPropagation(),
                                                                    className: "jsx-21e72d2f241fbad9" + " " + "rounded border-gray-300 dark:border-gray-600 h-4 w-4 text-indigo-600"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 363,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/page.tsx",
                                                                lineNumber: 362,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white",
                                                                children: [
                                                                    u.last_name,
                                                                    ", ",
                                                                    u.first_name
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/manage/page.tsx",
                                                                lineNumber: 365,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400",
                                                                children: new Date(u.created_at).toLocaleDateString()
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/page.tsx",
                                                                lineNumber: 366,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-4 whitespace-nowrap text-sm",
                                                                children: u.company_name ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-21e72d2f241fbad9" + " " + "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                                                                    children: u.company_name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 367,
                                                                    columnNumber: 93
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-21e72d2f241fbad9" + " " + "text-red-500 dark:text-red-400 text-xs italic",
                                                                    children: "Unassigned"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 367,
                                                                    columnNumber: 271
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/page.tsx",
                                                                lineNumber: 367,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-4 whitespace-nowrap text-sm",
                                                                children: u.role_name ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-21e72d2f241fbad9" + " " + "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                                                                    children: u.role_name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 368,
                                                                    columnNumber: 90
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-21e72d2f241fbad9" + " " + "text-red-500 dark:text-red-400 text-xs italic",
                                                                    children: "Unassigned"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 368,
                                                                    columnNumber: 273
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/page.tsx",
                                                                lineNumber: 368,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, u.user_id, true, {
                                                        fileName: "[project]/app/manage/page.tsx",
                                                        lineNumber: 357,
                                                        columnNumber: 21
                                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "jsx-21e72d2f241fbad9",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        colSpan: 5,
                                                        className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400",
                                                        children: "No unassigned profiles found."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/page.tsx",
                                                        lineNumber: 370,
                                                        columnNumber: 28
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 370,
                                                    columnNumber: 24
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/page.tsx",
                                                lineNumber: 355,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/manage/page.tsx",
                                        lineNumber: 345,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 344,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/manage/page.tsx",
                            lineNumber: 334,
                            columnNumber: 12
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/manage/page.tsx",
                        lineNumber: 332,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/manage/page.tsx",
                lineNumber: 267,
                columnNumber: 7
            }, this),
            modalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "aria-labelledby": "modal-title",
                role: "dialog",
                "aria-modal": "true",
                className: "jsx-21e72d2f241fbad9" + " " + "fixed inset-0 z-50 overflow-y-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-21e72d2f241fbad9" + " " + "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            onClick: ()=>setModalOpen(false),
                            className: "jsx-21e72d2f241fbad9" + " " + "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                        }, void 0, false, {
                            fileName: "[project]/app/manage/page.tsx",
                            lineNumber: 383,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-21e72d2f241fbad9" + " " + "relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-21e72d2f241fbad9" + " " + "bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-21e72d2f241fbad9" + " " + "sm:flex sm:items-start mb-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-21e72d2f241fbad9" + " " + "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        id: "modal-title",
                                                        className: "jsx-21e72d2f241fbad9" + " " + "text-lg leading-6 font-medium text-gray-900 dark:text-white",
                                                        children: getModalTitle()
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/page.tsx",
                                                        lineNumber: 388,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-21e72d2f241fbad9" + " " + "mt-2",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "jsx-21e72d2f241fbad9" + " " + "text-sm text-gray-500 dark:text-gray-400",
                                                            children: [
                                                                "Assigning ",
                                                                selectedIds.size,
                                                                " users. Leave a field blank to keep it unchanged."
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 391,
                                                            columnNumber: 43
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/page.tsx",
                                                        lineNumber: 391,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/manage/page.tsx",
                                                lineNumber: 387,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 386,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-21e72d2f241fbad9" + " " + "space-y-4 px-4 sm:px-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-21e72d2f241fbad9",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "jsx-21e72d2f241fbad9" + " " + "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                                            children: "Company"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 396,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            value: targetCompanyId,
                                                            onChange: (e)=>setTargetCompanyId(e.target.value),
                                                            className: "jsx-21e72d2f241fbad9" + " " + "block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "",
                                                                    className: "jsx-21e72d2f241fbad9",
                                                                    children: "-- No Change --"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 398,
                                                                    columnNumber: 23
                                                                }, this),
                                                                companies.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: c.id,
                                                                        className: "jsx-21e72d2f241fbad9",
                                                                        children: c.company_name
                                                                    }, c.id, false, {
                                                                        fileName: "[project]/app/manage/page.tsx",
                                                                        lineNumber: 399,
                                                                        columnNumber: 43
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 397,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 395,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-21e72d2f241fbad9",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "jsx-21e72d2f241fbad9" + " " + "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                                            children: "Role"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 403,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            value: targetRoleId,
                                                            onChange: (e)=>handleRoleChange(e.target.value),
                                                            className: "jsx-21e72d2f241fbad9" + " " + "block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "",
                                                                    className: "jsx-21e72d2f241fbad9",
                                                                    children: "-- No Change --"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 405,
                                                                    columnNumber: 23
                                                                }, this),
                                                                availableRoles.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: r.id,
                                                                        className: "jsx-21e72d2f241fbad9",
                                                                        children: [
                                                                            r.role_name,
                                                                            " (Lvl ",
                                                                            r.default_role_level,
                                                                            ")"
                                                                        ]
                                                                    }, r.id, true, {
                                                                        fileName: "[project]/app/manage/page.tsx",
                                                                        lineNumber: 406,
                                                                        columnNumber: 48
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 404,
                                                            columnNumber: 21
                                                        }, this),
                                                        targetCompanyId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "jsx-21e72d2f241fbad9" + " " + "mt-1 text-xs text-gray-500",
                                                            children: "Showing only roles available for this company (and global roles)."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 408,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 402,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 394,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 385,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-21e72d2f241fbad9" + " " + "bg-gray-50 dark:bg-gray-700/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            disabled: isSubmitting,
                                            onClick: handleSubmitAssignment,
                                            className: "jsx-21e72d2f241fbad9" + " " + "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50",
                                            children: isSubmitting ? 'Saving...' : 'Save Assignments'
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 413,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setModalOpen(false),
                                            className: "jsx-21e72d2f241fbad9" + " " + "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 414,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 412,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/manage/page.tsx",
                            lineNumber: 384,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/manage/page.tsx",
                    lineNumber: 382,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/manage/page.tsx",
                lineNumber: 381,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=app_9377b84d._.js.map