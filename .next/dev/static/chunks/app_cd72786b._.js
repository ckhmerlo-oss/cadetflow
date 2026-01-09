(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatDateTime",
    ()=>formatDateTime
]);
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/New_York'
    }).format(date);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/SearchableSelect.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SearchableSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function SearchableSelect({ label, options, value, onChange, placeholder = 'Select...', required = false, disabled = false, error = false }) {
    _s();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const selectedItem = options.find((opt)=>opt.id === value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SearchableSelect.useEffect": ()=>{
            if (selectedItem) {
                setSearch(selectedItem.label);
            } else {
                if (!isOpen) setSearch('');
            }
        }
    }["SearchableSelect.useEffect"], [
        selectedItem,
        isOpen
    ]);
    const filteredOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SearchableSelect.useMemo[filteredOptions]": ()=>{
            return options.filter({
                "SearchableSelect.useMemo[filteredOptions]": (opt)=>opt.label.toLowerCase().includes(search.toLowerCase()) || opt.group && opt.group.toLowerCase().includes(search.toLowerCase())
            }["SearchableSelect.useMemo[filteredOptions]"]);
        }
    }["SearchableSelect.useMemo[filteredOptions]"], [
        options,
        search
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SearchableSelect.useEffect": ()=>{
            function handleClickOutside(event) {
                if (containerRef.current && !containerRef.current.contains(event.target)) {
                    setIsOpen(false);
                    if (selectedItem) setSearch(selectedItem.label);
                    else setSearch('');
                }
            }
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "SearchableSelect.useEffect": ()=>document.removeEventListener('mousedown', handleClickOutside)
            })["SearchableSelect.useEffect"];
        }
    }["SearchableSelect.useEffect"], [
        selectedItem
    ]);
    const handleClear = (e)=>{
        e.stopPropagation();
        onChange('');
        setSearch('');
        setIsOpen(true);
        inputRef.current?.focus();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: containerRef,
        children: [
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-sm font-medium text-foreground mb-1",
                children: [
                    label,
                    " ",
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-destructive",
                        children: "*"
                    }, void 0, false, {
                        fileName: "[project]/app/components/SearchableSelect.tsx",
                        lineNumber: 78,
                        columnNumber: 34
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/SearchableSelect.tsx",
                lineNumber: 77,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: inputRef,
                        type: "text",
                        className: `block w-full rounded-md border bg-background py-2 pl-3 pr-10 text-sm shadow-sm focus:outline-none focus:ring-1 text-foreground placeholder:text-muted-foreground ${error ? 'border-destructive focus:border-destructive focus:ring-destructive' : 'border-input focus:border-primary focus:ring-primary'} ${disabled ? 'bg-muted opacity-50 cursor-not-allowed' : ''}`,
                        placeholder: placeholder,
                        value: search,
                        onChange: (e)=>{
                            setSearch(e.target.value);
                            if (!isOpen) setIsOpen(true);
                            if (e.target.value === '') onChange('');
                        },
                        onFocus: ()=>setIsOpen(true),
                        disabled: disabled
                    }, void 0, false, {
                        fileName: "[project]/app/components/SearchableSelect.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-y-0 right-0 flex items-center pr-2 gap-1",
                        children: [
                            value && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleClear,
                                className: "p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors",
                                tabIndex: -1,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "h-4 w-4",
                                    fill: "none",
                                    stroke: "currentColor",
                                    viewBox: "0 0 24 24",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: 2,
                                        d: "M6 18L18 6M6 6l12 12"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/SearchableSelect.tsx",
                                        lineNumber: 110,
                                        columnNumber: 100
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/SearchableSelect.tsx",
                                    lineNumber: 110,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/SearchableSelect.tsx",
                                lineNumber: 104,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pointer-events-none text-muted-foreground",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "h-5 w-5",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    "aria-hidden": "true",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        fillRule: "evenodd",
                                        d: "M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z",
                                        clipRule: "evenodd"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/SearchableSelect.tsx",
                                        lineNumber: 116,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/SearchableSelect.tsx",
                                    lineNumber: 115,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/SearchableSelect.tsx",
                                lineNumber: 114,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/SearchableSelect.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/SearchableSelect.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            isOpen && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-border animate-in fade-in zoom-in-95 duration-100",
                children: filteredOptions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                    className: "relative cursor-default select-none py-2 pl-3 pr-9 text-muted-foreground",
                    children: "No results found."
                }, void 0, false, {
                    fileName: "[project]/app/components/SearchableSelect.tsx",
                    lineNumber: 125,
                    columnNumber: 13
                }, this) : filteredOptions.map((option, index)=>{
                    const showGroupHeader = option.group && (index === 0 || option.group !== filteredOptions[index - 1].group);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            showGroupHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "sticky top-0 z-10 bg-muted py-1 pl-2 pr-9 text-xs font-bold text-muted-foreground",
                                children: option.group
                            }, void 0, false, {
                                fileName: "[project]/app/components/SearchableSelect.tsx",
                                lineNumber: 134,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: `relative cursor-pointer select-none py-2 pr-9 transition-colors ${option.id === value ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent hover:text-accent-foreground'} ${option.group ? 'pl-5' : 'pl-3'}`,
                                onClick: ()=>{
                                    onChange(option.id);
                                    setSearch(option.label);
                                    setIsOpen(false);
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `block truncate ${option.id === value ? 'font-semibold' : 'font-normal'}`,
                                        children: option.label
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/SearchableSelect.tsx",
                                        lineNumber: 150,
                                        columnNumber: 21
                                    }, this),
                                    option.id === value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "absolute inset-y-0 right-0 flex items-center pr-4 text-primary-foreground",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "h-5 w-5",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor",
                                            "aria-hidden": "true",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                fillRule: "evenodd",
                                                d: "M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z",
                                                clipRule: "evenodd"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/SearchableSelect.tsx",
                                                lineNumber: 156,
                                                columnNumber: 29
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/SearchableSelect.tsx",
                                            lineNumber: 155,
                                            columnNumber: 27
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/SearchableSelect.tsx",
                                        lineNumber: 154,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/SearchableSelect.tsx",
                                lineNumber: 138,
                                columnNumber: 19
                            }, this)
                        ]
                    }, option.id, true, {
                        fileName: "[project]/app/components/SearchableSelect.tsx",
                        lineNumber: 132,
                        columnNumber: 17
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/app/components/SearchableSelect.tsx",
                lineNumber: 123,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/SearchableSelect.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
_s(SearchableSelect, "XcCGUbYeXefuNuR7tI8LySP12Xg=");
_c = SearchableSelect;
var _c;
__turbopack_context__.k.register(_c, "SearchableSelect");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/report/[id]/data:820111 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60415971ff989601457ebc0244a4a8ff71b4be2994":"pullReport"},"app/report/[id]/actions.ts",""] */ __turbopack_context__.s([
    "pullReport",
    ()=>pullReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var pullReport = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("60415971ff989601457ebc0244a4a8ff71b4be2994", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "pullReport"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gMS4gQVBQUk9WRSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICAvLyAxLiBDaGVjayBVc2VyXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBObyBhdXRoZW50aWNhdGVkIHVzZXIgZm91bmQuXCIpO1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZDogTm8gdXNlciBzZXNzaW9uLicgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBdHRlbXB0aW5nIGFwcHJvdmFsIGZvciBSZXBvcnQgJHtyZXBvcnRJZH0gYnkgVXNlciAke3VzZXIuaWR9YCk7XHJcblxyXG4gIC8vIDIuIEZldGNoIFVzZXIncyBSb2xlICYgR3JvdXAgKFRoZSBcIktleXNcIiB0byB0aGUgUkxTIFBvbGljeSlcclxuICBjb25zdCB7IGRhdGE6IHVzZXJQcm9maWxlLCBlcnJvcjogcHJvZmlsZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgIC5zZWxlY3QoJ2lkLCByb2xlOnJvbGVzKGlkLCBuYW1lLCBhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKHByb2ZpbGVFcnJvciB8fCAhdXNlclByb2ZpbGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBDb3VsZCBub3QgZmV0Y2ggdXNlciBwcm9maWxlL3JvbGVcIiwgcHJvZmlsZUVycm9yKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBQcm9maWxlIEVycm9yOiAke3Byb2ZpbGVFcnJvcj8ubWVzc2FnZSB8fCAnUHJvZmlsZSBub3QgZm91bmQnfWAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgbXlHcm91cElkID0gKHVzZXJQcm9maWxlLnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWQ7XHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBVc2VyJ3MgR3JvdXAgSUQ6ICR7bXlHcm91cElkfSAoUm9sZTogJHsodXNlclByb2ZpbGUucm9sZSBhcyBhbnkpPy5uYW1lfSlgKTtcclxuXHJcbiAgLy8gMy4gRmV0Y2ggUmVwb3J0IFN0YXRlIChUaGUgXCJMb2NrXCIgb24gdGhlIFJMUyBQb2xpY3kpXHJcbiAgY29uc3QgeyBkYXRhOiByZXBvcnQsIGVycm9yOiByZXBvcnRFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnNlbGVjdCgnaWQsIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQsIHN0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKHJlcG9ydEVycm9yIHx8ICFyZXBvcnQpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBDb3VsZCBub3QgZmV0Y2ggcmVwb3J0XCIsIHJlcG9ydEVycm9yKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBSZXBvcnQgRXJyb3I6ICR7cmVwb3J0RXJyb3I/Lm1lc3NhZ2UgfHwgJ1JlcG9ydCBub3QgZm91bmQnfWAgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBSZXBvcnQncyBDdXJyZW50IEdyb3VwIElEOiAke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfWApO1xyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogUmVwb3J0IFN0YXR1czogJHtyZXBvcnQuc3RhdHVzfWApO1xyXG5cclxuICAvLyA0LiBWRVJJRlkgUEVSTUlTU0lPTiBNQVRDSFxyXG4gIC8vIFRoaXMgaXMgdGhlIGxvZ2ljIHlvdXIgUkxTIFwiVVNJTkdcIiBjbGF1c2UgdXNlcy4gSWYgdGhpcyBpcyBmYWxzZSwgUkxTIHdpbGwgYmxvY2sgeW91LlxyXG4gIGlmIChyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZCAhPT0gbXlHcm91cElkKSB7XHJcbiAgICAgIGNvbnN0IG1zZyA9IGBERUJVRyBNSVNNQVRDSDogVXNlciBHcm91cCAoJHtteUdyb3VwSWR9KSAhPSBSZXBvcnQgR3JvdXAgKCR7cmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWR9KWA7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBQZXJtaXNzaW9uIERlbmllZDogWW91IGFyZSBpbiBncm91cCAke215R3JvdXBJZH0sIGJ1dCByZXBvcnQgaXMgd2l0aCBncm91cCAke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfWAgfTtcclxuICB9XHJcblxyXG4gIC8vIDUuIERldGVybWluZSBOZXh0IFN0ZXBcclxuICBjb25zdCB7IGRhdGE6IGN1cnJlbnRHcm91cCB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgLnNlbGVjdCgnbmV4dF9hcHByb3Zlcl9ncm91cF9pZCcpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgY29uc3QgbmV4dEdyb3VwSWQgPSBjdXJyZW50R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gIGNvbnN0IG5ld1N0YXR1cyA9IG5leHRHcm91cElkID8gJ3BlbmRpbmdfYXBwcm92YWwnIDogJ2NvbXBsZXRlZCdcclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBZHZhbmNpbmcgdG8gR3JvdXA6ICR7bmV4dEdyb3VwSWR9IHwgTmV3IFN0YXR1czogJHtuZXdTdGF0dXN9YCk7XHJcblxyXG4gIC8vIDYuIFBlcmZvcm0gVXBkYXRlXHJcbiAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgc3RhdHVzOiBuZXdTdGF0dXMsXHJcbiAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG5leHRHcm91cElkXHJcbiAgICB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAodXBkYXRlRXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBVcGRhdGUgRmFpbGVkXCIsIHVwZGF0ZUVycm9yKTtcclxuICAgICAgLy8gUmV0dXJuIHRoZSByYXcgZGF0YWJhc2UgZXJyb3IgdG8gdGhlIFVJXHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgREIgVXBkYXRlIEZhaWxlZDogJHt1cGRhdGVFcnJvci5tZXNzYWdlfSAoQ29kZTogJHt1cGRhdGVFcnJvci5jb2RlfSlgIH1cclxuICB9XHJcblxyXG4gIC8vIDcuIExvZyBTdWNjZXNzXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ2FwcHJvdmVkJyxcclxuICAgIGNvbW1lbnQ6ICdBcHByb3ZlZCdcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSAyLiBSRUpFQ1QgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWplY3RSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnVwZGF0ZSh7IHN0YXR1czogJ3JlamVjdGVkJywgY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZDogbnVsbCB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ3JlamVjdGVkJyxcclxuICAgIGNvbW1lbnQ6ICdSZWplY3RlZCBieSBhcHByb3ZlcidcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSAzLiBLSUNLIEJBQ0sgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBraWNrQmFja1JlcG9ydEFjdGlvbihyZXBvcnRJZDogc3RyaW5nLCByZWFzb246IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgLy8gR2V0IHVzZXIncyBncm91cCB0byBtYXJrIHdobyBraWNrZWQgaXQgYmFja1xyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdyb2xlOnJvbGVzKGFwcHJvdmFsX2dyb3VwX2lkKScpXHJcbiAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgIC5zaW5nbGUoKVxyXG4gICAgXHJcbiAgY29uc3QgbXlHcm91cElkID0gKHByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnVwZGF0ZSh7IFxyXG4gICAgICBzdGF0dXM6ICduZWVkc19yZXZpc2lvbicsIFxyXG4gICAgICByZXZpc2lvbl9ieV9ncm91cF9pZDogbXlHcm91cElkIFxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdLaWNrZWQgQmFjayBmb3IgUmV2aXNpb24nLFxyXG4gICAgY29tbWVudDogcmVhc29uXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gNC4gUFVMTCAoQnkgU3VibWl0dGVyKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHB1bGxSZXBvcnQocmVwb3J0SWQ6IHN0cmluZywgY29tbWVudDogc3RyaW5nKSB7XHJcbiAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gIFxyXG4gIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgaWYgKCF1c2VyKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgLy8gMS4gQ2hlY2sgY3VycmVudCBzdGF0dXMgdG8gcHJldmVudCBkb3VibGUtcHVsbGluZ1xyXG4gIGNvbnN0IHsgZGF0YTogY3VycmVudFJlcG9ydCwgZXJyb3I6IGZldGNoRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC5zZWxlY3QoJ3N0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKGZldGNoRXJyb3IgfHwgIWN1cnJlbnRSZXBvcnQpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVwb3J0IG5vdCBmb3VuZCcgfVxyXG4gIH1cclxuXHJcbiAgaWYgKGN1cnJlbnRSZXBvcnQuc3RhdHVzID09PSAncHVsbGVkJykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUaGlzIHJlcG9ydCBpcyBhbHJlYWR5IHB1bGxlZC4nIH1cclxuICB9XHJcblxyXG4gIC8vIDIuIFVwZGF0ZSB0byAnUHVsbGVkJywgWmVybyBEZW1lcml0cywgUmVtb3ZlIGZyb20gQXBwcm92YWwgQ2hhaW5cclxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAudXBkYXRlKHsgXHJcbiAgICAgICAgc3RhdHVzOiAncHVsbGVkJywgLy8gPC0tLSBEaXN0aW5jdCBzdGF0dXNcclxuICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBudWxsLCBcclxuICAgICAgICBkZW1lcml0c19lZmZlY3RpdmU6IDAsIC8vIEVuc3VyZSBubyBkZW1lcml0cyBhcHBseVxyXG4gICAgICAgIHJldmlzaW9uX2J5X2dyb3VwX2lkOiBudWxsIC8vIEVuc3VyZSBpdCBkb2Vzbid0IGFwcGVhciBpbiBhbnlvbmUncyByZXZpc2lvbiBxdWV1ZVxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdQdWxsIEVycm9yOicsIGVycm9yKVxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuICB9XHJcblxyXG4gIC8vIDMuIExvZyB0aGUgYWN0aW9uXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ3B1bGxlZCcsXHJcbiAgICBjb21tZW50OiBjb21tZW50XHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldmFsaWRhdGVQYXRoKCcvcmVwb3J0cy9zdWJtaXR0ZWQnKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gNS4gUkVTVUJNSVQgKFN0YW5kYXJkKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3VibWl0UmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBSZWNhbGN1bGF0ZSBBcHByb3ZlciBDaGFpblxyXG4gICAgY29uc3QgeyBkYXRhOiB1c2VyUHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgICAgIC5zZWxlY3QoJ3JvbGU6cm9sZXMoYXBwcm92YWxfZ3JvdXBfaWQpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBjb25zdCBteUdyb3VwSWQgPSAodXNlclByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuICAgIGxldCB0YXJnZXRHcm91cElkID0gbnVsbFxyXG5cclxuICAgIGlmIChteUdyb3VwSWQpIHtcclxuICAgICAgICBjb25zdCB7IGRhdGE6IG15R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCduZXh0X2FwcHJvdmVyX2dyb3VwX2lkJylcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG15R3JvdXBJZClcclxuICAgICAgICAgICAgLnNpbmdsZSgpXHJcbiAgICAgICAgdGFyZ2V0R3JvdXBJZCA9IG15R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZ19hcHByb3ZhbCdcclxuICAgIGlmIChteUdyb3VwSWQgJiYgIXRhcmdldEdyb3VwSWQpIHtcclxuICAgICAgICBzdGF0dXMgPSAnY29tcGxldGVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiB0YXJnZXRHcm91cElkLCBcclxuICAgICAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ3Jlc3VibWl0dGVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IHJldmlzZWQgYW5kIHJlc3VibWl0dGVkJ1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDYuIEVESVQgJiBBUFBST1ZFIChDb21tYW5kIE92ZXJyaWRlKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRBbmRBcHByb3ZlUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgUGVybWlzc2lvblxyXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhkZWZhdWx0X3JvbGVfbGV2ZWwpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gICAgY29uc3Qgcm9sZUxldmVsID0gKHByb2ZpbGU/LnJvbGUgYXMgYW55KT8uZGVmYXVsdF9yb2xlX2xldmVsIHx8IDBcclxuICAgIGlmIChyb2xlTGV2ZWwgPCA5MCkgcmV0dXJuIHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMnIH1cclxuXHJcbiAgICAvLyBGb3JjZSBDb21wbGV0ZVxyXG4gICAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAgICAgLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIG9mZmVuc2VfdHlwZV9pZDogcGF5bG9hZC5vZmZlbnNlVHlwZUlkLFxyXG4gICAgICAgICAgICBub3RlczogcGF5bG9hZC5ub3RlcyxcclxuICAgICAgICAgICAgcmVwb3J0X2V4cGxhbmF0aW9uOiBwYXlsb2FkLnJlcG9ydEV4cGxhbmF0aW9uLFxyXG4gICAgICAgICAgICBkYXRlX29mX29mZmVuc2U6IHBheWxvYWQuZGF0ZU9mT2ZmZW5zZSxcclxuICAgICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJywgXHJcbiAgICAgICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwsXHJcbiAgICAgICAgICAgIHJldmlzaW9uX2J5X2dyb3VwX2lkOiBudWxsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ2VkaXRlZF9hbmRfYXBwcm92ZWQnLFxyXG4gICAgICAgIGNvbW1lbnQ6ICdSZXBvcnQgZWRpdGVkIGFuZCBpbW1lZGlhdGVseSBhcHByb3ZlZCBieSBhdXRob3JpdHknXHJcbiAgICB9KVxyXG5cclxuICAgIHJldmFsaWRhdGVQYXRoKGAvcmVwb3J0LyR7cmVwb3J0SWR9YClcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI4UkE0SnNCIn0=
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/report/[id]/data:ed41c7 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40a3e1aea32ee98a024ec4a4e72f61a51e3be8f308":"approveReportAction"},"app/report/[id]/actions.ts",""] */ __turbopack_context__.s([
    "approveReportAction",
    ()=>approveReportAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var approveReportAction = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("40a3e1aea32ee98a024ec4a4e72f61a51e3be8f308", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "approveReportAction"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gMS4gQVBQUk9WRSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICAvLyAxLiBDaGVjayBVc2VyXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBObyBhdXRoZW50aWNhdGVkIHVzZXIgZm91bmQuXCIpO1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZDogTm8gdXNlciBzZXNzaW9uLicgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBdHRlbXB0aW5nIGFwcHJvdmFsIGZvciBSZXBvcnQgJHtyZXBvcnRJZH0gYnkgVXNlciAke3VzZXIuaWR9YCk7XHJcblxyXG4gIC8vIDIuIEZldGNoIFVzZXIncyBSb2xlICYgR3JvdXAgKFRoZSBcIktleXNcIiB0byB0aGUgUkxTIFBvbGljeSlcclxuICBjb25zdCB7IGRhdGE6IHVzZXJQcm9maWxlLCBlcnJvcjogcHJvZmlsZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgIC5zZWxlY3QoJ2lkLCByb2xlOnJvbGVzKGlkLCBuYW1lLCBhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKHByb2ZpbGVFcnJvciB8fCAhdXNlclByb2ZpbGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBDb3VsZCBub3QgZmV0Y2ggdXNlciBwcm9maWxlL3JvbGVcIiwgcHJvZmlsZUVycm9yKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBQcm9maWxlIEVycm9yOiAke3Byb2ZpbGVFcnJvcj8ubWVzc2FnZSB8fCAnUHJvZmlsZSBub3QgZm91bmQnfWAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgbXlHcm91cElkID0gKHVzZXJQcm9maWxlLnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWQ7XHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBVc2VyJ3MgR3JvdXAgSUQ6ICR7bXlHcm91cElkfSAoUm9sZTogJHsodXNlclByb2ZpbGUucm9sZSBhcyBhbnkpPy5uYW1lfSlgKTtcclxuXHJcbiAgLy8gMy4gRmV0Y2ggUmVwb3J0IFN0YXRlIChUaGUgXCJMb2NrXCIgb24gdGhlIFJMUyBQb2xpY3kpXHJcbiAgY29uc3QgeyBkYXRhOiByZXBvcnQsIGVycm9yOiByZXBvcnRFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnNlbGVjdCgnaWQsIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQsIHN0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKHJlcG9ydEVycm9yIHx8ICFyZXBvcnQpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBDb3VsZCBub3QgZmV0Y2ggcmVwb3J0XCIsIHJlcG9ydEVycm9yKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBSZXBvcnQgRXJyb3I6ICR7cmVwb3J0RXJyb3I/Lm1lc3NhZ2UgfHwgJ1JlcG9ydCBub3QgZm91bmQnfWAgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBSZXBvcnQncyBDdXJyZW50IEdyb3VwIElEOiAke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfWApO1xyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogUmVwb3J0IFN0YXR1czogJHtyZXBvcnQuc3RhdHVzfWApO1xyXG5cclxuICAvLyA0LiBWRVJJRlkgUEVSTUlTU0lPTiBNQVRDSFxyXG4gIC8vIFRoaXMgaXMgdGhlIGxvZ2ljIHlvdXIgUkxTIFwiVVNJTkdcIiBjbGF1c2UgdXNlcy4gSWYgdGhpcyBpcyBmYWxzZSwgUkxTIHdpbGwgYmxvY2sgeW91LlxyXG4gIGlmIChyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZCAhPT0gbXlHcm91cElkKSB7XHJcbiAgICAgIGNvbnN0IG1zZyA9IGBERUJVRyBNSVNNQVRDSDogVXNlciBHcm91cCAoJHtteUdyb3VwSWR9KSAhPSBSZXBvcnQgR3JvdXAgKCR7cmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWR9KWA7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBQZXJtaXNzaW9uIERlbmllZDogWW91IGFyZSBpbiBncm91cCAke215R3JvdXBJZH0sIGJ1dCByZXBvcnQgaXMgd2l0aCBncm91cCAke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfWAgfTtcclxuICB9XHJcblxyXG4gIC8vIDUuIERldGVybWluZSBOZXh0IFN0ZXBcclxuICBjb25zdCB7IGRhdGE6IGN1cnJlbnRHcm91cCB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgLnNlbGVjdCgnbmV4dF9hcHByb3Zlcl9ncm91cF9pZCcpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgY29uc3QgbmV4dEdyb3VwSWQgPSBjdXJyZW50R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gIGNvbnN0IG5ld1N0YXR1cyA9IG5leHRHcm91cElkID8gJ3BlbmRpbmdfYXBwcm92YWwnIDogJ2NvbXBsZXRlZCdcclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBZHZhbmNpbmcgdG8gR3JvdXA6ICR7bmV4dEdyb3VwSWR9IHwgTmV3IFN0YXR1czogJHtuZXdTdGF0dXN9YCk7XHJcblxyXG4gIC8vIDYuIFBlcmZvcm0gVXBkYXRlXHJcbiAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgc3RhdHVzOiBuZXdTdGF0dXMsXHJcbiAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG5leHRHcm91cElkXHJcbiAgICB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAodXBkYXRlRXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBVcGRhdGUgRmFpbGVkXCIsIHVwZGF0ZUVycm9yKTtcclxuICAgICAgLy8gUmV0dXJuIHRoZSByYXcgZGF0YWJhc2UgZXJyb3IgdG8gdGhlIFVJXHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgREIgVXBkYXRlIEZhaWxlZDogJHt1cGRhdGVFcnJvci5tZXNzYWdlfSAoQ29kZTogJHt1cGRhdGVFcnJvci5jb2RlfSlgIH1cclxuICB9XHJcblxyXG4gIC8vIDcuIExvZyBTdWNjZXNzXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ2FwcHJvdmVkJyxcclxuICAgIGNvbW1lbnQ6ICdBcHByb3ZlZCdcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSAyLiBSRUpFQ1QgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWplY3RSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnVwZGF0ZSh7IHN0YXR1czogJ3JlamVjdGVkJywgY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZDogbnVsbCB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ3JlamVjdGVkJyxcclxuICAgIGNvbW1lbnQ6ICdSZWplY3RlZCBieSBhcHByb3ZlcidcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSAzLiBLSUNLIEJBQ0sgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBraWNrQmFja1JlcG9ydEFjdGlvbihyZXBvcnRJZDogc3RyaW5nLCByZWFzb246IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgLy8gR2V0IHVzZXIncyBncm91cCB0byBtYXJrIHdobyBraWNrZWQgaXQgYmFja1xyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdyb2xlOnJvbGVzKGFwcHJvdmFsX2dyb3VwX2lkKScpXHJcbiAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgIC5zaW5nbGUoKVxyXG4gICAgXHJcbiAgY29uc3QgbXlHcm91cElkID0gKHByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnVwZGF0ZSh7IFxyXG4gICAgICBzdGF0dXM6ICduZWVkc19yZXZpc2lvbicsIFxyXG4gICAgICByZXZpc2lvbl9ieV9ncm91cF9pZDogbXlHcm91cElkIFxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdLaWNrZWQgQmFjayBmb3IgUmV2aXNpb24nLFxyXG4gICAgY29tbWVudDogcmVhc29uXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gNC4gUFVMTCAoQnkgU3VibWl0dGVyKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHB1bGxSZXBvcnQocmVwb3J0SWQ6IHN0cmluZywgY29tbWVudDogc3RyaW5nKSB7XHJcbiAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gIFxyXG4gIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgaWYgKCF1c2VyKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgLy8gMS4gQ2hlY2sgY3VycmVudCBzdGF0dXMgdG8gcHJldmVudCBkb3VibGUtcHVsbGluZ1xyXG4gIGNvbnN0IHsgZGF0YTogY3VycmVudFJlcG9ydCwgZXJyb3I6IGZldGNoRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC5zZWxlY3QoJ3N0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKGZldGNoRXJyb3IgfHwgIWN1cnJlbnRSZXBvcnQpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVwb3J0IG5vdCBmb3VuZCcgfVxyXG4gIH1cclxuXHJcbiAgaWYgKGN1cnJlbnRSZXBvcnQuc3RhdHVzID09PSAncHVsbGVkJykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUaGlzIHJlcG9ydCBpcyBhbHJlYWR5IHB1bGxlZC4nIH1cclxuICB9XHJcblxyXG4gIC8vIDIuIFVwZGF0ZSB0byAnUHVsbGVkJywgWmVybyBEZW1lcml0cywgUmVtb3ZlIGZyb20gQXBwcm92YWwgQ2hhaW5cclxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAudXBkYXRlKHsgXHJcbiAgICAgICAgc3RhdHVzOiAncHVsbGVkJywgLy8gPC0tLSBEaXN0aW5jdCBzdGF0dXNcclxuICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBudWxsLCBcclxuICAgICAgICBkZW1lcml0c19lZmZlY3RpdmU6IDAsIC8vIEVuc3VyZSBubyBkZW1lcml0cyBhcHBseVxyXG4gICAgICAgIHJldmlzaW9uX2J5X2dyb3VwX2lkOiBudWxsIC8vIEVuc3VyZSBpdCBkb2Vzbid0IGFwcGVhciBpbiBhbnlvbmUncyByZXZpc2lvbiBxdWV1ZVxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdQdWxsIEVycm9yOicsIGVycm9yKVxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuICB9XHJcblxyXG4gIC8vIDMuIExvZyB0aGUgYWN0aW9uXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ3B1bGxlZCcsXHJcbiAgICBjb21tZW50OiBjb21tZW50XHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldmFsaWRhdGVQYXRoKCcvcmVwb3J0cy9zdWJtaXR0ZWQnKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gNS4gUkVTVUJNSVQgKFN0YW5kYXJkKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3VibWl0UmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBSZWNhbGN1bGF0ZSBBcHByb3ZlciBDaGFpblxyXG4gICAgY29uc3QgeyBkYXRhOiB1c2VyUHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgICAgIC5zZWxlY3QoJ3JvbGU6cm9sZXMoYXBwcm92YWxfZ3JvdXBfaWQpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBjb25zdCBteUdyb3VwSWQgPSAodXNlclByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuICAgIGxldCB0YXJnZXRHcm91cElkID0gbnVsbFxyXG5cclxuICAgIGlmIChteUdyb3VwSWQpIHtcclxuICAgICAgICBjb25zdCB7IGRhdGE6IG15R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCduZXh0X2FwcHJvdmVyX2dyb3VwX2lkJylcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG15R3JvdXBJZClcclxuICAgICAgICAgICAgLnNpbmdsZSgpXHJcbiAgICAgICAgdGFyZ2V0R3JvdXBJZCA9IG15R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZ19hcHByb3ZhbCdcclxuICAgIGlmIChteUdyb3VwSWQgJiYgIXRhcmdldEdyb3VwSWQpIHtcclxuICAgICAgICBzdGF0dXMgPSAnY29tcGxldGVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiB0YXJnZXRHcm91cElkLCBcclxuICAgICAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ3Jlc3VibWl0dGVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IHJldmlzZWQgYW5kIHJlc3VibWl0dGVkJ1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDYuIEVESVQgJiBBUFBST1ZFIChDb21tYW5kIE92ZXJyaWRlKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRBbmRBcHByb3ZlUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgUGVybWlzc2lvblxyXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhkZWZhdWx0X3JvbGVfbGV2ZWwpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gICAgY29uc3Qgcm9sZUxldmVsID0gKHByb2ZpbGU/LnJvbGUgYXMgYW55KT8uZGVmYXVsdF9yb2xlX2xldmVsIHx8IDBcclxuICAgIGlmIChyb2xlTGV2ZWwgPCA5MCkgcmV0dXJuIHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMnIH1cclxuXHJcbiAgICAvLyBGb3JjZSBDb21wbGV0ZVxyXG4gICAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAgICAgLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIG9mZmVuc2VfdHlwZV9pZDogcGF5bG9hZC5vZmZlbnNlVHlwZUlkLFxyXG4gICAgICAgICAgICBub3RlczogcGF5bG9hZC5ub3RlcyxcclxuICAgICAgICAgICAgcmVwb3J0X2V4cGxhbmF0aW9uOiBwYXlsb2FkLnJlcG9ydEV4cGxhbmF0aW9uLFxyXG4gICAgICAgICAgICBkYXRlX29mX29mZmVuc2U6IHBheWxvYWQuZGF0ZU9mT2ZmZW5zZSxcclxuICAgICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJywgXHJcbiAgICAgICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwsXHJcbiAgICAgICAgICAgIHJldmlzaW9uX2J5X2dyb3VwX2lkOiBudWxsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ2VkaXRlZF9hbmRfYXBwcm92ZWQnLFxyXG4gICAgICAgIGNvbW1lbnQ6ICdSZXBvcnQgZWRpdGVkIGFuZCBpbW1lZGlhdGVseSBhcHByb3ZlZCBieSBhdXRob3JpdHknXHJcbiAgICB9KVxyXG5cclxuICAgIHJldmFsaWRhdGVQYXRoKGAvcmVwb3J0LyR7cmVwb3J0SWR9YClcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJ1U0FNc0IifQ==
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/report/[id]/data:f970a5 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40b9efaf0f915c3047878b52c0028887a9970e0cf0":"rejectReportAction"},"app/report/[id]/actions.ts",""] */ __turbopack_context__.s([
    "rejectReportAction",
    ()=>rejectReportAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var rejectReportAction = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("40b9efaf0f915c3047878b52c0028887a9970e0cf0", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "rejectReportAction"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gMS4gQVBQUk9WRSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICAvLyAxLiBDaGVjayBVc2VyXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBObyBhdXRoZW50aWNhdGVkIHVzZXIgZm91bmQuXCIpO1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZDogTm8gdXNlciBzZXNzaW9uLicgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBdHRlbXB0aW5nIGFwcHJvdmFsIGZvciBSZXBvcnQgJHtyZXBvcnRJZH0gYnkgVXNlciAke3VzZXIuaWR9YCk7XHJcblxyXG4gIC8vIDIuIEZldGNoIFVzZXIncyBSb2xlICYgR3JvdXAgKFRoZSBcIktleXNcIiB0byB0aGUgUkxTIFBvbGljeSlcclxuICBjb25zdCB7IGRhdGE6IHVzZXJQcm9maWxlLCBlcnJvcjogcHJvZmlsZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgIC5zZWxlY3QoJ2lkLCByb2xlOnJvbGVzKGlkLCBuYW1lLCBhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKHByb2ZpbGVFcnJvciB8fCAhdXNlclByb2ZpbGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBDb3VsZCBub3QgZmV0Y2ggdXNlciBwcm9maWxlL3JvbGVcIiwgcHJvZmlsZUVycm9yKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBQcm9maWxlIEVycm9yOiAke3Byb2ZpbGVFcnJvcj8ubWVzc2FnZSB8fCAnUHJvZmlsZSBub3QgZm91bmQnfWAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgbXlHcm91cElkID0gKHVzZXJQcm9maWxlLnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWQ7XHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBVc2VyJ3MgR3JvdXAgSUQ6ICR7bXlHcm91cElkfSAoUm9sZTogJHsodXNlclByb2ZpbGUucm9sZSBhcyBhbnkpPy5uYW1lfSlgKTtcclxuXHJcbiAgLy8gMy4gRmV0Y2ggUmVwb3J0IFN0YXRlIChUaGUgXCJMb2NrXCIgb24gdGhlIFJMUyBQb2xpY3kpXHJcbiAgY29uc3QgeyBkYXRhOiByZXBvcnQsIGVycm9yOiByZXBvcnRFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnNlbGVjdCgnaWQsIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQsIHN0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKHJlcG9ydEVycm9yIHx8ICFyZXBvcnQpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBDb3VsZCBub3QgZmV0Y2ggcmVwb3J0XCIsIHJlcG9ydEVycm9yKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBSZXBvcnQgRXJyb3I6ICR7cmVwb3J0RXJyb3I/Lm1lc3NhZ2UgfHwgJ1JlcG9ydCBub3QgZm91bmQnfWAgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBSZXBvcnQncyBDdXJyZW50IEdyb3VwIElEOiAke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfWApO1xyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogUmVwb3J0IFN0YXR1czogJHtyZXBvcnQuc3RhdHVzfWApO1xyXG5cclxuICAvLyA0LiBWRVJJRlkgUEVSTUlTU0lPTiBNQVRDSFxyXG4gIC8vIFRoaXMgaXMgdGhlIGxvZ2ljIHlvdXIgUkxTIFwiVVNJTkdcIiBjbGF1c2UgdXNlcy4gSWYgdGhpcyBpcyBmYWxzZSwgUkxTIHdpbGwgYmxvY2sgeW91LlxyXG4gIGlmIChyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZCAhPT0gbXlHcm91cElkKSB7XHJcbiAgICAgIGNvbnN0IG1zZyA9IGBERUJVRyBNSVNNQVRDSDogVXNlciBHcm91cCAoJHtteUdyb3VwSWR9KSAhPSBSZXBvcnQgR3JvdXAgKCR7cmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWR9KWA7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBQZXJtaXNzaW9uIERlbmllZDogWW91IGFyZSBpbiBncm91cCAke215R3JvdXBJZH0sIGJ1dCByZXBvcnQgaXMgd2l0aCBncm91cCAke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfWAgfTtcclxuICB9XHJcblxyXG4gIC8vIDUuIERldGVybWluZSBOZXh0IFN0ZXBcclxuICBjb25zdCB7IGRhdGE6IGN1cnJlbnRHcm91cCB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgLnNlbGVjdCgnbmV4dF9hcHByb3Zlcl9ncm91cF9pZCcpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgY29uc3QgbmV4dEdyb3VwSWQgPSBjdXJyZW50R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gIGNvbnN0IG5ld1N0YXR1cyA9IG5leHRHcm91cElkID8gJ3BlbmRpbmdfYXBwcm92YWwnIDogJ2NvbXBsZXRlZCdcclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBZHZhbmNpbmcgdG8gR3JvdXA6ICR7bmV4dEdyb3VwSWR9IHwgTmV3IFN0YXR1czogJHtuZXdTdGF0dXN9YCk7XHJcblxyXG4gIC8vIDYuIFBlcmZvcm0gVXBkYXRlXHJcbiAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgc3RhdHVzOiBuZXdTdGF0dXMsXHJcbiAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG5leHRHcm91cElkXHJcbiAgICB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAodXBkYXRlRXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBVcGRhdGUgRmFpbGVkXCIsIHVwZGF0ZUVycm9yKTtcclxuICAgICAgLy8gUmV0dXJuIHRoZSByYXcgZGF0YWJhc2UgZXJyb3IgdG8gdGhlIFVJXHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgREIgVXBkYXRlIEZhaWxlZDogJHt1cGRhdGVFcnJvci5tZXNzYWdlfSAoQ29kZTogJHt1cGRhdGVFcnJvci5jb2RlfSlgIH1cclxuICB9XHJcblxyXG4gIC8vIDcuIExvZyBTdWNjZXNzXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ2FwcHJvdmVkJyxcclxuICAgIGNvbW1lbnQ6ICdBcHByb3ZlZCdcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSAyLiBSRUpFQ1QgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWplY3RSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnVwZGF0ZSh7IHN0YXR1czogJ3JlamVjdGVkJywgY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZDogbnVsbCB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ3JlamVjdGVkJyxcclxuICAgIGNvbW1lbnQ6ICdSZWplY3RlZCBieSBhcHByb3ZlcidcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSAzLiBLSUNLIEJBQ0sgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBraWNrQmFja1JlcG9ydEFjdGlvbihyZXBvcnRJZDogc3RyaW5nLCByZWFzb246IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgLy8gR2V0IHVzZXIncyBncm91cCB0byBtYXJrIHdobyBraWNrZWQgaXQgYmFja1xyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdyb2xlOnJvbGVzKGFwcHJvdmFsX2dyb3VwX2lkKScpXHJcbiAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgIC5zaW5nbGUoKVxyXG4gICAgXHJcbiAgY29uc3QgbXlHcm91cElkID0gKHByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnVwZGF0ZSh7IFxyXG4gICAgICBzdGF0dXM6ICduZWVkc19yZXZpc2lvbicsIFxyXG4gICAgICByZXZpc2lvbl9ieV9ncm91cF9pZDogbXlHcm91cElkIFxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdLaWNrZWQgQmFjayBmb3IgUmV2aXNpb24nLFxyXG4gICAgY29tbWVudDogcmVhc29uXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gNC4gUFVMTCAoQnkgU3VibWl0dGVyKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHB1bGxSZXBvcnQocmVwb3J0SWQ6IHN0cmluZywgY29tbWVudDogc3RyaW5nKSB7XHJcbiAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gIFxyXG4gIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgaWYgKCF1c2VyKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgLy8gMS4gQ2hlY2sgY3VycmVudCBzdGF0dXMgdG8gcHJldmVudCBkb3VibGUtcHVsbGluZ1xyXG4gIGNvbnN0IHsgZGF0YTogY3VycmVudFJlcG9ydCwgZXJyb3I6IGZldGNoRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC5zZWxlY3QoJ3N0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKGZldGNoRXJyb3IgfHwgIWN1cnJlbnRSZXBvcnQpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVwb3J0IG5vdCBmb3VuZCcgfVxyXG4gIH1cclxuXHJcbiAgaWYgKGN1cnJlbnRSZXBvcnQuc3RhdHVzID09PSAncHVsbGVkJykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUaGlzIHJlcG9ydCBpcyBhbHJlYWR5IHB1bGxlZC4nIH1cclxuICB9XHJcblxyXG4gIC8vIDIuIFVwZGF0ZSB0byAnUHVsbGVkJywgWmVybyBEZW1lcml0cywgUmVtb3ZlIGZyb20gQXBwcm92YWwgQ2hhaW5cclxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAudXBkYXRlKHsgXHJcbiAgICAgICAgc3RhdHVzOiAncHVsbGVkJywgLy8gPC0tLSBEaXN0aW5jdCBzdGF0dXNcclxuICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBudWxsLCBcclxuICAgICAgICBkZW1lcml0c19lZmZlY3RpdmU6IDAsIC8vIEVuc3VyZSBubyBkZW1lcml0cyBhcHBseVxyXG4gICAgICAgIHJldmlzaW9uX2J5X2dyb3VwX2lkOiBudWxsIC8vIEVuc3VyZSBpdCBkb2Vzbid0IGFwcGVhciBpbiBhbnlvbmUncyByZXZpc2lvbiBxdWV1ZVxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdQdWxsIEVycm9yOicsIGVycm9yKVxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuICB9XHJcblxyXG4gIC8vIDMuIExvZyB0aGUgYWN0aW9uXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ3B1bGxlZCcsXHJcbiAgICBjb21tZW50OiBjb21tZW50XHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldmFsaWRhdGVQYXRoKCcvcmVwb3J0cy9zdWJtaXR0ZWQnKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gNS4gUkVTVUJNSVQgKFN0YW5kYXJkKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3VibWl0UmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBSZWNhbGN1bGF0ZSBBcHByb3ZlciBDaGFpblxyXG4gICAgY29uc3QgeyBkYXRhOiB1c2VyUHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgICAgIC5zZWxlY3QoJ3JvbGU6cm9sZXMoYXBwcm92YWxfZ3JvdXBfaWQpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBjb25zdCBteUdyb3VwSWQgPSAodXNlclByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuICAgIGxldCB0YXJnZXRHcm91cElkID0gbnVsbFxyXG5cclxuICAgIGlmIChteUdyb3VwSWQpIHtcclxuICAgICAgICBjb25zdCB7IGRhdGE6IG15R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCduZXh0X2FwcHJvdmVyX2dyb3VwX2lkJylcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG15R3JvdXBJZClcclxuICAgICAgICAgICAgLnNpbmdsZSgpXHJcbiAgICAgICAgdGFyZ2V0R3JvdXBJZCA9IG15R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZ19hcHByb3ZhbCdcclxuICAgIGlmIChteUdyb3VwSWQgJiYgIXRhcmdldEdyb3VwSWQpIHtcclxuICAgICAgICBzdGF0dXMgPSAnY29tcGxldGVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiB0YXJnZXRHcm91cElkLCBcclxuICAgICAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ3Jlc3VibWl0dGVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IHJldmlzZWQgYW5kIHJlc3VibWl0dGVkJ1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDYuIEVESVQgJiBBUFBST1ZFIChDb21tYW5kIE92ZXJyaWRlKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRBbmRBcHByb3ZlUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgUGVybWlzc2lvblxyXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhkZWZhdWx0X3JvbGVfbGV2ZWwpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gICAgY29uc3Qgcm9sZUxldmVsID0gKHByb2ZpbGU/LnJvbGUgYXMgYW55KT8uZGVmYXVsdF9yb2xlX2xldmVsIHx8IDBcclxuICAgIGlmIChyb2xlTGV2ZWwgPCA5MCkgcmV0dXJuIHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMnIH1cclxuXHJcbiAgICAvLyBGb3JjZSBDb21wbGV0ZVxyXG4gICAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAgICAgLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIG9mZmVuc2VfdHlwZV9pZDogcGF5bG9hZC5vZmZlbnNlVHlwZUlkLFxyXG4gICAgICAgICAgICBub3RlczogcGF5bG9hZC5ub3RlcyxcclxuICAgICAgICAgICAgcmVwb3J0X2V4cGxhbmF0aW9uOiBwYXlsb2FkLnJlcG9ydEV4cGxhbmF0aW9uLFxyXG4gICAgICAgICAgICBkYXRlX29mX29mZmVuc2U6IHBheWxvYWQuZGF0ZU9mT2ZmZW5zZSxcclxuICAgICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJywgXHJcbiAgICAgICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwsXHJcbiAgICAgICAgICAgIHJldmlzaW9uX2J5X2dyb3VwX2lkOiBudWxsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ2VkaXRlZF9hbmRfYXBwcm92ZWQnLFxyXG4gICAgICAgIGNvbW1lbnQ6ICdSZXBvcnQgZWRpdGVkIGFuZCBpbW1lZGlhdGVseSBhcHByb3ZlZCBieSBhdXRob3JpdHknXHJcbiAgICB9KVxyXG5cclxuICAgIHJldmFsaWRhdGVQYXRoKGAvcmVwb3J0LyR7cmVwb3J0SWR9YClcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJzU0FnR3NCIn0=
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/report/[id]/data:bdfc87 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60192ef86ff1a9f52338794329fc736417cb466ad9":"kickBackReportAction"},"app/report/[id]/actions.ts",""] */ __turbopack_context__.s([
    "kickBackReportAction",
    ()=>kickBackReportAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var kickBackReportAction = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("60192ef86ff1a9f52338794329fc736417cb466ad9", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "kickBackReportAction"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gMS4gQVBQUk9WRSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICAvLyAxLiBDaGVjayBVc2VyXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBObyBhdXRoZW50aWNhdGVkIHVzZXIgZm91bmQuXCIpO1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZDogTm8gdXNlciBzZXNzaW9uLicgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBdHRlbXB0aW5nIGFwcHJvdmFsIGZvciBSZXBvcnQgJHtyZXBvcnRJZH0gYnkgVXNlciAke3VzZXIuaWR9YCk7XHJcblxyXG4gIC8vIDIuIEZldGNoIFVzZXIncyBSb2xlICYgR3JvdXAgKFRoZSBcIktleXNcIiB0byB0aGUgUkxTIFBvbGljeSlcclxuICBjb25zdCB7IGRhdGE6IHVzZXJQcm9maWxlLCBlcnJvcjogcHJvZmlsZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgIC5zZWxlY3QoJ2lkLCByb2xlOnJvbGVzKGlkLCBuYW1lLCBhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKHByb2ZpbGVFcnJvciB8fCAhdXNlclByb2ZpbGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBDb3VsZCBub3QgZmV0Y2ggdXNlciBwcm9maWxlL3JvbGVcIiwgcHJvZmlsZUVycm9yKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBQcm9maWxlIEVycm9yOiAke3Byb2ZpbGVFcnJvcj8ubWVzc2FnZSB8fCAnUHJvZmlsZSBub3QgZm91bmQnfWAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgbXlHcm91cElkID0gKHVzZXJQcm9maWxlLnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWQ7XHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBVc2VyJ3MgR3JvdXAgSUQ6ICR7bXlHcm91cElkfSAoUm9sZTogJHsodXNlclByb2ZpbGUucm9sZSBhcyBhbnkpPy5uYW1lfSlgKTtcclxuXHJcbiAgLy8gMy4gRmV0Y2ggUmVwb3J0IFN0YXRlIChUaGUgXCJMb2NrXCIgb24gdGhlIFJMUyBQb2xpY3kpXHJcbiAgY29uc3QgeyBkYXRhOiByZXBvcnQsIGVycm9yOiByZXBvcnRFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnNlbGVjdCgnaWQsIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQsIHN0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKHJlcG9ydEVycm9yIHx8ICFyZXBvcnQpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBDb3VsZCBub3QgZmV0Y2ggcmVwb3J0XCIsIHJlcG9ydEVycm9yKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBSZXBvcnQgRXJyb3I6ICR7cmVwb3J0RXJyb3I/Lm1lc3NhZ2UgfHwgJ1JlcG9ydCBub3QgZm91bmQnfWAgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBSZXBvcnQncyBDdXJyZW50IEdyb3VwIElEOiAke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfWApO1xyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogUmVwb3J0IFN0YXR1czogJHtyZXBvcnQuc3RhdHVzfWApO1xyXG5cclxuICAvLyA0LiBWRVJJRlkgUEVSTUlTU0lPTiBNQVRDSFxyXG4gIC8vIFRoaXMgaXMgdGhlIGxvZ2ljIHlvdXIgUkxTIFwiVVNJTkdcIiBjbGF1c2UgdXNlcy4gSWYgdGhpcyBpcyBmYWxzZSwgUkxTIHdpbGwgYmxvY2sgeW91LlxyXG4gIGlmIChyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZCAhPT0gbXlHcm91cElkKSB7XHJcbiAgICAgIGNvbnN0IG1zZyA9IGBERUJVRyBNSVNNQVRDSDogVXNlciBHcm91cCAoJHtteUdyb3VwSWR9KSAhPSBSZXBvcnQgR3JvdXAgKCR7cmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWR9KWA7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBQZXJtaXNzaW9uIERlbmllZDogWW91IGFyZSBpbiBncm91cCAke215R3JvdXBJZH0sIGJ1dCByZXBvcnQgaXMgd2l0aCBncm91cCAke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfWAgfTtcclxuICB9XHJcblxyXG4gIC8vIDUuIERldGVybWluZSBOZXh0IFN0ZXBcclxuICBjb25zdCB7IGRhdGE6IGN1cnJlbnRHcm91cCB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgLnNlbGVjdCgnbmV4dF9hcHByb3Zlcl9ncm91cF9pZCcpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgY29uc3QgbmV4dEdyb3VwSWQgPSBjdXJyZW50R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gIGNvbnN0IG5ld1N0YXR1cyA9IG5leHRHcm91cElkID8gJ3BlbmRpbmdfYXBwcm92YWwnIDogJ2NvbXBsZXRlZCdcclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBZHZhbmNpbmcgdG8gR3JvdXA6ICR7bmV4dEdyb3VwSWR9IHwgTmV3IFN0YXR1czogJHtuZXdTdGF0dXN9YCk7XHJcblxyXG4gIC8vIDYuIFBlcmZvcm0gVXBkYXRlXHJcbiAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgc3RhdHVzOiBuZXdTdGF0dXMsXHJcbiAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG5leHRHcm91cElkXHJcbiAgICB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAodXBkYXRlRXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBVcGRhdGUgRmFpbGVkXCIsIHVwZGF0ZUVycm9yKTtcclxuICAgICAgLy8gUmV0dXJuIHRoZSByYXcgZGF0YWJhc2UgZXJyb3IgdG8gdGhlIFVJXHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgREIgVXBkYXRlIEZhaWxlZDogJHt1cGRhdGVFcnJvci5tZXNzYWdlfSAoQ29kZTogJHt1cGRhdGVFcnJvci5jb2RlfSlgIH1cclxuICB9XHJcblxyXG4gIC8vIDcuIExvZyBTdWNjZXNzXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ2FwcHJvdmVkJyxcclxuICAgIGNvbW1lbnQ6ICdBcHByb3ZlZCdcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSAyLiBSRUpFQ1QgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWplY3RSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnVwZGF0ZSh7IHN0YXR1czogJ3JlamVjdGVkJywgY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZDogbnVsbCB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ3JlamVjdGVkJyxcclxuICAgIGNvbW1lbnQ6ICdSZWplY3RlZCBieSBhcHByb3ZlcidcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSAzLiBLSUNLIEJBQ0sgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBraWNrQmFja1JlcG9ydEFjdGlvbihyZXBvcnRJZDogc3RyaW5nLCByZWFzb246IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgLy8gR2V0IHVzZXIncyBncm91cCB0byBtYXJrIHdobyBraWNrZWQgaXQgYmFja1xyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdyb2xlOnJvbGVzKGFwcHJvdmFsX2dyb3VwX2lkKScpXHJcbiAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgIC5zaW5nbGUoKVxyXG4gICAgXHJcbiAgY29uc3QgbXlHcm91cElkID0gKHByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnVwZGF0ZSh7IFxyXG4gICAgICBzdGF0dXM6ICduZWVkc19yZXZpc2lvbicsIFxyXG4gICAgICByZXZpc2lvbl9ieV9ncm91cF9pZDogbXlHcm91cElkIFxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdLaWNrZWQgQmFjayBmb3IgUmV2aXNpb24nLFxyXG4gICAgY29tbWVudDogcmVhc29uXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gNC4gUFVMTCAoQnkgU3VibWl0dGVyKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHB1bGxSZXBvcnQocmVwb3J0SWQ6IHN0cmluZywgY29tbWVudDogc3RyaW5nKSB7XHJcbiAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gIFxyXG4gIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgaWYgKCF1c2VyKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgLy8gMS4gQ2hlY2sgY3VycmVudCBzdGF0dXMgdG8gcHJldmVudCBkb3VibGUtcHVsbGluZ1xyXG4gIGNvbnN0IHsgZGF0YTogY3VycmVudFJlcG9ydCwgZXJyb3I6IGZldGNoRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC5zZWxlY3QoJ3N0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKGZldGNoRXJyb3IgfHwgIWN1cnJlbnRSZXBvcnQpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVwb3J0IG5vdCBmb3VuZCcgfVxyXG4gIH1cclxuXHJcbiAgaWYgKGN1cnJlbnRSZXBvcnQuc3RhdHVzID09PSAncHVsbGVkJykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUaGlzIHJlcG9ydCBpcyBhbHJlYWR5IHB1bGxlZC4nIH1cclxuICB9XHJcblxyXG4gIC8vIDIuIFVwZGF0ZSB0byAnUHVsbGVkJywgWmVybyBEZW1lcml0cywgUmVtb3ZlIGZyb20gQXBwcm92YWwgQ2hhaW5cclxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAudXBkYXRlKHsgXHJcbiAgICAgICAgc3RhdHVzOiAncHVsbGVkJywgLy8gPC0tLSBEaXN0aW5jdCBzdGF0dXNcclxuICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBudWxsLCBcclxuICAgICAgICBkZW1lcml0c19lZmZlY3RpdmU6IDAsIC8vIEVuc3VyZSBubyBkZW1lcml0cyBhcHBseVxyXG4gICAgICAgIHJldmlzaW9uX2J5X2dyb3VwX2lkOiBudWxsIC8vIEVuc3VyZSBpdCBkb2Vzbid0IGFwcGVhciBpbiBhbnlvbmUncyByZXZpc2lvbiBxdWV1ZVxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdQdWxsIEVycm9yOicsIGVycm9yKVxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuICB9XHJcblxyXG4gIC8vIDMuIExvZyB0aGUgYWN0aW9uXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ3B1bGxlZCcsXHJcbiAgICBjb21tZW50OiBjb21tZW50XHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldmFsaWRhdGVQYXRoKCcvcmVwb3J0cy9zdWJtaXR0ZWQnKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gNS4gUkVTVUJNSVQgKFN0YW5kYXJkKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3VibWl0UmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBSZWNhbGN1bGF0ZSBBcHByb3ZlciBDaGFpblxyXG4gICAgY29uc3QgeyBkYXRhOiB1c2VyUHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgICAgIC5zZWxlY3QoJ3JvbGU6cm9sZXMoYXBwcm92YWxfZ3JvdXBfaWQpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBjb25zdCBteUdyb3VwSWQgPSAodXNlclByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuICAgIGxldCB0YXJnZXRHcm91cElkID0gbnVsbFxyXG5cclxuICAgIGlmIChteUdyb3VwSWQpIHtcclxuICAgICAgICBjb25zdCB7IGRhdGE6IG15R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCduZXh0X2FwcHJvdmVyX2dyb3VwX2lkJylcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG15R3JvdXBJZClcclxuICAgICAgICAgICAgLnNpbmdsZSgpXHJcbiAgICAgICAgdGFyZ2V0R3JvdXBJZCA9IG15R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZ19hcHByb3ZhbCdcclxuICAgIGlmIChteUdyb3VwSWQgJiYgIXRhcmdldEdyb3VwSWQpIHtcclxuICAgICAgICBzdGF0dXMgPSAnY29tcGxldGVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiB0YXJnZXRHcm91cElkLCBcclxuICAgICAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ3Jlc3VibWl0dGVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IHJldmlzZWQgYW5kIHJlc3VibWl0dGVkJ1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDYuIEVESVQgJiBBUFBST1ZFIChDb21tYW5kIE92ZXJyaWRlKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRBbmRBcHByb3ZlUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgUGVybWlzc2lvblxyXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhkZWZhdWx0X3JvbGVfbGV2ZWwpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gICAgY29uc3Qgcm9sZUxldmVsID0gKHByb2ZpbGU/LnJvbGUgYXMgYW55KT8uZGVmYXVsdF9yb2xlX2xldmVsIHx8IDBcclxuICAgIGlmIChyb2xlTGV2ZWwgPCA5MCkgcmV0dXJuIHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMnIH1cclxuXHJcbiAgICAvLyBGb3JjZSBDb21wbGV0ZVxyXG4gICAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAgICAgLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIG9mZmVuc2VfdHlwZV9pZDogcGF5bG9hZC5vZmZlbnNlVHlwZUlkLFxyXG4gICAgICAgICAgICBub3RlczogcGF5bG9hZC5ub3RlcyxcclxuICAgICAgICAgICAgcmVwb3J0X2V4cGxhbmF0aW9uOiBwYXlsb2FkLnJlcG9ydEV4cGxhbmF0aW9uLFxyXG4gICAgICAgICAgICBkYXRlX29mX29mZmVuc2U6IHBheWxvYWQuZGF0ZU9mT2ZmZW5zZSxcclxuICAgICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJywgXHJcbiAgICAgICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwsXHJcbiAgICAgICAgICAgIHJldmlzaW9uX2J5X2dyb3VwX2lkOiBudWxsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ2VkaXRlZF9hbmRfYXBwcm92ZWQnLFxyXG4gICAgICAgIGNvbW1lbnQ6ICdSZXBvcnQgZWRpdGVkIGFuZCBpbW1lZGlhdGVseSBhcHByb3ZlZCBieSBhdXRob3JpdHknXHJcbiAgICB9KVxyXG5cclxuICAgIHJldmFsaWRhdGVQYXRoKGAvcmVwb3J0LyR7cmVwb3J0SWR9YClcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJ3U0F3SHNCIn0=
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/report/[id]/data:e88f90 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"601988c3fb101e9d27b98c8bfc536938e860e50edc":"resubmitReport"},"app/report/[id]/actions.ts",""] */ __turbopack_context__.s([
    "resubmitReport",
    ()=>resubmitReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var resubmitReport = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("601988c3fb101e9d27b98c8bfc536938e860e50edc", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "resubmitReport"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gMS4gQVBQUk9WRSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICAvLyAxLiBDaGVjayBVc2VyXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBObyBhdXRoZW50aWNhdGVkIHVzZXIgZm91bmQuXCIpO1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZDogTm8gdXNlciBzZXNzaW9uLicgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBdHRlbXB0aW5nIGFwcHJvdmFsIGZvciBSZXBvcnQgJHtyZXBvcnRJZH0gYnkgVXNlciAke3VzZXIuaWR9YCk7XHJcblxyXG4gIC8vIDIuIEZldGNoIFVzZXIncyBSb2xlICYgR3JvdXAgKFRoZSBcIktleXNcIiB0byB0aGUgUkxTIFBvbGljeSlcclxuICBjb25zdCB7IGRhdGE6IHVzZXJQcm9maWxlLCBlcnJvcjogcHJvZmlsZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgIC5zZWxlY3QoJ2lkLCByb2xlOnJvbGVzKGlkLCBuYW1lLCBhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKHByb2ZpbGVFcnJvciB8fCAhdXNlclByb2ZpbGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBDb3VsZCBub3QgZmV0Y2ggdXNlciBwcm9maWxlL3JvbGVcIiwgcHJvZmlsZUVycm9yKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBQcm9maWxlIEVycm9yOiAke3Byb2ZpbGVFcnJvcj8ubWVzc2FnZSB8fCAnUHJvZmlsZSBub3QgZm91bmQnfWAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgbXlHcm91cElkID0gKHVzZXJQcm9maWxlLnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWQ7XHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBVc2VyJ3MgR3JvdXAgSUQ6ICR7bXlHcm91cElkfSAoUm9sZTogJHsodXNlclByb2ZpbGUucm9sZSBhcyBhbnkpPy5uYW1lfSlgKTtcclxuXHJcbiAgLy8gMy4gRmV0Y2ggUmVwb3J0IFN0YXRlIChUaGUgXCJMb2NrXCIgb24gdGhlIFJMUyBQb2xpY3kpXHJcbiAgY29uc3QgeyBkYXRhOiByZXBvcnQsIGVycm9yOiByZXBvcnRFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnNlbGVjdCgnaWQsIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQsIHN0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKHJlcG9ydEVycm9yIHx8ICFyZXBvcnQpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBDb3VsZCBub3QgZmV0Y2ggcmVwb3J0XCIsIHJlcG9ydEVycm9yKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBSZXBvcnQgRXJyb3I6ICR7cmVwb3J0RXJyb3I/Lm1lc3NhZ2UgfHwgJ1JlcG9ydCBub3QgZm91bmQnfWAgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBSZXBvcnQncyBDdXJyZW50IEdyb3VwIElEOiAke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfWApO1xyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogUmVwb3J0IFN0YXR1czogJHtyZXBvcnQuc3RhdHVzfWApO1xyXG5cclxuICAvLyA0LiBWRVJJRlkgUEVSTUlTU0lPTiBNQVRDSFxyXG4gIC8vIFRoaXMgaXMgdGhlIGxvZ2ljIHlvdXIgUkxTIFwiVVNJTkdcIiBjbGF1c2UgdXNlcy4gSWYgdGhpcyBpcyBmYWxzZSwgUkxTIHdpbGwgYmxvY2sgeW91LlxyXG4gIGlmIChyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZCAhPT0gbXlHcm91cElkKSB7XHJcbiAgICAgIGNvbnN0IG1zZyA9IGBERUJVRyBNSVNNQVRDSDogVXNlciBHcm91cCAoJHtteUdyb3VwSWR9KSAhPSBSZXBvcnQgR3JvdXAgKCR7cmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWR9KWA7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBQZXJtaXNzaW9uIERlbmllZDogWW91IGFyZSBpbiBncm91cCAke215R3JvdXBJZH0sIGJ1dCByZXBvcnQgaXMgd2l0aCBncm91cCAke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfWAgfTtcclxuICB9XHJcblxyXG4gIC8vIDUuIERldGVybWluZSBOZXh0IFN0ZXBcclxuICBjb25zdCB7IGRhdGE6IGN1cnJlbnRHcm91cCB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgLnNlbGVjdCgnbmV4dF9hcHByb3Zlcl9ncm91cF9pZCcpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgY29uc3QgbmV4dEdyb3VwSWQgPSBjdXJyZW50R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gIGNvbnN0IG5ld1N0YXR1cyA9IG5leHRHcm91cElkID8gJ3BlbmRpbmdfYXBwcm92YWwnIDogJ2NvbXBsZXRlZCdcclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBZHZhbmNpbmcgdG8gR3JvdXA6ICR7bmV4dEdyb3VwSWR9IHwgTmV3IFN0YXR1czogJHtuZXdTdGF0dXN9YCk7XHJcblxyXG4gIC8vIDYuIFBlcmZvcm0gVXBkYXRlXHJcbiAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgc3RhdHVzOiBuZXdTdGF0dXMsXHJcbiAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG5leHRHcm91cElkXHJcbiAgICB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAodXBkYXRlRXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBVcGRhdGUgRmFpbGVkXCIsIHVwZGF0ZUVycm9yKTtcclxuICAgICAgLy8gUmV0dXJuIHRoZSByYXcgZGF0YWJhc2UgZXJyb3IgdG8gdGhlIFVJXHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgREIgVXBkYXRlIEZhaWxlZDogJHt1cGRhdGVFcnJvci5tZXNzYWdlfSAoQ29kZTogJHt1cGRhdGVFcnJvci5jb2RlfSlgIH1cclxuICB9XHJcblxyXG4gIC8vIDcuIExvZyBTdWNjZXNzXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ2FwcHJvdmVkJyxcclxuICAgIGNvbW1lbnQ6ICdBcHByb3ZlZCdcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSAyLiBSRUpFQ1QgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWplY3RSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnVwZGF0ZSh7IHN0YXR1czogJ3JlamVjdGVkJywgY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZDogbnVsbCB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ3JlamVjdGVkJyxcclxuICAgIGNvbW1lbnQ6ICdSZWplY3RlZCBieSBhcHByb3ZlcidcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSAzLiBLSUNLIEJBQ0sgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBraWNrQmFja1JlcG9ydEFjdGlvbihyZXBvcnRJZDogc3RyaW5nLCByZWFzb246IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgLy8gR2V0IHVzZXIncyBncm91cCB0byBtYXJrIHdobyBraWNrZWQgaXQgYmFja1xyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdyb2xlOnJvbGVzKGFwcHJvdmFsX2dyb3VwX2lkKScpXHJcbiAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgIC5zaW5nbGUoKVxyXG4gICAgXHJcbiAgY29uc3QgbXlHcm91cElkID0gKHByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnVwZGF0ZSh7IFxyXG4gICAgICBzdGF0dXM6ICduZWVkc19yZXZpc2lvbicsIFxyXG4gICAgICByZXZpc2lvbl9ieV9ncm91cF9pZDogbXlHcm91cElkIFxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdLaWNrZWQgQmFjayBmb3IgUmV2aXNpb24nLFxyXG4gICAgY29tbWVudDogcmVhc29uXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gNC4gUFVMTCAoQnkgU3VibWl0dGVyKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHB1bGxSZXBvcnQocmVwb3J0SWQ6IHN0cmluZywgY29tbWVudDogc3RyaW5nKSB7XHJcbiAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gIFxyXG4gIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgaWYgKCF1c2VyKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgLy8gMS4gQ2hlY2sgY3VycmVudCBzdGF0dXMgdG8gcHJldmVudCBkb3VibGUtcHVsbGluZ1xyXG4gIGNvbnN0IHsgZGF0YTogY3VycmVudFJlcG9ydCwgZXJyb3I6IGZldGNoRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC5zZWxlY3QoJ3N0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKGZldGNoRXJyb3IgfHwgIWN1cnJlbnRSZXBvcnQpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVwb3J0IG5vdCBmb3VuZCcgfVxyXG4gIH1cclxuXHJcbiAgaWYgKGN1cnJlbnRSZXBvcnQuc3RhdHVzID09PSAncHVsbGVkJykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUaGlzIHJlcG9ydCBpcyBhbHJlYWR5IHB1bGxlZC4nIH1cclxuICB9XHJcblxyXG4gIC8vIDIuIFVwZGF0ZSB0byAnUHVsbGVkJywgWmVybyBEZW1lcml0cywgUmVtb3ZlIGZyb20gQXBwcm92YWwgQ2hhaW5cclxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAudXBkYXRlKHsgXHJcbiAgICAgICAgc3RhdHVzOiAncHVsbGVkJywgLy8gPC0tLSBEaXN0aW5jdCBzdGF0dXNcclxuICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBudWxsLCBcclxuICAgICAgICBkZW1lcml0c19lZmZlY3RpdmU6IDAsIC8vIEVuc3VyZSBubyBkZW1lcml0cyBhcHBseVxyXG4gICAgICAgIHJldmlzaW9uX2J5X2dyb3VwX2lkOiBudWxsIC8vIEVuc3VyZSBpdCBkb2Vzbid0IGFwcGVhciBpbiBhbnlvbmUncyByZXZpc2lvbiBxdWV1ZVxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdQdWxsIEVycm9yOicsIGVycm9yKVxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuICB9XHJcblxyXG4gIC8vIDMuIExvZyB0aGUgYWN0aW9uXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ3B1bGxlZCcsXHJcbiAgICBjb21tZW50OiBjb21tZW50XHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldmFsaWRhdGVQYXRoKCcvcmVwb3J0cy9zdWJtaXR0ZWQnKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gNS4gUkVTVUJNSVQgKFN0YW5kYXJkKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3VibWl0UmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBSZWNhbGN1bGF0ZSBBcHByb3ZlciBDaGFpblxyXG4gICAgY29uc3QgeyBkYXRhOiB1c2VyUHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgICAgIC5zZWxlY3QoJ3JvbGU6cm9sZXMoYXBwcm92YWxfZ3JvdXBfaWQpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBjb25zdCBteUdyb3VwSWQgPSAodXNlclByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuICAgIGxldCB0YXJnZXRHcm91cElkID0gbnVsbFxyXG5cclxuICAgIGlmIChteUdyb3VwSWQpIHtcclxuICAgICAgICBjb25zdCB7IGRhdGE6IG15R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCduZXh0X2FwcHJvdmVyX2dyb3VwX2lkJylcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG15R3JvdXBJZClcclxuICAgICAgICAgICAgLnNpbmdsZSgpXHJcbiAgICAgICAgdGFyZ2V0R3JvdXBJZCA9IG15R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZ19hcHByb3ZhbCdcclxuICAgIGlmIChteUdyb3VwSWQgJiYgIXRhcmdldEdyb3VwSWQpIHtcclxuICAgICAgICBzdGF0dXMgPSAnY29tcGxldGVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiB0YXJnZXRHcm91cElkLCBcclxuICAgICAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ3Jlc3VibWl0dGVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IHJldmlzZWQgYW5kIHJlc3VibWl0dGVkJ1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDYuIEVESVQgJiBBUFBST1ZFIChDb21tYW5kIE92ZXJyaWRlKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRBbmRBcHByb3ZlUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgUGVybWlzc2lvblxyXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhkZWZhdWx0X3JvbGVfbGV2ZWwpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gICAgY29uc3Qgcm9sZUxldmVsID0gKHByb2ZpbGU/LnJvbGUgYXMgYW55KT8uZGVmYXVsdF9yb2xlX2xldmVsIHx8IDBcclxuICAgIGlmIChyb2xlTGV2ZWwgPCA5MCkgcmV0dXJuIHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMnIH1cclxuXHJcbiAgICAvLyBGb3JjZSBDb21wbGV0ZVxyXG4gICAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAgICAgLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIG9mZmVuc2VfdHlwZV9pZDogcGF5bG9hZC5vZmZlbnNlVHlwZUlkLFxyXG4gICAgICAgICAgICBub3RlczogcGF5bG9hZC5ub3RlcyxcclxuICAgICAgICAgICAgcmVwb3J0X2V4cGxhbmF0aW9uOiBwYXlsb2FkLnJlcG9ydEV4cGxhbmF0aW9uLFxyXG4gICAgICAgICAgICBkYXRlX29mX29mZmVuc2U6IHBheWxvYWQuZGF0ZU9mT2ZmZW5zZSxcclxuICAgICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJywgXHJcbiAgICAgICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwsXHJcbiAgICAgICAgICAgIHJldmlzaW9uX2J5X2dyb3VwX2lkOiBudWxsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ2VkaXRlZF9hbmRfYXBwcm92ZWQnLFxyXG4gICAgICAgIGNvbW1lbnQ6ICdSZXBvcnQgZWRpdGVkIGFuZCBpbW1lZGlhdGVseSBhcHByb3ZlZCBieSBhdXRob3JpdHknXHJcbiAgICB9KVxyXG5cclxuICAgIHJldmFsaWRhdGVQYXRoKGAvcmVwb3J0LyR7cmVwb3J0SWR9YClcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJrU0ErTXNCIn0=
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/report/[id]/data:ad9d79 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60b2e9c55889ac9c331e7fad367eb309d805d67e0f":"editAndApproveReport"},"app/report/[id]/actions.ts",""] */ __turbopack_context__.s([
    "editAndApproveReport",
    ()=>editAndApproveReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var editAndApproveReport = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("60b2e9c55889ac9c331e7fad367eb309d805d67e0f", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "editAndApproveReport"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gMS4gQVBQUk9WRSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICAvLyAxLiBDaGVjayBVc2VyXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBObyBhdXRoZW50aWNhdGVkIHVzZXIgZm91bmQuXCIpO1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZDogTm8gdXNlciBzZXNzaW9uLicgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBdHRlbXB0aW5nIGFwcHJvdmFsIGZvciBSZXBvcnQgJHtyZXBvcnRJZH0gYnkgVXNlciAke3VzZXIuaWR9YCk7XHJcblxyXG4gIC8vIDIuIEZldGNoIFVzZXIncyBSb2xlICYgR3JvdXAgKFRoZSBcIktleXNcIiB0byB0aGUgUkxTIFBvbGljeSlcclxuICBjb25zdCB7IGRhdGE6IHVzZXJQcm9maWxlLCBlcnJvcjogcHJvZmlsZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ3Byb2ZpbGVzJylcclxuICAgIC5zZWxlY3QoJ2lkLCByb2xlOnJvbGVzKGlkLCBuYW1lLCBhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKHByb2ZpbGVFcnJvciB8fCAhdXNlclByb2ZpbGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBDb3VsZCBub3QgZmV0Y2ggdXNlciBwcm9maWxlL3JvbGVcIiwgcHJvZmlsZUVycm9yKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBQcm9maWxlIEVycm9yOiAke3Byb2ZpbGVFcnJvcj8ubWVzc2FnZSB8fCAnUHJvZmlsZSBub3QgZm91bmQnfWAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgbXlHcm91cElkID0gKHVzZXJQcm9maWxlLnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWQ7XHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBVc2VyJ3MgR3JvdXAgSUQ6ICR7bXlHcm91cElkfSAoUm9sZTogJHsodXNlclByb2ZpbGUucm9sZSBhcyBhbnkpPy5uYW1lfSlgKTtcclxuXHJcbiAgLy8gMy4gRmV0Y2ggUmVwb3J0IFN0YXRlIChUaGUgXCJMb2NrXCIgb24gdGhlIFJMUyBQb2xpY3kpXHJcbiAgY29uc3QgeyBkYXRhOiByZXBvcnQsIGVycm9yOiByZXBvcnRFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnNlbGVjdCgnaWQsIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQsIHN0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKHJlcG9ydEVycm9yIHx8ICFyZXBvcnQpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBDb3VsZCBub3QgZmV0Y2ggcmVwb3J0XCIsIHJlcG9ydEVycm9yKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBSZXBvcnQgRXJyb3I6ICR7cmVwb3J0RXJyb3I/Lm1lc3NhZ2UgfHwgJ1JlcG9ydCBub3QgZm91bmQnfWAgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBSZXBvcnQncyBDdXJyZW50IEdyb3VwIElEOiAke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfWApO1xyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogUmVwb3J0IFN0YXR1czogJHtyZXBvcnQuc3RhdHVzfWApO1xyXG5cclxuICAvLyA0LiBWRVJJRlkgUEVSTUlTU0lPTiBNQVRDSFxyXG4gIC8vIFRoaXMgaXMgdGhlIGxvZ2ljIHlvdXIgUkxTIFwiVVNJTkdcIiBjbGF1c2UgdXNlcy4gSWYgdGhpcyBpcyBmYWxzZSwgUkxTIHdpbGwgYmxvY2sgeW91LlxyXG4gIGlmIChyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZCAhPT0gbXlHcm91cElkKSB7XHJcbiAgICAgIGNvbnN0IG1zZyA9IGBERUJVRyBNSVNNQVRDSDogVXNlciBHcm91cCAoJHtteUdyb3VwSWR9KSAhPSBSZXBvcnQgR3JvdXAgKCR7cmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWR9KWA7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcclxuICAgICAgcmV0dXJuIHsgZXJyb3I6IGBQZXJtaXNzaW9uIERlbmllZDogWW91IGFyZSBpbiBncm91cCAke215R3JvdXBJZH0sIGJ1dCByZXBvcnQgaXMgd2l0aCBncm91cCAke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfWAgfTtcclxuICB9XHJcblxyXG4gIC8vIDUuIERldGVybWluZSBOZXh0IFN0ZXBcclxuICBjb25zdCB7IGRhdGE6IGN1cnJlbnRHcm91cCB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgLnNlbGVjdCgnbmV4dF9hcHByb3Zlcl9ncm91cF9pZCcpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgY29uc3QgbmV4dEdyb3VwSWQgPSBjdXJyZW50R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gIGNvbnN0IG5ld1N0YXR1cyA9IG5leHRHcm91cElkID8gJ3BlbmRpbmdfYXBwcm92YWwnIDogJ2NvbXBsZXRlZCdcclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBZHZhbmNpbmcgdG8gR3JvdXA6ICR7bmV4dEdyb3VwSWR9IHwgTmV3IFN0YXR1czogJHtuZXdTdGF0dXN9YCk7XHJcblxyXG4gIC8vIDYuIFBlcmZvcm0gVXBkYXRlXHJcbiAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgc3RhdHVzOiBuZXdTdGF0dXMsXHJcbiAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG5leHRHcm91cElkXHJcbiAgICB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAodXBkYXRlRXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBVcGRhdGUgRmFpbGVkXCIsIHVwZGF0ZUVycm9yKTtcclxuICAgICAgLy8gUmV0dXJuIHRoZSByYXcgZGF0YWJhc2UgZXJyb3IgdG8gdGhlIFVJXHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgREIgVXBkYXRlIEZhaWxlZDogJHt1cGRhdGVFcnJvci5tZXNzYWdlfSAoQ29kZTogJHt1cGRhdGVFcnJvci5jb2RlfSlgIH1cclxuICB9XHJcblxyXG4gIC8vIDcuIExvZyBTdWNjZXNzXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ2FwcHJvdmVkJyxcclxuICAgIGNvbW1lbnQ6ICdBcHByb3ZlZCdcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSAyLiBSRUpFQ1QgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWplY3RSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnVwZGF0ZSh7IHN0YXR1czogJ3JlamVjdGVkJywgY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZDogbnVsbCB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ3JlamVjdGVkJyxcclxuICAgIGNvbW1lbnQ6ICdSZWplY3RlZCBieSBhcHByb3ZlcidcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSAzLiBLSUNLIEJBQ0sgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBraWNrQmFja1JlcG9ydEFjdGlvbihyZXBvcnRJZDogc3RyaW5nLCByZWFzb246IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgLy8gR2V0IHVzZXIncyBncm91cCB0byBtYXJrIHdobyBraWNrZWQgaXQgYmFja1xyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdyb2xlOnJvbGVzKGFwcHJvdmFsX2dyb3VwX2lkKScpXHJcbiAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgIC5zaW5nbGUoKVxyXG4gICAgXHJcbiAgY29uc3QgbXlHcm91cElkID0gKHByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgLnVwZGF0ZSh7IFxyXG4gICAgICBzdGF0dXM6ICduZWVkc19yZXZpc2lvbicsIFxyXG4gICAgICByZXZpc2lvbl9ieV9ncm91cF9pZDogbXlHcm91cElkIFxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdLaWNrZWQgQmFjayBmb3IgUmV2aXNpb24nLFxyXG4gICAgY29tbWVudDogcmVhc29uXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gNC4gUFVMTCAoQnkgU3VibWl0dGVyKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHB1bGxSZXBvcnQocmVwb3J0SWQ6IHN0cmluZywgY29tbWVudDogc3RyaW5nKSB7XHJcbiAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gIFxyXG4gIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgaWYgKCF1c2VyKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgLy8gMS4gQ2hlY2sgY3VycmVudCBzdGF0dXMgdG8gcHJldmVudCBkb3VibGUtcHVsbGluZ1xyXG4gIGNvbnN0IHsgZGF0YTogY3VycmVudFJlcG9ydCwgZXJyb3I6IGZldGNoRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC5zZWxlY3QoJ3N0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKGZldGNoRXJyb3IgfHwgIWN1cnJlbnRSZXBvcnQpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnUmVwb3J0IG5vdCBmb3VuZCcgfVxyXG4gIH1cclxuXHJcbiAgaWYgKGN1cnJlbnRSZXBvcnQuc3RhdHVzID09PSAncHVsbGVkJykge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUaGlzIHJlcG9ydCBpcyBhbHJlYWR5IHB1bGxlZC4nIH1cclxuICB9XHJcblxyXG4gIC8vIDIuIFVwZGF0ZSB0byAnUHVsbGVkJywgWmVybyBEZW1lcml0cywgUmVtb3ZlIGZyb20gQXBwcm92YWwgQ2hhaW5cclxuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAudXBkYXRlKHsgXHJcbiAgICAgICAgc3RhdHVzOiAncHVsbGVkJywgLy8gPC0tLSBEaXN0aW5jdCBzdGF0dXNcclxuICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBudWxsLCBcclxuICAgICAgICBkZW1lcml0c19lZmZlY3RpdmU6IDAsIC8vIEVuc3VyZSBubyBkZW1lcml0cyBhcHBseVxyXG4gICAgICAgIHJldmlzaW9uX2J5X2dyb3VwX2lkOiBudWxsIC8vIEVuc3VyZSBpdCBkb2Vzbid0IGFwcGVhciBpbiBhbnlvbmUncyByZXZpc2lvbiBxdWV1ZVxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdQdWxsIEVycm9yOicsIGVycm9yKVxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuICB9XHJcblxyXG4gIC8vIDMuIExvZyB0aGUgYWN0aW9uXHJcbiAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgIHJlcG9ydF9pZDogcmVwb3J0SWQsXHJcbiAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgIGFjdGlvbjogJ3B1bGxlZCcsXHJcbiAgICBjb21tZW50OiBjb21tZW50XHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldmFsaWRhdGVQYXRoKCcvcmVwb3J0cy9zdWJtaXR0ZWQnKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gNS4gUkVTVUJNSVQgKFN0YW5kYXJkKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3VibWl0UmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBSZWNhbGN1bGF0ZSBBcHByb3ZlciBDaGFpblxyXG4gICAgY29uc3QgeyBkYXRhOiB1c2VyUHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgICAgIC5zZWxlY3QoJ3JvbGU6cm9sZXMoYXBwcm92YWxfZ3JvdXBfaWQpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBjb25zdCBteUdyb3VwSWQgPSAodXNlclByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuICAgIGxldCB0YXJnZXRHcm91cElkID0gbnVsbFxyXG5cclxuICAgIGlmIChteUdyb3VwSWQpIHtcclxuICAgICAgICBjb25zdCB7IGRhdGE6IG15R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCduZXh0X2FwcHJvdmVyX2dyb3VwX2lkJylcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG15R3JvdXBJZClcclxuICAgICAgICAgICAgLnNpbmdsZSgpXHJcbiAgICAgICAgdGFyZ2V0R3JvdXBJZCA9IG15R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZ19hcHByb3ZhbCdcclxuICAgIGlmIChteUdyb3VwSWQgJiYgIXRhcmdldEdyb3VwSWQpIHtcclxuICAgICAgICBzdGF0dXMgPSAnY29tcGxldGVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiB0YXJnZXRHcm91cElkLCBcclxuICAgICAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ3Jlc3VibWl0dGVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IHJldmlzZWQgYW5kIHJlc3VibWl0dGVkJ1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDYuIEVESVQgJiBBUFBST1ZFIChDb21tYW5kIE92ZXJyaWRlKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRBbmRBcHByb3ZlUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgUGVybWlzc2lvblxyXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhkZWZhdWx0X3JvbGVfbGV2ZWwpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gICAgY29uc3Qgcm9sZUxldmVsID0gKHByb2ZpbGU/LnJvbGUgYXMgYW55KT8uZGVmYXVsdF9yb2xlX2xldmVsIHx8IDBcclxuICAgIGlmIChyb2xlTGV2ZWwgPCA5MCkgcmV0dXJuIHsgZXJyb3I6ICdJbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMnIH1cclxuXHJcbiAgICAvLyBGb3JjZSBDb21wbGV0ZVxyXG4gICAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAgICAgLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIG9mZmVuc2VfdHlwZV9pZDogcGF5bG9hZC5vZmZlbnNlVHlwZUlkLFxyXG4gICAgICAgICAgICBub3RlczogcGF5bG9hZC5ub3RlcyxcclxuICAgICAgICAgICAgcmVwb3J0X2V4cGxhbmF0aW9uOiBwYXlsb2FkLnJlcG9ydEV4cGxhbmF0aW9uLFxyXG4gICAgICAgICAgICBkYXRlX29mX29mZmVuc2U6IHBheWxvYWQuZGF0ZU9mT2ZmZW5zZSxcclxuICAgICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJywgXHJcbiAgICAgICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwsXHJcbiAgICAgICAgICAgIHJldmlzaW9uX2J5X2dyb3VwX2lkOiBudWxsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ2VkaXRlZF9hbmRfYXBwcm92ZWQnLFxyXG4gICAgICAgIGNvbW1lbnQ6ICdSZXBvcnQgZWRpdGVkIGFuZCBpbW1lZGlhdGVseSBhcHByb3ZlZCBieSBhdXRob3JpdHknXHJcbiAgICB9KVxyXG5cclxuICAgIHJldmFsaWRhdGVQYXRoKGAvcmVwb3J0LyR7cmVwb3J0SWR9YClcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJ3U0E2UXNCIn0=
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/report/[id]/ReportDetailsClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReportDetailsClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"); // Added useEffect
// UPDATED: Path matches your submit/page.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SearchableSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/SearchableSelect.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$820111__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/report/[id]/data:820111 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$ed41c7__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/report/[id]/data:ed41c7 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$f970a5__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/report/[id]/data:f970a5 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$bdfc87__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/report/[id]/data:bdfc87 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$e88f90__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/report/[id]/data:e88f90 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$ad9d79__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/report/[id]/data:ad9d79 [app-client] (ecmascript) <text/javascript>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function ReportDetailsClient({ user, initialReport, initialLogs, initialAppeal, permissions, userProfile }) {
    _s();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    // State
    const [report, setReport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialReport);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialLogs);
    const [appeal, setAppeal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialAppeal);
    // NEW: Store offenses in state (Client Side Fetch)
    const [offensesList, setOffensesList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isActionLoading, setActionLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { isSubmitter, isSubject, isApprover, canActOnAppeal, canPull } = permissions;
    // Modes
    const [isEditing, setIsEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editIntent, setEditIntent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('resubmit');
    const [isAppealing, setIsAppealing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isEscalating, setIsEscalating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Inputs
    const [editableOffenseId, setEditableOffenseId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialReport.offense_type_id);
    const [editableNotes, setEditableNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialReport.notes || '');
    const [editableExplanation, setEditableExplanation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialReport.report_explanation || '');
    const dt = new Date(initialReport.date_of_offense);
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const [editableDate, setEditableDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(`${year}-${month}-${day}`);
    const [editableTime, setEditableTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(dt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }));
    const [appealJustification, setAppealJustification] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [comment, setComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [appealComment, setAppealComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isPullModalOpen, setIsPullModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pullComment, setPullComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const roleLevel = userProfile?.role?.default_role_level || 0;
    const isCommandant = roleLevel >= 90;
    const userRole = userProfile?.role?.role_name || userProfile?.role?.name || '';
    // --- NEW: FETCH OFFENSES (Matches submit/page.tsx logic) ---
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReportDetailsClient.useEffect": ()=>{
            async function fetchOffenses() {
                const { data } = await supabase.from('offense_types').select('*').order('policy_category', {
                    ascending: true
                }).order('offense_group', {
                    ascending: true
                }).order('offense_code', {
                    ascending: true
                });
                if (data) {
                    setOffensesList(data);
                }
            }
            fetchOffenses();
        }
    }["ReportDetailsClient.useEffect"], []); // Runs once on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReportDetailsClient.useEffect": ()=>{
            setReport(initialReport);
        }
    }["ReportDetailsClient.useEffect"], [
        initialReport
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReportDetailsClient.useEffect": ()=>{
            setLogs(initialLogs);
        }
    }["ReportDetailsClient.useEffect"], [
        initialLogs
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReportDetailsClient.useEffect": ()=>{
            setAppeal(initialAppeal);
        }
    }["ReportDetailsClient.useEffect"], [
        initialAppeal
    ]);
    // --- PREPARE OFFENSE OPTIONS (Matches submit/page.tsx logic) ---
    const offenseOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ReportDetailsClient.useMemo[offenseOptions]": ()=>{
            return offensesList.map({
                "ReportDetailsClient.useMemo[offenseOptions]": (o)=>({
                        id: o.id,
                        label: `[${o.offense_code}] ${o.offense_name} (${o.demerits})`,
                        group: o.offense_group
                    })
            }["ReportDetailsClient.useMemo[offenseOptions]"]);
        }
    }["ReportDetailsClient.useMemo[offenseOptions]"], [
        offensesList
    ]);
    // --- ACTIONS ---
    async function handleApprovalAction(action) {
        if (!confirm(`Are you sure you want to ${action}?`)) return;
        if ((action === 'reject' || action === 'kickback') && !comment) {
            alert("Comment required.");
            return;
        }
        setActionLoading(true);
        let result;
        if (action === 'approve') result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$ed41c7__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["approveReportAction"])(report.id);
        else if (action === 'reject') result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$f970a5__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["rejectReportAction"])(report.id);
        else result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$bdfc87__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["kickBackReportAction"])(report.id, comment);
        if (result?.error) {
            alert(result.error);
            setActionLoading(false);
        } else {
            router.refresh();
        }
    }
    async function handleSubmitEdit(e) {
        e.preventDefault();
        setActionLoading(true);
        const localDateTime = new Date(`${editableDate}T${editableTime}:00`);
        const fullTimestamp = localDateTime.toISOString();
        const payload = {
            offenseTypeId: editableOffenseId,
            notes: editableNotes,
            reportExplanation: editableExplanation,
            dateOfOffense: fullTimestamp
        };
        let result;
        if (editIntent === 'approve') result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$ad9d79__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["editAndApproveReport"])(report.id, payload);
        else result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$e88f90__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["resubmitReport"])(report.id, payload);
        if (result.error) {
            alert(result.error);
            setActionLoading(false);
        } else {
            setIsEditing(false);
            router.refresh();
        }
    }
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
            setActionLoading(false);
            setIsAppealing(false);
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
                alert(action === 'grant' ? "Appeal granted." : "Appeal rejected.");
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
    async function handlePullReport() {
        if (!pullComment.trim()) {
            alert("A comment is required.");
            return;
        }
        setActionLoading(true);
        // REMINDER: Update your actions.ts pullReport function to accept (reportId, comment)
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$820111__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["pullReport"])(report.id, pullComment);
        if (result?.error) {
            alert(`Error : ${result.error}`);
            setActionLoading(false);
        } else {
            alert("Report pulled.");
            router.refresh();
            setIsPullModalOpen(false);
        }
    }
    const formatName = (person)=>person ? `${person.last_name}, ${person.first_name.charAt(0)}.` : 'N/A';
    // 1. Update Badge Text
    const formatStatus = (status)=>{
        if (status === 'completed') return 'Approved';
        if (status === 'needs_revision') return 'Revision Requested';
        if (status === 'pulled') return 'Pulled'; // Clear indication it is void
        return status.replace('_', ' ');
    };
    const formatAppealStatus = (status)=>status.replace(/_/g, ' ');
    // 2. Ensure badge color handles 'Pulled' (Gray/Neutral)
    const getStatusColor = (status)=>{
        if (status === 'completed') return 'bg-green-500/10 text-green-600 border-green-200';
        if (status === 'rejected') return 'bg-destructive/10 text-destructive border-destructive/20';
        if (status === 'pulled') return 'bg-gray-500/10 text-gray-600 border-gray-200'; // Neutral gray for pulled
        return 'bg-orange-500/10 text-orange-600 border-orange-200';
    };
    const showActionBox = isApprover && report.status === 'pending_approval' && !isEditing && !isAppealing;
    const showRevisionBox = isSubmitter && report.status === 'needs_revision' && !isEditing;
    // 3. LOCK EDITING: Ensure 'Pulled' is NOT in this logic
    const canEdit = isSubmitter && report.status === 'needs_revision' || isApprover && report.status === 'pending_approval' || userRole === 'Admin';
    // 4. Hide Pull Button if already pulled
    const showPullButton = canPull && report.status !== 'pulled' && report.status !== 'completed';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6",
        children: [
            isEditing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-card border border-border p-6 rounded-lg shadow-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmitEdit,
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold text-foreground flex items-center gap-2",
                            children: editIntent === 'approve' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-primary",
                                children: "Edit & Approve"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 296,
                                columnNumber: 45
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Edit Report"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 296,
                                columnNumber: 100
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 295,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-foreground",
                                            children: "Date"
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 300,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "date",
                                            value: editableDate,
                                            onChange: (e)=>setEditableDate(e.target.value),
                                            required: true,
                                            className: "input-base w-full"
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 301,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 299,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-foreground",
                                            children: "Time"
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 304,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "time",
                                            value: editableTime,
                                            onChange: (e)=>setEditableTime(e.target.value),
                                            required: true,
                                            className: "input-base w-full"
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 305,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 303,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 298,
                            columnNumber: 14
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SearchableSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                label: "Infraction",
                                options: offenseOptions,
                                value: editableOffenseId,
                                onChange: setEditableOffenseId,
                                placeholder: "Search for an infraction...",
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 310,
                                columnNumber: 16
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 308,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-foreground",
                                    children: "Explanation"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 320,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: editableExplanation,
                                    onChange: (e)=>setEditableExplanation(e.target.value),
                                    rows: 4,
                                    className: "input-base w-full",
                                    placeholder: "Detailed explanation..."
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 321,
                                    columnNumber: 16
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 319,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-foreground",
                                    children: "Notes (Internal)"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 324,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: editableNotes,
                                    onChange: (e)=>setEditableNotes(e.target.value),
                                    rows: 2,
                                    className: "input-base w-full"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 325,
                                    columnNumber: 16
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 323,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setIsEditing(false),
                                    disabled: isActionLoading,
                                    className: "w-1/2 py-2 border border-input rounded-md text-foreground hover:bg-accent",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 328,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: isActionLoading,
                                    className: `w-1/2 py-2 text-primary-foreground rounded-md shadow ${editIntent === 'approve' ? 'bg-primary hover:bg-primary/90' : 'bg-primary hover:bg-primary/90'} disabled:opacity-50`,
                                    children: isActionLoading ? 'Saving...' : editIntent === 'approve' ? 'Confirm & Approve' : 'Resubmit'
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 329,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 327,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                    lineNumber: 294,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 293,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-card border border-border p-6 rounded-lg shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col md:flex-row justify-between ...",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl md:text-3xl font-bold text-foreground",
                                children: report.offense_type.offense_name
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 342,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`,
                                children: formatStatus(report.status)
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 345,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 341,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border pt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-muted-foreground",
                                        children: "Subject"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 352,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg text-foreground",
                                        children: formatName(report.subject)
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 352,
                                        columnNumber: 88
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 352,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-muted-foreground",
                                        children: "Submitted By"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 353,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg text-foreground",
                                        children: formatName(report.submitter)
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 353,
                                        columnNumber: 93
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 353,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-muted-foreground",
                                        children: "Date & Time"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 354,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg text-foreground",
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDateTime"])(report.date_of_offense).toLocaleString()
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 354,
                                        columnNumber: 92
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 354,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-muted-foreground",
                                        children: "Category"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 355,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg text-foreground",
                                        children: [
                                            "Cat ",
                                            report.offense_type.offense_code
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 355,
                                        columnNumber: 89
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 355,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-muted-foreground",
                                        children: "Demerits"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 356,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg font-bold text-destructive",
                                        children: report.demerits_effective
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 356,
                                        columnNumber: 89
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 356,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 351,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-medium text-muted-foreground",
                                children: "Green Sheet Summary"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 359,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-1 p-3 bg-muted/50 rounded text-foreground text-sm border border-border",
                                children: report.notes || 'None'
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 359,
                                columnNumber: 115
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 359,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-medium text-muted-foreground",
                                children: "Detailed Narrative"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 360,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-1 p-3 bg-muted/50 rounded text-foreground text-sm border border-border whitespace-pre-wrap",
                                children: report.report_explanation || 'None'
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 360,
                                columnNumber: 114
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 360,
                        columnNumber: 11
                    }, this),
                    appeal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-primary/5 border-l-4 border-primary p-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-medium text-foreground",
                                            children: "Appeal Status"
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 367,
                                            columnNumber: 27
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-bold text-primary uppercase tracking-wider",
                                            children: formatAppealStatus(appeal.status)
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 368,
                                            columnNumber: 27
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 366,
                                    columnNumber: 23
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 365,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-muted/30 p-4 rounded-lg border border-border space-y-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pl-4 border-l-2 border-muted-foreground",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs uppercase font-semibold text-muted-foreground",
                                            children: "Cadet Justification"
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 375,
                                            columnNumber: 27
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-foreground whitespace-pre-wrap",
                                            children: appeal.justification
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 376,
                                            columnNumber: 27
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 374,
                                    columnNumber: 23
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 373,
                                columnNumber: 19
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 364,
                        columnNumber: 15
                    }, this),
                    showActionBox && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 border-t border-border pt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-medium text-foreground mb-4",
                                children: "Actions"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 385,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                placeholder: "Add a comment...",
                                value: comment,
                                onChange: (e)=>setComment(e.target.value),
                                className: "input-base w-full mb-4",
                                rows: 3
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 386,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleApprovalAction('approve'),
                                        disabled: isActionLoading,
                                        className: "flex-1 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50",
                                        children: "Approve"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 388,
                                        columnNumber: 21
                                    }, this),
                                    isCommandant && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setEditIntent('approve');
                                            setIsEditing(true);
                                        },
                                        disabled: isActionLoading,
                                        className: "flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2",
                                        children: "Edit & Approve"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 391,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleApprovalAction('kickback'),
                                        disabled: isActionLoading,
                                        className: "flex-1 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50",
                                        children: "Kick Back"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 400,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleApprovalAction('reject'),
                                        disabled: isActionLoading,
                                        className: "flex-1 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50",
                                        children: "Reject"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 401,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 387,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 384,
                        columnNumber: 13
                    }, this),
                    showRevisionBox && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 bg-orange-500/10 border border-orange-500/30 p-4 rounded",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-medium text-orange-700 dark:text-orange-300",
                                children: "Needs Revision"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 409,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm mt-1 mb-3 text-orange-600 dark:text-orange-400",
                                children: "Please edit and resubmit this report."
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 410,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setEditIntent('resubmit');
                                    setIsEditing(true);
                                },
                                className: "py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90",
                                children: "Edit & Resubmit"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 411,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 408,
                        columnNumber: 13
                    }, this),
                    showPullButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setIsPullModalOpen(true),
                        className: "inline-flex items-center...",
                        children: "Pull Report"
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 417,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 339,
                columnNumber: 9
            }, this),
            !isEditing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-card border border-border p-6 rounded-lg shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-medium text-foreground mb-4",
                        children: "History"
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 430,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "space-y-4",
                        children: logs.length > 0 ? logs.map((log)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "border-b border-border pb-4 last:border-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-medium text-foreground",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: formatName(log.actor)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                        lineNumber: 435,
                                                        columnNumber: 75
                                                    }, this),
                                                    ": ",
                                                    log.action
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 435,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-muted-foreground",
                                                children: new Date(log.created_at).toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 436,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 434,
                                        columnNumber: 19
                                    }, this),
                                    log.comment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-2 text-sm bg-muted/50 p-2 rounded text-muted-foreground",
                                        children: [
                                            '"',
                                            log.comment,
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 438,
                                        columnNumber: 35
                                    }, this)
                                ]
                            }, log.id, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 433,
                                columnNumber: 17
                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-muted-foreground",
                            children: "No history yet."
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 440,
                            columnNumber: 20
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 431,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 429,
                columnNumber: 11
            }, this),
            isPullModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-card p-6 rounded-lg shadow-xl max-w-lg w-full border border-border",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold text-foreground",
                            children: "Pull Report"
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 449,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                            rows: 3,
                            value: pullComment,
                            onChange: (e)=>setPullComment(e.target.value),
                            className: "mt-4 block w-full input-base",
                            placeholder: "Reason for pulling..."
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 450,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-6 flex gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsPullModalOpen(false),
                                    className: "w-1/2 py-2 border border-input rounded text-foreground hover:bg-accent",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 458,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handlePullReport,
                                    disabled: !pullComment.trim(),
                                    className: "w-1/2 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50",
                                    children: "Confirm Pull"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 459,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 457,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                    lineNumber: 448,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 447,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
        lineNumber: 289,
        columnNumber: 5
    }, this);
}
_s(ReportDetailsClient, "vHCCMUs0e/7RX//Z81zLnvKSn9s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ReportDetailsClient;
var _c;
__turbopack_context__.k.register(_c, "ReportDetailsClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_cd72786b._.js.map