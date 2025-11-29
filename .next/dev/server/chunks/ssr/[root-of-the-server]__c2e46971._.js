module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/app/components/ThemeProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// in app/components/ThemeProvider.tsx
__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const ThemeProviderContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ThemeProvider({ children, defaultTheme = 'dark' }) {
    // 1. Initialize state *only* with the default theme.
    // This ensures the server and client initial render are identical.
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultTheme);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // 2. On client mount, check local storage and update state if it exists.
        // This runs *after* hydration, avoiding the mismatch.
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, []); // Empty dependency array ensures this runs only once on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // 3. This effect syncs any theme change (from mount or toggle)
        // back to the <html> tag and local storage.
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        // Save the choice to local storage
        window.localStorage.setItem('theme', theme);
    }, [
        theme
    ]); // Runs whenever the theme state changes
    const value = {
        theme,
        setTheme
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeProviderContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/app/components/ThemeProvider.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
const useTheme = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ThemeProviderContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/utils/supabase/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// in utils/supabase/client.ts
__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-ssr] (ecmascript)");
;
function createClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createBrowserClient"])(("TURBOPACK compile-time value", "https://ejzvpknayvkggswejgkm.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqenZwa25heXZrZ2dzd2VqZ2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzc1ODMsImV4cCI6MjA3NzQxMzU4M30.Bmf6dl5raXm1Y4Mrdctz6d8kfFOKkiCFmrm85YgKoJ8"));
}
}),
"[project]/app/components/tour/TourConfig.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/components/tour/TourConfig.ts
__turbopack_context__.s([
    "TOUR_STEPS",
    ()=>TOUR_STEPS
]);
const TOUR_STEPS = [
    // --- LEVEL 10 SPECIFIC TOUR (Ledger Only) ---
    // Uses ::userId:: placeholder which the Engine replaces
    {
        id: 'ledger-intro',
        path: '/ledger/::userId::',
        targetId: 'ledger-header',
        title: 'Your Disciplinary Record',
        content: 'This is your personal ledger. It tracks every demerit you have received and every tour you have served.',
        placement: 'bottom',
        shouldShow: (p)=>p.roleLevel === 10
    },
    {
        id: 'ledger-stats',
        path: '/ledger/::userId::',
        targetId: 'ledger-stats-grid',
        title: 'Current Standing',
        content: 'Keep an eye on these numbers. Your "Current Tour Balance" tells you how many penalty tours you currently owe.',
        placement: 'bottom',
        shouldShow: (p)=>p.roleLevel === 10
    },
    {
        id: 'ledger-history',
        path: '/ledger/::userId::',
        targetId: 'ledger-history-list',
        title: 'Report History',
        content: 'This list shows all reports filed against you. Click any report title to view the full details or file an appeal.',
        placement: 'top',
        shouldShow: (p)=>p.roleLevel === 10
    },
    // --- STANDARD TOUR (Level 15+) ---
    {
        id: 'dashboard-intro',
        path: '/',
        targetId: 'nav-dashboard',
        title: 'Dashboard',
        content: 'This is your command center.',
        placement: 'bottom',
        shouldShow: (p)=>p.roleLevel >= 15
    },
    {
        id: 'dashboard-action-items',
        path: '/',
        targetId: 'dashboard-action-items',
        title: 'Action Items',
        content: 'This is the most important section. Reports waiting for your approval, revision, or attention will appear here.',
        placement: 'right',
        shouldShow: (p)=>p.roleLevel >= 15
    },
    {
        id: 'nav-submit',
        path: '/',
        targetId: 'nav-submit',
        title: 'Submit Report',
        content: 'Click here to file a new demerit report.',
        placement: 'bottom',
        shouldShow: (p)=>p.roleLevel >= 15
    },
    // --- STAFF (Level 50+) ---
    {
        id: 'green-sheet',
        path: '/reports/daily',
        targetId: 'green-sheet-container',
        title: 'Daily Reports',
        content: 'View the unposted Green Sheet here. You can toggle to the Tour Sheet to log served punishments.',
        placement: 'top',
        shouldShow: (p)=>p.showDailyReports
    },
    // --- ADMIN / MANAGE ---
    {
        id: 'roster-manage',
        path: '/manage',
        targetId: 'roster-table',
        title: 'Roster Management',
        content: 'Search for cadets, assign roles, or move them between companies using this table.',
        placement: 'top',
        shouldShow: (p)=>p.canManage
    },
    // --- FINISH (Everyone) ---
    {
        id: 'finish-logout',
        path: '/',
        targetId: 'nav-signout',
        title: 'Sign Out',
        content: 'When you are done, use this button to log out.',
        placement: 'left',
        shouldShow: (p)=>p.roleLevel >= 15
    },
    {
        id: 'finish-logout-l10',
        path: '/ledger/::userId::',
        targetId: 'nav-signout',
        title: 'Sign Out',
        content: 'Use this button to log out.',
        placement: 'left',
        shouldShow: (p)=>p.roleLevel === 10
    }
];
}),
"[project]/app/components/tour/OnboardingTour.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/components/tour/OnboardingTour.tsx
__turbopack_context__.s([
    "default",
    ()=>OnboardingTour
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$tour$2f$TourConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/tour/TourConfig.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function OnboardingTour(permissions) {
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentStepIndex, setCurrentStepIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [rect, setRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isCompleting, setIsCompleting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    // 1. Filter and Process steps
    const activeSteps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$tour$2f$TourConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOUR_STEPS"].filter((step)=>step.shouldShow(permissions)).map((step)=>({
                ...step,
                // Replace placeholder with actual ID for Ledger links
                path: step.path.replace('::userId::', permissions.userId)
            }));
    }, [
        permissions.roleLevel,
        permissions.canManage,
        permissions.isSiteAdmin,
        permissions.showDailyReports,
        permissions.userId
    ]);
    const currentStep = activeSteps[currentStepIndex];
    // 2. Start Tour logic
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (permissions.show && activeSteps.length > 0) {
            setTimeout(()=>setIsOpen(true), 1500);
        }
    }, [
        permissions.show,
        activeSteps.length
    ]);
    // 3. Navigation & Positioning Engine
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isOpen || !currentStep) return;
        // A. Route Check
        if (pathname !== currentStep.path) {
            router.push(currentStep.path);
            return;
        }
        // B. Find Element
        const findAndHighlight = ()=>{
            const element = document.getElementById(currentStep.targetId);
            if (element) {
                const r = element.getBoundingClientRect();
                // Ensure visible
                if (r.width > 0 && r.height > 0) {
                    setRect(r);
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                } else {
                    // Fallback
                    setRect({
                        top: window.innerHeight / 2,
                        left: window.innerWidth / 2,
                        width: 0,
                        height: 0
                    });
                }
            } else {
                setTimeout(findAndHighlight, 500);
            }
        };
        const timer = setTimeout(findAndHighlight, 500);
        window.addEventListener('resize', findAndHighlight);
        return ()=>{
            clearTimeout(timer);
            window.removeEventListener('resize', findAndHighlight);
        };
    }, [
        currentStepIndex,
        currentStep,
        isOpen,
        pathname,
        router
    ]);
    const handleNext = ()=>{
        if (currentStepIndex < activeSteps.length - 1) {
            setCurrentStepIndex((prev)=>prev + 1);
        } else {
            handleFinish();
        }
    };
    const handleBack = ()=>{
        if (currentStepIndex > 0) {
            setCurrentStepIndex((prev)=>prev - 1);
        }
    };
    const handleFinish = async ()=>{
        setIsCompleting(true);
        await supabase.rpc('complete_onboarding_tour');
        setIsOpen(false);
        setRect(null);
        router.refresh();
    };
    if (!isOpen || !currentStep) return null;
    // Helper for popover styles
    const getPopoverStyle = ()=>{
        if (!rect) return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        };
        const gap = 15;
        const width = 320;
        switch(currentStep.placement){
            case 'right':
                return {
                    top: rect.top,
                    left: rect.right + gap
                };
            case 'left':
                return {
                    top: rect.top,
                    left: rect.left - width - gap
                };
            case 'top':
                return {
                    top: rect.top - gap - 200,
                    left: rect.left
                };
            case 'bottom':
            default:
                return {
                    top: rect.bottom + gap,
                    left: rect.left
                };
        }
    };
    const style = getPopoverStyle();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[9999] pointer-events-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute transition-all duration-500 ease-in-out rounded-md pointer-events-auto",
                style: {
                    top: rect ? rect.top - 5 : '50%',
                    left: rect ? rect.left - 5 : '50%',
                    width: rect ? rect.width + 10 : 0,
                    height: rect ? rect.height + 10 : 0,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
                }
            }, void 0, false, {
                fileName: "[project]/app/components/tour/OnboardingTour.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute pointer-events-auto transition-all duration-500 ease-out w-80 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden",
                style: {
                    top: style.top,
                    left: style.left
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-indigo-600 px-4 py-3 flex justify-between items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-bold text-indigo-100 uppercase tracking-wider",
                                children: [
                                    "Step ",
                                    currentStepIndex + 1,
                                    " of ",
                                    activeSteps.length
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/tour/OnboardingTour.tsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleFinish,
                                className: "text-indigo-200 hover:text-white text-xs font-semibold",
                                children: "Skip"
                            }, void 0, false, {
                                fileName: "[project]/app/components/tour/OnboardingTour.tsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/tour/OnboardingTour.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-gray-900 dark:text-white mb-2",
                                children: currentStep.title
                            }, void 0, false, {
                                fileName: "[project]/app/components/tour/OnboardingTour.tsx",
                                lineNumber: 146,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-600 dark:text-gray-300 leading-relaxed",
                                children: currentStep.content
                            }, void 0, false, {
                                fileName: "[project]/app/components/tour/OnboardingTour.tsx",
                                lineNumber: 149,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/tour/OnboardingTour.tsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-50 dark:bg-gray-900/50 px-5 py-3 flex justify-between items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleBack,
                                disabled: currentStepIndex === 0,
                                className: "text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30",
                                children: "Back"
                            }, void 0, false, {
                                fileName: "[project]/app/components/tour/OnboardingTour.tsx",
                                lineNumber: 155,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleNext,
                                disabled: isCompleting,
                                className: "bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors",
                                children: currentStepIndex === activeSteps.length - 1 ? 'Finish' : 'Next'
                            }, void 0, false, {
                                fileName: "[project]/app/components/tour/OnboardingTour.tsx",
                                lineNumber: 163,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/tour/OnboardingTour.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/tour/OnboardingTour.tsx",
                lineNumber: 132,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/tour/OnboardingTour.tsx",
        lineNumber: 117,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c2e46971._.js.map