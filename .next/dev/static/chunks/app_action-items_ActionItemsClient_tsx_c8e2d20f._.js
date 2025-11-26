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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function ActionItemsClient({ initialReports, currentUserId }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    // --- State ---
    const [selectedReports, setSelectedReports] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [filterType, setFilterType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [filterSubmitter, setFilterSubmitter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        key: 'created_at',
        direction: 'asc'
    });
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Actions State
    const [bulkComment, setBulkComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [expandedRowId, setExpandedRowId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [singleComment, setSingleComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // --- Helpers ---
    const formatName = (person)=>{
        if (!person) return 'N/A';
        const p = Array.isArray(person) ? person[0] : person;
        if (!p || !p.last_name) return 'N/A';
        return `${p.last_name}, ${p.first_name}`;
    };
    const getTaskType = (r)=>{
        if (r.appeal_status && [
            'pending_issuer',
            'pending_chain',
            'pending_commandant'
        ].includes(r.appeal_status)) return 'Appeal Review';
        if (r.appeal_status && [
            'rejected_by_issuer',
            'rejected_by_chain'
        ].includes(r.appeal_status) && r.subject_cadet_id === currentUserId) return 'Appeal Decision';
        if (r.status === 'needs_revision') return 'Revision Needed';
        return 'Approval Needed';
    };
    // *** NEW: Determine if item can be bulk processed ***
    const isBulkActionable = (r)=>{
        // Only standard approvals allow bulk actions. 
        // Appeals and Revisions require individual attention.
        return getTaskType(r) === 'Approval Needed';
    };
    const uniqueSubmitters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ActionItemsClient.useMemo[uniqueSubmitters]": ()=>{
            const submitters = new Set(initialReports.map({
                "ActionItemsClient.useMemo[uniqueSubmitters]": (r)=>formatName(r.submitter)
            }["ActionItemsClient.useMemo[uniqueSubmitters]"]));
            return Array.from(submitters).sort();
        }
    }["ActionItemsClient.useMemo[uniqueSubmitters]"], [
        initialReports
    ]);
    // --- Filtering & Sorting ---
    const processedReports = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ActionItemsClient.useMemo[processedReports]": ()=>{
            let result = [
                ...initialReports
            ];
            // 1. Search
            if (searchTerm) {
                const s = searchTerm.toLowerCase();
                result = result.filter({
                    "ActionItemsClient.useMemo[processedReports]": (item)=>formatName(item.subject).toLowerCase().includes(s) || formatName(item.submitter).toLowerCase().includes(s) || item.offense_type.offense_name.toLowerCase().includes(s)
                }["ActionItemsClient.useMemo[processedReports]"]);
            }
            // 2. Filter Type
            if (filterType !== 'all') {
                result = result.filter({
                    "ActionItemsClient.useMemo[processedReports]": (r)=>{
                        const type = getTaskType(r);
                        if (filterType === 'approvals') return type === 'Approval Needed';
                        if (filterType === 'revisions') return type === 'Revision Needed';
                        if (filterType === 'appeals') return type.includes('Appeal');
                        return true;
                    }
                }["ActionItemsClient.useMemo[processedReports]"]);
            }
            // 3. Filter Submitter
            if (filterSubmitter !== 'all') {
                result = result.filter({
                    "ActionItemsClient.useMemo[processedReports]": (r)=>formatName(r.submitter) === filterSubmitter
                }["ActionItemsClient.useMemo[processedReports]"]);
            }
            // 4. Sort
            result.sort({
                "ActionItemsClient.useMemo[processedReports]": (a, b)=>{
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
                        case 'type':
                            aValue = getTaskType(a);
                            bValue = getTaskType(b);
                            break;
                        case 'created_at':
                            aValue = new Date(a.created_at).getTime();
                            bValue = new Date(b.created_at).getTime();
                            break;
                    }
                    return aValue < bValue ? sortConfig.direction === 'asc' ? -1 : 1 : aValue > bValue ? sortConfig.direction === 'asc' ? 1 : -1 : 0;
                }
            }["ActionItemsClient.useMemo[processedReports]"]);
            return result;
        }
    }["ActionItemsClient.useMemo[processedReports]"], [
        initialReports,
        searchTerm,
        filterType,
        filterSubmitter,
        sortConfig,
        currentUserId
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
    // *** UPDATED: Only selects items that are allowed to be bulk approved ***
    const handleSelectAll = ()=>{
        const bulkableItems = processedReports.filter(isBulkActionable);
        if (selectedReports.size === bulkableItems.length && bulkableItems.length > 0) {
            setSelectedReports(new Set());
        } else {
            setSelectedReports(new Set(bulkableItems.map((i)=>i.id)));
        }
    };
    const handleRowClick = (reportId)=>{
        if (expandedRowId === reportId) {
            setExpandedRowId(null);
            setSingleComment('');
        } else {
            setExpandedRowId(reportId);
            setSingleComment('');
        }
    };
    // --- Logic: Bulk & Single Actions ---
    const performAction = async (report, action, comment)=>{
        const taskType = getTaskType(report);
        let rpcName = '';
        let payload = {};
        // A. STANDARD APPROVAL
        if (taskType === 'Approval Needed') {
            if (action === 'approve') {
                rpcName = 'handle_approval';
                payload = {
                    report_id_to_approve: report.id,
                    approval_comment: comment
                };
            } else if (action === 'reject') {
                rpcName = 'handle_rejection';
                payload = {
                    p_report_id: report.id,
                    p_comment: comment
                };
            } else if (action === 'kickback') {
                rpcName = 'handle_kickback';
                payload = {
                    p_report_id: report.id,
                    p_comment: comment
                };
            }
        } else if (taskType === 'Appeal Review') {
            if (report.appeal_status === 'pending_issuer') rpcName = 'appeal_issuer_action';
            else if (report.appeal_status === 'pending_chain') rpcName = 'appeal_chain_action';
            else if (report.appeal_status === 'pending_commandant') rpcName = 'appeal_commandant_action';
            const appealAction = action === 'approve' ? 'grant' : 'reject';
            if (rpcName) {
                payload = {
                    p_appeal_id: report.appeal_id,
                    p_action: appealAction,
                    p_comment: comment
                };
            } else {
                return {
                    error: {
                        message: 'Could not determine appeal stage.'
                    }
                };
            }
        } else if (taskType === 'Revision Needed') {
            return {
                error: {
                    message: 'Revisions must be done via the full edit page.'
                }
            };
        }
        return supabase.rpc(rpcName, payload);
    };
    const handleSingleAction = async (report, action)=>{
        if ((action === 'reject' || action === 'kickback') && !singleComment.trim()) {
            alert(`A comment is required to ${action} this item.`);
            return;
        }
        if (getTaskType(report).includes('Appeal') && action === 'kickback') {
            alert("You cannot 'Kick-Back' an appeal. Please Reject it if clarification is needed, or Grant it.");
            return;
        }
        setIsLoading(true);
        const { error } = await performAction(report, action, singleComment.trim() || 'Approved');
        if (error) alert(`Error: ${error.message}`);
        else {
            setExpandedRowId(null);
            setSingleComment('');
            router.refresh();
        }
        setIsLoading(false);
    };
    const handleBulkAction = async (action)=>{
        if (selectedReports.size === 0) return;
        if (action === 'reject' && !bulkComment.trim()) {
            alert('Comment required for rejection');
            return;
        }
        if (!window.confirm(`Are you sure you want to ${action} ${selectedReports.size} items?`)) return;
        setIsLoading(true);
        const reportsToProcess = processedReports.filter((r)=>selectedReports.has(r.id));
        await Promise.all(reportsToProcess.map((report)=>performAction(report, action, bulkComment.trim() || 'Bulk Action')));
        setSelectedReports(new Set());
        setBulkComment('');
        router.refresh();
        setIsLoading(false);
    };
    const SortIcon = ({ active, direction })=>{
        if (!active) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "ml-1 text-gray-400",
            children: "↕"
        }, void 0, false, {
            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
            lineNumber: 215,
            columnNumber: 27
        }, this);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "ml-1 text-indigo-600 dark:text-indigo-400",
            children: direction === 'asc' ? '↑' : '↓'
        }, void 0, false, {
            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
            lineNumber: 216,
            columnNumber: 14
        }, this);
    };
    const getTaskBadge = (r)=>{
        const type = getTaskType(r);
        const styles = {
            'Approval Needed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
            'Revision Needed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
            'Appeal Review': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'Appeal Decision': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
        };
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`,
            children: type
        }, void 0, false, {
            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
            lineNumber: 227,
            columnNumber: 14
        }, this);
    };
    // Calculations for Select All checkbox state
    const bulkableCount = processedReports.filter(isBulkActionable).length;
    const isAllSelected = bulkableCount > 0 && selectedReports.size === bulkableCount;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col md:flex-row gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "Search reports...",
                                    className: "block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3",
                                    value: searchTerm,
                                    onChange: (e)=>setSearchTerm(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                    lineNumber: 241,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 240,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filterType,
                                        onChange: (e)=>setFilterType(e.target.value),
                                        className: "rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "all",
                                                children: "All Actions"
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 245,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "approvals",
                                                children: "Approval Needed"
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 246,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "revisions",
                                                children: "Revision Needed"
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 247,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "appeals",
                                                children: "Appeals"
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 248,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 244,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filterSubmitter,
                                        onChange: (e)=>setFilterSubmitter(e.target.value),
                                        className: "rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "all",
                                                children: "All Submitters"
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 251,
                                                columnNumber: 21
                                            }, this),
                                            uniqueSubmitters.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: s,
                                                    children: s
                                                }, s, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 252,
                                                    columnNumber: 48
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 250,
                                        columnNumber: 18
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 243,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                        lineNumber: 239,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md border border-gray-200 dark:border-gray-700",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap",
                                children: [
                                    selectedReports.size,
                                    " selected"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 258,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: selectedReports.size > 0 ? "Optional comment for bulk action..." : "Select items to enable actions...",
                                value: bulkComment,
                                onChange: (e)=>setBulkComment(e.target.value),
                                disabled: selectedReports.size === 0,
                                className: "block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm sm:text-sm"
                            }, void 0, false, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 261,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleBulkAction('approve'),
                                        disabled: selectedReports.size === 0 || isLoading,
                                        className: "px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                        children: "Approve"
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 263,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleBulkAction('reject'),
                                        disabled: selectedReports.size === 0 || isLoading || !bulkComment.trim(),
                                        className: "px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                        children: "Reject"
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 264,
                                        columnNumber: 18
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 262,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                        lineNumber: 257,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-grow overflow-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-gray-50 dark:bg-gray-700 sticky top-0 z-10",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-4 text-left w-12",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            className: "rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-30",
                                            checked: isAllSelected,
                                            onChange: handleSelectAll,
                                            disabled: bulkableCount === 0
                                        }, void 0, false, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 276,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 274,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        onClick: ()=>handleSort('created_at'),
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer",
                                        children: [
                                            "Date ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                active: sortConfig.key === 'created_at',
                                                direction: sortConfig.direction
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 284,
                                                columnNumber: 177
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 284,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        onClick: ()=>handleSort('subject'),
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer",
                                        children: [
                                            "Subject ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                active: sortConfig.key === 'subject',
                                                direction: sortConfig.direction
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 285,
                                                columnNumber: 177
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 285,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase",
                                        children: "Infraction"
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 286,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        onClick: ()=>handleSort('type'),
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer",
                                        children: [
                                            "Action ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                active: sortConfig.key === 'type',
                                                direction: sortConfig.direction
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 287,
                                                columnNumber: 173
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 287,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 273,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                            lineNumber: 272,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700",
                            children: processedReports.length > 0 ? processedReports.map((item)=>{
                                const isAppeal = getTaskType(item).includes('Appeal');
                                const canBulkSelect = isBulkActionable(item);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            onClick: ()=>handleRowClick(item.id),
                                            className: `cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${expandedRowId === item.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "p-4",
                                                    onClick: (e)=>e.stopPropagation(),
                                                    children: canBulkSelect ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        className: "rounded border-gray-300 text-indigo-600 focus:ring-indigo-500",
                                                        checked: selectedReports.has(item.id),
                                                        onChange: ()=>handleSelect(item.id)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 301,
                                                        columnNumber: 31
                                                    }, this) : /* Placeholder to keep column alignment */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "block w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 309,
                                                        columnNumber: 30
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 298,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400",
                                                    children: new Date(item.created_at).toLocaleDateString()
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 312,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4 whitespace-nowrap",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm font-medium text-gray-900 dark:text-white",
                                                            children: formatName(item.subject)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                            lineNumber: 313,
                                                            columnNumber: 67
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-gray-500",
                                                            children: [
                                                                "By: ",
                                                                formatName(item.submitter)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                            lineNumber: 313,
                                                            columnNumber: 166
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 313,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4 text-sm text-gray-500 dark:text-gray-300",
                                                    children: item.offense_type.offense_name
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 314,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4 whitespace-nowrap",
                                                    children: getTaskBadge(item)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 315,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 297,
                                            columnNumber: 21
                                        }, this),
                                        expandedRowId === item.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "bg-gray-50 dark:bg-gray-900/30",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                colSpan: 5,
                                                className: "p-0 border-b border-gray-200 dark:border-gray-700",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col md:flex-row",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-grow p-6 space-y-4 md:border-r border-gray-200 dark:border-gray-700",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "grid grid-cols-2 gap-4 text-sm",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "block text-xs font-semibold text-gray-500 uppercase",
                                                                                    children: "Submitted By"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 327,
                                                                                    columnNumber: 42
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-gray-900 dark:text-white",
                                                                                    children: formatName(item.submitter)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 327,
                                                                                    columnNumber: 131
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 327,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "block text-xs font-semibold text-gray-500 uppercase",
                                                                                    children: "Time"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 328,
                                                                                    columnNumber: 42
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-gray-900 dark:text-white",
                                                                                    children: new Date(item.created_at).toLocaleTimeString()
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 328,
                                                                                    columnNumber: 123
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 328,
                                                                            columnNumber: 37
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                    lineNumber: 326,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                            className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1",
                                                                            children: "Original Report Notes"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 333,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap",
                                                                            children: item.notes || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "italic text-gray-400",
                                                                                children: "No notes provided."
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 335,
                                                                                columnNumber: 56
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 334,
                                                                            columnNumber: 37
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                    lineNumber: 332,
                                                                    columnNumber: 33
                                                                }, this),
                                                                isAppeal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "space-y-3 mt-4",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                            className: "text-sm font-bold text-indigo-800 dark:text-indigo-200 pb-1 border-b border-indigo-200 dark:border-indigo-800",
                                                                            children: "Appeal Case File"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 342,
                                                                            columnNumber: 41
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-md",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase block mb-1",
                                                                                    children: "Cadet Justification"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 346,
                                                                                    columnNumber: 45
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-sm text-gray-900 dark:text-white",
                                                                                    children: item.appeal_justification
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 347,
                                                                                    columnNumber: 45
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 345,
                                                                            columnNumber: 41
                                                                        }, this),
                                                                        item.appeal_issuer_comment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "ml-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border-l-4 border-blue-400",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-xs font-bold text-blue-700 dark:text-blue-300 uppercase block mb-1",
                                                                                    children: "Issuer Rebuttal"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 353,
                                                                                    columnNumber: 49
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-sm text-gray-900 dark:text-white",
                                                                                    children: item.appeal_issuer_comment
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 354,
                                                                                    columnNumber: 49
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 352,
                                                                            columnNumber: 45
                                                                        }, this),
                                                                        item.appeal_chain_comment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "ml-8 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border-l-4 border-purple-400",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-xs font-bold text-purple-700 dark:text-purple-300 uppercase block mb-1",
                                                                                    children: "Chain of Command Note"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 361,
                                                                                    columnNumber: 49
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-sm text-gray-900 dark:text-white",
                                                                                    children: item.appeal_chain_comment
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 362,
                                                                                    columnNumber: 49
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 360,
                                                                            columnNumber: 45
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                    lineNumber: 341,
                                                                    columnNumber: 37
                                                                }, this) : /* --- STANDARD HISTORY VIEW --- */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                            className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2",
                                                                            children: "History"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 369,
                                                                            columnNumber: 41
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-2 max-h-40 overflow-y-auto",
                                                                            children: item.logs.map((log, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex items-start gap-2 text-xs",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "font-medium text-gray-900 dark:text-white w-24 flex-shrink-0",
                                                                                            children: log.actor_name
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                            lineNumber: 373,
                                                                                            columnNumber: 53
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300",
                                                                                            children: log.action
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                            lineNumber: 374,
                                                                                            columnNumber: 53
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "text-gray-500",
                                                                                            children: new Date(log.created_at).toLocaleDateString()
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                            lineNumber: 375,
                                                                                            columnNumber: 53
                                                                                        }, this),
                                                                                        log.comment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "text-gray-600 dark:text-gray-400 italic",
                                                                                            children: [
                                                                                                '- "',
                                                                                                log.comment,
                                                                                                '"'
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                            lineNumber: 376,
                                                                                            columnNumber: 69
                                                                                        }, this)
                                                                                    ]
                                                                                }, idx, true, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 372,
                                                                                    columnNumber: 49
                                                                                }, this))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 370,
                                                                            columnNumber: 41
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                    lineNumber: 368,
                                                                    columnNumber: 37
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                            lineNumber: 325,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "md:w-72 flex-shrink-0 p-6 bg-white dark:bg-gray-800 flex flex-col gap-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "block text-sm font-medium text-gray-900 dark:text-white mb-2",
                                                                            children: isAppeal ? 'Appeal Decision Note' : 'Review Comment'
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 387,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                            placeholder: isAppeal ? "Reason for decision (visible to cadet)..." : "Reason for decision...",
                                                                            className: "w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm text-sm p-2",
                                                                            rows: 3,
                                                                            value: singleComment,
                                                                            onChange: (e)=>setSingleComment(e.target.value)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 390,
                                                                            columnNumber: 37
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                    lineNumber: 386,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex flex-col gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>handleSingleAction(item, 'approve'),
                                                                            disabled: isLoading,
                                                                            className: "w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors",
                                                                            children: isAppeal ? 'Grant / Forward Appeal' : 'Approve'
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 399,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex gap-2",
                                                                            children: [
                                                                                !isAppeal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>handleSingleAction(item, 'kickback'),
                                                                                    disabled: isLoading || !singleComment.trim(),
                                                                                    className: "flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors",
                                                                                    children: "Kick-Back"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 404,
                                                                                    columnNumber: 45
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>handleSingleAction(item, 'reject'),
                                                                                    disabled: isLoading || !singleComment.trim(),
                                                                                    className: `flex-1 py-2 ${isAppeal ? 'w-full' : ''} bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors`,
                                                                                    children: isAppeal ? 'Reject Appeal' : 'Reject'
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 408,
                                                                                    columnNumber: 41
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 402,
                                                                            columnNumber: 37
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                    lineNumber: 398,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                    href: `/report/${item.id}`,
                                                                    className: "text-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2",
                                                                    children: "Open Full Report Page →"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                    lineNumber: 413,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                            lineNumber: 385,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 322,
                                                    columnNumber: 27
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 321,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 320,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, item.id, true, {
                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                    lineNumber: 296,
                                    columnNumber: 17
                                }, this);
                            }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: 5,
                                    className: "px-6 py-12 text-center text-gray-500 dark:text-gray-400",
                                    children: "No items found."
                                }, void 0, false, {
                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                    lineNumber: 425,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 425,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                            lineNumber: 290,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                    lineNumber: 271,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                lineNumber: 270,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
        lineNumber: 235,
        columnNumber: 5
    }, this);
}
_s(ActionItemsClient, "NAuNM9mt6y0CY8AjPuDUSiyAZHE=", false, function() {
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