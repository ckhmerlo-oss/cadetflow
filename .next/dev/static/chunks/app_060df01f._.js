(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/manage/RosterClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RosterClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const CONDUCT_ORDER = [
    'Exemplary',
    'Commendable',
    'Satisfactory',
    'Deficient',
    'Unsatisfactory'
];
function RosterClient({ initialData, canEditProfiles, companies, onReassign, variant = 'cadet' }) {
    _s();
    const [openCadetId, setOpenCadetId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [filterCompany, setFilterCompany] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [filterGrade, setFilterGrade] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [filterConduct, setFilterConduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        key: 'last_name',
        direction: 'ascending'
    });
    const handleRowClick = (cadetId)=>{
        setOpenCadetId((prevId)=>prevId === cadetId ? null : cadetId);
    };
    const filteredAndSortedCadets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RosterClient.useMemo[filteredAndSortedCadets]": ()=>{
            let filteredData = [
                ...initialData
            ];
            if (searchTerm) {
                const lowerSearch = searchTerm.toLowerCase();
                filteredData = filteredData.filter({
                    "RosterClient.useMemo[filteredAndSortedCadets]": (item)=>item.first_name.toLowerCase().includes(lowerSearch) || item.last_name.toLowerCase().includes(lowerSearch) || item.cadet_rank && item.cadet_rank.toLowerCase().includes(lowerSearch) || item.role_name && item.role_name.toLowerCase().includes(lowerSearch) || item.email && item.email.toLowerCase().includes(lowerSearch)
                }["RosterClient.useMemo[filteredAndSortedCadets]"]);
            }
            if (filterCompany !== 'all') {
                filteredData = filteredData.filter({
                    "RosterClient.useMemo[filteredAndSortedCadets]": (c)=>c.company_name === filterCompany
                }["RosterClient.useMemo[filteredAndSortedCadets]"]);
            }
            if (variant === 'cadet') {
                if (filterGrade !== 'all') filteredData = filteredData.filter({
                    "RosterClient.useMemo[filteredAndSortedCadets]": (c)=>c.grade_level === filterGrade
                }["RosterClient.useMemo[filteredAndSortedCadets]"]);
                if (filterConduct !== 'all') filteredData = filteredData.filter({
                    "RosterClient.useMemo[filteredAndSortedCadets]": (c)=>c.conduct_status === filterConduct
                }["RosterClient.useMemo[filteredAndSortedCadets]"]);
            }
            filteredData.sort({
                "RosterClient.useMemo[filteredAndSortedCadets]": (a, b)=>{
                    const aValue = a[sortConfig.key];
                    const bValue = b[sortConfig.key];
                    if (aValue == null) return 1;
                    if (bValue == null) return -1;
                    return aValue < bValue ? sortConfig.direction === 'ascending' ? -1 : 1 : aValue > bValue ? sortConfig.direction === 'ascending' ? 1 : -1 : 0;
                }
            }["RosterClient.useMemo[filteredAndSortedCadets]"]);
            return filteredData;
        }
    }["RosterClient.useMemo[filteredAndSortedCadets]"], [
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
    const uniqueCompanies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RosterClient.useMemo[uniqueCompanies]": ()=>[
                ...new Set(initialData.map({
                    "RosterClient.useMemo[uniqueCompanies]": (c)=>c.company_name
                }["RosterClient.useMemo[uniqueCompanies]"]).filter(Boolean).sort())
            ]
    }["RosterClient.useMemo[uniqueCompanies]"], [
        initialData
    ]);
    const uniqueGrades = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RosterClient.useMemo[uniqueGrades]": ()=>[
                ...new Set(initialData.map({
                    "RosterClient.useMemo[uniqueGrades]": (c)=>c.grade_level
                }["RosterClient.useMemo[uniqueGrades]"]).filter(Boolean).sort())
            ]
    }["RosterClient.useMemo[uniqueGrades]"], [
        initialData
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "roster-controls",
                className: "p-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gray-200 dark:border-gray-700 no-print",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: searchTerm,
                        onChange: (e)=>setSearchTerm(e.target.value),
                        placeholder: variant === 'cadet' ? "Search by name, role, room..." : "Search by name, role, email...",
                        className: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                    }, void 0, false, {
                        fileName: "[project]/app/manage/RosterClient.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: filterCompany,
                        onChange: (e)=>setFilterCompany(e.target.value),
                        className: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "all",
                                children: "All Companies"
                            }, void 0, false, {
                                fileName: "[project]/app/manage/RosterClient.tsx",
                                lineNumber: 127,
                                columnNumber: 11
                            }, this),
                            uniqueCompanies.map((co)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: String(co),
                                    children: String(co)
                                }, String(co), false, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 128,
                                    columnNumber: 38
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/manage/RosterClient.tsx",
                        lineNumber: 126,
                        columnNumber: 9
                    }, this),
                    variant === 'cadet' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: filterGrade,
                                onChange: (e)=>setFilterGrade(e.target.value),
                                className: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: "All Grades"
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                        lineNumber: 134,
                                        columnNumber: 15
                                    }, this),
                                    uniqueGrades.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: String(g),
                                            children: String(g)
                                        }, String(g), false, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 135,
                                            columnNumber: 38
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/manage/RosterClient.tsx",
                                lineNumber: 133,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: filterConduct,
                                onChange: (e)=>setFilterConduct(e.target.value),
                                className: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: "All Conduct"
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                        lineNumber: 138,
                                        columnNumber: 15
                                    }, this),
                                    CONDUCT_ORDER.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: c,
                                            children: c
                                        }, c, false, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 139,
                                            columnNumber: 39
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/manage/RosterClient.tsx",
                                lineNumber: 137,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/app/manage/RosterClient.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                id: "roster-table-content",
                className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700 printable-table",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                        className: "bg-gray-50 dark:bg-gray-700/50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                variant === 'cadet' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                    onClick: ()=>requestSort('cadet_rank'),
                                    children: [
                                        "Rank ",
                                        getSortIndicator('cadet_rank')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 149,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                    onClick: ()=>requestSort('email'),
                                    children: [
                                        "Email ",
                                        getSortIndicator('email')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 151,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                    onClick: ()=>requestSort('last_name'),
                                    children: [
                                        "Name ",
                                        getSortIndicator('last_name')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 154,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                    onClick: ()=>requestSort('company_name'),
                                    children: [
                                        "Company ",
                                        getSortIndicator('company_name')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 155,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                    onClick: ()=>requestSort('role_name'),
                                    children: [
                                        "Role ",
                                        getSortIndicator('role_name')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/RosterClient.tsx",
                                    lineNumber: 156,
                                    columnNumber: 13
                                }, this),
                                variant === 'cadet' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            scope: "col",
                                            className: "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                            onClick: ()=>requestSort('grade_level'),
                                            children: [
                                                "Grade ",
                                                getSortIndicator('grade_level')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 160,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            scope: "col",
                                            className: "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                            onClick: ()=>requestSort('room_number'),
                                            children: [
                                                "Room # ",
                                                getSortIndicator('room_number')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 161,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            scope: "col",
                                            className: "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                            onClick: ()=>requestSort('conduct_status'),
                                            children: [
                                                "Conduct ",
                                                getSortIndicator('conduct_status')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 162,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/manage/RosterClient.tsx",
                            lineNumber: 147,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/manage/RosterClient.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                        className: "divide-y divide-gray-200 dark:divide-gray-700",
                        children: filteredAndSortedCadets.map((person)=>{
                            const isAdmin = variant === 'faculty' && (person.role_level || 0) >= 90;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        onClick: ()=>handleRowClick(person.id),
                                        className: `
                    hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors
                    ${isAdmin ? 'bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-amber-400' : ''}
                `,
                                        children: [
                                            variant === 'cadet' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200",
                                                children: person.cadet_rank || '-'
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 180,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono",
                                                children: person.email || '-'
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 182,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white",
                                                children: [
                                                    person.last_name,
                                                    ", ",
                                                    person.first_name,
                                                    isAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 uppercase tracking-wide",
                                                        children: "Admin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 188,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 185,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400",
                                                children: person.company_name || '-'
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 194,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400",
                                                children: person.role_name
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 195,
                                                columnNumber: 17
                                            }, this),
                                            variant === 'cadet' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400",
                                                        children: person.grade_level || '-'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 199,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400",
                                                        children: person.room_number || '-'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 200,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap text-sm",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getConductColor(person.conduct_status)}`,
                                                            children: person.conduct_status
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                                            lineNumber: 201,
                                                            columnNumber: 73
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 201,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                        lineNumber: 172,
                                        columnNumber: 15
                                    }, this),
                                    openCadetId === person.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "bg-gray-50 dark:bg-gray-700/30 print-hide",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            colSpan: variant === 'cadet' ? 7 : 4,
                                            className: "px-6 py-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col md:flex-row justify-between gap-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-grow space-y-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider",
                                                                children: variant === 'cadet' ? 'Academic & Disciplinary' : 'Faculty Details'
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                lineNumber: 211,
                                                                columnNumber: 25
                                                            }, this),
                                                            variant === 'cadet' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-center",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block text-xs text-gray-500 uppercase",
                                                                                children: "Demerits (Term)"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 216,
                                                                                columnNumber: 140
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-lg font-bold",
                                                                                children: person.term_demerits
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 216,
                                                                                columnNumber: 218
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 216,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-center",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block text-xs text-gray-500 uppercase",
                                                                                children: "Demerits (Year)"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 217,
                                                                                columnNumber: 140
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-lg font-bold",
                                                                                children: person.year_demerits
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 217,
                                                                                columnNumber: 218
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 217,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-center",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block text-xs text-gray-500 uppercase",
                                                                                children: "Tour Balance"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 218,
                                                                                columnNumber: 140
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: `text-lg font-bold ${person.has_star_tours ? 'text-red-600' : 'text-gray-900 dark:text-white'}`,
                                                                                children: person.has_star_tours ? '*' : person.current_tour_balance
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 218,
                                                                                columnNumber: 215
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 218,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                lineNumber: 215,
                                                                columnNumber: 27
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "p-4 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm text-gray-700 dark:text-gray-200",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                children: "Email:"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 222,
                                                                                columnNumber: 85
                                                                            }, this),
                                                                            " ",
                                                                            person.email || 'No email'
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 222,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm text-gray-700 dark:text-gray-200 mt-1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                children: "System ID:"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 223,
                                                                                columnNumber: 90
                                                                            }, this),
                                                                            " ",
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "font-mono text-xs text-gray-500",
                                                                                children: person.id
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                                lineNumber: 223,
                                                                                columnNumber: 118
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 223,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    isAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-amber-600 dark:text-amber-400 mt-2 font-semibold",
                                                                        children: [
                                                                            "System Administrator (Level ",
                                                                            person.role_level,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 224,
                                                                        columnNumber: 41
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                lineNumber: 221,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 210,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-shrink-0 md:w-48 space-y-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider",
                                                                children: "Actions"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                lineNumber: 230,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-col gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                        href: `/profile/${person.id}`,
                                                                        className: "w-full text-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors",
                                                                        children: "View Profile"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 232,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    variant === 'cadet' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                        href: `/ledger/${person.id}`,
                                                                        className: "w-full text-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors",
                                                                        children: "View Ledger"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 234,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    canEditProfiles && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>onReassign(person.id),
                                                                        className: "w-full text-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-md shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors",
                                                                        children: "Re-Assign"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                                        lineNumber: 237,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                                lineNumber: 231,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                                        lineNumber: 229,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/manage/RosterClient.tsx",
                                                lineNumber: 208,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/RosterClient.tsx",
                                            lineNumber: 207,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/RosterClient.tsx",
                                        lineNumber: 206,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, person.id, true, {
                                fileName: "[project]/app/manage/RosterClient.tsx",
                                lineNumber: 171,
                                columnNumber: 13
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/manage/RosterClient.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/manage/RosterClient.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/manage/RosterClient.tsx",
        lineNumber: 121,
        columnNumber: 5
    }, this);
}
_s(RosterClient, "Q6lmQBUGu8ZZL7aueB+1dGZW1u4=");
_c = RosterClient;
var _c;
__turbopack_context__.k.register(_c, "RosterClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/profile/constants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/manage/data:4a6e8a [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"603a47877742303afc33baf0bf80c9229af4e52ef8":"bulkAssignCompany"},"app/manage/actions.ts",""] */ __turbopack_context__.s([
    "bulkAssignCompany",
    ()=>bulkAssignCompany
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var bulkAssignCompany = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("603a47877742303afc33baf0bf80c9229af4e52ef8", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "bulkAssignCompany"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyBIZWxwZXI6IENoZWNrIGlmIHVzZXIgaXMgYXV0aG9yaXplZCAoU3RhZmYvQWRtaW4vVEFDKVxyXG5hc3luYyBmdW5jdGlvbiBjaGVja1Blcm1pc3Npb25zKHN1cGFiYXNlOiBhbnkpIHtcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdyb2xlOnJvbGVfaWQgKGRlZmF1bHRfcm9sZV9sZXZlbCwgcm9sZV9uYW1lKScpXHJcbiAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgIC5zaW5nbGUoKVxyXG5cclxuICBjb25zdCBsZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgY29uc3QgbmFtZSA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LnJvbGVfbmFtZSB8fCAnJ1xyXG4gIFxyXG4gIC8vIEFsbG93IFN0YWZmICg1MCspLCBvciBzcGVjaWZpYyByb2xlcyBsaWtlIEFkbWluL1RBQ1xyXG4gIHJldHVybiBsZXZlbCA+PSA1MCB8fCBuYW1lID09PSAnQWRtaW4nIHx8IG5hbWUuaW5jbHVkZXMoJ1RBQycpXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVVc2VyUm9sZSh1c2VySWQ6IHN0cmluZywgcm9sZUlkOiBzdHJpbmcgfCBudWxsKSB7XHJcbiAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gIFxyXG4gIGlmICghYXdhaXQgY2hlY2tQZXJtaXNzaW9ucyhzdXBhYmFzZSkpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiBcIlVuYXV0aG9yaXplZC5cIiB9XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgIC51cGRhdGUoeyByb2xlX2lkOiByb2xlSWQgfSlcclxuICAgIC5lcSgnaWQnLCB1c2VySWQpXHJcblxyXG4gIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICByZXZhbGlkYXRlUGF0aCgnL21hbmFnZScpXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSBORVcgQlVMSyBBQ1RJT05TIC0tLVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1bGtBc3NpZ25Db21wYW55KHVzZXJJZHM6IHN0cmluZ1tdLCBjb21wYW55SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICBpZiAoIWF3YWl0IGNoZWNrUGVybWlzc2lvbnMoc3VwYWJhc2UpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogXCJVbmF1dGhvcml6ZWQuXCIgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAudXBkYXRlKHsgY29tcGFueV9pZDogY29tcGFueUlkIH0pXHJcbiAgICAuaW4oJ2lkJywgdXNlcklkcylcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIHJldmFsaWRhdGVQYXRoKCcvbWFuYWdlJylcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1bGtBc3NpZ25Sb2xlKHVzZXJJZHM6IHN0cmluZ1tdLCByb2xlSWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICBpZiAoIWF3YWl0IGNoZWNrUGVybWlzc2lvbnMoc3VwYWJhc2UpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogXCJVbmF1dGhvcml6ZWQuXCIgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAudXBkYXRlKHsgcm9sZV9pZDogcm9sZUlkIH0pXHJcbiAgICAuaW4oJ2lkJywgdXNlcklkcylcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIHJldmFsaWRhdGVQYXRoKCcvbWFuYWdlJylcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiZ1NBMkNzQiJ9
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/manage/data:32ea59 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60532683f7b9907727bf29a27c70ffe98877d06a86":"bulkAssignRole"},"app/manage/actions.ts",""] */ __turbopack_context__.s([
    "bulkAssignRole",
    ()=>bulkAssignRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var bulkAssignRole = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("60532683f7b9907727bf29a27c70ffe98877d06a86", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "bulkAssignRole"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyBIZWxwZXI6IENoZWNrIGlmIHVzZXIgaXMgYXV0aG9yaXplZCAoU3RhZmYvQWRtaW4vVEFDKVxyXG5hc3luYyBmdW5jdGlvbiBjaGVja1Blcm1pc3Npb25zKHN1cGFiYXNlOiBhbnkpIHtcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdyb2xlOnJvbGVfaWQgKGRlZmF1bHRfcm9sZV9sZXZlbCwgcm9sZV9uYW1lKScpXHJcbiAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgIC5zaW5nbGUoKVxyXG5cclxuICBjb25zdCBsZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgY29uc3QgbmFtZSA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LnJvbGVfbmFtZSB8fCAnJ1xyXG4gIFxyXG4gIC8vIEFsbG93IFN0YWZmICg1MCspLCBvciBzcGVjaWZpYyByb2xlcyBsaWtlIEFkbWluL1RBQ1xyXG4gIHJldHVybiBsZXZlbCA+PSA1MCB8fCBuYW1lID09PSAnQWRtaW4nIHx8IG5hbWUuaW5jbHVkZXMoJ1RBQycpXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVVc2VyUm9sZSh1c2VySWQ6IHN0cmluZywgcm9sZUlkOiBzdHJpbmcgfCBudWxsKSB7XHJcbiAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gIFxyXG4gIGlmICghYXdhaXQgY2hlY2tQZXJtaXNzaW9ucyhzdXBhYmFzZSkpIHtcclxuICAgIHJldHVybiB7IGVycm9yOiBcIlVuYXV0aG9yaXplZC5cIiB9XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgIC51cGRhdGUoeyByb2xlX2lkOiByb2xlSWQgfSlcclxuICAgIC5lcSgnaWQnLCB1c2VySWQpXHJcblxyXG4gIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICByZXZhbGlkYXRlUGF0aCgnL21hbmFnZScpXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSBORVcgQlVMSyBBQ1RJT05TIC0tLVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1bGtBc3NpZ25Db21wYW55KHVzZXJJZHM6IHN0cmluZ1tdLCBjb21wYW55SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICBpZiAoIWF3YWl0IGNoZWNrUGVybWlzc2lvbnMoc3VwYWJhc2UpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogXCJVbmF1dGhvcml6ZWQuXCIgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAudXBkYXRlKHsgY29tcGFueV9pZDogY29tcGFueUlkIH0pXHJcbiAgICAuaW4oJ2lkJywgdXNlcklkcylcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIHJldmFsaWRhdGVQYXRoKCcvbWFuYWdlJylcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1bGtBc3NpZ25Sb2xlKHVzZXJJZHM6IHN0cmluZ1tdLCByb2xlSWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICBpZiAoIWF3YWl0IGNoZWNrUGVybWlzc2lvbnMoc3VwYWJhc2UpKSB7XHJcbiAgICByZXR1cm4geyBlcnJvcjogXCJVbmF1dGhvcml6ZWQuXCIgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAudXBkYXRlKHsgcm9sZV9pZDogcm9sZUlkIH0pXHJcbiAgICAuaW4oJ2lkJywgdXNlcklkcylcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIHJldmFsaWRhdGVQYXRoKCcvbWFuYWdlJylcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiNlJBNkRzQiJ9
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/manage/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ManagePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$RosterClient$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/manage/RosterClient.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$profile$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/profile/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$data$3a$4a6e8a__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/manage/data:4a6e8a [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$data$3a$32ea59__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/manage/data:32ea59 [app-client] (ecmascript) <text/javascript>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
function ManagePage() {
    _s();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    // Added 'faculty' to tab state
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('roster');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Data State
    const [companies, setCompanies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [roles, setRoles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [unassigned, setUnassigned] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [rosterData, setRosterData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [facultyData, setFacultyData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]) // New State
    ;
    // Permissions
    const [canEditProfiles, setCanEditProfiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAdmin, setIsAdmin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false) // New State for 90+ check
    ;
    // Selection State
    const [selectedIds, setSelectedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    // Sorting State
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        key: 'created_at',
        direction: 'desc'
    });
    // Modal State
    const [modalOpen, setModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [targetCompanyId, setTargetCompanyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [targetRoleId, setTargetRoleId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // --- 1. Extract Data Fetching Logic ---
    const fetchData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ManagePage.useCallback[fetchData]": async ()=>{
            setLoading(true);
            setError(null);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setLoading(false);
                    setError("You must be logged in.");
                    return;
                }
                const { data: viewerProfile } = await supabase.from('profiles').select('role:role_id (role_name, default_role_level)').eq('id', user.id).single();
                const roleName = viewerProfile?.role?.role_name || '';
                const roleLevel = viewerProfile?.role?.default_role_level || 0;
                const isSiteAdmin = roleName === 'Admin' || roleLevel >= 90;
                setIsAdmin(isSiteAdmin);
                setCanEditProfiles(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$profile$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EDIT_AUTHORIZED_ROLES"].includes(roleName) || roleName.includes('TAC') || isSiteAdmin);
                // Build Promise Array
                const promises = [
                    supabase.from('companies').select('*').order('company_name'),
                    supabase.from('roles').select('*').order('default_role_level', {
                        ascending: false
                    }),
                    supabase.rpc('get_unassigned_users'),
                    supabase.rpc('get_full_roster')
                ];
                // Only fetch faculty if admin
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
                else setRosterData(fullRosterRes.data);
                if (unassignedRes.error) console.error("Error fetching unassigned:", unassignedRes.error.message);
                else setUnassigned(unassignedRes.data);
                if (facultyRes.error) console.error("Error fetching faculty:", facultyRes.error.message);
                else setFacultyData(facultyRes.data);
            } catch (err) {
                setError(err.message);
            } finally{
                setLoading(false);
            }
        }
    }["ManagePage.useCallback[fetchData]"], [
        supabase
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ManagePage.useEffect": ()=>{
            fetchData();
        }
    }["ManagePage.useEffect"], [
        fetchData
    ]);
    // --- Sorting Logic ---
    const sortedUnassigned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ManagePage.useMemo[sortedUnassigned]": ()=>{
            const sorted = [
                ...unassigned
            ];
            sorted.sort({
                "ManagePage.useMemo[sortedUnassigned]": (a, b)=>{
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
                }
            }["ManagePage.useMemo[sortedUnassigned]"]);
            return sorted;
        }
    }["ManagePage.useMemo[sortedUnassigned]"], [
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
        if (sortConfig.key !== column) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-gray-300 ml-1",
            children: "⇅"
        }, void 0, false, {
            fileName: "[project]/app/manage/page.tsx",
            lineNumber: 164,
            columnNumber: 43
        }, this);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-indigo-600 dark:text-indigo-400 ml-1",
            children: sortConfig.direction === 'asc' ? '↑' : '↓'
        }, void 0, false, {
            fileName: "[project]/app/manage/page.tsx",
            lineNumber: 165,
            columnNumber: 12
        }, this);
    };
    // --- Handlers ---
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
    const availableRoles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ManagePage.useMemo[availableRoles]": ()=>{
            if (!targetCompanyId) return roles;
            return roles.filter({
                "ManagePage.useMemo[availableRoles]": (r)=>r.company_id === targetCompanyId || r.company_id === null
            }["ManagePage.useMemo[availableRoles]"]);
        }
    }["ManagePage.useMemo[availableRoles]"], [
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
    const handleSubmitAssignment = async ()=>{
        if (!targetCompanyId && !targetRoleId) {
            alert("Please select at least a Company OR a Role to assign.");
            return;
        }
        if (selectedIds.size === 0) return;
        setIsSubmitting(true);
        const idsToUpdate = Array.from(selectedIds);
        const promises = [];
        if (targetCompanyId) promises.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$data$3a$4a6e8a__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["bulkAssignCompany"])(idsToUpdate, targetCompanyId));
        if (targetRoleId) promises.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$data$3a$32ea59__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["bulkAssignRole"])(idsToUpdate, targetRoleId));
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto p-8 text-center text-gray-500",
            children: "Loading roster data..."
        }, void 0, false, {
            fileName: "[project]/app/manage/page.tsx",
            lineNumber: 239,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "21e72d2f241fbad9",
                children: "@media print{body{color:#000!important;background-color:#fff!important}header,.no-print,div[aria-label=Tabs]{display:none!important}#printable-roster,body>div,body>main{visibility:visible!important;display:block!important}}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-21e72d2f241fbad9" + " " + "max-w-7xl mx-auto p-4 sm:p-6 lg:p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-21e72d2f241fbad9" + " " + "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 no-print",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-21e72d2f241fbad9",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "jsx-21e72d2f241fbad9" + " " + "text-3xl font-bold text-gray-900 dark:text-white",
                                        children: "Roster Management"
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/page.tsx",
                                        lineNumber: 256,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-21e72d2f241fbad9" + " " + "text-gray-500 dark:text-gray-400 mt-1",
                                        children: "Assign cadets to roles."
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/page.tsx",
                                        lineNumber: 257,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 255,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/manage/roles",
                                className: "flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        className: "jsx-21e72d2f241fbad9" + " " + "h-5 w-5",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
                                            className: "jsx-21e72d2f241fbad9"
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 262,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/page.tsx",
                                        lineNumber: 261,
                                        columnNumber: 13
                                    }, this),
                                    "Configure Chain of Command"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 260,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/manage/page.tsx",
                        lineNumber: 254,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-21e72d2f241fbad9" + " " + "mb-6 border-b border-gray-200 dark:border-gray-700 no-print",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            id: "tour-roster-filters",
                            className: "jsx-21e72d2f241fbad9" + " " + "mb-6 border-b border-gray-200 dark:border-gray-700 no-print",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                "aria-label": "Tabs",
                                className: "jsx-21e72d2f241fbad9" + " " + "-mb-px flex space-x-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('roster'),
                                        className: "jsx-21e72d2f241fbad9" + " " + `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'roster' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                                        children: "Cadet Roster"
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/page.tsx",
                                        lineNumber: 271,
                                        columnNumber: 13
                                    }, this),
                                    isAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('faculty'),
                                        className: "jsx-21e72d2f241fbad9" + " " + `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'faculty' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                                        children: "Faculty & Staff"
                                    }, void 0, false, {
                                        fileName: "[project]/app/manage/page.tsx",
                                        lineNumber: 277,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('unassigned'),
                                        className: "jsx-21e72d2f241fbad9" + " " + `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'unassigned' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                                        children: [
                                            "Unassigned",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-21e72d2f241fbad9" + " " + "ml-1.5 inline-block py-0.5 px-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                                                children: unassigned.length
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/page.tsx",
                                                lineNumber: 284,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/manage/page.tsx",
                                        lineNumber: 282,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 270,
                                columnNumber: 11
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/manage/page.tsx",
                            lineNumber: 269,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/manage/page.tsx",
                        lineNumber: 268,
                        columnNumber: 9
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-21e72d2f241fbad9" + " " + "mb-6 p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200",
                        children: [
                            "Error: ",
                            error
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/manage/page.tsx",
                        lineNumber: 290,
                        columnNumber: 19
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "printable-roster",
                        className: "jsx-21e72d2f241fbad9" + " " + ((activeTab === 'roster' ? '' : 'hidden') || ""),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-21e72d2f241fbad9" + " " + "flex justify-end mb-4 no-print",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handlePrintRoster,
                                    className: "jsx-21e72d2f241fbad9" + " " + "text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline",
                                    children: "Print Roster"
                                }, void 0, false, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 295,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 294,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$RosterClient$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                initialData: rosterData,
                                canEditProfiles: canEditProfiles,
                                companies: companies,
                                onReassign: handleReassign,
                                variant: "cadet"
                            }, void 0, false, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 297,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/manage/page.tsx",
                        lineNumber: 293,
                        columnNumber: 9
                    }, this),
                    isAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-21e72d2f241fbad9" + " " + ((activeTab === 'faculty' ? '' : 'hidden') || ""),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-21e72d2f241fbad9" + " " + "mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "jsx-21e72d2f241fbad9" + " " + "text-sm text-blue-800 dark:text-blue-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "jsx-21e72d2f241fbad9",
                                            children: "Restricted View:"
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 305,
                                            columnNumber: 19
                                        }, this),
                                        " You are viewing the Faculty & Staff roster. This data is only visible to role level 90+."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 304,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 303,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$manage$2f$RosterClient$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                initialData: facultyData,
                                canEditProfiles: canEditProfiles,
                                companies: companies,
                                onReassign: handleReassign,
                                variant: "faculty"
                            }, void 0, false, {
                                fileName: "[project]/app/manage/page.tsx",
                                lineNumber: 308,
                                columnNumber: 14
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/manage/page.tsx",
                        lineNumber: 302,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-21e72d2f241fbad9" + " " + `no-print ${activeTab === 'unassigned' ? '' : 'hidden'}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-21e72d2f241fbad9" + " " + "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-21e72d2f241fbad9" + " " + "p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-900/50",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-21e72d2f241fbad9" + " " + "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: unassigned.length > 0 && selectedIds.size === unassigned.length,
                                                    onChange: handleSelectAll,
                                                    className: "jsx-21e72d2f241fbad9" + " " + "rounded border-gray-300 dark:border-gray-600"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 317,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-21e72d2f241fbad9" + " " + "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                    children: [
                                                        selectedIds.size,
                                                        " selected"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 318,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 316,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-21e72d2f241fbad9" + " " + "flex gap-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: openModal,
                                                disabled: selectedIds.size === 0,
                                                className: "jsx-21e72d2f241fbad9" + " " + "px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm flex items-center gap-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-21e72d2f241fbad9",
                                                    children: "Assign Selected..."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 321,
                                                    columnNumber: 231
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/page.tsx",
                                                lineNumber: 321,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 320,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 315,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-21e72d2f241fbad9" + " " + "overflow-x-auto",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "jsx-21e72d2f241fbad9" + " " + "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                className: "jsx-21e72d2f241fbad9" + " " + "bg-gray-50 dark:bg-gray-700/50",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "jsx-21e72d2f241fbad9",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            scope: "col",
                                                            className: "jsx-21e72d2f241fbad9" + " " + "w-12 px-6 py-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 328,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            scope: "col",
                                                            onClick: ()=>handleSort('name'),
                                                            className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                            children: [
                                                                "Name ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                    column: "name",
                                                                    className: "jsx-21e72d2f241fbad9"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 329,
                                                                    columnNumber: 241
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 329,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            scope: "col",
                                                            onClick: ()=>handleSort('created_at'),
                                                            className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                            children: [
                                                                "Date Joined ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                    column: "created_at",
                                                                    className: "jsx-21e72d2f241fbad9"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 330,
                                                                    columnNumber: 254
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 330,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            scope: "col",
                                                            onClick: ()=>handleSort('company'),
                                                            className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                            children: [
                                                                "Company ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                    column: "company",
                                                                    className: "jsx-21e72d2f241fbad9"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 331,
                                                                    columnNumber: 247
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 331,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            scope: "col",
                                                            onClick: ()=>handleSort('role'),
                                                            className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                                                            children: [
                                                                "Role ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                                    column: "role",
                                                                    className: "jsx-21e72d2f241fbad9"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 332,
                                                                    columnNumber: 241
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 332,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            scope: "col",
                                                            className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-3",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-21e72d2f241fbad9" + " " + "sr-only",
                                                                children: "Action"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/page.tsx",
                                                                lineNumber: 333,
                                                                columnNumber: 59
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 333,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 327,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/page.tsx",
                                                lineNumber: 326,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                className: "jsx-21e72d2f241fbad9" + " " + "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700",
                                                children: sortedUnassigned.length > 0 ? sortedUnassigned.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        onClick: ()=>router.push(`/profile/${u.user_id}`),
                                                        className: "jsx-21e72d2f241fbad9" + " " + "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                onClick: (e)=>e.stopPropagation(),
                                                                className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-4 whitespace-nowrap",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "checkbox",
                                                                    checked: selectedIds.has(u.user_id),
                                                                    onChange: ()=>handleSelectRow(u.user_id),
                                                                    onClick: (e)=>e.stopPropagation(),
                                                                    className: "jsx-21e72d2f241fbad9" + " " + "rounded border-gray-300 dark:border-gray-600 h-4 w-4 text-indigo-600"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 340,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/page.tsx",
                                                                lineNumber: 339,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white",
                                                                children: [
                                                                    u.last_name,
                                                                    ", ",
                                                                    u.first_name
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/manage/page.tsx",
                                                                lineNumber: 342,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400",
                                                                children: new Date(u.created_at).toLocaleDateString()
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/page.tsx",
                                                                lineNumber: 343,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-4 whitespace-nowrap text-sm",
                                                                children: u.company_name ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-21e72d2f241fbad9" + " " + "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                                                                    children: u.company_name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 344,
                                                                    columnNumber: 93
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-21e72d2f241fbad9" + " " + "text-red-500 dark:text-red-400 text-xs italic",
                                                                    children: "Unassigned"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 344,
                                                                    columnNumber: 271
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/page.tsx",
                                                                lineNumber: 344,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-4 whitespace-nowrap text-sm",
                                                                children: u.role_name ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-21e72d2f241fbad9" + " " + "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                                                                    children: u.role_name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 345,
                                                                    columnNumber: 90
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-21e72d2f241fbad9" + " " + "text-red-500 dark:text-red-400 text-xs italic",
                                                                    children: "Unassigned"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 345,
                                                                    columnNumber: 273
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/page.tsx",
                                                                lineNumber: 345,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-4 whitespace-nowrap text-right text-sm font-medium",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: (e)=>{
                                                                        e.stopPropagation();
                                                                        setSelectedIds(new Set([
                                                                            u.user_id
                                                                        ]));
                                                                        openModal();
                                                                    },
                                                                    className: "jsx-21e72d2f241fbad9" + " " + "text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200",
                                                                    children: "Edit"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 346,
                                                                    columnNumber: 98
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/manage/page.tsx",
                                                                lineNumber: 346,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, u.user_id, true, {
                                                        fileName: "[project]/app/manage/page.tsx",
                                                        lineNumber: 338,
                                                        columnNumber: 21
                                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "jsx-21e72d2f241fbad9",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        colSpan: 6,
                                                        className: "jsx-21e72d2f241fbad9" + " " + "px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400",
                                                        children: "No unassigned profiles found."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/page.tsx",
                                                        lineNumber: 348,
                                                        columnNumber: 28
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 348,
                                                    columnNumber: 24
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/manage/page.tsx",
                                                lineNumber: 336,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/manage/page.tsx",
                                        lineNumber: 325,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 324,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/manage/page.tsx",
                            lineNumber: 314,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/manage/page.tsx",
                        lineNumber: 313,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/manage/page.tsx",
                lineNumber: 253,
                columnNumber: 7
            }, this),
            modalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "aria-labelledby": "modal-title",
                role: "dialog",
                "aria-modal": "true",
                className: "jsx-21e72d2f241fbad9" + " " + "fixed inset-0 z-50 overflow-y-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-21e72d2f241fbad9" + " " + "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            onClick: ()=>setModalOpen(false),
                            className: "jsx-21e72d2f241fbad9" + " " + "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                        }, void 0, false, {
                            fileName: "[project]/app/manage/page.tsx",
                            lineNumber: 361,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            "aria-hidden": "true",
                            className: "jsx-21e72d2f241fbad9" + " " + "hidden sm:inline-block sm:align-middle sm:h-screen",
                            children: "​"
                        }, void 0, false, {
                            fileName: "[project]/app/manage/page.tsx",
                            lineNumber: 362,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-21e72d2f241fbad9" + " " + "relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-21e72d2f241fbad9" + " " + "bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-21e72d2f241fbad9" + " " + "sm:flex sm:items-start mb-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-21e72d2f241fbad9" + " " + "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        id: "modal-title",
                                                        className: "jsx-21e72d2f241fbad9" + " " + "text-lg leading-6 font-medium text-gray-900 dark:text-white",
                                                        children: "Bulk Assignment"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/page.tsx",
                                                        lineNumber: 367,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-21e72d2f241fbad9" + " " + "mt-2",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "jsx-21e72d2f241fbad9" + " " + "text-sm text-gray-500 dark:text-gray-400",
                                                            children: [
                                                                "Assigning ",
                                                                selectedIds.size,
                                                                " users. Leave a field blank to keep it unchanged."
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 368,
                                                            columnNumber: 43
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/manage/page.tsx",
                                                        lineNumber: 368,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/manage/page.tsx",
                                                lineNumber: 366,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 365,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-21e72d2f241fbad9" + " " + "space-y-4 px-4 sm:px-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-21e72d2f241fbad9",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "jsx-21e72d2f241fbad9" + " " + "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                                            children: "Company"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 373,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            value: targetCompanyId,
                                                            onChange: (e)=>setTargetCompanyId(e.target.value),
                                                            className: "jsx-21e72d2f241fbad9" + " " + "block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "",
                                                                    className: "jsx-21e72d2f241fbad9",
                                                                    children: "-- No Change --"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 375,
                                                                    columnNumber: 23
                                                                }, this),
                                                                companies.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: c.id,
                                                                        className: "jsx-21e72d2f241fbad9",
                                                                        children: c.company_name
                                                                    }, c.id, false, {
                                                                        fileName: "[project]/app/manage/page.tsx",
                                                                        lineNumber: 376,
                                                                        columnNumber: 43
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 374,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 372,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-21e72d2f241fbad9",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "jsx-21e72d2f241fbad9" + " " + "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                                            children: "Role"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 380,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            value: targetRoleId,
                                                            onChange: (e)=>handleRoleChange(e.target.value),
                                                            className: "jsx-21e72d2f241fbad9" + " " + "block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "",
                                                                    className: "jsx-21e72d2f241fbad9",
                                                                    children: "-- No Change --"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/manage/page.tsx",
                                                                    lineNumber: 382,
                                                                    columnNumber: 23
                                                                }, this),
                                                                availableRoles.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
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
                                                                        lineNumber: 383,
                                                                        columnNumber: 48
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 381,
                                                            columnNumber: 21
                                                        }, this),
                                                        targetCompanyId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "jsx-21e72d2f241fbad9" + " " + "mt-1 text-xs text-gray-500",
                                                            children: "Showing only roles available for this company (and global roles)."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/manage/page.tsx",
                                                            lineNumber: 385,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/manage/page.tsx",
                                                    lineNumber: 379,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 371,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 364,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-21e72d2f241fbad9" + " " + "bg-gray-50 dark:bg-gray-700/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            disabled: isSubmitting,
                                            onClick: handleSubmitAssignment,
                                            className: "jsx-21e72d2f241fbad9" + " " + "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50",
                                            children: isSubmitting ? 'Saving...' : 'Save Assignments'
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 390,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setModalOpen(false),
                                            className: "jsx-21e72d2f241fbad9" + " " + "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/app/manage/page.tsx",
                                            lineNumber: 391,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/manage/page.tsx",
                                    lineNumber: 389,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/manage/page.tsx",
                            lineNumber: 363,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/manage/page.tsx",
                    lineNumber: 360,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/manage/page.tsx",
                lineNumber: 359,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(ManagePage, "NJp9dF0g2euuskXWi7aBTdNDdJU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ManagePage;
var _c;
__turbopack_context__.k.register(_c, "ManagePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_060df01f._.js.map