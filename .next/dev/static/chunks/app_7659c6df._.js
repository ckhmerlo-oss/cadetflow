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
"[project]/app/report/[id]/data:b8185f [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60415971ff989601457ebc0244a4a8ff71b4be2994":"pullReport"},"app/report/[id]/actions.ts",""] */ __turbopack_context__.s([
    "pullReport",
    ()=>pullReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var pullReport = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("60415971ff989601457ebc0244a4a8ff71b4be2994", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "pullReport"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gMS4gQVBQUk9WRSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICAvLyAxLiBDaGVjayBVc2VyXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBObyBhdXRoZW50aWNhdGVkIHVzZXIgZm91bmQuXCIpO1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZDogTm8gdXNlciBzZXNzaW9uLicgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBdHRlbXB0aW5nIGFwcHJvdmFsIGZvciBSZXBvcnQgJHtyZXBvcnRJZH0gYnkgVXNlciAke3VzZXIuaWR9YCk7XHJcblxyXG4gIC8vIDIuIEZldGNoIFVzZXIncyBSb2xlICYgR3JvdXBcclxuICAvLyBGSVg6IENoYW5nZWQgJ25hbWUnIHRvICdyb2xlX25hbWUnIGluIHRoZSBzZWxlY3Qgc3RyaW5nXHJcbiAgY29uc3QgeyBkYXRhOiB1c2VyUHJvZmlsZSwgZXJyb3I6IHByb2ZpbGVFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdpZCwgcm9sZTpyb2xlcyhpZCwgcm9sZV9uYW1lLCBhcHByb3ZhbF9ncm91cF9pZCknKSBcclxuICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgLmVxKCdhcmNoaXZlZCcsIGZhbHNlKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChwcm9maWxlRXJyb3IgfHwgIXVzZXJQcm9maWxlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogQ291bGQgbm90IGZldGNoIHVzZXIgcHJvZmlsZS9yb2xlXCIsIHByb2ZpbGVFcnJvcik7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUHJvZmlsZSBFcnJvcjogJHtwcm9maWxlRXJyb3I/Lm1lc3NhZ2UgfHwgJ1Byb2ZpbGUgbm90IGZvdW5kJ31gIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IG15R3JvdXBJZCA9ICh1c2VyUHJvZmlsZS5yb2xlIGFzIGFueSk/LmFwcHJvdmFsX2dyb3VwX2lkO1xyXG4gIFxyXG4gIC8vIEZJWDogVXBkYXRlZCB0aGUgbG9nIHRvIHJlYWQgJ3JvbGVfbmFtZSdcclxuICBjb25zb2xlLmxvZyhgREVCVUc6IFVzZXIncyBHcm91cCBJRDogJHtteUdyb3VwSWR9IChSb2xlOiAkeyh1c2VyUHJvZmlsZS5yb2xlIGFzIGFueSk/LnJvbGVfbmFtZX0pYCk7XHJcblxyXG4gIC8vIDMuIEZldGNoIFJlcG9ydCBTdGF0ZSAoVGhlIFwiTG9ja1wiIG9uIHRoZSBSTFMgUG9saWN5KVxyXG4gIGNvbnN0IHsgZGF0YTogcmVwb3J0LCBlcnJvcjogcmVwb3J0RXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC5zZWxlY3QoJ2lkLCBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkLCBzdGF0dXMnKVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChyZXBvcnRFcnJvciB8fCAhcmVwb3J0KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogQ291bGQgbm90IGZldGNoIHJlcG9ydFwiLCByZXBvcnRFcnJvcik7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUmVwb3J0IEVycm9yOiAke3JlcG9ydEVycm9yPy5tZXNzYWdlIHx8ICdSZXBvcnQgbm90IGZvdW5kJ31gIH1cclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogUmVwb3J0J3MgQ3VycmVudCBHcm91cCBJRDogJHtyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZH1gKTtcclxuICBjb25zb2xlLmxvZyhgREVCVUc6IFJlcG9ydCBTdGF0dXM6ICR7cmVwb3J0LnN0YXR1c31gKTtcclxuXHJcbiAgLy8gNC4gVkVSSUZZIFBFUk1JU1NJT04gTUFUQ0hcclxuICAvLyBUaGlzIGlzIHRoZSBsb2dpYyB5b3VyIFJMUyBcIlVTSU5HXCIgY2xhdXNlIHVzZXMuIElmIHRoaXMgaXMgZmFsc2UsIFJMUyB3aWxsIGJsb2NrIHlvdS5cclxuICBpZiAocmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQgIT09IG15R3JvdXBJZCkge1xyXG4gICAgICBjb25zdCBtc2cgPSBgREVCVUcgTUlTTUFUQ0g6IFVzZXIgR3JvdXAgKCR7bXlHcm91cElkfSkgIT0gUmVwb3J0IEdyb3VwICgke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfSlgO1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1zZyk7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBhcmUgaW4gZ3JvdXAgJHtteUdyb3VwSWR9LCBidXQgcmVwb3J0IGlzIHdpdGggZ3JvdXAgJHtyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZH1gIH07XHJcbiAgfVxyXG5cclxuICAvLyA1LiBEZXRlcm1pbmUgTmV4dCBTdGVwXHJcbiAgY29uc3QgeyBkYXRhOiBjdXJyZW50R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnYXBwcm92YWxfZ3JvdXBzJylcclxuICAgIC5zZWxlY3QoJ25leHRfYXBwcm92ZXJfZ3JvdXBfaWQnKVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGNvbnN0IG5leHRHcm91cElkID0gY3VycmVudEdyb3VwPy5uZXh0X2FwcHJvdmVyX2dyb3VwX2lkIHx8IG51bGxcclxuICBjb25zdCBuZXdTdGF0dXMgPSBuZXh0R3JvdXBJZCA/ICdwZW5kaW5nX2FwcHJvdmFsJyA6ICdjb21wbGV0ZWQnXHJcblxyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogQWR2YW5jaW5nIHRvIEdyb3VwOiAke25leHRHcm91cElkfSB8IE5ldyBTdGF0dXM6ICR7bmV3U3RhdHVzfWApO1xyXG5cclxuICAvLyA2LiBQZXJmb3JtIFVwZGF0ZVxyXG4gIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAudXBkYXRlKHsgXHJcbiAgICAgIHN0YXR1czogbmV3U3RhdHVzLFxyXG4gICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBuZXh0R3JvdXBJZFxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKHVwZGF0ZUVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogVXBkYXRlIEZhaWxlZFwiLCB1cGRhdGVFcnJvcik7XHJcbiAgICAgIC8vIFJldHVybiB0aGUgcmF3IGRhdGFiYXNlIGVycm9yIHRvIHRoZSBVSVxyXG4gICAgICByZXR1cm4geyBlcnJvcjogYERCIFVwZGF0ZSBGYWlsZWQ6ICR7dXBkYXRlRXJyb3IubWVzc2FnZX0gKENvZGU6ICR7dXBkYXRlRXJyb3IuY29kZX0pYCB9XHJcbiAgfVxyXG5cclxuICAvLyA3LiBMb2cgU3VjY2Vzc1xyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdhcHByb3ZlZCcsXHJcbiAgICBjb21tZW50OiAnQXBwcm92ZWQnXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gMi4gUkVKRUNUIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVqZWN0UmVwb3J0QWN0aW9uKHJlcG9ydElkOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBzdGF0dXM6ICdyZWplY3RlZCcsIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdyZWplY3RlZCcsXHJcbiAgICBjb21tZW50OiAnUmVqZWN0ZWQgYnkgYXBwcm92ZXInXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gMy4gS0lDSyBCQUNLIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24ga2lja0JhY2tSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZywgcmVhc29uOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIC8vIEdldCB1c2VyJ3MgZ3JvdXAgdG8gbWFyayB3aG8ga2lja2VkIGl0IGJhY2tcclxuICBjb25zdCB7IGRhdGE6IHByb2ZpbGUgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgLnNlbGVjdCgncm9sZTpyb2xlcyhhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuZXEoJ2FyY2hpdmVkJywgZmFsc2UpXHJcbiAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gIGNvbnN0IG15R3JvdXBJZCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmFwcHJvdmFsX2dyb3VwX2lkXHJcblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgc3RhdHVzOiAnbmVlZHNfcmV2aXNpb24nLCBcclxuICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG15R3JvdXBJZCBcclxuICAgIH0pXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHByb3ZhbF9sb2cnKS5pbnNlcnQoe1xyXG4gICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgYWN0aW9uOiAnS2lja2VkIEJhY2sgZm9yIFJldmlzaW9uJyxcclxuICAgIGNvbW1lbnQ6IHJlYXNvblxyXG4gIH0pXHJcblxyXG4gIHJldmFsaWRhdGVQYXRoKGAvcmVwb3J0LyR7cmVwb3J0SWR9YClcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDQuIFBVTEwgKEJ5IFN1Ym1pdHRlcikgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdWxsUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIGNvbW1lbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIGNvbnN0IHsgZGF0YTogcmVwb3J0IH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAuc2VsZWN0KCdzdWJtaXR0ZWRfYnksIHN0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKCFyZXBvcnQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcG9ydCBub3QgZm91bmQnIH1cclxuICBcclxuICAvLyBHZXQgVXNlciBSb2xlIGZvciBPdmVycmlkZVxyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgIC5zZWxlY3QoJ3JvbGU6cm9sZXMoZGVmYXVsdF9yb2xlX2xldmVsKScpXHJcbiAgICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAgLmVxKCdhcmNoaXZlZCcsIGZhbHNlKVxyXG4gICAgIC5zaW5nbGUoKVxyXG4gICAgIFxyXG4gIGNvbnN0IHJvbGVMZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgY29uc3QgaXNTdWJtaXR0ZXIgPSByZXBvcnQuc3VibWl0dGVkX2J5ID09PSB1c2VyLmlkXHJcbiAgY29uc3QgaXNDb21tYW5kYW50ID0gcm9sZUxldmVsID49IDkwXHJcblxyXG4gIC8vIEd1YXJkIENsYXVzZVxyXG4gIGlmICghaXNTdWJtaXR0ZXIgJiYgIWlzQ29tbWFuZGFudCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdQZXJtaXNzaW9uIERlbmllZDogWW91IGNhbm5vdCBwdWxsIHRoaXMgcmVwb3J0LicgfVxyXG4gIH1cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgaWYgKHJlcG9ydC5zdGF0dXMgPT09ICdwdWxsZWQnKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RoaXMgcmVwb3J0IGlzIGFscmVhZHkgcHVsbGVkLicgfVxyXG4gIH1cclxuXHJcbiAgLy8gMi4gVXBkYXRlIHRvICdQdWxsZWQnLCBaZXJvIERlbWVyaXRzLCBSZW1vdmUgZnJvbSBBcHByb3ZhbCBDaGFpblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgICBzdGF0dXM6ICdwdWxsZWQnLCAvLyA8LS0tIERpc3RpbmN0IHN0YXR1c1xyXG4gICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwsIFxyXG4gICAgICAgIGRlbWVyaXRzX2VmZmVjdGl2ZTogMCwgLy8gRW5zdXJlIG5vIGRlbWVyaXRzIGFwcGx5XHJcbiAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgLy8gRW5zdXJlIGl0IGRvZXNuJ3QgYXBwZWFyIGluIGFueW9uZSdzIHJldmlzaW9uIHF1ZXVlXHJcbiAgICB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1B1bGwgRXJyb3I6JywgZXJyb3IpXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG4gIH1cclxuXHJcbiAgLy8gMy4gTG9nIHRoZSBhY3Rpb25cclxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHByb3ZhbF9sb2cnKS5pbnNlcnQoe1xyXG4gICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgYWN0aW9uOiAncHVsbGVkJyxcclxuICAgIGNvbW1lbnQ6IGNvbW1lbnRcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV2YWxpZGF0ZVBhdGgoJy9yZXBvcnRzL3N1Ym1pdHRlZCcpXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSA1LiBSRVNVQk1JVCAoU3RhbmRhcmQpIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdWJtaXRSZXBvcnQocmVwb3J0SWQ6IHN0cmluZywgcGF5bG9hZDoge1xyXG4gICAgb2ZmZW5zZVR5cGVJZDogc3RyaW5nLFxyXG4gICAgbm90ZXM6IHN0cmluZyxcclxuICAgIHJlcG9ydEV4cGxhbmF0aW9uOiBzdHJpbmcsXHJcbiAgICBkYXRlT2ZPZmZlbnNlOiBzdHJpbmdcclxufSkge1xyXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gICAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICAgIFxyXG4gICAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfVxyXG5cclxuICAgIC8vIFJlY2FsY3VsYXRlIEFwcHJvdmVyIENoYWluXHJcbiAgICBjb25zdCB7IGRhdGE6IHVzZXJQcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgICAgIC5lcSgnYXJjaGl2ZWQnLCBmYWxzZSlcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBjb25zdCBteUdyb3VwSWQgPSAodXNlclByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuICAgIGxldCB0YXJnZXRHcm91cElkID0gbnVsbFxyXG5cclxuICAgIGlmIChteUdyb3VwSWQpIHtcclxuICAgICAgICBjb25zdCB7IGRhdGE6IG15R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCduZXh0X2FwcHJvdmVyX2dyb3VwX2lkJylcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG15R3JvdXBJZClcclxuICAgICAgICAgICAgLnNpbmdsZSgpXHJcbiAgICAgICAgdGFyZ2V0R3JvdXBJZCA9IG15R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZ19hcHByb3ZhbCdcclxuICAgIGlmIChteUdyb3VwSWQgJiYgIXRhcmdldEdyb3VwSWQpIHtcclxuICAgICAgICBzdGF0dXMgPSAnY29tcGxldGVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiB0YXJnZXRHcm91cElkLCBcclxuICAgICAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ3Jlc3VibWl0dGVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IHJldmlzZWQgYW5kIHJlc3VibWl0dGVkJ1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDYuIEVESVQgJiBBUFBST1ZFIChDb21tYW5kIE92ZXJyaWRlKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRBbmRBcHByb3ZlUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgUGVybWlzc2lvblxyXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhkZWZhdWx0X3JvbGVfbGV2ZWwpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuZXEoJ2FyY2hpdmVkJywgZmFsc2UpXHJcbiAgICAgICAgLnNpbmdsZSgpXHJcbiAgICBcclxuICAgIGNvbnN0IHJvbGVMZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgICBpZiAocm9sZUxldmVsIDwgOTApIHJldHVybiB7IGVycm9yOiAnSW5zdWZmaWNpZW50IHBlcm1pc3Npb25zJyB9XHJcblxyXG4gICAgLy8gRm9yY2UgQ29tcGxldGVcclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsIFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBudWxsLFxyXG4gICAgICAgICAgICByZXZpc2lvbl9ieV9ncm91cF9pZDogbnVsbFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICAgIGlmICh1cGRhdGVFcnJvcikgcmV0dXJuIHsgZXJyb3I6IHVwZGF0ZUVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICAgICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgICAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgICAgICBhY3Rpb246ICdlZGl0ZWRfYW5kX2FwcHJvdmVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IGVkaXRlZCBhbmQgaW1tZWRpYXRlbHkgYXBwcm92ZWQgYnkgYXV0aG9yaXR5J1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOFJBaUtzQiJ9
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/report/[id]/data:a4a96b [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40a3e1aea32ee98a024ec4a4e72f61a51e3be8f308":"approveReportAction"},"app/report/[id]/actions.ts",""] */ __turbopack_context__.s([
    "approveReportAction",
    ()=>approveReportAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var approveReportAction = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("40a3e1aea32ee98a024ec4a4e72f61a51e3be8f308", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "approveReportAction"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gMS4gQVBQUk9WRSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICAvLyAxLiBDaGVjayBVc2VyXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBObyBhdXRoZW50aWNhdGVkIHVzZXIgZm91bmQuXCIpO1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZDogTm8gdXNlciBzZXNzaW9uLicgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBdHRlbXB0aW5nIGFwcHJvdmFsIGZvciBSZXBvcnQgJHtyZXBvcnRJZH0gYnkgVXNlciAke3VzZXIuaWR9YCk7XHJcblxyXG4gIC8vIDIuIEZldGNoIFVzZXIncyBSb2xlICYgR3JvdXBcclxuICAvLyBGSVg6IENoYW5nZWQgJ25hbWUnIHRvICdyb2xlX25hbWUnIGluIHRoZSBzZWxlY3Qgc3RyaW5nXHJcbiAgY29uc3QgeyBkYXRhOiB1c2VyUHJvZmlsZSwgZXJyb3I6IHByb2ZpbGVFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdpZCwgcm9sZTpyb2xlcyhpZCwgcm9sZV9uYW1lLCBhcHByb3ZhbF9ncm91cF9pZCknKSBcclxuICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgLmVxKCdhcmNoaXZlZCcsIGZhbHNlKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChwcm9maWxlRXJyb3IgfHwgIXVzZXJQcm9maWxlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogQ291bGQgbm90IGZldGNoIHVzZXIgcHJvZmlsZS9yb2xlXCIsIHByb2ZpbGVFcnJvcik7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUHJvZmlsZSBFcnJvcjogJHtwcm9maWxlRXJyb3I/Lm1lc3NhZ2UgfHwgJ1Byb2ZpbGUgbm90IGZvdW5kJ31gIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IG15R3JvdXBJZCA9ICh1c2VyUHJvZmlsZS5yb2xlIGFzIGFueSk/LmFwcHJvdmFsX2dyb3VwX2lkO1xyXG4gIFxyXG4gIC8vIEZJWDogVXBkYXRlZCB0aGUgbG9nIHRvIHJlYWQgJ3JvbGVfbmFtZSdcclxuICBjb25zb2xlLmxvZyhgREVCVUc6IFVzZXIncyBHcm91cCBJRDogJHtteUdyb3VwSWR9IChSb2xlOiAkeyh1c2VyUHJvZmlsZS5yb2xlIGFzIGFueSk/LnJvbGVfbmFtZX0pYCk7XHJcblxyXG4gIC8vIDMuIEZldGNoIFJlcG9ydCBTdGF0ZSAoVGhlIFwiTG9ja1wiIG9uIHRoZSBSTFMgUG9saWN5KVxyXG4gIGNvbnN0IHsgZGF0YTogcmVwb3J0LCBlcnJvcjogcmVwb3J0RXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC5zZWxlY3QoJ2lkLCBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkLCBzdGF0dXMnKVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChyZXBvcnRFcnJvciB8fCAhcmVwb3J0KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogQ291bGQgbm90IGZldGNoIHJlcG9ydFwiLCByZXBvcnRFcnJvcik7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUmVwb3J0IEVycm9yOiAke3JlcG9ydEVycm9yPy5tZXNzYWdlIHx8ICdSZXBvcnQgbm90IGZvdW5kJ31gIH1cclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogUmVwb3J0J3MgQ3VycmVudCBHcm91cCBJRDogJHtyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZH1gKTtcclxuICBjb25zb2xlLmxvZyhgREVCVUc6IFJlcG9ydCBTdGF0dXM6ICR7cmVwb3J0LnN0YXR1c31gKTtcclxuXHJcbiAgLy8gNC4gVkVSSUZZIFBFUk1JU1NJT04gTUFUQ0hcclxuICAvLyBUaGlzIGlzIHRoZSBsb2dpYyB5b3VyIFJMUyBcIlVTSU5HXCIgY2xhdXNlIHVzZXMuIElmIHRoaXMgaXMgZmFsc2UsIFJMUyB3aWxsIGJsb2NrIHlvdS5cclxuICBpZiAocmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQgIT09IG15R3JvdXBJZCkge1xyXG4gICAgICBjb25zdCBtc2cgPSBgREVCVUcgTUlTTUFUQ0g6IFVzZXIgR3JvdXAgKCR7bXlHcm91cElkfSkgIT0gUmVwb3J0IEdyb3VwICgke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfSlgO1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1zZyk7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBhcmUgaW4gZ3JvdXAgJHtteUdyb3VwSWR9LCBidXQgcmVwb3J0IGlzIHdpdGggZ3JvdXAgJHtyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZH1gIH07XHJcbiAgfVxyXG5cclxuICAvLyA1LiBEZXRlcm1pbmUgTmV4dCBTdGVwXHJcbiAgY29uc3QgeyBkYXRhOiBjdXJyZW50R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnYXBwcm92YWxfZ3JvdXBzJylcclxuICAgIC5zZWxlY3QoJ25leHRfYXBwcm92ZXJfZ3JvdXBfaWQnKVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGNvbnN0IG5leHRHcm91cElkID0gY3VycmVudEdyb3VwPy5uZXh0X2FwcHJvdmVyX2dyb3VwX2lkIHx8IG51bGxcclxuICBjb25zdCBuZXdTdGF0dXMgPSBuZXh0R3JvdXBJZCA/ICdwZW5kaW5nX2FwcHJvdmFsJyA6ICdjb21wbGV0ZWQnXHJcblxyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogQWR2YW5jaW5nIHRvIEdyb3VwOiAke25leHRHcm91cElkfSB8IE5ldyBTdGF0dXM6ICR7bmV3U3RhdHVzfWApO1xyXG5cclxuICAvLyA2LiBQZXJmb3JtIFVwZGF0ZVxyXG4gIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAudXBkYXRlKHsgXHJcbiAgICAgIHN0YXR1czogbmV3U3RhdHVzLFxyXG4gICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBuZXh0R3JvdXBJZFxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKHVwZGF0ZUVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogVXBkYXRlIEZhaWxlZFwiLCB1cGRhdGVFcnJvcik7XHJcbiAgICAgIC8vIFJldHVybiB0aGUgcmF3IGRhdGFiYXNlIGVycm9yIHRvIHRoZSBVSVxyXG4gICAgICByZXR1cm4geyBlcnJvcjogYERCIFVwZGF0ZSBGYWlsZWQ6ICR7dXBkYXRlRXJyb3IubWVzc2FnZX0gKENvZGU6ICR7dXBkYXRlRXJyb3IuY29kZX0pYCB9XHJcbiAgfVxyXG5cclxuICAvLyA3LiBMb2cgU3VjY2Vzc1xyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdhcHByb3ZlZCcsXHJcbiAgICBjb21tZW50OiAnQXBwcm92ZWQnXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gMi4gUkVKRUNUIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVqZWN0UmVwb3J0QWN0aW9uKHJlcG9ydElkOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBzdGF0dXM6ICdyZWplY3RlZCcsIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdyZWplY3RlZCcsXHJcbiAgICBjb21tZW50OiAnUmVqZWN0ZWQgYnkgYXBwcm92ZXInXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gMy4gS0lDSyBCQUNLIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24ga2lja0JhY2tSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZywgcmVhc29uOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIC8vIEdldCB1c2VyJ3MgZ3JvdXAgdG8gbWFyayB3aG8ga2lja2VkIGl0IGJhY2tcclxuICBjb25zdCB7IGRhdGE6IHByb2ZpbGUgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgLnNlbGVjdCgncm9sZTpyb2xlcyhhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuZXEoJ2FyY2hpdmVkJywgZmFsc2UpXHJcbiAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gIGNvbnN0IG15R3JvdXBJZCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmFwcHJvdmFsX2dyb3VwX2lkXHJcblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgc3RhdHVzOiAnbmVlZHNfcmV2aXNpb24nLCBcclxuICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG15R3JvdXBJZCBcclxuICAgIH0pXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHByb3ZhbF9sb2cnKS5pbnNlcnQoe1xyXG4gICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgYWN0aW9uOiAnS2lja2VkIEJhY2sgZm9yIFJldmlzaW9uJyxcclxuICAgIGNvbW1lbnQ6IHJlYXNvblxyXG4gIH0pXHJcblxyXG4gIHJldmFsaWRhdGVQYXRoKGAvcmVwb3J0LyR7cmVwb3J0SWR9YClcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDQuIFBVTEwgKEJ5IFN1Ym1pdHRlcikgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdWxsUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIGNvbW1lbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIGNvbnN0IHsgZGF0YTogcmVwb3J0IH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAuc2VsZWN0KCdzdWJtaXR0ZWRfYnksIHN0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKCFyZXBvcnQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcG9ydCBub3QgZm91bmQnIH1cclxuICBcclxuICAvLyBHZXQgVXNlciBSb2xlIGZvciBPdmVycmlkZVxyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgIC5zZWxlY3QoJ3JvbGU6cm9sZXMoZGVmYXVsdF9yb2xlX2xldmVsKScpXHJcbiAgICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAgLmVxKCdhcmNoaXZlZCcsIGZhbHNlKVxyXG4gICAgIC5zaW5nbGUoKVxyXG4gICAgIFxyXG4gIGNvbnN0IHJvbGVMZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgY29uc3QgaXNTdWJtaXR0ZXIgPSByZXBvcnQuc3VibWl0dGVkX2J5ID09PSB1c2VyLmlkXHJcbiAgY29uc3QgaXNDb21tYW5kYW50ID0gcm9sZUxldmVsID49IDkwXHJcblxyXG4gIC8vIEd1YXJkIENsYXVzZVxyXG4gIGlmICghaXNTdWJtaXR0ZXIgJiYgIWlzQ29tbWFuZGFudCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdQZXJtaXNzaW9uIERlbmllZDogWW91IGNhbm5vdCBwdWxsIHRoaXMgcmVwb3J0LicgfVxyXG4gIH1cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgaWYgKHJlcG9ydC5zdGF0dXMgPT09ICdwdWxsZWQnKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RoaXMgcmVwb3J0IGlzIGFscmVhZHkgcHVsbGVkLicgfVxyXG4gIH1cclxuXHJcbiAgLy8gMi4gVXBkYXRlIHRvICdQdWxsZWQnLCBaZXJvIERlbWVyaXRzLCBSZW1vdmUgZnJvbSBBcHByb3ZhbCBDaGFpblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgICBzdGF0dXM6ICdwdWxsZWQnLCAvLyA8LS0tIERpc3RpbmN0IHN0YXR1c1xyXG4gICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwsIFxyXG4gICAgICAgIGRlbWVyaXRzX2VmZmVjdGl2ZTogMCwgLy8gRW5zdXJlIG5vIGRlbWVyaXRzIGFwcGx5XHJcbiAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgLy8gRW5zdXJlIGl0IGRvZXNuJ3QgYXBwZWFyIGluIGFueW9uZSdzIHJldmlzaW9uIHF1ZXVlXHJcbiAgICB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1B1bGwgRXJyb3I6JywgZXJyb3IpXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG4gIH1cclxuXHJcbiAgLy8gMy4gTG9nIHRoZSBhY3Rpb25cclxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHByb3ZhbF9sb2cnKS5pbnNlcnQoe1xyXG4gICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgYWN0aW9uOiAncHVsbGVkJyxcclxuICAgIGNvbW1lbnQ6IGNvbW1lbnRcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV2YWxpZGF0ZVBhdGgoJy9yZXBvcnRzL3N1Ym1pdHRlZCcpXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSA1LiBSRVNVQk1JVCAoU3RhbmRhcmQpIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdWJtaXRSZXBvcnQocmVwb3J0SWQ6IHN0cmluZywgcGF5bG9hZDoge1xyXG4gICAgb2ZmZW5zZVR5cGVJZDogc3RyaW5nLFxyXG4gICAgbm90ZXM6IHN0cmluZyxcclxuICAgIHJlcG9ydEV4cGxhbmF0aW9uOiBzdHJpbmcsXHJcbiAgICBkYXRlT2ZPZmZlbnNlOiBzdHJpbmdcclxufSkge1xyXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gICAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICAgIFxyXG4gICAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfVxyXG5cclxuICAgIC8vIFJlY2FsY3VsYXRlIEFwcHJvdmVyIENoYWluXHJcbiAgICBjb25zdCB7IGRhdGE6IHVzZXJQcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgICAgIC5lcSgnYXJjaGl2ZWQnLCBmYWxzZSlcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBjb25zdCBteUdyb3VwSWQgPSAodXNlclByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuICAgIGxldCB0YXJnZXRHcm91cElkID0gbnVsbFxyXG5cclxuICAgIGlmIChteUdyb3VwSWQpIHtcclxuICAgICAgICBjb25zdCB7IGRhdGE6IG15R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCduZXh0X2FwcHJvdmVyX2dyb3VwX2lkJylcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG15R3JvdXBJZClcclxuICAgICAgICAgICAgLnNpbmdsZSgpXHJcbiAgICAgICAgdGFyZ2V0R3JvdXBJZCA9IG15R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZ19hcHByb3ZhbCdcclxuICAgIGlmIChteUdyb3VwSWQgJiYgIXRhcmdldEdyb3VwSWQpIHtcclxuICAgICAgICBzdGF0dXMgPSAnY29tcGxldGVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiB0YXJnZXRHcm91cElkLCBcclxuICAgICAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ3Jlc3VibWl0dGVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IHJldmlzZWQgYW5kIHJlc3VibWl0dGVkJ1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDYuIEVESVQgJiBBUFBST1ZFIChDb21tYW5kIE92ZXJyaWRlKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRBbmRBcHByb3ZlUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgUGVybWlzc2lvblxyXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhkZWZhdWx0X3JvbGVfbGV2ZWwpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuZXEoJ2FyY2hpdmVkJywgZmFsc2UpXHJcbiAgICAgICAgLnNpbmdsZSgpXHJcbiAgICBcclxuICAgIGNvbnN0IHJvbGVMZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgICBpZiAocm9sZUxldmVsIDwgOTApIHJldHVybiB7IGVycm9yOiAnSW5zdWZmaWNpZW50IHBlcm1pc3Npb25zJyB9XHJcblxyXG4gICAgLy8gRm9yY2UgQ29tcGxldGVcclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsIFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBudWxsLFxyXG4gICAgICAgICAgICByZXZpc2lvbl9ieV9ncm91cF9pZDogbnVsbFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICAgIGlmICh1cGRhdGVFcnJvcikgcmV0dXJuIHsgZXJyb3I6IHVwZGF0ZUVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICAgICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgICAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgICAgICBhY3Rpb246ICdlZGl0ZWRfYW5kX2FwcHJvdmVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IGVkaXRlZCBhbmQgaW1tZWRpYXRlbHkgYXBwcm92ZWQgYnkgYXV0aG9yaXR5J1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoidVNBTXNCIn0=
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/report/[id]/data:80ac02 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40b9efaf0f915c3047878b52c0028887a9970e0cf0":"rejectReportAction"},"app/report/[id]/actions.ts",""] */ __turbopack_context__.s([
    "rejectReportAction",
    ()=>rejectReportAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var rejectReportAction = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("40b9efaf0f915c3047878b52c0028887a9970e0cf0", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "rejectReportAction"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gMS4gQVBQUk9WRSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICAvLyAxLiBDaGVjayBVc2VyXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBObyBhdXRoZW50aWNhdGVkIHVzZXIgZm91bmQuXCIpO1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZDogTm8gdXNlciBzZXNzaW9uLicgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBdHRlbXB0aW5nIGFwcHJvdmFsIGZvciBSZXBvcnQgJHtyZXBvcnRJZH0gYnkgVXNlciAke3VzZXIuaWR9YCk7XHJcblxyXG4gIC8vIDIuIEZldGNoIFVzZXIncyBSb2xlICYgR3JvdXBcclxuICAvLyBGSVg6IENoYW5nZWQgJ25hbWUnIHRvICdyb2xlX25hbWUnIGluIHRoZSBzZWxlY3Qgc3RyaW5nXHJcbiAgY29uc3QgeyBkYXRhOiB1c2VyUHJvZmlsZSwgZXJyb3I6IHByb2ZpbGVFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdpZCwgcm9sZTpyb2xlcyhpZCwgcm9sZV9uYW1lLCBhcHByb3ZhbF9ncm91cF9pZCknKSBcclxuICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgLmVxKCdhcmNoaXZlZCcsIGZhbHNlKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChwcm9maWxlRXJyb3IgfHwgIXVzZXJQcm9maWxlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogQ291bGQgbm90IGZldGNoIHVzZXIgcHJvZmlsZS9yb2xlXCIsIHByb2ZpbGVFcnJvcik7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUHJvZmlsZSBFcnJvcjogJHtwcm9maWxlRXJyb3I/Lm1lc3NhZ2UgfHwgJ1Byb2ZpbGUgbm90IGZvdW5kJ31gIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IG15R3JvdXBJZCA9ICh1c2VyUHJvZmlsZS5yb2xlIGFzIGFueSk/LmFwcHJvdmFsX2dyb3VwX2lkO1xyXG4gIFxyXG4gIC8vIEZJWDogVXBkYXRlZCB0aGUgbG9nIHRvIHJlYWQgJ3JvbGVfbmFtZSdcclxuICBjb25zb2xlLmxvZyhgREVCVUc6IFVzZXIncyBHcm91cCBJRDogJHtteUdyb3VwSWR9IChSb2xlOiAkeyh1c2VyUHJvZmlsZS5yb2xlIGFzIGFueSk/LnJvbGVfbmFtZX0pYCk7XHJcblxyXG4gIC8vIDMuIEZldGNoIFJlcG9ydCBTdGF0ZSAoVGhlIFwiTG9ja1wiIG9uIHRoZSBSTFMgUG9saWN5KVxyXG4gIGNvbnN0IHsgZGF0YTogcmVwb3J0LCBlcnJvcjogcmVwb3J0RXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC5zZWxlY3QoJ2lkLCBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkLCBzdGF0dXMnKVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChyZXBvcnRFcnJvciB8fCAhcmVwb3J0KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogQ291bGQgbm90IGZldGNoIHJlcG9ydFwiLCByZXBvcnRFcnJvcik7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUmVwb3J0IEVycm9yOiAke3JlcG9ydEVycm9yPy5tZXNzYWdlIHx8ICdSZXBvcnQgbm90IGZvdW5kJ31gIH1cclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogUmVwb3J0J3MgQ3VycmVudCBHcm91cCBJRDogJHtyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZH1gKTtcclxuICBjb25zb2xlLmxvZyhgREVCVUc6IFJlcG9ydCBTdGF0dXM6ICR7cmVwb3J0LnN0YXR1c31gKTtcclxuXHJcbiAgLy8gNC4gVkVSSUZZIFBFUk1JU1NJT04gTUFUQ0hcclxuICAvLyBUaGlzIGlzIHRoZSBsb2dpYyB5b3VyIFJMUyBcIlVTSU5HXCIgY2xhdXNlIHVzZXMuIElmIHRoaXMgaXMgZmFsc2UsIFJMUyB3aWxsIGJsb2NrIHlvdS5cclxuICBpZiAocmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQgIT09IG15R3JvdXBJZCkge1xyXG4gICAgICBjb25zdCBtc2cgPSBgREVCVUcgTUlTTUFUQ0g6IFVzZXIgR3JvdXAgKCR7bXlHcm91cElkfSkgIT0gUmVwb3J0IEdyb3VwICgke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfSlgO1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1zZyk7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBhcmUgaW4gZ3JvdXAgJHtteUdyb3VwSWR9LCBidXQgcmVwb3J0IGlzIHdpdGggZ3JvdXAgJHtyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZH1gIH07XHJcbiAgfVxyXG5cclxuICAvLyA1LiBEZXRlcm1pbmUgTmV4dCBTdGVwXHJcbiAgY29uc3QgeyBkYXRhOiBjdXJyZW50R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnYXBwcm92YWxfZ3JvdXBzJylcclxuICAgIC5zZWxlY3QoJ25leHRfYXBwcm92ZXJfZ3JvdXBfaWQnKVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGNvbnN0IG5leHRHcm91cElkID0gY3VycmVudEdyb3VwPy5uZXh0X2FwcHJvdmVyX2dyb3VwX2lkIHx8IG51bGxcclxuICBjb25zdCBuZXdTdGF0dXMgPSBuZXh0R3JvdXBJZCA/ICdwZW5kaW5nX2FwcHJvdmFsJyA6ICdjb21wbGV0ZWQnXHJcblxyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogQWR2YW5jaW5nIHRvIEdyb3VwOiAke25leHRHcm91cElkfSB8IE5ldyBTdGF0dXM6ICR7bmV3U3RhdHVzfWApO1xyXG5cclxuICAvLyA2LiBQZXJmb3JtIFVwZGF0ZVxyXG4gIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAudXBkYXRlKHsgXHJcbiAgICAgIHN0YXR1czogbmV3U3RhdHVzLFxyXG4gICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBuZXh0R3JvdXBJZFxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKHVwZGF0ZUVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogVXBkYXRlIEZhaWxlZFwiLCB1cGRhdGVFcnJvcik7XHJcbiAgICAgIC8vIFJldHVybiB0aGUgcmF3IGRhdGFiYXNlIGVycm9yIHRvIHRoZSBVSVxyXG4gICAgICByZXR1cm4geyBlcnJvcjogYERCIFVwZGF0ZSBGYWlsZWQ6ICR7dXBkYXRlRXJyb3IubWVzc2FnZX0gKENvZGU6ICR7dXBkYXRlRXJyb3IuY29kZX0pYCB9XHJcbiAgfVxyXG5cclxuICAvLyA3LiBMb2cgU3VjY2Vzc1xyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdhcHByb3ZlZCcsXHJcbiAgICBjb21tZW50OiAnQXBwcm92ZWQnXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gMi4gUkVKRUNUIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVqZWN0UmVwb3J0QWN0aW9uKHJlcG9ydElkOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBzdGF0dXM6ICdyZWplY3RlZCcsIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdyZWplY3RlZCcsXHJcbiAgICBjb21tZW50OiAnUmVqZWN0ZWQgYnkgYXBwcm92ZXInXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gMy4gS0lDSyBCQUNLIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24ga2lja0JhY2tSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZywgcmVhc29uOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIC8vIEdldCB1c2VyJ3MgZ3JvdXAgdG8gbWFyayB3aG8ga2lja2VkIGl0IGJhY2tcclxuICBjb25zdCB7IGRhdGE6IHByb2ZpbGUgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgLnNlbGVjdCgncm9sZTpyb2xlcyhhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuZXEoJ2FyY2hpdmVkJywgZmFsc2UpXHJcbiAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gIGNvbnN0IG15R3JvdXBJZCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmFwcHJvdmFsX2dyb3VwX2lkXHJcblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgc3RhdHVzOiAnbmVlZHNfcmV2aXNpb24nLCBcclxuICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG15R3JvdXBJZCBcclxuICAgIH0pXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHByb3ZhbF9sb2cnKS5pbnNlcnQoe1xyXG4gICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgYWN0aW9uOiAnS2lja2VkIEJhY2sgZm9yIFJldmlzaW9uJyxcclxuICAgIGNvbW1lbnQ6IHJlYXNvblxyXG4gIH0pXHJcblxyXG4gIHJldmFsaWRhdGVQYXRoKGAvcmVwb3J0LyR7cmVwb3J0SWR9YClcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDQuIFBVTEwgKEJ5IFN1Ym1pdHRlcikgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdWxsUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIGNvbW1lbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIGNvbnN0IHsgZGF0YTogcmVwb3J0IH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAuc2VsZWN0KCdzdWJtaXR0ZWRfYnksIHN0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKCFyZXBvcnQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcG9ydCBub3QgZm91bmQnIH1cclxuICBcclxuICAvLyBHZXQgVXNlciBSb2xlIGZvciBPdmVycmlkZVxyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgIC5zZWxlY3QoJ3JvbGU6cm9sZXMoZGVmYXVsdF9yb2xlX2xldmVsKScpXHJcbiAgICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAgLmVxKCdhcmNoaXZlZCcsIGZhbHNlKVxyXG4gICAgIC5zaW5nbGUoKVxyXG4gICAgIFxyXG4gIGNvbnN0IHJvbGVMZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgY29uc3QgaXNTdWJtaXR0ZXIgPSByZXBvcnQuc3VibWl0dGVkX2J5ID09PSB1c2VyLmlkXHJcbiAgY29uc3QgaXNDb21tYW5kYW50ID0gcm9sZUxldmVsID49IDkwXHJcblxyXG4gIC8vIEd1YXJkIENsYXVzZVxyXG4gIGlmICghaXNTdWJtaXR0ZXIgJiYgIWlzQ29tbWFuZGFudCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdQZXJtaXNzaW9uIERlbmllZDogWW91IGNhbm5vdCBwdWxsIHRoaXMgcmVwb3J0LicgfVxyXG4gIH1cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgaWYgKHJlcG9ydC5zdGF0dXMgPT09ICdwdWxsZWQnKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RoaXMgcmVwb3J0IGlzIGFscmVhZHkgcHVsbGVkLicgfVxyXG4gIH1cclxuXHJcbiAgLy8gMi4gVXBkYXRlIHRvICdQdWxsZWQnLCBaZXJvIERlbWVyaXRzLCBSZW1vdmUgZnJvbSBBcHByb3ZhbCBDaGFpblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgICBzdGF0dXM6ICdwdWxsZWQnLCAvLyA8LS0tIERpc3RpbmN0IHN0YXR1c1xyXG4gICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwsIFxyXG4gICAgICAgIGRlbWVyaXRzX2VmZmVjdGl2ZTogMCwgLy8gRW5zdXJlIG5vIGRlbWVyaXRzIGFwcGx5XHJcbiAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgLy8gRW5zdXJlIGl0IGRvZXNuJ3QgYXBwZWFyIGluIGFueW9uZSdzIHJldmlzaW9uIHF1ZXVlXHJcbiAgICB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1B1bGwgRXJyb3I6JywgZXJyb3IpXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG4gIH1cclxuXHJcbiAgLy8gMy4gTG9nIHRoZSBhY3Rpb25cclxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHByb3ZhbF9sb2cnKS5pbnNlcnQoe1xyXG4gICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgYWN0aW9uOiAncHVsbGVkJyxcclxuICAgIGNvbW1lbnQ6IGNvbW1lbnRcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV2YWxpZGF0ZVBhdGgoJy9yZXBvcnRzL3N1Ym1pdHRlZCcpXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSA1LiBSRVNVQk1JVCAoU3RhbmRhcmQpIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdWJtaXRSZXBvcnQocmVwb3J0SWQ6IHN0cmluZywgcGF5bG9hZDoge1xyXG4gICAgb2ZmZW5zZVR5cGVJZDogc3RyaW5nLFxyXG4gICAgbm90ZXM6IHN0cmluZyxcclxuICAgIHJlcG9ydEV4cGxhbmF0aW9uOiBzdHJpbmcsXHJcbiAgICBkYXRlT2ZPZmZlbnNlOiBzdHJpbmdcclxufSkge1xyXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gICAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICAgIFxyXG4gICAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfVxyXG5cclxuICAgIC8vIFJlY2FsY3VsYXRlIEFwcHJvdmVyIENoYWluXHJcbiAgICBjb25zdCB7IGRhdGE6IHVzZXJQcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgICAgIC5lcSgnYXJjaGl2ZWQnLCBmYWxzZSlcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBjb25zdCBteUdyb3VwSWQgPSAodXNlclByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuICAgIGxldCB0YXJnZXRHcm91cElkID0gbnVsbFxyXG5cclxuICAgIGlmIChteUdyb3VwSWQpIHtcclxuICAgICAgICBjb25zdCB7IGRhdGE6IG15R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCduZXh0X2FwcHJvdmVyX2dyb3VwX2lkJylcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG15R3JvdXBJZClcclxuICAgICAgICAgICAgLnNpbmdsZSgpXHJcbiAgICAgICAgdGFyZ2V0R3JvdXBJZCA9IG15R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZ19hcHByb3ZhbCdcclxuICAgIGlmIChteUdyb3VwSWQgJiYgIXRhcmdldEdyb3VwSWQpIHtcclxuICAgICAgICBzdGF0dXMgPSAnY29tcGxldGVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiB0YXJnZXRHcm91cElkLCBcclxuICAgICAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ3Jlc3VibWl0dGVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IHJldmlzZWQgYW5kIHJlc3VibWl0dGVkJ1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDYuIEVESVQgJiBBUFBST1ZFIChDb21tYW5kIE92ZXJyaWRlKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRBbmRBcHByb3ZlUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgUGVybWlzc2lvblxyXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhkZWZhdWx0X3JvbGVfbGV2ZWwpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuZXEoJ2FyY2hpdmVkJywgZmFsc2UpXHJcbiAgICAgICAgLnNpbmdsZSgpXHJcbiAgICBcclxuICAgIGNvbnN0IHJvbGVMZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgICBpZiAocm9sZUxldmVsIDwgOTApIHJldHVybiB7IGVycm9yOiAnSW5zdWZmaWNpZW50IHBlcm1pc3Npb25zJyB9XHJcblxyXG4gICAgLy8gRm9yY2UgQ29tcGxldGVcclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsIFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBudWxsLFxyXG4gICAgICAgICAgICByZXZpc2lvbl9ieV9ncm91cF9pZDogbnVsbFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICAgIGlmICh1cGRhdGVFcnJvcikgcmV0dXJuIHsgZXJyb3I6IHVwZGF0ZUVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICAgICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgICAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgICAgICBhY3Rpb246ICdlZGl0ZWRfYW5kX2FwcHJvdmVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IGVkaXRlZCBhbmQgaW1tZWRpYXRlbHkgYXBwcm92ZWQgYnkgYXV0aG9yaXR5J1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoic1NBb0dzQiJ9
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/report/[id]/data:f3eb06 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60192ef86ff1a9f52338794329fc736417cb466ad9":"kickBackReportAction"},"app/report/[id]/actions.ts",""] */ __turbopack_context__.s([
    "kickBackReportAction",
    ()=>kickBackReportAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var kickBackReportAction = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("60192ef86ff1a9f52338794329fc736417cb466ad9", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "kickBackReportAction"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gMS4gQVBQUk9WRSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICAvLyAxLiBDaGVjayBVc2VyXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBObyBhdXRoZW50aWNhdGVkIHVzZXIgZm91bmQuXCIpO1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZDogTm8gdXNlciBzZXNzaW9uLicgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBdHRlbXB0aW5nIGFwcHJvdmFsIGZvciBSZXBvcnQgJHtyZXBvcnRJZH0gYnkgVXNlciAke3VzZXIuaWR9YCk7XHJcblxyXG4gIC8vIDIuIEZldGNoIFVzZXIncyBSb2xlICYgR3JvdXBcclxuICAvLyBGSVg6IENoYW5nZWQgJ25hbWUnIHRvICdyb2xlX25hbWUnIGluIHRoZSBzZWxlY3Qgc3RyaW5nXHJcbiAgY29uc3QgeyBkYXRhOiB1c2VyUHJvZmlsZSwgZXJyb3I6IHByb2ZpbGVFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdpZCwgcm9sZTpyb2xlcyhpZCwgcm9sZV9uYW1lLCBhcHByb3ZhbF9ncm91cF9pZCknKSBcclxuICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgLmVxKCdhcmNoaXZlZCcsIGZhbHNlKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChwcm9maWxlRXJyb3IgfHwgIXVzZXJQcm9maWxlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogQ291bGQgbm90IGZldGNoIHVzZXIgcHJvZmlsZS9yb2xlXCIsIHByb2ZpbGVFcnJvcik7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUHJvZmlsZSBFcnJvcjogJHtwcm9maWxlRXJyb3I/Lm1lc3NhZ2UgfHwgJ1Byb2ZpbGUgbm90IGZvdW5kJ31gIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IG15R3JvdXBJZCA9ICh1c2VyUHJvZmlsZS5yb2xlIGFzIGFueSk/LmFwcHJvdmFsX2dyb3VwX2lkO1xyXG4gIFxyXG4gIC8vIEZJWDogVXBkYXRlZCB0aGUgbG9nIHRvIHJlYWQgJ3JvbGVfbmFtZSdcclxuICBjb25zb2xlLmxvZyhgREVCVUc6IFVzZXIncyBHcm91cCBJRDogJHtteUdyb3VwSWR9IChSb2xlOiAkeyh1c2VyUHJvZmlsZS5yb2xlIGFzIGFueSk/LnJvbGVfbmFtZX0pYCk7XHJcblxyXG4gIC8vIDMuIEZldGNoIFJlcG9ydCBTdGF0ZSAoVGhlIFwiTG9ja1wiIG9uIHRoZSBSTFMgUG9saWN5KVxyXG4gIGNvbnN0IHsgZGF0YTogcmVwb3J0LCBlcnJvcjogcmVwb3J0RXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC5zZWxlY3QoJ2lkLCBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkLCBzdGF0dXMnKVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChyZXBvcnRFcnJvciB8fCAhcmVwb3J0KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogQ291bGQgbm90IGZldGNoIHJlcG9ydFwiLCByZXBvcnRFcnJvcik7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUmVwb3J0IEVycm9yOiAke3JlcG9ydEVycm9yPy5tZXNzYWdlIHx8ICdSZXBvcnQgbm90IGZvdW5kJ31gIH1cclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogUmVwb3J0J3MgQ3VycmVudCBHcm91cCBJRDogJHtyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZH1gKTtcclxuICBjb25zb2xlLmxvZyhgREVCVUc6IFJlcG9ydCBTdGF0dXM6ICR7cmVwb3J0LnN0YXR1c31gKTtcclxuXHJcbiAgLy8gNC4gVkVSSUZZIFBFUk1JU1NJT04gTUFUQ0hcclxuICAvLyBUaGlzIGlzIHRoZSBsb2dpYyB5b3VyIFJMUyBcIlVTSU5HXCIgY2xhdXNlIHVzZXMuIElmIHRoaXMgaXMgZmFsc2UsIFJMUyB3aWxsIGJsb2NrIHlvdS5cclxuICBpZiAocmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQgIT09IG15R3JvdXBJZCkge1xyXG4gICAgICBjb25zdCBtc2cgPSBgREVCVUcgTUlTTUFUQ0g6IFVzZXIgR3JvdXAgKCR7bXlHcm91cElkfSkgIT0gUmVwb3J0IEdyb3VwICgke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfSlgO1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1zZyk7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBhcmUgaW4gZ3JvdXAgJHtteUdyb3VwSWR9LCBidXQgcmVwb3J0IGlzIHdpdGggZ3JvdXAgJHtyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZH1gIH07XHJcbiAgfVxyXG5cclxuICAvLyA1LiBEZXRlcm1pbmUgTmV4dCBTdGVwXHJcbiAgY29uc3QgeyBkYXRhOiBjdXJyZW50R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnYXBwcm92YWxfZ3JvdXBzJylcclxuICAgIC5zZWxlY3QoJ25leHRfYXBwcm92ZXJfZ3JvdXBfaWQnKVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGNvbnN0IG5leHRHcm91cElkID0gY3VycmVudEdyb3VwPy5uZXh0X2FwcHJvdmVyX2dyb3VwX2lkIHx8IG51bGxcclxuICBjb25zdCBuZXdTdGF0dXMgPSBuZXh0R3JvdXBJZCA/ICdwZW5kaW5nX2FwcHJvdmFsJyA6ICdjb21wbGV0ZWQnXHJcblxyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogQWR2YW5jaW5nIHRvIEdyb3VwOiAke25leHRHcm91cElkfSB8IE5ldyBTdGF0dXM6ICR7bmV3U3RhdHVzfWApO1xyXG5cclxuICAvLyA2LiBQZXJmb3JtIFVwZGF0ZVxyXG4gIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAudXBkYXRlKHsgXHJcbiAgICAgIHN0YXR1czogbmV3U3RhdHVzLFxyXG4gICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBuZXh0R3JvdXBJZFxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKHVwZGF0ZUVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogVXBkYXRlIEZhaWxlZFwiLCB1cGRhdGVFcnJvcik7XHJcbiAgICAgIC8vIFJldHVybiB0aGUgcmF3IGRhdGFiYXNlIGVycm9yIHRvIHRoZSBVSVxyXG4gICAgICByZXR1cm4geyBlcnJvcjogYERCIFVwZGF0ZSBGYWlsZWQ6ICR7dXBkYXRlRXJyb3IubWVzc2FnZX0gKENvZGU6ICR7dXBkYXRlRXJyb3IuY29kZX0pYCB9XHJcbiAgfVxyXG5cclxuICAvLyA3LiBMb2cgU3VjY2Vzc1xyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdhcHByb3ZlZCcsXHJcbiAgICBjb21tZW50OiAnQXBwcm92ZWQnXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gMi4gUkVKRUNUIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVqZWN0UmVwb3J0QWN0aW9uKHJlcG9ydElkOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBzdGF0dXM6ICdyZWplY3RlZCcsIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdyZWplY3RlZCcsXHJcbiAgICBjb21tZW50OiAnUmVqZWN0ZWQgYnkgYXBwcm92ZXInXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gMy4gS0lDSyBCQUNLIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24ga2lja0JhY2tSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZywgcmVhc29uOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIC8vIEdldCB1c2VyJ3MgZ3JvdXAgdG8gbWFyayB3aG8ga2lja2VkIGl0IGJhY2tcclxuICBjb25zdCB7IGRhdGE6IHByb2ZpbGUgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgLnNlbGVjdCgncm9sZTpyb2xlcyhhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuZXEoJ2FyY2hpdmVkJywgZmFsc2UpXHJcbiAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gIGNvbnN0IG15R3JvdXBJZCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmFwcHJvdmFsX2dyb3VwX2lkXHJcblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgc3RhdHVzOiAnbmVlZHNfcmV2aXNpb24nLCBcclxuICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG15R3JvdXBJZCBcclxuICAgIH0pXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHByb3ZhbF9sb2cnKS5pbnNlcnQoe1xyXG4gICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgYWN0aW9uOiAnS2lja2VkIEJhY2sgZm9yIFJldmlzaW9uJyxcclxuICAgIGNvbW1lbnQ6IHJlYXNvblxyXG4gIH0pXHJcblxyXG4gIHJldmFsaWRhdGVQYXRoKGAvcmVwb3J0LyR7cmVwb3J0SWR9YClcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDQuIFBVTEwgKEJ5IFN1Ym1pdHRlcikgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdWxsUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIGNvbW1lbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIGNvbnN0IHsgZGF0YTogcmVwb3J0IH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAuc2VsZWN0KCdzdWJtaXR0ZWRfYnksIHN0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKCFyZXBvcnQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcG9ydCBub3QgZm91bmQnIH1cclxuICBcclxuICAvLyBHZXQgVXNlciBSb2xlIGZvciBPdmVycmlkZVxyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgIC5zZWxlY3QoJ3JvbGU6cm9sZXMoZGVmYXVsdF9yb2xlX2xldmVsKScpXHJcbiAgICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAgLmVxKCdhcmNoaXZlZCcsIGZhbHNlKVxyXG4gICAgIC5zaW5nbGUoKVxyXG4gICAgIFxyXG4gIGNvbnN0IHJvbGVMZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgY29uc3QgaXNTdWJtaXR0ZXIgPSByZXBvcnQuc3VibWl0dGVkX2J5ID09PSB1c2VyLmlkXHJcbiAgY29uc3QgaXNDb21tYW5kYW50ID0gcm9sZUxldmVsID49IDkwXHJcblxyXG4gIC8vIEd1YXJkIENsYXVzZVxyXG4gIGlmICghaXNTdWJtaXR0ZXIgJiYgIWlzQ29tbWFuZGFudCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdQZXJtaXNzaW9uIERlbmllZDogWW91IGNhbm5vdCBwdWxsIHRoaXMgcmVwb3J0LicgfVxyXG4gIH1cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgaWYgKHJlcG9ydC5zdGF0dXMgPT09ICdwdWxsZWQnKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RoaXMgcmVwb3J0IGlzIGFscmVhZHkgcHVsbGVkLicgfVxyXG4gIH1cclxuXHJcbiAgLy8gMi4gVXBkYXRlIHRvICdQdWxsZWQnLCBaZXJvIERlbWVyaXRzLCBSZW1vdmUgZnJvbSBBcHByb3ZhbCBDaGFpblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgICBzdGF0dXM6ICdwdWxsZWQnLCAvLyA8LS0tIERpc3RpbmN0IHN0YXR1c1xyXG4gICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwsIFxyXG4gICAgICAgIGRlbWVyaXRzX2VmZmVjdGl2ZTogMCwgLy8gRW5zdXJlIG5vIGRlbWVyaXRzIGFwcGx5XHJcbiAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgLy8gRW5zdXJlIGl0IGRvZXNuJ3QgYXBwZWFyIGluIGFueW9uZSdzIHJldmlzaW9uIHF1ZXVlXHJcbiAgICB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1B1bGwgRXJyb3I6JywgZXJyb3IpXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG4gIH1cclxuXHJcbiAgLy8gMy4gTG9nIHRoZSBhY3Rpb25cclxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHByb3ZhbF9sb2cnKS5pbnNlcnQoe1xyXG4gICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgYWN0aW9uOiAncHVsbGVkJyxcclxuICAgIGNvbW1lbnQ6IGNvbW1lbnRcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV2YWxpZGF0ZVBhdGgoJy9yZXBvcnRzL3N1Ym1pdHRlZCcpXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSA1LiBSRVNVQk1JVCAoU3RhbmRhcmQpIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdWJtaXRSZXBvcnQocmVwb3J0SWQ6IHN0cmluZywgcGF5bG9hZDoge1xyXG4gICAgb2ZmZW5zZVR5cGVJZDogc3RyaW5nLFxyXG4gICAgbm90ZXM6IHN0cmluZyxcclxuICAgIHJlcG9ydEV4cGxhbmF0aW9uOiBzdHJpbmcsXHJcbiAgICBkYXRlT2ZPZmZlbnNlOiBzdHJpbmdcclxufSkge1xyXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gICAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICAgIFxyXG4gICAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfVxyXG5cclxuICAgIC8vIFJlY2FsY3VsYXRlIEFwcHJvdmVyIENoYWluXHJcbiAgICBjb25zdCB7IGRhdGE6IHVzZXJQcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgICAgIC5lcSgnYXJjaGl2ZWQnLCBmYWxzZSlcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBjb25zdCBteUdyb3VwSWQgPSAodXNlclByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuICAgIGxldCB0YXJnZXRHcm91cElkID0gbnVsbFxyXG5cclxuICAgIGlmIChteUdyb3VwSWQpIHtcclxuICAgICAgICBjb25zdCB7IGRhdGE6IG15R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCduZXh0X2FwcHJvdmVyX2dyb3VwX2lkJylcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG15R3JvdXBJZClcclxuICAgICAgICAgICAgLnNpbmdsZSgpXHJcbiAgICAgICAgdGFyZ2V0R3JvdXBJZCA9IG15R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZ19hcHByb3ZhbCdcclxuICAgIGlmIChteUdyb3VwSWQgJiYgIXRhcmdldEdyb3VwSWQpIHtcclxuICAgICAgICBzdGF0dXMgPSAnY29tcGxldGVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiB0YXJnZXRHcm91cElkLCBcclxuICAgICAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ3Jlc3VibWl0dGVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IHJldmlzZWQgYW5kIHJlc3VibWl0dGVkJ1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDYuIEVESVQgJiBBUFBST1ZFIChDb21tYW5kIE92ZXJyaWRlKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRBbmRBcHByb3ZlUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgUGVybWlzc2lvblxyXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhkZWZhdWx0X3JvbGVfbGV2ZWwpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuZXEoJ2FyY2hpdmVkJywgZmFsc2UpXHJcbiAgICAgICAgLnNpbmdsZSgpXHJcbiAgICBcclxuICAgIGNvbnN0IHJvbGVMZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgICBpZiAocm9sZUxldmVsIDwgOTApIHJldHVybiB7IGVycm9yOiAnSW5zdWZmaWNpZW50IHBlcm1pc3Npb25zJyB9XHJcblxyXG4gICAgLy8gRm9yY2UgQ29tcGxldGVcclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsIFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBudWxsLFxyXG4gICAgICAgICAgICByZXZpc2lvbl9ieV9ncm91cF9pZDogbnVsbFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICAgIGlmICh1cGRhdGVFcnJvcikgcmV0dXJuIHsgZXJyb3I6IHVwZGF0ZUVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICAgICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgICAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgICAgICBhY3Rpb246ICdlZGl0ZWRfYW5kX2FwcHJvdmVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IGVkaXRlZCBhbmQgaW1tZWRpYXRlbHkgYXBwcm92ZWQgYnkgYXV0aG9yaXR5J1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoid1NBNEhzQiJ9
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/report/[id]/data:c4e63b [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"601988c3fb101e9d27b98c8bfc536938e860e50edc":"resubmitReport"},"app/report/[id]/actions.ts",""] */ __turbopack_context__.s([
    "resubmitReport",
    ()=>resubmitReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var resubmitReport = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("601988c3fb101e9d27b98c8bfc536938e860e50edc", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "resubmitReport"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gMS4gQVBQUk9WRSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICAvLyAxLiBDaGVjayBVc2VyXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBObyBhdXRoZW50aWNhdGVkIHVzZXIgZm91bmQuXCIpO1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZDogTm8gdXNlciBzZXNzaW9uLicgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBdHRlbXB0aW5nIGFwcHJvdmFsIGZvciBSZXBvcnQgJHtyZXBvcnRJZH0gYnkgVXNlciAke3VzZXIuaWR9YCk7XHJcblxyXG4gIC8vIDIuIEZldGNoIFVzZXIncyBSb2xlICYgR3JvdXBcclxuICAvLyBGSVg6IENoYW5nZWQgJ25hbWUnIHRvICdyb2xlX25hbWUnIGluIHRoZSBzZWxlY3Qgc3RyaW5nXHJcbiAgY29uc3QgeyBkYXRhOiB1c2VyUHJvZmlsZSwgZXJyb3I6IHByb2ZpbGVFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdpZCwgcm9sZTpyb2xlcyhpZCwgcm9sZV9uYW1lLCBhcHByb3ZhbF9ncm91cF9pZCknKSBcclxuICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgLmVxKCdhcmNoaXZlZCcsIGZhbHNlKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChwcm9maWxlRXJyb3IgfHwgIXVzZXJQcm9maWxlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogQ291bGQgbm90IGZldGNoIHVzZXIgcHJvZmlsZS9yb2xlXCIsIHByb2ZpbGVFcnJvcik7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUHJvZmlsZSBFcnJvcjogJHtwcm9maWxlRXJyb3I/Lm1lc3NhZ2UgfHwgJ1Byb2ZpbGUgbm90IGZvdW5kJ31gIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IG15R3JvdXBJZCA9ICh1c2VyUHJvZmlsZS5yb2xlIGFzIGFueSk/LmFwcHJvdmFsX2dyb3VwX2lkO1xyXG4gIFxyXG4gIC8vIEZJWDogVXBkYXRlZCB0aGUgbG9nIHRvIHJlYWQgJ3JvbGVfbmFtZSdcclxuICBjb25zb2xlLmxvZyhgREVCVUc6IFVzZXIncyBHcm91cCBJRDogJHtteUdyb3VwSWR9IChSb2xlOiAkeyh1c2VyUHJvZmlsZS5yb2xlIGFzIGFueSk/LnJvbGVfbmFtZX0pYCk7XHJcblxyXG4gIC8vIDMuIEZldGNoIFJlcG9ydCBTdGF0ZSAoVGhlIFwiTG9ja1wiIG9uIHRoZSBSTFMgUG9saWN5KVxyXG4gIGNvbnN0IHsgZGF0YTogcmVwb3J0LCBlcnJvcjogcmVwb3J0RXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC5zZWxlY3QoJ2lkLCBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkLCBzdGF0dXMnKVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChyZXBvcnRFcnJvciB8fCAhcmVwb3J0KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogQ291bGQgbm90IGZldGNoIHJlcG9ydFwiLCByZXBvcnRFcnJvcik7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUmVwb3J0IEVycm9yOiAke3JlcG9ydEVycm9yPy5tZXNzYWdlIHx8ICdSZXBvcnQgbm90IGZvdW5kJ31gIH1cclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogUmVwb3J0J3MgQ3VycmVudCBHcm91cCBJRDogJHtyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZH1gKTtcclxuICBjb25zb2xlLmxvZyhgREVCVUc6IFJlcG9ydCBTdGF0dXM6ICR7cmVwb3J0LnN0YXR1c31gKTtcclxuXHJcbiAgLy8gNC4gVkVSSUZZIFBFUk1JU1NJT04gTUFUQ0hcclxuICAvLyBUaGlzIGlzIHRoZSBsb2dpYyB5b3VyIFJMUyBcIlVTSU5HXCIgY2xhdXNlIHVzZXMuIElmIHRoaXMgaXMgZmFsc2UsIFJMUyB3aWxsIGJsb2NrIHlvdS5cclxuICBpZiAocmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQgIT09IG15R3JvdXBJZCkge1xyXG4gICAgICBjb25zdCBtc2cgPSBgREVCVUcgTUlTTUFUQ0g6IFVzZXIgR3JvdXAgKCR7bXlHcm91cElkfSkgIT0gUmVwb3J0IEdyb3VwICgke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfSlgO1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1zZyk7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBhcmUgaW4gZ3JvdXAgJHtteUdyb3VwSWR9LCBidXQgcmVwb3J0IGlzIHdpdGggZ3JvdXAgJHtyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZH1gIH07XHJcbiAgfVxyXG5cclxuICAvLyA1LiBEZXRlcm1pbmUgTmV4dCBTdGVwXHJcbiAgY29uc3QgeyBkYXRhOiBjdXJyZW50R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnYXBwcm92YWxfZ3JvdXBzJylcclxuICAgIC5zZWxlY3QoJ25leHRfYXBwcm92ZXJfZ3JvdXBfaWQnKVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGNvbnN0IG5leHRHcm91cElkID0gY3VycmVudEdyb3VwPy5uZXh0X2FwcHJvdmVyX2dyb3VwX2lkIHx8IG51bGxcclxuICBjb25zdCBuZXdTdGF0dXMgPSBuZXh0R3JvdXBJZCA/ICdwZW5kaW5nX2FwcHJvdmFsJyA6ICdjb21wbGV0ZWQnXHJcblxyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogQWR2YW5jaW5nIHRvIEdyb3VwOiAke25leHRHcm91cElkfSB8IE5ldyBTdGF0dXM6ICR7bmV3U3RhdHVzfWApO1xyXG5cclxuICAvLyA2LiBQZXJmb3JtIFVwZGF0ZVxyXG4gIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAudXBkYXRlKHsgXHJcbiAgICAgIHN0YXR1czogbmV3U3RhdHVzLFxyXG4gICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBuZXh0R3JvdXBJZFxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKHVwZGF0ZUVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogVXBkYXRlIEZhaWxlZFwiLCB1cGRhdGVFcnJvcik7XHJcbiAgICAgIC8vIFJldHVybiB0aGUgcmF3IGRhdGFiYXNlIGVycm9yIHRvIHRoZSBVSVxyXG4gICAgICByZXR1cm4geyBlcnJvcjogYERCIFVwZGF0ZSBGYWlsZWQ6ICR7dXBkYXRlRXJyb3IubWVzc2FnZX0gKENvZGU6ICR7dXBkYXRlRXJyb3IuY29kZX0pYCB9XHJcbiAgfVxyXG5cclxuICAvLyA3LiBMb2cgU3VjY2Vzc1xyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdhcHByb3ZlZCcsXHJcbiAgICBjb21tZW50OiAnQXBwcm92ZWQnXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gMi4gUkVKRUNUIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVqZWN0UmVwb3J0QWN0aW9uKHJlcG9ydElkOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBzdGF0dXM6ICdyZWplY3RlZCcsIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdyZWplY3RlZCcsXHJcbiAgICBjb21tZW50OiAnUmVqZWN0ZWQgYnkgYXBwcm92ZXInXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gMy4gS0lDSyBCQUNLIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24ga2lja0JhY2tSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZywgcmVhc29uOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIC8vIEdldCB1c2VyJ3MgZ3JvdXAgdG8gbWFyayB3aG8ga2lja2VkIGl0IGJhY2tcclxuICBjb25zdCB7IGRhdGE6IHByb2ZpbGUgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgLnNlbGVjdCgncm9sZTpyb2xlcyhhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuZXEoJ2FyY2hpdmVkJywgZmFsc2UpXHJcbiAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gIGNvbnN0IG15R3JvdXBJZCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmFwcHJvdmFsX2dyb3VwX2lkXHJcblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgc3RhdHVzOiAnbmVlZHNfcmV2aXNpb24nLCBcclxuICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG15R3JvdXBJZCBcclxuICAgIH0pXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHByb3ZhbF9sb2cnKS5pbnNlcnQoe1xyXG4gICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgYWN0aW9uOiAnS2lja2VkIEJhY2sgZm9yIFJldmlzaW9uJyxcclxuICAgIGNvbW1lbnQ6IHJlYXNvblxyXG4gIH0pXHJcblxyXG4gIHJldmFsaWRhdGVQYXRoKGAvcmVwb3J0LyR7cmVwb3J0SWR9YClcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDQuIFBVTEwgKEJ5IFN1Ym1pdHRlcikgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdWxsUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIGNvbW1lbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIGNvbnN0IHsgZGF0YTogcmVwb3J0IH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAuc2VsZWN0KCdzdWJtaXR0ZWRfYnksIHN0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKCFyZXBvcnQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcG9ydCBub3QgZm91bmQnIH1cclxuICBcclxuICAvLyBHZXQgVXNlciBSb2xlIGZvciBPdmVycmlkZVxyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgIC5zZWxlY3QoJ3JvbGU6cm9sZXMoZGVmYXVsdF9yb2xlX2xldmVsKScpXHJcbiAgICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAgLmVxKCdhcmNoaXZlZCcsIGZhbHNlKVxyXG4gICAgIC5zaW5nbGUoKVxyXG4gICAgIFxyXG4gIGNvbnN0IHJvbGVMZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgY29uc3QgaXNTdWJtaXR0ZXIgPSByZXBvcnQuc3VibWl0dGVkX2J5ID09PSB1c2VyLmlkXHJcbiAgY29uc3QgaXNDb21tYW5kYW50ID0gcm9sZUxldmVsID49IDkwXHJcblxyXG4gIC8vIEd1YXJkIENsYXVzZVxyXG4gIGlmICghaXNTdWJtaXR0ZXIgJiYgIWlzQ29tbWFuZGFudCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdQZXJtaXNzaW9uIERlbmllZDogWW91IGNhbm5vdCBwdWxsIHRoaXMgcmVwb3J0LicgfVxyXG4gIH1cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgaWYgKHJlcG9ydC5zdGF0dXMgPT09ICdwdWxsZWQnKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RoaXMgcmVwb3J0IGlzIGFscmVhZHkgcHVsbGVkLicgfVxyXG4gIH1cclxuXHJcbiAgLy8gMi4gVXBkYXRlIHRvICdQdWxsZWQnLCBaZXJvIERlbWVyaXRzLCBSZW1vdmUgZnJvbSBBcHByb3ZhbCBDaGFpblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgICBzdGF0dXM6ICdwdWxsZWQnLCAvLyA8LS0tIERpc3RpbmN0IHN0YXR1c1xyXG4gICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwsIFxyXG4gICAgICAgIGRlbWVyaXRzX2VmZmVjdGl2ZTogMCwgLy8gRW5zdXJlIG5vIGRlbWVyaXRzIGFwcGx5XHJcbiAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgLy8gRW5zdXJlIGl0IGRvZXNuJ3QgYXBwZWFyIGluIGFueW9uZSdzIHJldmlzaW9uIHF1ZXVlXHJcbiAgICB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1B1bGwgRXJyb3I6JywgZXJyb3IpXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG4gIH1cclxuXHJcbiAgLy8gMy4gTG9nIHRoZSBhY3Rpb25cclxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHByb3ZhbF9sb2cnKS5pbnNlcnQoe1xyXG4gICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgYWN0aW9uOiAncHVsbGVkJyxcclxuICAgIGNvbW1lbnQ6IGNvbW1lbnRcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV2YWxpZGF0ZVBhdGgoJy9yZXBvcnRzL3N1Ym1pdHRlZCcpXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSA1LiBSRVNVQk1JVCAoU3RhbmRhcmQpIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdWJtaXRSZXBvcnQocmVwb3J0SWQ6IHN0cmluZywgcGF5bG9hZDoge1xyXG4gICAgb2ZmZW5zZVR5cGVJZDogc3RyaW5nLFxyXG4gICAgbm90ZXM6IHN0cmluZyxcclxuICAgIHJlcG9ydEV4cGxhbmF0aW9uOiBzdHJpbmcsXHJcbiAgICBkYXRlT2ZPZmZlbnNlOiBzdHJpbmdcclxufSkge1xyXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gICAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICAgIFxyXG4gICAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfVxyXG5cclxuICAgIC8vIFJlY2FsY3VsYXRlIEFwcHJvdmVyIENoYWluXHJcbiAgICBjb25zdCB7IGRhdGE6IHVzZXJQcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgICAgIC5lcSgnYXJjaGl2ZWQnLCBmYWxzZSlcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBjb25zdCBteUdyb3VwSWQgPSAodXNlclByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuICAgIGxldCB0YXJnZXRHcm91cElkID0gbnVsbFxyXG5cclxuICAgIGlmIChteUdyb3VwSWQpIHtcclxuICAgICAgICBjb25zdCB7IGRhdGE6IG15R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCduZXh0X2FwcHJvdmVyX2dyb3VwX2lkJylcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG15R3JvdXBJZClcclxuICAgICAgICAgICAgLnNpbmdsZSgpXHJcbiAgICAgICAgdGFyZ2V0R3JvdXBJZCA9IG15R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZ19hcHByb3ZhbCdcclxuICAgIGlmIChteUdyb3VwSWQgJiYgIXRhcmdldEdyb3VwSWQpIHtcclxuICAgICAgICBzdGF0dXMgPSAnY29tcGxldGVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiB0YXJnZXRHcm91cElkLCBcclxuICAgICAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ3Jlc3VibWl0dGVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IHJldmlzZWQgYW5kIHJlc3VibWl0dGVkJ1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDYuIEVESVQgJiBBUFBST1ZFIChDb21tYW5kIE92ZXJyaWRlKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRBbmRBcHByb3ZlUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgUGVybWlzc2lvblxyXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhkZWZhdWx0X3JvbGVfbGV2ZWwpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuZXEoJ2FyY2hpdmVkJywgZmFsc2UpXHJcbiAgICAgICAgLnNpbmdsZSgpXHJcbiAgICBcclxuICAgIGNvbnN0IHJvbGVMZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgICBpZiAocm9sZUxldmVsIDwgOTApIHJldHVybiB7IGVycm9yOiAnSW5zdWZmaWNpZW50IHBlcm1pc3Npb25zJyB9XHJcblxyXG4gICAgLy8gRm9yY2UgQ29tcGxldGVcclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsIFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBudWxsLFxyXG4gICAgICAgICAgICByZXZpc2lvbl9ieV9ncm91cF9pZDogbnVsbFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICAgIGlmICh1cGRhdGVFcnJvcikgcmV0dXJuIHsgZXJyb3I6IHVwZGF0ZUVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICAgICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgICAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgICAgICBhY3Rpb246ICdlZGl0ZWRfYW5kX2FwcHJvdmVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IGVkaXRlZCBhbmQgaW1tZWRpYXRlbHkgYXBwcm92ZWQgYnkgYXV0aG9yaXR5J1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoia1NBbU9zQiJ9
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/report/[id]/data:4fc6b1 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60b2e9c55889ac9c331e7fad367eb309d805d67e0f":"editAndApproveReport"},"app/report/[id]/actions.ts",""] */ __turbopack_context__.s([
    "editAndApproveReport",
    ()=>editAndApproveReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var editAndApproveReport = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("60b2e9c55889ac9c331e7fad367eb309d805d67e0f", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "editAndApproveReport"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAtLS0gMS4gQVBQUk9WRSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICAvLyAxLiBDaGVjayBVc2VyXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRFQlVHOiBObyBhdXRoZW50aWNhdGVkIHVzZXIgZm91bmQuXCIpO1xyXG4gICAgICByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZDogTm8gdXNlciBzZXNzaW9uLicgfVxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYERFQlVHOiBBdHRlbXB0aW5nIGFwcHJvdmFsIGZvciBSZXBvcnQgJHtyZXBvcnRJZH0gYnkgVXNlciAke3VzZXIuaWR9YCk7XHJcblxyXG4gIC8vIDIuIEZldGNoIFVzZXIncyBSb2xlICYgR3JvdXBcclxuICAvLyBGSVg6IENoYW5nZWQgJ25hbWUnIHRvICdyb2xlX25hbWUnIGluIHRoZSBzZWxlY3Qgc3RyaW5nXHJcbiAgY29uc3QgeyBkYXRhOiB1c2VyUHJvZmlsZSwgZXJyb3I6IHByb2ZpbGVFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdpZCwgcm9sZTpyb2xlcyhpZCwgcm9sZV9uYW1lLCBhcHByb3ZhbF9ncm91cF9pZCknKSBcclxuICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgLmVxKCdhcmNoaXZlZCcsIGZhbHNlKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChwcm9maWxlRXJyb3IgfHwgIXVzZXJQcm9maWxlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogQ291bGQgbm90IGZldGNoIHVzZXIgcHJvZmlsZS9yb2xlXCIsIHByb2ZpbGVFcnJvcik7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUHJvZmlsZSBFcnJvcjogJHtwcm9maWxlRXJyb3I/Lm1lc3NhZ2UgfHwgJ1Byb2ZpbGUgbm90IGZvdW5kJ31gIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IG15R3JvdXBJZCA9ICh1c2VyUHJvZmlsZS5yb2xlIGFzIGFueSk/LmFwcHJvdmFsX2dyb3VwX2lkO1xyXG4gIFxyXG4gIC8vIEZJWDogVXBkYXRlZCB0aGUgbG9nIHRvIHJlYWQgJ3JvbGVfbmFtZSdcclxuICBjb25zb2xlLmxvZyhgREVCVUc6IFVzZXIncyBHcm91cCBJRDogJHtteUdyb3VwSWR9IChSb2xlOiAkeyh1c2VyUHJvZmlsZS5yb2xlIGFzIGFueSk/LnJvbGVfbmFtZX0pYCk7XHJcblxyXG4gIC8vIDMuIEZldGNoIFJlcG9ydCBTdGF0ZSAoVGhlIFwiTG9ja1wiIG9uIHRoZSBSTFMgUG9saWN5KVxyXG4gIGNvbnN0IHsgZGF0YTogcmVwb3J0LCBlcnJvcjogcmVwb3J0RXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC5zZWxlY3QoJ2lkLCBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkLCBzdGF0dXMnKVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChyZXBvcnRFcnJvciB8fCAhcmVwb3J0KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogQ291bGQgbm90IGZldGNoIHJlcG9ydFwiLCByZXBvcnRFcnJvcik7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUmVwb3J0IEVycm9yOiAke3JlcG9ydEVycm9yPy5tZXNzYWdlIHx8ICdSZXBvcnQgbm90IGZvdW5kJ31gIH1cclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogUmVwb3J0J3MgQ3VycmVudCBHcm91cCBJRDogJHtyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZH1gKTtcclxuICBjb25zb2xlLmxvZyhgREVCVUc6IFJlcG9ydCBTdGF0dXM6ICR7cmVwb3J0LnN0YXR1c31gKTtcclxuXHJcbiAgLy8gNC4gVkVSSUZZIFBFUk1JU1NJT04gTUFUQ0hcclxuICAvLyBUaGlzIGlzIHRoZSBsb2dpYyB5b3VyIFJMUyBcIlVTSU5HXCIgY2xhdXNlIHVzZXMuIElmIHRoaXMgaXMgZmFsc2UsIFJMUyB3aWxsIGJsb2NrIHlvdS5cclxuICBpZiAocmVwb3J0LmN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQgIT09IG15R3JvdXBJZCkge1xyXG4gICAgICBjb25zdCBtc2cgPSBgREVCVUcgTUlTTUFUQ0g6IFVzZXIgR3JvdXAgKCR7bXlHcm91cElkfSkgIT0gUmVwb3J0IEdyb3VwICgke3JlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkfSlgO1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1zZyk7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiBgUGVybWlzc2lvbiBEZW5pZWQ6IFlvdSBhcmUgaW4gZ3JvdXAgJHtteUdyb3VwSWR9LCBidXQgcmVwb3J0IGlzIHdpdGggZ3JvdXAgJHtyZXBvcnQuY3VycmVudF9hcHByb3Zlcl9ncm91cF9pZH1gIH07XHJcbiAgfVxyXG5cclxuICAvLyA1LiBEZXRlcm1pbmUgTmV4dCBTdGVwXHJcbiAgY29uc3QgeyBkYXRhOiBjdXJyZW50R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnYXBwcm92YWxfZ3JvdXBzJylcclxuICAgIC5zZWxlY3QoJ25leHRfYXBwcm92ZXJfZ3JvdXBfaWQnKVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydC5jdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGNvbnN0IG5leHRHcm91cElkID0gY3VycmVudEdyb3VwPy5uZXh0X2FwcHJvdmVyX2dyb3VwX2lkIHx8IG51bGxcclxuICBjb25zdCBuZXdTdGF0dXMgPSBuZXh0R3JvdXBJZCA/ICdwZW5kaW5nX2FwcHJvdmFsJyA6ICdjb21wbGV0ZWQnXHJcblxyXG4gIGNvbnNvbGUubG9nKGBERUJVRzogQWR2YW5jaW5nIHRvIEdyb3VwOiAke25leHRHcm91cElkfSB8IE5ldyBTdGF0dXM6ICR7bmV3U3RhdHVzfWApO1xyXG5cclxuICAvLyA2LiBQZXJmb3JtIFVwZGF0ZVxyXG4gIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAudXBkYXRlKHsgXHJcbiAgICAgIHN0YXR1czogbmV3U3RhdHVzLFxyXG4gICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBuZXh0R3JvdXBJZFxyXG4gICAgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKHVwZGF0ZUVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJERUJVRzogVXBkYXRlIEZhaWxlZFwiLCB1cGRhdGVFcnJvcik7XHJcbiAgICAgIC8vIFJldHVybiB0aGUgcmF3IGRhdGFiYXNlIGVycm9yIHRvIHRoZSBVSVxyXG4gICAgICByZXR1cm4geyBlcnJvcjogYERCIFVwZGF0ZSBGYWlsZWQ6ICR7dXBkYXRlRXJyb3IubWVzc2FnZX0gKENvZGU6ICR7dXBkYXRlRXJyb3IuY29kZX0pYCB9XHJcbiAgfVxyXG5cclxuICAvLyA3LiBMb2cgU3VjY2Vzc1xyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdhcHByb3ZlZCcsXHJcbiAgICBjb21tZW50OiAnQXBwcm92ZWQnXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gMi4gUkVKRUNUIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVqZWN0UmVwb3J0QWN0aW9uKHJlcG9ydElkOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBzdGF0dXM6ICdyZWplY3RlZCcsIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwgfSlcclxuICAgIC5lcSgnaWQnLCByZXBvcnRJZClcclxuXHJcbiAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcblxyXG4gIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgYWN0b3JfaWQ6IHVzZXIuaWQsXHJcbiAgICBhY3Rpb246ICdyZWplY3RlZCcsXHJcbiAgICBjb21tZW50OiAnUmVqZWN0ZWQgYnkgYXBwcm92ZXInXHJcbiAgfSlcclxuXHJcbiAgcmV2YWxpZGF0ZVBhdGgoYC9yZXBvcnQvJHtyZXBvcnRJZH1gKVxyXG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gMy4gS0lDSyBCQUNLIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24ga2lja0JhY2tSZXBvcnRBY3Rpb24ocmVwb3J0SWQ6IHN0cmluZywgcmVhc29uOiBzdHJpbmcpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIC8vIEdldCB1c2VyJ3MgZ3JvdXAgdG8gbWFyayB3aG8ga2lja2VkIGl0IGJhY2tcclxuICBjb25zdCB7IGRhdGE6IHByb2ZpbGUgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgLnNlbGVjdCgncm9sZTpyb2xlcyhhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuZXEoJ2FyY2hpdmVkJywgZmFsc2UpXHJcbiAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gIGNvbnN0IG15R3JvdXBJZCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmFwcHJvdmFsX2dyb3VwX2lkXHJcblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgc3RhdHVzOiAnbmVlZHNfcmV2aXNpb24nLCBcclxuICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG15R3JvdXBJZCBcclxuICAgIH0pXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHByb3ZhbF9sb2cnKS5pbnNlcnQoe1xyXG4gICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgYWN0aW9uOiAnS2lja2VkIEJhY2sgZm9yIFJldmlzaW9uJyxcclxuICAgIGNvbW1lbnQ6IHJlYXNvblxyXG4gIH0pXHJcblxyXG4gIHJldmFsaWRhdGVQYXRoKGAvcmVwb3J0LyR7cmVwb3J0SWR9YClcclxuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDQuIFBVTEwgKEJ5IFN1Ym1pdHRlcikgLS0tXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdWxsUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIGNvbW1lbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gIGNvbnN0IHsgZGF0YTogcmVwb3J0IH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAuc2VsZWN0KCdzdWJtaXR0ZWRfYnksIHN0YXR1cycpXHJcbiAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcbiAgICAuc2luZ2xlKClcclxuXHJcbiAgaWYgKCFyZXBvcnQpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1JlcG9ydCBub3QgZm91bmQnIH1cclxuICBcclxuICAvLyBHZXQgVXNlciBSb2xlIGZvciBPdmVycmlkZVxyXG4gIGNvbnN0IHsgZGF0YTogcHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgIC5zZWxlY3QoJ3JvbGU6cm9sZXMoZGVmYXVsdF9yb2xlX2xldmVsKScpXHJcbiAgICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAgLmVxKCdhcmNoaXZlZCcsIGZhbHNlKVxyXG4gICAgIC5zaW5nbGUoKVxyXG4gICAgIFxyXG4gIGNvbnN0IHJvbGVMZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgY29uc3QgaXNTdWJtaXR0ZXIgPSByZXBvcnQuc3VibWl0dGVkX2J5ID09PSB1c2VyLmlkXHJcbiAgY29uc3QgaXNDb21tYW5kYW50ID0gcm9sZUxldmVsID49IDkwXHJcblxyXG4gIC8vIEd1YXJkIENsYXVzZVxyXG4gIGlmICghaXNTdWJtaXR0ZXIgJiYgIWlzQ29tbWFuZGFudCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdQZXJtaXNzaW9uIERlbmllZDogWW91IGNhbm5vdCBwdWxsIHRoaXMgcmVwb3J0LicgfVxyXG4gIH1cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgaWYgKHJlcG9ydC5zdGF0dXMgPT09ICdwdWxsZWQnKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1RoaXMgcmVwb3J0IGlzIGFscmVhZHkgcHVsbGVkLicgfVxyXG4gIH1cclxuXHJcbiAgLy8gMi4gVXBkYXRlIHRvICdQdWxsZWQnLCBaZXJvIERlbWVyaXRzLCBSZW1vdmUgZnJvbSBBcHByb3ZhbCBDaGFpblxyXG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgIC51cGRhdGUoeyBcclxuICAgICAgICBzdGF0dXM6ICdwdWxsZWQnLCAvLyA8LS0tIERpc3RpbmN0IHN0YXR1c1xyXG4gICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IG51bGwsIFxyXG4gICAgICAgIGRlbWVyaXRzX2VmZmVjdGl2ZTogMCwgLy8gRW5zdXJlIG5vIGRlbWVyaXRzIGFwcGx5XHJcbiAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgLy8gRW5zdXJlIGl0IGRvZXNuJ3QgYXBwZWFyIGluIGFueW9uZSdzIHJldmlzaW9uIHF1ZXVlXHJcbiAgICB9KVxyXG4gICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICBpZiAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1B1bGwgRXJyb3I6JywgZXJyb3IpXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG4gIH1cclxuXHJcbiAgLy8gMy4gTG9nIHRoZSBhY3Rpb25cclxuICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHByb3ZhbF9sb2cnKS5pbnNlcnQoe1xyXG4gICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgYWN0aW9uOiAncHVsbGVkJyxcclxuICAgIGNvbW1lbnQ6IGNvbW1lbnRcclxuICB9KVxyXG5cclxuICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgcmV2YWxpZGF0ZVBhdGgoJy9yZXBvcnRzL3N1Ym1pdHRlZCcpXHJcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIC0tLSA1LiBSRVNVQk1JVCAoU3RhbmRhcmQpIC0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdWJtaXRSZXBvcnQocmVwb3J0SWQ6IHN0cmluZywgcGF5bG9hZDoge1xyXG4gICAgb2ZmZW5zZVR5cGVJZDogc3RyaW5nLFxyXG4gICAgbm90ZXM6IHN0cmluZyxcclxuICAgIHJlcG9ydEV4cGxhbmF0aW9uOiBzdHJpbmcsXHJcbiAgICBkYXRlT2ZPZmZlbnNlOiBzdHJpbmdcclxufSkge1xyXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gICAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICAgIFxyXG4gICAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfVxyXG5cclxuICAgIC8vIFJlY2FsY3VsYXRlIEFwcHJvdmVyIENoYWluXHJcbiAgICBjb25zdCB7IGRhdGE6IHVzZXJQcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhhcHByb3ZhbF9ncm91cF9pZCknKVxyXG4gICAgICAgIC5lcSgnaWQnLCB1c2VyLmlkKVxyXG4gICAgICAgIC5lcSgnYXJjaGl2ZWQnLCBmYWxzZSlcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBjb25zdCBteUdyb3VwSWQgPSAodXNlclByb2ZpbGU/LnJvbGUgYXMgYW55KT8uYXBwcm92YWxfZ3JvdXBfaWRcclxuICAgIGxldCB0YXJnZXRHcm91cElkID0gbnVsbFxyXG5cclxuICAgIGlmIChteUdyb3VwSWQpIHtcclxuICAgICAgICBjb25zdCB7IGRhdGE6IG15R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgICAgIC5mcm9tKCdhcHByb3ZhbF9ncm91cHMnKVxyXG4gICAgICAgICAgICAuc2VsZWN0KCduZXh0X2FwcHJvdmVyX2dyb3VwX2lkJylcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG15R3JvdXBJZClcclxuICAgICAgICAgICAgLnNpbmdsZSgpXHJcbiAgICAgICAgdGFyZ2V0R3JvdXBJZCA9IG15R3JvdXA/Lm5leHRfYXBwcm92ZXJfZ3JvdXBfaWQgfHwgbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGF0dXMgPSAncGVuZGluZ19hcHByb3ZhbCdcclxuICAgIGlmIChteUdyb3VwSWQgJiYgIXRhcmdldEdyb3VwSWQpIHtcclxuICAgICAgICBzdGF0dXMgPSAnY29tcGxldGVkJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiB0YXJnZXRHcm91cElkLCBcclxuICAgICAgICAgICAgcmV2aXNpb25fYnlfZ3JvdXBfaWQ6IG51bGwgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgcmVwb3J0SWQpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnYXBwcm92YWxfbG9nJykuaW5zZXJ0KHtcclxuICAgICAgICByZXBvcnRfaWQ6IHJlcG9ydElkLFxyXG4gICAgICAgIGFjdG9yX2lkOiB1c2VyLmlkLFxyXG4gICAgICAgIGFjdGlvbjogJ3Jlc3VibWl0dGVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IHJldmlzZWQgYW5kIHJlc3VibWl0dGVkJ1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gLS0tIDYuIEVESVQgJiBBUFBST1ZFIChDb21tYW5kIE92ZXJyaWRlKSAtLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRBbmRBcHByb3ZlUmVwb3J0KHJlcG9ydElkOiBzdHJpbmcsIHBheWxvYWQ6IHtcclxuICAgIG9mZmVuc2VUeXBlSWQ6IHN0cmluZyxcclxuICAgIG5vdGVzOiBzdHJpbmcsXHJcbiAgICByZXBvcnRFeHBsYW5hdGlvbjogc3RyaW5nLFxyXG4gICAgZGF0ZU9mT2ZmZW5zZTogc3RyaW5nXHJcbn0pIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgUGVybWlzc2lvblxyXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdCgncm9sZTpyb2xlcyhkZWZhdWx0X3JvbGVfbGV2ZWwpJylcclxuICAgICAgICAuZXEoJ2lkJywgdXNlci5pZClcclxuICAgICAgICAuZXEoJ2FyY2hpdmVkJywgZmFsc2UpXHJcbiAgICAgICAgLnNpbmdsZSgpXHJcbiAgICBcclxuICAgIGNvbnN0IHJvbGVMZXZlbCA9IChwcm9maWxlPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgICBpZiAocm9sZUxldmVsIDwgOTApIHJldHVybiB7IGVycm9yOiAnSW5zdWZmaWNpZW50IHBlcm1pc3Npb25zJyB9XHJcblxyXG4gICAgLy8gRm9yY2UgQ29tcGxldGVcclxuICAgIGNvbnN0IHsgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC51cGRhdGUoe1xyXG4gICAgICAgICAgICBvZmZlbnNlX3R5cGVfaWQ6IHBheWxvYWQub2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICAgICAgbm90ZXM6IHBheWxvYWQubm90ZXMsXHJcbiAgICAgICAgICAgIHJlcG9ydF9leHBsYW5hdGlvbjogcGF5bG9hZC5yZXBvcnRFeHBsYW5hdGlvbixcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBwYXlsb2FkLmRhdGVPZk9mZmVuc2UsXHJcbiAgICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsIFxyXG4gICAgICAgICAgICBjdXJyZW50X2FwcHJvdmVyX2dyb3VwX2lkOiBudWxsLFxyXG4gICAgICAgICAgICByZXZpc2lvbl9ieV9ncm91cF9pZDogbnVsbFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmVxKCdpZCcsIHJlcG9ydElkKVxyXG5cclxuICAgIGlmICh1cGRhdGVFcnJvcikgcmV0dXJuIHsgZXJyb3I6IHVwZGF0ZUVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcHJvdmFsX2xvZycpLmluc2VydCh7XHJcbiAgICAgICAgcmVwb3J0X2lkOiByZXBvcnRJZCxcclxuICAgICAgICBhY3Rvcl9pZDogdXNlci5pZCxcclxuICAgICAgICBhY3Rpb246ICdlZGl0ZWRfYW5kX2FwcHJvdmVkJyxcclxuICAgICAgICBjb21tZW50OiAnUmVwb3J0IGVkaXRlZCBhbmQgaW1tZWRpYXRlbHkgYXBwcm92ZWQgYnkgYXV0aG9yaXR5J1xyXG4gICAgfSlcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aChgL3JlcG9ydC8ke3JlcG9ydElkfWApXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoid1NBa1NzQiJ9
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
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$b8185f__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/report/[id]/data:b8185f [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$a4a96b__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/report/[id]/data:a4a96b [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$80ac02__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/report/[id]/data:80ac02 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$f3eb06__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/report/[id]/data:f3eb06 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$c4e63b__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/report/[id]/data:c4e63b [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$4fc6b1__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/report/[id]/data:4fc6b1 [app-client] (ecmascript) <text/javascript>");
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
    // Define when the Appeal button should be visible
    const showAppealButton = isSubject && report.status === 'completed' && !appeal && !isAppealing;
    // Only show appeal actions if the user has permission and an appeal is active
    const showAppealActionBox = canActOnAppeal && appeal && !isEditing && !isAppealing && !isEscalating;
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
        if (action === 'approve') result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$a4a96b__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["approveReportAction"])(report.id);
        else if (action === 'reject') result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$80ac02__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["rejectReportAction"])(report.id);
        else result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$f3eb06__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["kickBackReportAction"])(report.id, comment);
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
        if (editIntent === 'approve') result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$4fc6b1__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["editAndApproveReport"])(report.id, payload);
        else result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$c4e63b__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["resubmitReport"])(report.id, payload);
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
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$report$2f5b$id$5d2f$data$3a$b8185f__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["pullReport"])(report.id, pullComment);
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
    const showPullButton = canPull && report.status !== 'pulled';
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
                                lineNumber: 302,
                                columnNumber: 45
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Edit Report"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 302,
                                columnNumber: 100
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 301,
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
                                            lineNumber: 306,
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
                                            lineNumber: 307,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 305,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-foreground",
                                            children: "Time"
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 310,
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
                                            lineNumber: 311,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 309,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 304,
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
                                lineNumber: 316,
                                columnNumber: 16
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 314,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-foreground",
                                    children: "Explanation"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 326,
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
                                    lineNumber: 327,
                                    columnNumber: 16
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 325,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-foreground",
                                    children: "Notes (Internal)"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 330,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: editableNotes,
                                    onChange: (e)=>setEditableNotes(e.target.value),
                                    rows: 2,
                                    className: "input-base w-full"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 331,
                                    columnNumber: 16
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 329,
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
                                    lineNumber: 334,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: isActionLoading,
                                    className: `w-1/2 py-2 text-primary-foreground rounded-md shadow ${editIntent === 'approve' ? 'bg-primary hover:bg-primary/90' : 'bg-primary hover:bg-primary/90'} disabled:opacity-50`,
                                    children: isActionLoading ? 'Saving...' : editIntent === 'approve' ? 'Confirm & Approve' : 'Resubmit'
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 335,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 333,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                    lineNumber: 300,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 299,
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
                                lineNumber: 348,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`,
                                children: formatStatus(report.status)
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 351,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 347,
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
                                        lineNumber: 358,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg text-foreground",
                                        children: formatName(report.subject)
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 358,
                                        columnNumber: 88
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 358,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-muted-foreground",
                                        children: "Submitted By"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 359,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg text-foreground",
                                        children: formatName(report.submitter)
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 359,
                                        columnNumber: 93
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 359,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-muted-foreground",
                                        children: "Date & Time"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 360,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg text-foreground",
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDateTime"])(report.date_of_offense).toLocaleString()
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 360,
                                        columnNumber: 92
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 360,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-muted-foreground",
                                        children: "Category"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 361,
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
                                        lineNumber: 361,
                                        columnNumber: 89
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 361,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-muted-foreground",
                                        children: "Demerits"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 362,
                                        columnNumber: 18
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-lg font-bold text-destructive",
                                        children: report.demerits_effective
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 362,
                                        columnNumber: 89
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 362,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 357,
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
                                lineNumber: 365,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-1 p-3 bg-muted/50 rounded text-foreground text-sm border border-border",
                                children: report.notes || 'None'
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 365,
                                columnNumber: 115
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 365,
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
                                lineNumber: 366,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-1 p-3 bg-muted/50 rounded text-foreground text-sm border border-border whitespace-pre-wrap",
                                children: report.report_explanation || 'None'
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 366,
                                columnNumber: 114
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 366,
                        columnNumber: 11
                    }, this),
                    showAppealButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 border-t border-border pt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-medium text-foreground mb-4",
                                children: "Appeal"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 373,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground mb-4",
                                children: "If you believe this report is in error, you may submit an appeal. This will be escalated to your chain of command."
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 374,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setIsAppealing(true),
                                className: "py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90",
                                children: "Appeal this Report"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 378,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 372,
                        columnNumber: 13
                    }, this),
                    isAppealing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 bg-card border border-border p-6 rounded-lg shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-foreground mb-4",
                                children: "Submit Appeal"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 390,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleSubmitAppeal,
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-sm font-medium text-foreground mb-1",
                                                children: "Justification"
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 393,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                required: true,
                                                value: appealJustification,
                                                onChange: (e)=>setAppealJustification(e.target.value),
                                                rows: 5,
                                                className: "input-base w-full p-2 border rounded bg-background text-foreground",
                                                placeholder: "Explain clearly why this report is incorrect or unjust..."
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 396,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 392,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setIsAppealing(false),
                                                disabled: isActionLoading,
                                                className: "w-1/2 py-2 border border-input rounded-md text-foreground hover:bg-accent",
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 407,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                disabled: isActionLoading,
                                                className: "w-1/2 py-2 bg-primary text-primary-foreground rounded-md shadow hover:bg-primary/90 disabled:opacity-50",
                                                children: isActionLoading ? 'Submitting...' : 'Submit Appeal'
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 415,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 406,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 391,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 389,
                        columnNumber: 13
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
                                            lineNumber: 431,
                                            columnNumber: 27
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-bold text-primary uppercase tracking-wider",
                                            children: formatAppealStatus(appeal.status)
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 432,
                                            columnNumber: 27
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 430,
                                    columnNumber: 23
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 429,
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
                                            lineNumber: 439,
                                            columnNumber: 27
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-foreground whitespace-pre-wrap",
                                            children: appeal.justification
                                        }, void 0, false, {
                                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                            lineNumber: 440,
                                            columnNumber: 27
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 438,
                                    columnNumber: 23
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 437,
                                columnNumber: 19
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 428,
                        columnNumber: 15
                    }, this),
                    showAppealActionBox && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 border-t border-border pt-6 bg-primary/5 p-4 rounded-lg border-primary/20",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-foreground mb-4",
                                children: "Appeal Authority Actions"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 449,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-foreground mb-1",
                                        children: "Decision Comment / Reason"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 453,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        value: appealComment,
                                        onChange: (e)=>setAppealComment(e.target.value),
                                        className: "input-base w-full p-2 border rounded",
                                        rows: 3,
                                        placeholder: "Required for Rejection or Granting..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 454,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 452,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleAppealAction('grant'),
                                        disabled: isActionLoading,
                                        className: "flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50",
                                        children: "Grant Appeal"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 464,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleAppealAction('reject'),
                                        disabled: isActionLoading,
                                        className: "flex-1 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50",
                                        children: "Reject Appeal"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 471,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setIsEscalating(true),
                                        disabled: isActionLoading,
                                        className: "flex-1 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50",
                                        children: "Escalate Appeal"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 480,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 463,
                                columnNumber: 19
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 448,
                        columnNumber: 15
                    }, this),
                    isEscalating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 bg-card border border-border p-6 rounded-lg shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-foreground mb-4",
                                children: "Escalate Appeal"
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 494,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground mb-4",
                                children: "You are escalating this appeal to the next level in the chain of command. Please provide a justification for this escalation."
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 495,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleEscalate,
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-sm font-medium text-foreground mb-1",
                                                children: "Escalation Justification"
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 501,
                                                columnNumber: 27
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                required: true,
                                                value: appealJustification,
                                                onChange: (e)=>setAppealJustification(e.target.value),
                                                rows: 4,
                                                className: "input-base w-full p-2 border rounded",
                                                placeholder: "Why is this being escalated?"
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 503,
                                                columnNumber: 27
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 500,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setIsEscalating(false),
                                                disabled: isActionLoading,
                                                className: "w-1/2 py-2 border border-input rounded-md text-foreground hover:bg-accent",
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 513,
                                                columnNumber: 27
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                disabled: isActionLoading,
                                                className: "w-1/2 py-2 bg-orange-500 text-white rounded-md shadow hover:bg-orange-600 disabled:opacity-50",
                                                children: isActionLoading ? 'Processing...' : 'Confirm Escalation'
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 521,
                                                columnNumber: 27
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 512,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 499,
                                columnNumber: 19
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 493,
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
                                lineNumber: 536,
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
                                lineNumber: 537,
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
                                        lineNumber: 539,
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
                                        lineNumber: 542,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleApprovalAction('kickback'),
                                        disabled: isActionLoading,
                                        className: "flex-1 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50",
                                        children: "Kick Back"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 551,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleApprovalAction('reject'),
                                        disabled: isActionLoading,
                                        className: "flex-1 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50",
                                        children: "Reject"
                                    }, void 0, false, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 552,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 538,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 535,
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
                                lineNumber: 560,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm mt-1 mb-3 text-orange-600 dark:text-orange-400",
                                children: "Please edit and resubmit this report."
                            }, void 0, false, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 561,
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
                                lineNumber: 562,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 559,
                        columnNumber: 13
                    }, this),
                    showPullButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 border-t border-border pt-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setIsPullModalOpen(true),
                            className: "inline-flex items-center justify-center px-4 py-2 bg-slate-600 text-white font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors shadow-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "mr-2",
                                    children: "↩"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 573,
                                    columnNumber: 17
                                }, this),
                                " Pull Report"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 569,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 568,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 345,
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
                        lineNumber: 584,
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
                                                        lineNumber: 589,
                                                        columnNumber: 75
                                                    }, this),
                                                    ": ",
                                                    log.action
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 589,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-muted-foreground",
                                                children: new Date(log.created_at).toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                                lineNumber: 590,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                        lineNumber: 588,
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
                                        lineNumber: 592,
                                        columnNumber: 35
                                    }, this)
                                ]
                            }, log.id, true, {
                                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                lineNumber: 587,
                                columnNumber: 17
                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-muted-foreground",
                            children: "No history yet."
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 594,
                            columnNumber: 20
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                        lineNumber: 585,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 583,
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
                            lineNumber: 603,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-2 text-sm text-muted-foreground",
                            children: "This will retract the report, set demerits to zero, and remove it from the approval chain."
                        }, void 0, false, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 604,
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
                            lineNumber: 607,
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
                                    lineNumber: 615,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handlePullReport,
                                    disabled: !pullComment.trim(),
                                    className: "w-1/2 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50",
                                    children: "Confirm Pull"
                                }, void 0, false, {
                                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                                    lineNumber: 616,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                            lineNumber: 614,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                    lineNumber: 602,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
                lineNumber: 601,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/report/[id]/ReportDetailsClient.tsx",
        lineNumber: 295,
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

//# sourceMappingURL=app_7659c6df._.js.map