module.exports = [
"[project]/app/action-items/ActionItemsClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ActionItemsClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function ActionItemsClient({ initialReports, currentUserId }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    // --- State ---
    const [selectedReports, setSelectedReports] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    // Sorting
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        key: 'created_at',
        direction: 'asc'
    });
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Filtering
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [filterCategory, setFilterCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [filterValue, setFilterValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // 2. Added Date State
    const [startDate, setStartDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [endDate, setEndDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // Actions State
    const [bulkComment, setBulkComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [expandedRowId, setExpandedRowId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [singleComment, setSingleComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // --- Helpers ---
    const formatName = (person)=>{
        if (!person) return 'N/A';
        const p = Array.isArray(person) ? person[0] : person;
        if (!p || !p.last_name) return 'N/A';
        return `${p.last_name}, ${p.first_name}`;
    };
    const getTaskType = (r)=>{
        if (r.type === 'incident') return 'Incident Review'; // <--- NEW CHECK
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
    const isBulkActionable = (r)=>{
        return getTaskType(r) === 'Approval Needed';
    };
    // --- Dynamic Options ---
    const uniqueSubjects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...new Set(initialReports.map((r)=>formatName(r.subject)))
        ].sort(), [
        initialReports
    ]);
    const uniqueSubmitters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...new Set(initialReports.map((r)=>formatName(r.submitter)))
        ].sort(), [
        initialReports
    ]);
    const uniqueOffenses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...new Set(initialReports.map((r)=>r.offense_type.offense_name))
        ].sort(), [
        initialReports
    ]);
    const uniqueTypes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...new Set(initialReports.map((r)=>getTaskType(r)))
        ].sort(), [
        initialReports
    ]);
    // --- Filtering & Sorting Logic ---
    const processedReports = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        let result = [
            ...initialReports
        ];
        // 1. Search (Global Text Search)
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            result = result.filter((item)=>formatName(item.subject).toLowerCase().includes(s) || formatName(item.submitter).toLowerCase().includes(s) || item.offense_type.offense_name.toLowerCase().includes(s));
        }
        // 2. Category Filtering
        // 3. Logic for Date Range vs Standard Value
        if (filterCategory === 'date_range') {
            if (startDate) result = result.filter((r)=>new Date(r.created_at) >= new Date(startDate));
            if (endDate) result = result.filter((r)=>new Date(r.created_at) <= new Date(endDate + 'T23:59:59'));
        } else if (filterCategory !== 'all' && filterValue) {
            switch(filterCategory){
                case 'subject':
                    result = result.filter((r)=>formatName(r.subject) === filterValue);
                    break;
                case 'submitter':
                    result = result.filter((r)=>formatName(r.submitter) === filterValue);
                    break;
                case 'offense':
                    result = result.filter((r)=>r.offense_type.offense_name === filterValue);
                    break;
                case 'type':
                    result = result.filter((r)=>getTaskType(r) === filterValue);
                    break;
            }
        }
        // 4. Sort
        result.sort((a, b)=>{
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
        });
        return result;
    }, [
        initialReports,
        searchTerm,
        filterCategory,
        filterValue,
        startDate,
        endDate,
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
    const handleFilterCategoryChange = (cat)=>{
        setFilterCategory(cat);
        setFilterValue('');
        setStartDate('');
        setEndDate('');
    };
    const handleSelect = (id)=>{
        const newSet = new Set(selectedReports);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedReports(newSet);
    };
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
        if (!active) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "ml-1 text-gray-400",
            children: "↕"
        }, void 0, false, {
            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
            lineNumber: 234,
            columnNumber: 27
        }, this);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "ml-1 text-indigo-600 dark:text-indigo-400",
            children: direction === 'asc' ? '↑' : '↓'
        }, void 0, false, {
            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
            lineNumber: 235,
            columnNumber: 14
        }, this);
    };
    const getTaskBadge = (r)=>{
        const type = getTaskType(r);
        const styles = {
            'Approval Needed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
            'Incident Review': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'Revision Needed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
            'Appeal Review': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'Appeal Decision': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
        };
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`,
            children: type
        }, void 0, false, {
            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
            lineNumber: 247,
            columnNumber: 14
        }, this);
    };
    const bulkableCount = processedReports.filter(isBulkActionable).length;
    const isAllSelected = bulkableCount > 0 && selectedReports.size === bulkableCount;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col lg:flex-row gap-4 items-end",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full lg:w-1/3 relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1",
                                    children: "Quick Search"
                                }, void 0, false, {
                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                    lineNumber: 262,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "h-5 w-5 text-gray-400",
                                                fill: "currentColor",
                                                viewBox: "0 0 20 20",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    fillRule: "evenodd",
                                                    d: "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z",
                                                    clipRule: "evenodd"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 265,
                                                    columnNumber: 104
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 265,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 264,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            placeholder: "Search items...",
                                            className: "block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 pl-10 pr-3 focus:ring-indigo-500 focus:border-indigo-500",
                                            value: searchTerm,
                                            onChange: (e)=>setSearchTerm(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 267,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                    lineNumber: 263,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                            lineNumber: 261,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full lg:w-2/3 flex flex-col sm:flex-row gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-full sm:w-1/3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1",
                                            children: "Filter By"
                                        }, void 0, false, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 280,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: filterCategory,
                                            onChange: (e)=>handleFilterCategoryChange(e.target.value),
                                            className: "block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "all",
                                                    children: "None"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 286,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "date_range",
                                                    children: "Date Range"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 287,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "subject",
                                                    children: "Subject"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 288,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "submitter",
                                                    children: "Submitter"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 289,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "offense",
                                                    children: "Infraction"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 290,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "type",
                                                    children: "Action Type"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 291,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 281,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                    lineNumber: 279,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-full sm:w-2/3",
                                    children: filterCategory === 'date_range' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-1/2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1",
                                                        children: "From"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 300,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "date",
                                                        value: startDate,
                                                        onChange: (e)=>setStartDate(e.target.value),
                                                        className: "block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 301,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 299,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-1/2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1",
                                                        children: "To"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 304,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "date",
                                                        value: endDate,
                                                        onChange: (e)=>setEndDate(e.target.value),
                                                        className: "block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 305,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 303,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 298,
                                        columnNumber: 25
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: `block text-xs font-bold uppercase mb-1 ${filterCategory === 'all' ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`,
                                                children: filterCategory === 'all' ? 'Select Filter Type First' : 'Select Value'
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 310,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: filterValue,
                                                onChange: (e)=>setFilterValue(e.target.value),
                                                disabled: filterCategory === 'all',
                                                className: "block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "",
                                                        children: filterCategory === 'all' ? '—' : 'Select...'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 319,
                                                        columnNumber: 33
                                                    }, this),
                                                    filterCategory === 'subject' && uniqueSubjects.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: s,
                                                            children: s
                                                        }, s, false, {
                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                            lineNumber: 320,
                                                            columnNumber: 90
                                                        }, this)),
                                                    filterCategory === 'submitter' && uniqueSubmitters.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: s,
                                                            children: s
                                                        }, s, false, {
                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                            lineNumber: 321,
                                                            columnNumber: 94
                                                        }, this)),
                                                    filterCategory === 'offense' && uniqueOffenses.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: s,
                                                            children: s
                                                        }, s, false, {
                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                            lineNumber: 322,
                                                            columnNumber: 90
                                                        }, this)),
                                                    filterCategory === 'type' && uniqueTypes.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: s,
                                                            children: s
                                                        }, s, false, {
                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                            lineNumber: 323,
                                                            columnNumber: 84
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 313,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 309,
                                        columnNumber: 25
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                    lineNumber: 295,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                            lineNumber: 278,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                    lineNumber: 258,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                lineNumber: 257,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[100px]",
                        children: [
                            selectedReports.size,
                            " selected"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                        lineNumber: 334,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 w-full",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: selectedReports.size > 0 ? "Comment for bulk action (required for rejection)..." : "Select checkboxes to enable bulk actions...",
                            value: bulkComment,
                            onChange: (e)=>setBulkComment(e.target.value),
                            disabled: selectedReports.size === 0,
                            className: "block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3 disabled:bg-gray-200 dark:disabled:bg-gray-700/50"
                        }, void 0, false, {
                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                            lineNumber: 338,
                            columnNumber: 14
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                        lineNumber: 337,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 w-full sm:w-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleBulkAction('approve'),
                                disabled: selectedReports.size === 0 || isLoading,
                                className: "flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm",
                                children: "Approve"
                            }, void 0, false, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 341,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleBulkAction('reject'),
                                disabled: selectedReports.size === 0 || isLoading || !bulkComment.trim(),
                                className: "flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm",
                                children: "Reject"
                            }, void 0, false, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 342,
                                columnNumber: 14
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                        lineNumber: 340,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                lineNumber: 333,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "overflow-x-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                className: "bg-gray-50 dark:bg-gray-700/50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "p-4 text-left w-12",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                className: "rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-30",
                                                checked: isAllSelected,
                                                onChange: handleSelectAll,
                                                disabled: bulkableCount === 0
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 353,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 352,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            onClick: ()=>handleSort('created_at'),
                                            className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                                            children: [
                                                "Date ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                    active: sortConfig.key === 'created_at',
                                                    direction: sortConfig.direction
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 361,
                                                    columnNumber: 222
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 361,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            onClick: ()=>handleSort('subject'),
                                            className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                                            children: [
                                                "Subject ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                    active: sortConfig.key === 'subject',
                                                    direction: sortConfig.direction
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 362,
                                                    columnNumber: 222
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 362,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase",
                                            children: "Infraction"
                                        }, void 0, false, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 363,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            onClick: ()=>handleSort('type'),
                                            className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                                            children: [
                                                "Action ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                    active: sortConfig.key === 'type',
                                                    direction: sortConfig.direction
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 364,
                                                    columnNumber: 218
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                            lineNumber: 364,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                    lineNumber: 351,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 350,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700",
                                children: processedReports.length > 0 ? processedReports.map((item)=>{
                                    const isAppeal = getTaskType(item).includes('Appeal');
                                    const canBulkSelect = isBulkActionable(item);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                onClick: ()=>handleRowClick(item.id),
                                                className: `cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${expandedRowId === item.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-4",
                                                        onClick: (e)=>e.stopPropagation(),
                                                        children: canBulkSelect ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            className: "rounded border-gray-300 text-indigo-600 focus:ring-indigo-500",
                                                            checked: selectedReports.has(item.id),
                                                            onChange: ()=>handleSelect(item.id)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                            lineNumber: 377,
                                                            columnNumber: 33
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                            lineNumber: 383,
                                                            columnNumber: 33
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 375,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400",
                                                        children: new Date(item.created_at).toLocaleDateString()
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 385,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-sm font-medium text-gray-900 dark:text-white",
                                                                children: formatName(item.subject)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                lineNumber: 386,
                                                                columnNumber: 69
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-gray-500",
                                                                children: [
                                                                    "By: ",
                                                                    formatName(item.submitter)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                lineNumber: 386,
                                                                columnNumber: 168
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 386,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 text-sm text-gray-500 dark:text-gray-300",
                                                        children: item.offense_type.offense_name
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 387,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap",
                                                        children: getTaskBadge(item)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 388,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 374,
                                                columnNumber: 25
                                            }, this),
                                            expandedRowId === item.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "bg-gray-50 dark:bg-gray-900/30 shadow-inner",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    colSpan: 5,
                                                    className: "p-0 border-b border-gray-200 dark:border-gray-700",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col md:flex-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex-grow p-6 space-y-4 md:border-r border-gray-200 dark:border-gray-700",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "grid grid-cols-2 gap-4 text-sm",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "block text-xs font-bold text-gray-500 uppercase",
                                                                                        children: "Submitted By"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 400,
                                                                                        columnNumber: 46
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-gray-900 dark:text-white",
                                                                                        children: formatName(item.submitter)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 400,
                                                                                        columnNumber: 131
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 400,
                                                                                columnNumber: 41
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "block text-xs font-bold text-gray-500 uppercase",
                                                                                        children: "Time"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 401,
                                                                                        columnNumber: 46
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-gray-900 dark:text-white",
                                                                                        children: new Date(item.created_at).toLocaleTimeString()
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 401,
                                                                                        columnNumber: 123
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 401,
                                                                                columnNumber: 41
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 399,
                                                                        columnNumber: 37
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                className: "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1",
                                                                                children: "Original Report Notes"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 405,
                                                                                columnNumber: 41
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap",
                                                                                children: item.notes || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "italic text-gray-400",
                                                                                    children: "No notes provided."
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 407,
                                                                                    columnNumber: 60
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 406,
                                                                                columnNumber: 41
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 404,
                                                                        columnNumber: 37
                                                                    }, this),
                                                                    isAppeal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "space-y-3 mt-4",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                className: "text-sm font-bold text-indigo-800 dark:text-indigo-200 pb-1 border-b border-indigo-200 dark:border-indigo-800",
                                                                                children: "Appeal Case File"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 414,
                                                                                columnNumber: 45
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-md",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase block mb-1",
                                                                                        children: "Cadet Justification"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 417,
                                                                                        columnNumber: 49
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-sm text-gray-900 dark:text-white",
                                                                                        children: item.appeal_justification
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 418,
                                                                                        columnNumber: 49
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 416,
                                                                                columnNumber: 45
                                                                            }, this),
                                                                            item.appeal_issuer_comment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "ml-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border-l-4 border-blue-400",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-xs font-bold text-blue-700 dark:text-blue-300 uppercase block mb-1",
                                                                                        children: "Issuer Rebuttal"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 423,
                                                                                        columnNumber: 53
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-sm text-gray-900 dark:text-white",
                                                                                        children: item.appeal_issuer_comment
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 424,
                                                                                        columnNumber: 53
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 422,
                                                                                columnNumber: 49
                                                                            }, this),
                                                                            item.appeal_chain_comment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "ml-8 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border-l-4 border-purple-400",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-xs font-bold text-purple-700 dark:text-purple-300 uppercase block mb-1",
                                                                                        children: "Chain of Command Note"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 430,
                                                                                        columnNumber: 53
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-sm text-gray-900 dark:text-white",
                                                                                        children: item.appeal_chain_comment
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 431,
                                                                                        columnNumber: 53
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 429,
                                                                                columnNumber: 49
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 413,
                                                                        columnNumber: 41
                                                                    }, this) : /* --- STANDARD HISTORY VIEW --- */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                className: "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2",
                                                                                children: "History"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 438,
                                                                                columnNumber: 45
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "space-y-2 max-h-40 overflow-y-auto",
                                                                                children: item.logs.map((log, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-start gap-2 text-xs",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "font-medium text-gray-900 dark:text-white w-24 flex-shrink-0",
                                                                                                children: log.actor_name
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                                lineNumber: 442,
                                                                                                columnNumber: 57
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-bold uppercase text-[10px]",
                                                                                                children: log.action
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                                lineNumber: 443,
                                                                                                columnNumber: 57
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-500",
                                                                                                children: new Date(log.created_at).toLocaleDateString()
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                                lineNumber: 444,
                                                                                                columnNumber: 57
                                                                                            }, this),
                                                                                            log.comment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-600 dark:text-gray-400 italic",
                                                                                                children: [
                                                                                                    '- "',
                                                                                                    log.comment,
                                                                                                    '"'
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                                lineNumber: 445,
                                                                                                columnNumber: 73
                                                                                            }, this)
                                                                                        ]
                                                                                    }, idx, true, {
                                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                        lineNumber: 441,
                                                                                        columnNumber: 53
                                                                                    }, this))
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                lineNumber: 439,
                                                                                columnNumber: 45
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                        lineNumber: 437,
                                                                        columnNumber: 41
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                lineNumber: 398,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "md:w-72 flex-shrink-0 p-6 bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-4 border-l border-gray-200 dark:border-gray-700",
                                                                children: item.type === 'incident' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex flex-col gap-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-sm text-gray-600 dark:text-gray-300",
                                                                            children: "Incidents require detailed review and cannot be quick-approved."
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 458,
                                                                            columnNumber: 45
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                            href: `/incidents/${item.id}`,
                                                                            className: "w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold text-center shadow-sm",
                                                                            children: "Process Incident →"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 461,
                                                                            columnNumber: 45
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                    lineNumber: 457,
                                                                    columnNumber: 41
                                                                }, this) : /* STANDARD REPORT ACTIONS */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                    className: "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2",
                                                                                    children: isAppeal ? 'Appeal Decision Note' : 'Review Comment'
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 472,
                                                                                    columnNumber: 49
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                                    placeholder: isAppeal ? "Reason (visible to cadet)..." : "Reason...",
                                                                                    className: "w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm text-sm p-2",
                                                                                    rows: 4,
                                                                                    value: singleComment,
                                                                                    onChange: (e)=>setSingleComment(e.target.value)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 475,
                                                                                    columnNumber: 49
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 471,
                                                                            columnNumber: 45
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex flex-col gap-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>handleSingleAction(item, 'approve'),
                                                                                    disabled: isLoading,
                                                                                    className: "w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors shadow-sm",
                                                                                    children: isAppeal ? 'Grant / Forward Appeal' : 'Approve'
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 484,
                                                                                    columnNumber: 49
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex gap-2",
                                                                                    children: [
                                                                                        !isAppeal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                            onClick: ()=>handleSingleAction(item, 'kickback'),
                                                                                            disabled: isLoading || !singleComment.trim(),
                                                                                            className: "flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors shadow-sm",
                                                                                            children: "Kick-Back"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                            lineNumber: 489,
                                                                                            columnNumber: 57
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                            onClick: ()=>handleSingleAction(item, 'reject'),
                                                                                            disabled: isLoading || !singleComment.trim(),
                                                                                            className: `flex-1 py-2 ${isAppeal ? 'w-full' : ''} bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors shadow-sm`,
                                                                                            children: isAppeal ? 'Reject Appeal' : 'Reject'
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                            lineNumber: 493,
                                                                                            columnNumber: 53
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                                    lineNumber: 487,
                                                                                    columnNumber: 49
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 483,
                                                                            columnNumber: 45
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                            href: `/report/${item.id}`,
                                                                            className: "text-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 font-medium",
                                                                            children: "Open Full Report Page →"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                            lineNumber: 498,
                                                                            columnNumber: 45
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                                lineNumber: 454,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                        lineNumber: 395,
                                                        columnNumber: 29
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                    lineNumber: 394,
                                                    columnNumber: 29
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                                lineNumber: 393,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, item.id, true, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 373,
                                        columnNumber: 21
                                    }, this);
                                }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        colSpan: 5,
                                        className: "px-6 py-12 text-center text-gray-500 dark:text-gray-400",
                                        children: "No pending items found."
                                    }, void 0, false, {
                                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                        lineNumber: 512,
                                        columnNumber: 25
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                    lineNumber: 512,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                                lineNumber: 367,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                        lineNumber: 349,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                    lineNumber: 348,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/action-items/ActionItemsClient.tsx",
                lineNumber: 347,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/action-items/ActionItemsClient.tsx",
        lineNumber: 254,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_action-items_ActionItemsClient_tsx_4df3ddb3._.js.map