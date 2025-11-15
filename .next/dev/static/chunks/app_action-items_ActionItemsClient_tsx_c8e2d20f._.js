(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/action-items/ActionItemsClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ActionItemsClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// Helper to format names
const formatName = (person)=>{
    if (!person?.last_name) return 'N/A';
    return `${person.last_name}, ${person.first_name}`;
};
function ActionItemsClient({ items }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    // State
    const [selectedReports, setSelectedReports] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        key: 'date',
        direction: 'asc'
    });
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [bulkComment, setBulkComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Inline Action State
    const [expandedRowId, setExpandedRowId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [singleComment, setSingleComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // --- Filtering & Sorting ---
    const filteredItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ActionItemsClient.useMemo[filteredItems]": ()=>{
            const lowerSearch = searchTerm.toLowerCase();
            if (!lowerSearch) return items;
            return items.filter({
                "ActionItemsClient.useMemo[filteredItems]": (item)=>formatName(item.subject).toLowerCase().includes(lowerSearch) || formatName(item.submitter).toLowerCase().includes(lowerSearch) || item.company?.company_name?.toLowerCase().includes(lowerSearch) || item.offense_type.offense_name.toLowerCase().includes(lowerSearch)
            }["ActionItemsClient.useMemo[filteredItems]"]);
        }
    }["ActionItemsClient.useMemo[filteredItems]"], [
        items,
        searchTerm
    ]);
    const sortedAndFilteredItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ActionItemsClient.useMemo[sortedAndFilteredItems]": ()=>{
            return [
                ...filteredItems
            ].sort({
                "ActionItemsClient.useMemo[sortedAndFilteredItems]": (a, b)=>{
                    let aValue = '', bValue = '';
                    switch(sortConfig.key){
                        case 'subject':
                            aValue = formatName(a.subject);
                            bValue = formatName(b.subject);
                            break;
                        case 'submitter':
                            aValue = formatName(a.submitter);
                            bValue = formatName(b.submitter);
                            break;
                        case 'company':
                            aValue = a.company?.company_name || '';
                            bValue = b.company?.company_name || '';
                            break;
                        case 'offense':
                            aValue = a.offense_type.offense_name;
                            bValue = b.offense_type.offense_name;
                            break;
                        case 'date':
                            aValue = new Date(a.created_at).getTime();
                            bValue = new Date(b.created_at).getTime();
                            break;
                    }
                    return aValue < bValue ? sortConfig.direction === 'asc' ? -1 : 1 : aValue > bValue ? sortConfig.direction === 'asc' ? 1 : -1 : 0;
                }
            }["ActionItemsClient.useMemo[sortedAndFilteredItems]"]);
        }
    }["ActionItemsClient.useMemo[sortedAndFilteredItems]"], [
        filteredItems,
        sortConfig
    ]);
    // --- Handlers ---
    const handleSort = (key)=>{
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };
    const handleSelect = (id)=>{
        const newSet = new Set(selectedReports);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedReports(newSet);
    };
    const handleSelectAll = ()=>{
        setSelectedReports(selectedReports.size === sortedAndFilteredItems.length ? new Set() : new Set(sortedAndFilteredItems.map((i)=>i.id)));
    };
    // Toggle Expansion
    const handleRowClick = (reportId)=>{
        if (expandedRowId === reportId) {
            setExpandedRowId(null);
            setSingleComment('');
        } else {
            setExpandedRowId(reportId);
            setSingleComment('');
        }
    };
    // Handle Individual Action
    const handleSingleAction = async (reportId, action)=>{
        if ((action === 'reject' || action === 'kickback') && !singleComment.trim()) {
            alert(`A comment is required to ${action} this report.`);
            return;
        }
        setIsLoading(true);
        let rpcName = 'bulk_approve_reports';
        if (action === 'reject') rpcName = 'bulk_reject_reports';
        if (action === 'kickback') rpcName = 'bulk_kickback_reports';
        const comment = singleComment.trim() || 'Approved';
        const { data, error } = await supabase.rpc(rpcName, {
            p_report_ids: [
                reportId
            ],
            p_comment: comment
        });
        if (error) {
            alert(`Error: ${error.message}`);
        } else {
            setExpandedRowId(null);
            setSingleComment('');
            router.refresh();
        }
        setIsLoading(false);
    };
    // Bulk Action Handler
    const handleBulkAction = async (action)=>{
        if (selectedReports.size === 0) return;
        if (action === 'reject' && !bulkComment.trim()) {
            alert('Comment required for rejection');
            return;
        }
        setIsLoading(true);
        const rpcName = action === 'approve' ? 'bulk_approve_reports' : 'bulk_reject_reports';
        await supabase.rpc(rpcName, {
            p_report_ids: Array.from(selectedReports),
            p_comment: bulkComment || 'Approved'
        });
        setSelectedReports(new Set());
        setBulkComment('');
        router.refresh();
        setIsLoading(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-200 dark:border-gray-700",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Search...",
                        className: "block w-full md:w-1/3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm",
                        value: searchTerm,
                        onChange: (e)=>setSearchTerm(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-grow flex flex-col sm:flex-row sm:items-center gap-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                placeholder: selectedReports.size > 0 ? `Comment for ${selectedReports.size} items...` : 'Select items...',
                                className: "block w-full sm:flex-grow rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm py-2 px-3",
                                value: bulkComment,
                                onChange: (e)=>setBulkComment(e.target.value),
                                disabled: selectedReports.size === 0 || isLoading
                            }, void 0, false, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 131,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 flex-shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleBulkAction('approve'),
                                        disabled: selectedReports.size === 0 || isLoading,
                                        className: "py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400",
                                        children: "Approve"
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 133,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleBulkAction('reject'),
                                        disabled: selectedReports.size === 0 || isLoading || !bulkComment.trim(),
                                        className: "py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400",
                                        children: "Reject"
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 134,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 132,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-gray-50 dark:bg-gray-700",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-4 text-left",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            className: "rounded",
                                            checked: selectedReports.size > 0 && selectedReports.size === sortedAndFilteredItems.length,
                                            onChange: handleSelectAll
                                        }, void 0, false, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 144,
                                            columnNumber: 47
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 144,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        onClick: ()=>handleSort('subject'),
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                        children: "Subject"
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 144,
                                        columnNumber: 217
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        onClick: ()=>handleSort('submitter'),
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                        children: "Submitter"
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 144,
                                        columnNumber: 396
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        onClick: ()=>handleSort('company'),
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                        children: "Company"
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 144,
                                        columnNumber: 579
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        onClick: ()=>handleSort('offense'),
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                        children: "Infraction"
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 144,
                                        columnNumber: 758
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        onClick: ()=>handleSort('date'),
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer",
                                        children: "Date"
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 144,
                                        columnNumber: 940
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider",
                                        children: "Time"
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 144,
                                        columnNumber: 1113
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 144,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                            lineNumber: 142,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700",
                            children: sortedAndFilteredItems.length > 0 ? sortedAndFilteredItems.map((item)=>[
                                    // Main Row
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        onClick: ()=>handleRowClick(item.id),
                                        className: `cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${expandedRowId === item.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "p-4",
                                                onClick: (e)=>e.stopPropagation(),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    className: "rounded",
                                                    checked: selectedReports.has(item.id),
                                                    onChange: ()=>handleSelect(item.id)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 155,
                                                    columnNumber: 74
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 155,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white",
                                                children: formatName(item.subject)
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 156,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300",
                                                children: formatName(item.submitter)
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 157,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300",
                                                children: item.company?.company_name || 'N/A'
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 158,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 text-sm text-gray-500 dark:text-gray-300",
                                                children: item.offense_type.offense_name
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 159,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300",
                                                children: new Date(item.created_at).toLocaleDateString()
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 160,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono",
                                                children: new Date(item.created_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 161,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, item.id, true, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 150,
                                        columnNumber: 17
                                    }, this),
                                    // EXPANDED ROW VIEW
                                    expandedRowId === item.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "bg-gray-50 dark:bg-gray-900/30",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            colSpan: 7,
                                            className: "p-0 border-b border-gray-200 dark:border-gray-700",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col md:flex-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-grow p-6 space-y-6 md:border-r border-gray-200 dark:border-gray-700",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase",
                                                                                children: "Subject"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 177,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-gray-900 dark:text-white font-medium",
                                                                                children: formatName(item.subject)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 178,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 176,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase",
                                                                                children: "Demerits"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 181,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-red-600 dark:text-red-400 font-bold text-lg",
                                                                                children: item.offense_type.demerits
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 182,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 180,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase",
                                                                                children: "Submitter"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 185,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-gray-900 dark:text-white",
                                                                                children: formatName(item.submitter)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 186,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 184,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase",
                                                                                children: "Date"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 189,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-gray-900 dark:text-white",
                                                                                children: new Date(item.created_at).toLocaleString()
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 190,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 188,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                lineNumber: 175,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                        className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1",
                                                                        children: "Notes"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 196,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap",
                                                                        children: item.notes || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "italic text-gray-400",
                                                                            children: "No notes provided."
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 198,
                                                                            columnNumber: 48
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 197,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                lineNumber: 195,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                        className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2",
                                                                        children: "History"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 204,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "space-y-2",
                                                                        children: item.logs && item.logs.length > 0 ? item.logs.map((log, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-start gap-2 text-sm flex-wrap",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "font-medium text-gray-900 dark:text-white w-32 flex-shrink-0",
                                                                                        children: log.actor_name
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 209,
                                                                                        columnNumber: 45
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: `px-2 py-0.5 rounded-full text-xs font-medium ${log.action === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : log.action === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : log.action === 'kickback' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`,
                                                                                        children: log.action
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 210,
                                                                                        columnNumber: 45
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-gray-500 dark:text-gray-400 text-xs",
                                                                                        children: new Date(log.date).toLocaleDateString()
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 218,
                                                                                        columnNumber: 45
                                                                                    }, this),
                                                                                    log.comment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-gray-600 dark:text-gray-300 italic",
                                                                                        children: [
                                                                                            '"',
                                                                                            log.comment,
                                                                                            '"'
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 219,
                                                                                        columnNumber: 61
                                                                                    }, this)
                                                                                ]
                                                                            }, idx, true, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 208,
                                                                                columnNumber: 41
                                                                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs text-gray-500 italic",
                                                                            children: "No prior history."
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 223,
                                                                            columnNumber: 37
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 205,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                lineNumber: 203,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 173,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "md:w-64 flex-shrink-0 p-4 bg-white dark:bg-gray-800 flex flex-col gap-4 border-t md:border-t-0 border-gray-200 dark:border-gray-700",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "block text-sm font-medium text-gray-900 dark:text-white mb-2",
                                                                        children: "Review Action"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 232,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                        placeholder: "Add a comment (required for Reject/Kickback)...",
                                                                        className: "w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm text-sm",
                                                                        rows: 4,
                                                                        value: singleComment,
                                                                        onChange: (e)=>setSingleComment(e.target.value)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 233,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                lineNumber: 231,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-col gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>handleSingleAction(item.id, 'approve'),
                                                                        disabled: isLoading,
                                                                        className: "w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50",
                                                                        children: "Approve"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 242,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>handleSingleAction(item.id, 'kickback'),
                                                                        disabled: isLoading || !singleComment.trim(),
                                                                        className: "w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium disabled:opacity-50",
                                                                        children: "Kick-Back"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 245,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>handleSingleAction(item.id, 'reject'),
                                                                        disabled: isLoading || !singleComment.trim(),
                                                                        className: "w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium disabled:opacity-50",
                                                                        children: "Reject"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 248,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                lineNumber: 241,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-auto pt-4 text-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                    href: `/report/${item.id}`,
                                                                    className: "text-xs text-indigo-600 dark:text-indigo-400 hover:underline",
                                                                    children: "View Full Page →"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                    lineNumber: 253,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                lineNumber: 252,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 230,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 170,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 169,
                                            columnNumber: 21
                                        }, this)
                                    }, `${item.id}-details`, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 168,
                                        columnNumber: 19
                                    }, this)
                                ]) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: 7,
                                    className: "px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400",
                                    children: searchTerm ? 'No reports match your search.' : 'Your action item queue is empty.'
                                }, void 0, false, {
                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                    lineNumber: 264,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 264,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                            lineNumber: 146,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                    lineNumber: 141,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                lineNumber: 140,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
        lineNumber: 125,
        columnNumber: 5
    }, this);
}
_s(ActionItemsClient, "iaAwM0voxXGHZKrYs3AeJH/CpKE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ActionItemsClient;
var _c;
__turbopack_context__.k.register(_c, "ActionItemsClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_action-items_ActionItemsClient_tsx_c8e2d20f._.js.map