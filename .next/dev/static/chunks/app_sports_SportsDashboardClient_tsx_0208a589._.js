(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/sports/SportsDashboardClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SportsDashboardClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function SportsDashboardClient({ sports, upcomingEvents, unassignedCadets, currentSeason }) {
    _s();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('current');
    const currentSeasonSports = sports.filter((s)=>s.season === currentSeason);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-foreground mb-4 flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-primary",
                                children: "⚡"
                            }, void 0, false, {
                                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                lineNumber: 27,
                                columnNumber: 21
                            }, this),
                            " Upcoming Action"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                        lineNumber: 26,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                        children: upcomingEvents.length > 0 ? upcomingEvents.map((evt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-primary text-primary-foreground rounded-xl p-5 shadow-lg relative overflow-hidden border border-primary/20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-0 right-0 p-3 opacity-20 text-6xl font-black",
                                        children: evt.sport_name[0]
                                    }, void 0, false, {
                                        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                        lineNumber: 32,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative z-10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${evt.is_home ? 'bg-background text-foreground' : 'bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30'}`,
                                                children: evt.is_home ? 'Home' : 'Away'
                                            }, void 0, false, {
                                                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                                lineNumber: 34,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-bold mt-2 leading-tight",
                                                children: evt.title
                                            }, void 0, false, {
                                                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                                lineNumber: 37,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-primary-foreground/80 text-sm mt-1",
                                                children: new Date(evt.date).toLocaleDateString([], {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                                lineNumber: 38,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-primary-foreground/60 uppercase tracking-widest mt-4 font-bold",
                                                children: evt.sport_name
                                            }, void 0, false, {
                                                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                                lineNumber: 39,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                        lineNumber: 33,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, evt.id, true, {
                                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                lineNumber: 31,
                                columnNumber: 25
                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "col-span-3 p-8 bg-muted/20 rounded-xl border border-dashed border-border text-center text-muted-foreground",
                            children: "No upcoming games scheduled."
                        }, void 0, false, {
                            fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                            lineNumber: 43,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                        lineNumber: 29,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                lineNumber: 25,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-border mb-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                    className: "-mb-px flex space-x-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setActiveTab('current'),
                            className: `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'current' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`,
                            children: [
                                "Current Season (",
                                currentSeason,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                            lineNumber: 53,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setActiveTab('all'),
                            className: `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`,
                            children: "All Sports"
                        }, void 0, false, {
                            fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                            lineNumber: 59,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setActiveTab('unassigned'),
                            className: `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'unassigned' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`,
                            children: [
                                "Unassigned Cadets ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full",
                                    children: unassignedCadets.length
                                }, void 0, false, {
                                    fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                    lineNumber: 69,
                                    columnNumber: 43
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                            lineNumber: 65,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                    lineNumber: 52,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                lineNumber: 51,
                columnNumber: 13
            }, this),
            activeTab === 'current' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                children: currentSeasonSports.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: `/sports/${s.id}`,
                        className: "group bg-card p-5 rounded-lg border border-border hover:border-primary transition-all shadow-sm hover:shadow-md",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-start",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-bold text-lg text-foreground group-hover:text-primary transition-colors",
                                        children: s.name
                                    }, void 0, false, {
                                        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                        lineNumber: 80,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 text-xs font-bold px-2 py-1 rounded-full",
                                        children: "Active"
                                    }, void 0, false, {
                                        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                        lineNumber: 81,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                lineNumber: 79,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors",
                                children: "Manage Roster & Schedule →"
                            }, void 0, false, {
                                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                lineNumber: 83,
                                columnNumber: 29
                            }, this)
                        ]
                    }, s.id, true, {
                        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                        lineNumber: 78,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                lineNumber: 76,
                columnNumber: 17
            }, this),
            activeTab === 'all' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
                children: sports.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: `/sports/${s.id}`,
                        className: `block p-4 rounded-lg border transition-colors ${s.season === currentSeason ? 'bg-card border-primary/50 shadow-sm' : 'bg-muted/20 border-border opacity-75 hover:opacity-100 hover:bg-card'}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "font-bold text-foreground",
                                    children: s.name
                                }, void 0, false, {
                                    fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                    lineNumber: 97,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-medium text-muted-foreground uppercase",
                                    children: s.season
                                }, void 0, false, {
                                    fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                    lineNumber: 98,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                            lineNumber: 96,
                            columnNumber: 29
                        }, this)
                    }, s.id, false, {
                        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                        lineNumber: 95,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                lineNumber: 93,
                columnNumber: 17
            }, this),
            activeTab === 'unassigned' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-card rounded-lg border border-border overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 bg-muted/30 border-b border-border",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "font-bold text-muted-foreground text-sm uppercase",
                            children: [
                                "Cadets not in ",
                                currentSeason,
                                " Sports"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                            lineNumber: 109,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                        lineNumber: 108,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0 p-4",
                        children: unassignedCadets.length > 0 ? unassignedCadets.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 border-b border-border flex justify-between items-center hover:bg-accent transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium text-foreground",
                                                children: [
                                                    c.last_name,
                                                    ", ",
                                                    c.first_name
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                                lineNumber: 115,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-muted-foreground",
                                                children: c.company?.company_name || 'No Co'
                                            }, void 0, false, {
                                                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                                lineNumber: 116,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                        lineNumber: 114,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground",
                                        children: c.cadet_rank
                                    }, void 0, false, {
                                        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                        lineNumber: 118,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, c.id, true, {
                                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                                lineNumber: 113,
                                columnNumber: 29
                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 text-center text-muted-foreground text-sm italic col-span-full",
                            children: "All cadets assigned!"
                        }, void 0, false, {
                            fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                            lineNumber: 121,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                        lineNumber: 111,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/sports/SportsDashboardClient.tsx",
                lineNumber: 107,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/sports/SportsDashboardClient.tsx",
        lineNumber: 23,
        columnNumber: 9
    }, this);
}
_s(SportsDashboardClient, "f7EzYkzUTjcbJRVg9skiX2Me0FE=");
_c = SportsDashboardClient;
var _c;
__turbopack_context__.k.register(_c, "SportsDashboardClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_sports_SportsDashboardClient_tsx_0208a589._.js.map