module.exports = [
"[project]/app/report/[id]/ReportDetailsClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// in app/report/[id]/ReportDetailsClient.tsx
__turbopack_context__.s([
    "default",
    ()=>ReportDetailsClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// All imports from your original file
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function ReportDetailsClient({ user, initialReport, initialLogs, initialAppeal, offenses, escalationTarget: initialEscalationTarget, permissions }) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    // --- STATE HOOKS ---
    // Initialize state from props
    const [report, setReport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialReport);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialLogs);
    const [appeal, setAppeal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialAppeal);
    const [isActionLoading, setActionLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Permissions are now just props
    const { isSubmitter, isSubject, isApprover, canActOnAppeal } = permissions;
    // Form Modes & Inputs
    const [isEditing, setIsEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editableOffenseId, setEditableOffenseId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialReport.offense_type_id);
    const [editableNotes, setEditableNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialReport.notes || '');
    const [editableDate, setEditableDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [editableTime, setEditableTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isAppealing, setIsAppealing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isEscalating, setIsEscalating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [appealJustification, setAppealJustification] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [comment, setComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [appealComment, setAppealComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [escalationTarget, setEscalationTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialEscalationTarget || '');
    // --- Data fetching is GONE from useEffect ---
    // The server component handles all initial data loading.
    // We only use useEffect if we need to react to prop changes,
    // or set complex initial state.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Set initial appeal comment if needed
        if (initialAppeal && initialAppeal.status === 'pending_commandant') {
            setAppealComment(initialAppeal.chain_comment || initialAppeal.issuer_comment || '');
        }
    }, [
        initialAppeal
    ]);
    // --- Helpers ---
    // (All your helper functions remain unchanged)
    const formatName = (person)=>{
        if (!person) return 'N/A';
        return `${person.last_name}, ${person.first_name.charAt(0)}.`;
    };
    const formatStatus = (status)=>{
        switch(status){
            case 'completed':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            case 'needs_revision':
                return 'Revision Requested';
            case 'pending_approval':
                return 'Pending Approval';
            default:
                return status.replace('_', ' ');
        }
    };
    const formatAppealStatus = (status)=>{
        switch(status){
            case 'pending_issuer':
                return 'Pending Initial Review';
            case 'rejected_by_issuer':
                return 'Rejected by Issuer (Can Escalate)';
            case 'pending_chain':
                return 'Pending Chain of Command';
            case 'rejected_by_chain':
                return 'Rejected by Chain (Can Escalate)';
            case 'pending_commandant':
                return 'Pending Commandant Review';
            case 'approved':
                return 'Appeal Granted';
            case 'rejected_final':
                return 'Appeal Denied (Final)';
            default:
                return status.replace('_', ' ');
        }
    };
    // --- Actions ---
    // (All your action/handler functions remain unchanged)
    async function handleApprovalAction(action) {
        if (!report) return;
        let rpcName = '';
        if (action === 'approve') rpcName = 'handle_approval';
        else if (action === 'reject') rpcName = 'handle_rejection';
        else rpcName = 'handle_kickback';
        if (!window.confirm(`Are you sure you want to ${action}?`)) return;
        if ((action === 'reject' || action === 'kickback') && !comment) {
            alert("Comment required.");
            return;
        }
        setActionLoading(true);
        const payload = action === 'approve' ? {
            report_id_to_approve: report.id,
            approval_comment: comment || 'Approved'
        } : {
            p_report_id: report.id,
            p_comment: comment
        };
        const { error } = await supabase.rpc(rpcName, payload);
        if (error) {
            alert(error.message);
            setActionLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    }
    // Edit Report Handlers
    function handleEditClick() {
        if (!report) return;
        setIsEditing(true);
        setEditableOffenseId(report.offense_type_id);
        setEditableNotes(report.notes || '');
        const dt = new Date(report.date_of_offense);
        const year = dt.getFullYear();
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        setEditableDate(`${year}-${month}-${day}`);
        setEditableTime(dt.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }));
    }
    async function handleResubmit(e) {
        e.preventDefault();
        setActionLoading(true);
        const localDateTime = new Date(`${editableDate}T${editableTime}:00`);
        const fullTimestamp = localDateTime.toISOString();
        const { error } = await supabase.rpc('resubmit_report', {
            p_report_id: report.id,
            p_new_offense_type_id: editableOffenseId,
            p_new_notes: editableNotes,
            p_new_timestamp: fullTimestamp
        });
        if (error) {
            alert(error.message);
            setActionLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    }
    // Appeal Handlers
    async function handleSubmitAppeal(e) {
        e.preventDefault();
        if (!appealJustification.trim()) return;
        setActionLoading(true);
        const { error } = await supabase.from('appeals').insert({
            report_id: report.id,
            appealing_cadet_id: user?.id,
            justification: appealJustification
        });
        if (error) {
            alert(error.message);
            setActionLoading(false);
        } else {
            alert("Appeal submitted.");
            // No need to refresh the router, just update state
            setActionLoading(false);
            setIsAppealing(false);
            // We'll reload the page to get new appeal state from server
            router.refresh();
        }
    }
    async function handleAppealAction(action) {
        if (!appeal) return;
        if (!appealComment.trim()) {
            alert("Please provide a comment.");
            return;
        }
        setActionLoading(true);
        let rpcName = '';
        if (appeal.status === 'pending_issuer') rpcName = 'appeal_issuer_action';
        else if (appeal.status === 'pending_chain') rpcName = 'appeal_chain_action';
        else if (appeal.status === 'pending_commandant') rpcName = 'appeal_commandant_action';
        if (rpcName) {
            const { error } = await supabase.rpc(rpcName, {
                p_appeal_id: appeal.id,
                p_action: action,
                p_comment: appealComment
            });
            if (error) alert(error.message);
            else {
                alert(action === 'grant' ? "Appeal granted/forwarded." : "Appeal rejected.");
                router.push('/');
                router.refresh();
            }
        }
        setActionLoading(false);
    }
    async function handleEscalate(e) {
        e.preventDefault();
        if (!appeal || !appealJustification.trim()) return;
        setActionLoading(true);
        const { error } = await supabase.rpc('escalate_appeal', {
            p_appeal_id: appeal.id,
            p_justification: appealJustification
        });
        if (error) {
            alert(error.message);
            setActionLoading(false);
        } else {
            alert("Appeal escalated.");
            setIsEscalating(false);
            router.refresh();
        }
    }
    // Group offenses for dropdown
    const groupedOffenses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return offenses.reduce((acc, o)=>{
            (acc[o.offense_group] = acc[o.offense_group] || []).push(o);
            return acc;
        }, {});
    }, [
        offenses
    ]);
    // --- Render States ---
    // (No 'loading' or 'error' states needed, server handles that)
    if (!report) return null; // Server would have 404'd already
    const showActionBox = isApprover && report.status === 'pending_approval' && !isEditing && !isAppealing;
    const showRevisionBox = isSubmitter && report.status === 'needs_revision' && !isEditing;
    const canAppeal = isSubject && report.status === 'completed' && !appeal && !isAppealing;
    const canEscalate = isSubject && appeal && [
        'rejected_by_issuer',
        'rejected_by_chain'
    ].includes(appeal.status) && !isEscalating;
    // --- RETURN JSX ---
    // (This is your *exact* JSX from the original file, just copied over)
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6",
        children: [
            isEditing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleResubmit,
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold text-gray-900 dark:text-white",
                            children: "Edit Report"
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 282,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                                            children: "Date"
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 285,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "date",
                                            value: editableDate,
                                            onChange: (e)=>setEditableDate(e.target.value),
                                            required: true,
                                            className: "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm"
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 286,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 284,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                                            children: "Time"
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 289,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "time",
                                            value: editableTime,
                                            onChange: (e)=>setEditableTime(e.target.value),
                                            required: true,
                                            className: "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm"
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 290,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 288,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 283,
                            columnNumber: 14
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                                    children: "Offense"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 294,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: editableOffenseId,
                                    onChange: (e)=>setEditableOffenseId(e.target.value),
                                    required: true,
                                    className: "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm",
                                    children: Object.entries(groupedOffenses).map(([group, opts])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("optgroup", {
                                            label: group,
                                            children: opts.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: o.id,
                                                    children: [
                                                        "(",
                                                        o.demerits,
                                                        ") ",
                                                        o.offense_name
                                                    ]
                                                }, o.id, true, {
                                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                    lineNumber: 297,
                                                    columnNumber: 71
                                                }, this))
                                        }, group, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 297,
                                            columnNumber: 20
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 295,
                                    columnNumber: 16
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 293,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                                    children: "Notes"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 302,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: editableNotes,
                                    onChange: (e)=>setEditableNotes(e.target.value),
                                    rows: 4,
                                    className: "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 303,
                                    columnNumber: 16
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 301,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setIsEditing(false),
                                    disabled: isActionLoading,
                                    className: "w-1/2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 306,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: isActionLoading,
                                    className: "w-1/2 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400",
                                    children: isActionLoading ? 'Saving...' : 'Resubmit'
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 307,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 305,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                    lineNumber: 281,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 280,
                columnNumber: 9
            }, this) : isAppealing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-2 border-indigo-500",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmitAppeal,
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold text-gray-900 dark:text-white",
                            children: "Appeal this Report"
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 317,
                            columnNumber: 18
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-500 dark:text-gray-400",
                            children: [
                                "State your case clearly. This will be sent first to ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: formatName(report.submitter)
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 319,
                                    columnNumber: 74
                                }, this),
                                " for review."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 318,
                            columnNumber: 18
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "justification",
                                    className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                                    children: "Justification / Defense"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 322,
                                    columnNumber: 22
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    id: "justification",
                                    rows: 6,
                                    required: true,
                                    value: appealJustification,
                                    onChange: (e)=>setAppealJustification(e.target.value),
                                    className: "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
                                    placeholder: "I respectfully appeal this report because..."
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 323,
                                    columnNumber: 22
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 321,
                            columnNumber: 18
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setIsAppealing(false),
                                    disabled: isActionLoading,
                                    className: "w-1/2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 326,
                                    columnNumber: 22
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: isActionLoading,
                                    className: "w-1/2 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400",
                                    children: isActionLoading ? 'Submitting...' : 'Submit Appeal'
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 327,
                                    columnNumber: 22
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 325,
                            columnNumber: 18
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                    lineNumber: 316,
                    columnNumber: 14
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 315,
                columnNumber: 10
            }, this) : isEscalating && appeal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-2 border-yellow-500",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleEscalate,
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold text-gray-900 dark:text-white",
                            children: "Escalate Appeal"
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 337,
                            columnNumber: 18
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-500 dark:text-gray-400",
                            children: [
                                "You are escalating this appeal to the next level in the chain of command:",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 340,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    className: "text-lg text-gray-900 dark:text-white block mt-2",
                                    children: escalationTarget || 'Loading next step...'
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 341,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 338,
                            columnNumber: 18
                        }, this),
                        appeal.issuer_comment && appeal.status === 'rejected_by_issuer' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-500",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-red-800 dark:text-red-300",
                                    children: "Issuer's Reason for Rejection:"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 348,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-red-700 dark:text-red-200 italic",
                                    children: [
                                        '"',
                                        appeal.issuer_comment,
                                        '"'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 349,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 347,
                            columnNumber: 21
                        }, this),
                        appeal.chain_comment && appeal.status === 'rejected_by_chain' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-500",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-red-800 dark:text-red-300",
                                    children: "Chain of Command's Reason for Rejection:"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 354,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-red-700 dark:text-red-200 italic",
                                    children: [
                                        '"',
                                        appeal.chain_comment,
                                        '"'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 355,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 353,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "justification_esc",
                                    className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                                    children: "Update Justification (Optional)"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 360,
                                    columnNumber: 22
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    id: "justification_esc",
                                    rows: 6,
                                    required: true,
                                    value: appealJustification,
                                    onChange: (e)=>setAppealJustification(e.target.value),
                                    className: "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 361,
                                    columnNumber: 22
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 359,
                            columnNumber: 18
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setIsEscalating(false),
                                    disabled: isActionLoading,
                                    className: "w-1/2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 364,
                                    columnNumber: 22
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: isActionLoading,
                                    className: "w-1/2 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400",
                                    children: isActionLoading ? 'Escalating...' : 'Confirm Escalation'
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 365,
                                    columnNumber: 22
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 363,
                            columnNumber: 18
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                    lineNumber: 336,
                    columnNumber: 14
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 335,
                columnNumber: 10
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl md:text-3xl font-bold text-gray-900 dark:text-white",
                                children: report.offense_type.offense_name
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 375,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `px-3 py-1 rounded-full text-sm font-medium ${report.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : report.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : report.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'}`,
                                children: formatStatus(report.status)
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 376,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 374,
                        columnNumber: 11
                    }, this),
                    appeal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 p-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-medium text-indigo-800 dark:text-indigo-200",
                                            children: "Appeal Status"
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 391,
                                            columnNumber: 27
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wider",
                                            children: formatAppealStatus(appeal.status)
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 392,
                                            columnNumber: 27
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 390,
                                    columnNumber: 23
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 389,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border dark:border-gray-700 space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "font-medium text-gray-900 dark:text-white mb-2",
                                        children: "Appeal Record"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 399,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pl-4 border-l-2 border-gray-300 dark:border-gray-600",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase font-semibold text-gray-500 dark:text-gray-400",
                                                children: "Cadet Justification"
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 401,
                                                columnNumber: 27
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap",
                                                children: appeal.justification
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 402,
                                                columnNumber: 27
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 400,
                                        columnNumber: 23
                                    }, this),
                                    appeal.issuer_comment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pl-4 border-l-2 border-blue-300 dark:border-blue-600",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase font-semibold text-blue-600 dark:text-blue-400",
                                                children: "Issuer Note"
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 406,
                                                columnNumber: 31
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-gray-800 dark:text-gray-200",
                                                children: appeal.issuer_comment
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 407,
                                                columnNumber: 31
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 405,
                                        columnNumber: 27
                                    }, this),
                                    appeal.chain_comment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pl-4 border-l-2 border-purple-300 dark:border-purple-600",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase font-semibold text-purple-600 dark:text-purple-400",
                                                children: "Chain of Command Note"
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 412,
                                                columnNumber: 31
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-gray-800 dark:text-gray-200",
                                                children: appeal.chain_comment
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 413,
                                                columnNumber: 31
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 411,
                                        columnNumber: 27
                                    }, this),
                                    appeal.final_comment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `pl-4 border-l-2 ${appeal.status === 'approved' ? 'border-green-500' : 'border-red-500'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `text-xs uppercase font-semibold ${appeal.status === 'approved' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`,
                                                children: "Final Decision"
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 418,
                                                columnNumber: 31
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-gray-800 dark:text-gray-200",
                                                children: appeal.final_comment
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 421,
                                                columnNumber: 31
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 417,
                                        columnNumber: 27
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 398,
                                columnNumber: 19
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 388,
                        columnNumber: 15
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t dark:border-gray-700 pt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-gray-500 dark:text-gray-400",
                                        children: "Subject"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 429,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg text-gray-900 dark:text-white",
                                        children: formatName(report.subject)
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 429,
                                        columnNumber: 99
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 429,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-gray-500 dark:text-gray-400",
                                        children: "Submitted By"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 430,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg text-gray-900 dark:text-white",
                                        children: formatName(report.submitter)
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 430,
                                        columnNumber: 104
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 430,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-gray-500 dark:text-gray-400",
                                        children: "Date & Time"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 431,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg text-gray-900 dark:text-white",
                                        children: new Date(report.date_of_offense).toLocaleString([], {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 431,
                                        columnNumber: 103
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 431,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-gray-500 dark:text-gray-400",
                                        children: "Category"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 432,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg text-gray-900 dark:text-white",
                                        children: [
                                            "Cat ",
                                            report.offense_type.offense_code
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 432,
                                        columnNumber: 100
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 432,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-gray-500 dark:text-gray-400",
                                        children: "Demerits"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 434,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg font-bold text-red-600 dark:text-red-400",
                                        children: report.demerits_effective !== report.offense_type.demerits ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "line-through text-gray-400 mr-2",
                                                    children: report.offense_type.demerits
                                                }, void 0, false, {
                                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                    lineNumber: 437,
                                                    columnNumber: 27
                                                }, this),
                                                report.demerits_effective
                                            ]
                                        }, void 0, true) : report.demerits_effective
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 435,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 433,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 428,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-medium text-gray-700 dark:text-gray-300 mt-6",
                        children: "Notes:"
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 443,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md whitespace-pre-wrap",
                        children: report.notes || "No notes provided."
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 444,
                        columnNumber: 11
                    }, this),
                    canActOnAppeal && !isEditing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 p-6 rounded-lg shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-medium text-purple-900 dark:text-purple-100 mb-4",
                                children: "Appeal Action Required"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 451,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                placeholder: "Reason for your decision (this will be visible in the appeal record)...",
                                value: appealComment,
                                onChange: (e)=>setAppealComment(e.target.value),
                                className: "w-full rounded-md border-purple-300 dark:border-purple-600 dark:bg-gray-900 dark:text-white mb-4",
                                rows: 3
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 452,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleAppealAction('grant'),
                                        disabled: isActionLoading,
                                        className: "flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50",
                                        children: appeal?.status === 'pending_commandant' ? 'Final Approval (Grant Appeal)' : 'Grant & Forward to Next Level'
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 454,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleAppealAction('reject'),
                                        disabled: isActionLoading,
                                        className: "flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50",
                                        children: "Reject Appeal"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 457,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 453,
                                columnNumber: 19
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 450,
                        columnNumber: 15
                    }, this),
                    (canAppeal || canEscalate) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 border-t dark:border-gray-700 pt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-medium text-gray-900 dark:text-white",
                                children: "Options"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 465,
                                columnNumber: 19
                            }, this),
                            canAppeal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-sm text-gray-500 dark:text-gray-400 mb-4",
                                        children: "If you believe this report was issued in error, you may submit an appeal."
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 468,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setIsAppealing(true),
                                        className: "py-2 px-4 border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 rounded-md font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors",
                                        children: "Appeal this Report"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 469,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true),
                            canEscalate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-sm text-gray-500 dark:text-gray-400 mb-4",
                                        children: "Your appeal was rejected. You may accept this decision or escalate it."
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 474,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setAppealJustification(appeal?.justification || '');
                                            setIsEscalating(true);
                                        },
                                        className: "py-2 px-4 bg-yellow-600 text-white rounded-md font-medium hover:bg-yellow-700 transition-colors",
                                        children: "Escalate Appeal"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 475,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 464,
                        columnNumber: 15
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 373,
                columnNumber: 9
            }, this),
            showActionBox && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-medium text-gray-900 dark:text-white",
                        children: "Actions"
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 487,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        placeholder: "Add a comment...",
                        value: comment,
                        onChange: (e)=>setComment(e.target.value),
                        className: "mt-4 mb-4 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm",
                        rows: 3
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 488,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col sm:flex-row gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleApprovalAction('approve'),
                                disabled: isActionLoading,
                                className: "flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400",
                                children: "Approve"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 490,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleApprovalAction('kickback'),
                                disabled: isActionLoading,
                                className: "flex-1 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400",
                                children: "Kick-back"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 491,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleApprovalAction('reject'),
                                disabled: isActionLoading,
                                className: "flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400",
                                children: "Reject"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 492,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 489,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 486,
                columnNumber: 9
            }, this),
            showRevisionBox && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 p-6 rounded-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-medium text-yellow-800 dark:text-yellow-200",
                        children: "Needs Revision"
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 499,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleEditClick,
                        className: "mt-4 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700",
                        children: "Edit Report"
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 500,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 498,
                columnNumber: 9
            }, this),
            !isEditing && !isAppealing && !isEscalating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-medium text-gray-900 dark:text-white mb-4",
                        children: "History"
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 507,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "space-y-4",
                        children: logs.length > 0 ? logs.map((log)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "border-b dark:border-gray-700 pb-4 last:border-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-medium text-gray-900 dark:text-white",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: formatName(log.actor)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                        lineNumber: 512,
                                                        columnNumber: 89
                                                    }, this),
                                                    ": ",
                                                    log.action
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 512,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-gray-500 dark:text-gray-400",
                                                children: new Date(log.created_at).toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 513,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 511,
                                        columnNumber: 19
                                    }, this),
                                    log.comment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-2 text-sm bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-gray-600 dark:text-gray-300",
                                        children: [
                                            '"',
                                            log.comment,
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 515,
                                        columnNumber: 35
                                    }, this)
                                ]
                            }, log.id, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 510,
                                columnNumber: 17
                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-500 dark:text-gray-400",
                            children: "No history yet."
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 517,
                            columnNumber: 20
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 508,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 506,
                columnNumber: 11
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
        lineNumber: 276,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_report_%5Bid%5D_ReportDetailsClient_tsx_ac179caf._.js.map