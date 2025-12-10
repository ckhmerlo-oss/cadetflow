(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
                className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                children: [
                    label,
                    " ",
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-red-500",
                        children: "*"
                    }, void 0, false, {
                        fileName: "[project]/app/components/SearchableSelect.tsx",
                        lineNumber: 79,
                        columnNumber: 34
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/SearchableSelect.tsx",
                lineNumber: 78,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: inputRef,
                        type: "text",
                        className: `block w-full rounded-md border bg-white dark:bg-gray-900 py-2 pl-3 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white ${error ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`,
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
                        lineNumber: 84,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-y-0 right-0 flex items-center pr-2 gap-1",
                        children: [
                            value && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleClear,
                                className: "p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
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
                                        lineNumber: 109,
                                        columnNumber: 100
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/SearchableSelect.tsx",
                                    lineNumber: 109,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/SearchableSelect.tsx",
                                lineNumber: 103,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pointer-events-none text-gray-400",
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
                                        lineNumber: 115,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/SearchableSelect.tsx",
                                    lineNumber: 114,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/SearchableSelect.tsx",
                                lineNumber: 113,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/SearchableSelect.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/SearchableSelect.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this),
            isOpen && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
                children: filteredOptions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                    className: "relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500 dark:text-gray-300",
                    children: "No results found."
                }, void 0, false, {
                    fileName: "[project]/app/components/SearchableSelect.tsx",
                    lineNumber: 124,
                    columnNumber: 13
                }, this) : filteredOptions.map((option, index)=>{
                    const showGroupHeader = option.group && (index === 0 || option.group !== filteredOptions[index - 1].group);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            showGroupHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 py-1 pl-2 pr-9 text-xs font-bold text-gray-500 dark:text-gray-400",
                                children: option.group
                            }, void 0, false, {
                                fileName: "[project]/app/components/SearchableSelect.tsx",
                                lineNumber: 133,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: `relative cursor-pointer select-none py-2 pr-9 text-gray-900 dark:text-white hover:bg-indigo-600 hover:text-white ${option.id === value ? 'bg-indigo-600 text-white' : ''} ${option.group ? 'pl-5' : 'pl-3'}`,
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
                                        lineNumber: 147,
                                        columnNumber: 21
                                    }, this),
                                    option.id === value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "absolute inset-y-0 right-0 flex items-center pr-4 text-white",
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
                                                lineNumber: 153,
                                                columnNumber: 29
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/SearchableSelect.tsx",
                                            lineNumber: 152,
                                            columnNumber: 27
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/SearchableSelect.tsx",
                                        lineNumber: 151,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/SearchableSelect.tsx",
                                lineNumber: 137,
                                columnNumber: 19
                            }, this)
                        ]
                    }, option.id, true, {
                        fileName: "[project]/app/components/SearchableSelect.tsx",
                        lineNumber: 131,
                        columnNumber: 17
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/app/components/SearchableSelect.tsx",
                lineNumber: 122,
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
"[project]/app/incidents/data:5504bd [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40ea4824ebb15e230302cbedc00d4d62f0c65d0aa6":"submitIncident"},"app/incidents/actions.ts",""] */ __turbopack_context__.s([
    "submitIncident",
    ()=>submitIncident
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var submitIncident = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("40ea4824ebb15e230302cbedc00d4d62f0c65d0aa6", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "submitIncident"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG5leHBvcnQgdHlwZSBJbmNpZGVudFJlcG9ydCA9IHtcclxuICBpZDogc3RyaW5nXHJcbiAgY3JlYXRlZF9hdDogc3RyaW5nXHJcbiAgcmVwb3J0ZXJfaWQ6IHN0cmluZ1xyXG4gIHN1YmplY3RfY2FkZXRfaWQ6IHN0cmluZ1xyXG4gIGRlc2NyaXB0aW9uOiBzdHJpbmdcclxuICBsb2NhdGlvbjogc3RyaW5nXHJcbiAgaW5jaWRlbnRfdGltZTogc3RyaW5nXHJcbiAgYWN0aW9uX3Rha2VuOiBzdHJpbmcgfCBudWxsXHJcbiAgc3RhdHVzOiAncGVuZGluZycgfCAnaGFuZGxlZCcgfCAnY29udmVydGVkJ1xyXG4gIHJlc29sdmVkX2F0OiBzdHJpbmcgfCBudWxsXHJcbiAgcmVzb2x2ZWRfYnk6IHN0cmluZyB8IG51bGxcclxuICByZXNvbHV0aW9uX25vdGVzOiBzdHJpbmcgfCBudWxsXHJcbiAgLy8gSm9pbnNcclxuICByZXBvcnRlcjogeyBmaXJzdF9uYW1lOiBzdHJpbmc7IGxhc3RfbmFtZTogc3RyaW5nIH1cclxuICBzdWJqZWN0OiB7IGZpcnN0X25hbWU6IHN0cmluZzsgbGFzdF9uYW1lOiBzdHJpbmc7IGNvbXBhbnk/OiB7IGNvbXBhbnlfbmFtZTogc3RyaW5nIH0gfVxyXG4gIHJlc29sdmVyPzogeyBmaXJzdF9uYW1lOiBzdHJpbmc7IGxhc3RfbmFtZTogc3RyaW5nIH1cclxufVxyXG5cclxuLy8gLS0tIEZFVENISU5HIC0tLVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEluY2lkZW50cyhmaWx0ZXI6ICdwZW5kaW5nJyB8ICdyZXNvbHZlZCcgfCAnYWxsJyA9ICdwZW5kaW5nJykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIFxyXG4gIGlmICghdXNlcikgcmV0dXJuIFtdXHJcblxyXG4gIC8vIFJCQUM6IENoZWNrIGlmIHZpZXdlciBpcyBTdGFmZiAoTGV2ZWwgNTArKSBvciBqdXN0IEZhY3VsdHlcclxuICAvLyAoUG9saWN5IGhhbmRsZXMgc2VjdXJpdHksIHRoaXMganVzdCBoZWxwcyBVSSBsb2dpYyBpZiBuZWVkZWQsIGJ1dCB3ZSdsbCByZWx5IG9uIFJMUylcclxuICBcclxuICBsZXQgcXVlcnkgPSBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2luY2lkZW50X3JlcG9ydHMnKVxyXG4gICAgLnNlbGVjdChgXHJcbiAgICAgICosXHJcbiAgICAgIHJlcG9ydGVyOnJlcG9ydGVyX2lkKGZpcnN0X25hbWUsIGxhc3RfbmFtZSksXHJcbiAgICAgIHN1YmplY3Q6c3ViamVjdF9jYWRldF9pZChmaXJzdF9uYW1lLCBsYXN0X25hbWUsIGNvbXBhbnk6Y29tcGFuaWVzKGNvbXBhbnlfbmFtZSkpLFxyXG4gICAgICByZXNvbHZlcjpyZXNvbHZlZF9ieShmaXJzdF9uYW1lLCBsYXN0X25hbWUpXHJcbiAgICBgKVxyXG4gICAgLm9yZGVyKCdjcmVhdGVkX2F0JywgeyBhc2NlbmRpbmc6IGZhbHNlIH0pXHJcblxyXG4gIGlmIChmaWx0ZXIgPT09ICdwZW5kaW5nJykge1xyXG4gICAgICBxdWVyeSA9IHF1ZXJ5LmVxKCdzdGF0dXMnLCAncGVuZGluZycpXHJcbiAgfSBlbHNlIGlmIChmaWx0ZXIgPT09ICdyZXNvbHZlZCcpIHtcclxuICAgICAgcXVlcnkgPSBxdWVyeS5pbignc3RhdHVzJywgWydoYW5kbGVkJywgJ2NvbnZlcnRlZCddKVxyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgcXVlcnlcclxuICBcclxuICBpZiAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgaW5jaWRlbnRzOicsIGVycm9yKVxyXG4gICAgICByZXR1cm4gW11cclxuICB9XHJcblxyXG4gIHJldHVybiBkYXRhIGFzIEluY2lkZW50UmVwb3J0W11cclxufVxyXG5cclxuLy8gLS0tIFNVQk1JU1NJT04gKFRlYWNoZXJzKSAtLS1cclxuXHJcbnR5cGUgSW5jaWRlbnRQYXlsb2FkID0ge1xyXG4gICAgY2FkZXRJZHM6IHN0cmluZ1tdXHJcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nXHJcbiAgICBsb2NhdGlvbjogc3RyaW5nXHJcbiAgICBpbmNpZGVudF90aW1lOiBzdHJpbmcgLy8gSVNPIFN0cmluZ1xyXG4gICAgYWN0aW9uX3Rha2VuPzogc3RyaW5nXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdWJtaXRJbmNpZGVudChwYXlsb2FkOiBJbmNpZGVudFBheWxvYWQpIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgb25lIHJlcG9ydCBwZXIgY2FkZXRcclxuICAgIGNvbnN0IHJvd3MgPSBwYXlsb2FkLmNhZGV0SWRzLm1hcChjYWRldElkID0+ICh7XHJcbiAgICAgICAgcmVwb3J0ZXJfaWQ6IHVzZXIuaWQsXHJcbiAgICAgICAgc3ViamVjdF9jYWRldF9pZDogY2FkZXRJZCxcclxuICAgICAgICBkZXNjcmlwdGlvbjogcGF5bG9hZC5kZXNjcmlwdGlvbixcclxuICAgICAgICBsb2NhdGlvbjogcGF5bG9hZC5sb2NhdGlvbixcclxuICAgICAgICBpbmNpZGVudF90aW1lOiBwYXlsb2FkLmluY2lkZW50X3RpbWUsXHJcbiAgICAgICAgYWN0aW9uX3Rha2VuOiBwYXlsb2FkLmFjdGlvbl90YWtlbiB8fCBudWxsLFxyXG4gICAgICAgIHN0YXR1czogJ3BlbmRpbmcnXHJcbiAgICB9KSlcclxuXHJcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdpbmNpZGVudF9yZXBvcnRzJykuaW5zZXJ0KHJvd3MpXHJcblxyXG4gICAgaWYgKGVycm9yKSByZXR1cm4geyBlcnJvcjogZXJyb3IubWVzc2FnZSB9XHJcbiAgICBcclxuICAgIHJldmFsaWRhdGVQYXRoKCcvaW5jaWRlbnRzJylcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAtLS0gUkVTT0xVVElPTiAoVEFDcykgLS0tXHJcblxyXG4vLyBPcHRpb24gQTogTWFyayBhcyBcIkhhbmRsZWRcIiAoTm8gRGVtZXJpdHMpXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXNvbHZlQXNIYW5kbGVkKGluY2lkZW50SWQ6IHN0cmluZywgbm90ZXM6IHN0cmluZykge1xyXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gICAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICAgIFxyXG4gICAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfVxyXG5cclxuICAgIC8vIDEuIFVwZGF0ZSBJbmNpZGVudCBTdGF0dXNcclxuICAgIGNvbnN0IHsgZGF0YTogaW5jaWRlbnQsIGVycm9yOiB1cGRhdGVFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgnaW5jaWRlbnRfcmVwb3J0cycpXHJcbiAgICAgICAgLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIHN0YXR1czogJ2hhbmRsZWQnLFxyXG4gICAgICAgICAgICByZXNvbHZlZF9ieTogdXNlci5pZCxcclxuICAgICAgICAgICAgcmVzb2x2ZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICAgICAgcmVzb2x1dGlvbl9ub3Rlczogbm90ZXNcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5lcSgnaWQnLCBpbmNpZGVudElkKVxyXG4gICAgICAgIC5zZWxlY3QoKVxyXG4gICAgICAgIC5zaW5nbGUoKVxyXG5cclxuICAgIGlmICh1cGRhdGVFcnJvcikgcmV0dXJuIHsgZXJyb3I6IHVwZGF0ZUVycm9yLm1lc3NhZ2UgfVxyXG5cclxuICAgIC8vIDIuIEluc2VydCBpbnRvIExlZGdlciAoMCB2YWx1ZSkgc28gaXQgYXBwZWFycyBpbiBoaXN0b3J5XHJcbiAgICAvLyBXZSBhc3N1bWUgJ3RvdXJfbGVkZ2VyJyBhbGxvd3MgZGlyZWN0IGluc2VydHMgZm9yIGFkbWlucy9UQUNzXHJcbiAgICBjb25zdCB7IGVycm9yOiBsZWRnZXJFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgndG91cl9sZWRnZXInKVxyXG4gICAgICAgIC5pbnNlcnQoe1xyXG4gICAgICAgICAgICBjYWRldF9pZDogaW5jaWRlbnQuc3ViamVjdF9jYWRldF9pZCxcclxuICAgICAgICAgICAgc3RhZmZfaWQ6IHVzZXIuaWQsXHJcbiAgICAgICAgICAgIGFtb3VudDogMCxcclxuICAgICAgICAgICAgYWN0aW9uOiAnYWRqdXN0bWVudCcsIC8vIG9yICdpbmNpZGVudCcgaWYgZW51bSBzdXBwb3J0c1xyXG4gICAgICAgICAgICBjb21tZW50OiBgSW5jaWRlbnQgSGFuZGxlZDogJHtub3Rlc30gKFJlZjogJHtpbmNpZGVudC5kZXNjcmlwdGlvbi5zdWJzdHJpbmcoMCwgMjApfS4uLilgXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICBpZiAobGVkZ2VyRXJyb3IpIGNvbnNvbGUuZXJyb3IoXCJMZWRnZXIgbG9nZ2luZyBmYWlsZWQ6XCIsIGxlZGdlckVycm9yKVxyXG5cclxuICAgIHJldmFsaWRhdGVQYXRoKCcvaW5jaWRlbnRzJylcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyBPcHRpb24gQjogQ29udmVydCB0byBEZW1lcml0c1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29udmVydFRvRGVtZXJpdChpbmNpZGVudElkOiBzdHJpbmcsIG9mZmVuc2VUeXBlSWQ6IHN0cmluZywgbm90ZXM6IHN0cmluZykge1xyXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gICAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICAgIFxyXG4gICAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfVxyXG5cclxuICAgIC8vIDEuIEdldCBJbmNpZGVudCBEZXRhaWxzXHJcbiAgICBjb25zdCB7IGRhdGE6IGluY2lkZW50IH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdpbmNpZGVudF9yZXBvcnRzJylcclxuICAgICAgICAuc2VsZWN0KCcqJylcclxuICAgICAgICAuZXEoJ2lkJywgaW5jaWRlbnRJZClcclxuICAgICAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gICAgaWYgKCFpbmNpZGVudCkgcmV0dXJuIHsgZXJyb3I6IFwiSW5jaWRlbnQgbm90IGZvdW5kXCIgfVxyXG5cclxuICAgIC8vIDIuIENhbGwgUlBDIHRvIGNyZWF0ZSB0aGUgcmVwb3J0XHJcbiAgICAvLyBXZSBhcHBlbmQgdGhlIGluY2lkZW50IGluZm8gdG8gdGhlIG5vdGVzIGZvciBjb250ZXh0XHJcbiAgICBjb25zdCBmdWxsTm90ZXMgPSBgJHtub3Rlc31cXG5cXG5bT3JpZ2luYXRpbmcgSW5jaWRlbnRdXFxuUmVwb3J0ZXI6IChUZWFjaGVyKVxcblRpbWU6ICR7bmV3IERhdGUoaW5jaWRlbnQuaW5jaWRlbnRfdGltZSkudG9Mb2NhbGVTdHJpbmcoKX1cXG5Mb2M6ICR7aW5jaWRlbnQubG9jYXRpb259XFxuRGVzYzogJHtpbmNpZGVudC5kZXNjcmlwdGlvbn1gXHJcblxyXG4gICAgY29uc3QgeyBlcnJvcjogcnBjRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLnJwYygnY3JlYXRlX25ld19yZXBvcnQnLCB7XHJcbiAgICAgICAgcF9zdWJqZWN0X2NhZGV0X2lkOiBpbmNpZGVudC5zdWJqZWN0X2NhZGV0X2lkLFxyXG4gICAgICAgIHBfb2ZmZW5zZV90eXBlX2lkOiBvZmZlbnNlVHlwZUlkLFxyXG4gICAgICAgIHBfbm90ZXM6IGZ1bGxOb3RlcyxcclxuICAgICAgICBwX29mZmVuc2VfdGltZXN0YW1wOiBpbmNpZGVudC5pbmNpZGVudF90aW1lXHJcbiAgICB9KVxyXG5cclxuICAgIGlmIChycGNFcnJvcikgcmV0dXJuIHsgZXJyb3I6IFwiRmFpbGVkIHRvIGNyZWF0ZSBkZW1lcml0IHJlcG9ydDogXCIgKyBycGNFcnJvci5tZXNzYWdlIH1cclxuXHJcbiAgICAvLyAzLiBGaW5kIHRoZSByZXBvcnQgd2UganVzdCBjcmVhdGVkIHRvIGxpbmsgaXRcclxuICAgIC8vIChTaW5jZSBSUEMgaW1wbGllcyB2b2lkIHJldHVybiB1c3VhbGx5LCB3ZSBmZXRjaCB0aGUgbGF0ZXN0IGJ5IHRoaXMgdXNlciBmb3IgdGhpcyBjYWRldClcclxuICAgIGNvbnN0IHsgZGF0YTogbmV3UmVwb3J0IH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC5zZWxlY3QoJ2lkJylcclxuICAgICAgICAuZXEoJ3N1Ym1pdHRlZF9ieScsIHVzZXIuaWQpXHJcbiAgICAgICAgLmVxKCdzdWJqZWN0X2NhZGV0X2lkJywgaW5jaWRlbnQuc3ViamVjdF9jYWRldF9pZClcclxuICAgICAgICAub3JkZXIoJ2NyZWF0ZWRfYXQnLCB7IGFzY2VuZGluZzogZmFsc2UgfSlcclxuICAgICAgICAubGltaXQoMSlcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBpZiAobmV3UmVwb3J0KSB7XHJcbiAgICAgICAgLy8gTGluayB0aGVtXHJcbiAgICAgICAgYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAgICAgLmZyb20oJ2RlbWVyaXRfcmVwb3J0cycpXHJcbiAgICAgICAgICAgIC51cGRhdGUoeyBsaW5rZWRfaW5jaWRlbnRfaWQ6IGluY2lkZW50SWQgfSlcclxuICAgICAgICAgICAgLmVxKCdpZCcsIG5ld1JlcG9ydC5pZClcclxuICAgIH1cclxuXHJcbiAgICAvLyA0LiBVcGRhdGUgSW5jaWRlbnQgU3RhdHVzXHJcbiAgICBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdpbmNpZGVudF9yZXBvcnRzJylcclxuICAgICAgICAudXBkYXRlKHtcclxuICAgICAgICAgICAgc3RhdHVzOiAnY29udmVydGVkJyxcclxuICAgICAgICAgICAgcmVzb2x2ZWRfYnk6IHVzZXIuaWQsXHJcbiAgICAgICAgICAgIHJlc29sdmVkX2F0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgICAgIHJlc29sdXRpb25fbm90ZXM6IFwiQ29udmVydGVkIHRvIERlbWVyaXQgUmVwb3J0XCJcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5lcSgnaWQnLCBpbmNpZGVudElkKVxyXG5cclxuICAgIHJldmFsaWRhdGVQYXRoKCcvaW5jaWRlbnRzJylcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJnU0F1RXNCIn0=
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/incidents/create/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CreateIncidentPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SearchableSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/SearchableSelect.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$data$3a$5504bd__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/incidents/data:5504bd [app-client] (ecmascript) <text/javascript>"); // From Phase 2
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function CreateIncidentPage() {
    _s();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [cadets, setCadets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedCadets, setSelectedCadets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        action_taken: ''
    });
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateIncidentPage.useEffect": ()=>{
            async function loadCadets() {
                // Reusing the search logic from sports/actions or similar RPC
                // For simplicity, we fetch the light roster here
                const { data } = await supabase.from('profiles').select('id, first_name, last_name, company:companies(company_name), role:roles!inner(default_role_level)').lt('role.default_role_level', 50) // Students only
                .order('last_name');
                if (data) {
                    setCadets(data.map({
                        "CreateIncidentPage.useEffect.loadCadets": (c)=>({
                                id: c.id,
                                label: `${c.last_name}, ${c.first_name} (${c.company?.company_name || 'No Co'})`
                            })
                    }["CreateIncidentPage.useEffect.loadCadets"]));
                }
            }
            loadCadets();
        }
    }["CreateIncidentPage.useEffect"], [
        supabase
    ]);
    const cadetOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CreateIncidentPage.useMemo[cadetOptions]": ()=>cadets
    }["CreateIncidentPage.useMemo[cadetOptions]"], [
        cadets
    ]);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (selectedCadets.length === 0) return alert("Select at least one cadet.");
        setLoading(true);
        const isoDate = new Date(`${formData.date}T${formData.time}:00`).toISOString();
        const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$data$3a$5504bd__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["submitIncident"])({
            cadetIds: selectedCadets,
            description: formData.description,
            location: formData.location,
            incident_time: isoDate,
            action_taken: formData.action_taken
        });
        if (error) {
            alert("Error: " + error);
            setLoading(false);
        } else {
            router.push('/incidents'); // Redirect to list to see "Pending" status
        }
    };
    // Helper to add/remove multiple cadets
    const handleAddCadet = (id)=>{
        if (id && !selectedCadets.includes(id)) setSelectedCadets([
            ...selectedCadets,
            id
        ]);
    };
    const removeCadet = (id)=>setSelectedCadets(selectedCadets.filter((c)=>c !== id));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-2xl mx-auto p-4 sm:p-6 lg:p-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold text-gray-900 dark:text-white mb-6",
                    children: "Report an Incident"
                }, void 0, false, {
                    fileName: "[project]/app/incidents/create/page.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2",
                                    children: "Who was involved?"
                                }, void 0, false, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 84,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-2 mb-2",
                                    children: selectedCadets.map((id)=>{
                                        const c = cadets.find((x)=>x.id === id);
                                        return c ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded-full flex items-center gap-1",
                                            children: [
                                                c.label,
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>removeCadet(id),
                                                    className: "hover:text-red-600 font-bold ml-1",
                                                    children: "×"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/incidents/create/page.tsx",
                                                    lineNumber: 91,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, id, true, {
                                            fileName: "[project]/app/incidents/create/page.tsx",
                                            lineNumber: 89,
                                            columnNumber: 29
                                        }, this) : null;
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 85,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SearchableSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    label: "",
                                    options: cadetOptions,
                                    value: "",
                                    onChange: handleAddCadet,
                                    placeholder: "Search cadets..."
                                }, void 0, false, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 96,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/incidents/create/page.tsx",
                            lineNumber: 83,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                            children: "Date"
                                        }, void 0, false, {
                                            fileName: "[project]/app/incidents/create/page.tsx",
                                            lineNumber: 108,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "date",
                                            required: true,
                                            value: formData.date,
                                            onChange: (e)=>setFormData({
                                                    ...formData,
                                                    date: e.target.value
                                                }),
                                            className: "w-full border rounded p-2 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                                        }, void 0, false, {
                                            fileName: "[project]/app/incidents/create/page.tsx",
                                            lineNumber: 109,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 107,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                            children: "Time"
                                        }, void 0, false, {
                                            fileName: "[project]/app/incidents/create/page.tsx",
                                            lineNumber: 112,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "time",
                                            required: true,
                                            value: formData.time,
                                            onChange: (e)=>setFormData({
                                                    ...formData,
                                                    time: e.target.value
                                                }),
                                            className: "w-full border rounded p-2 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                                        }, void 0, false, {
                                            fileName: "[project]/app/incidents/create/page.tsx",
                                            lineNumber: 113,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 111,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "md:col-span-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                            children: "Location"
                                        }, void 0, false, {
                                            fileName: "[project]/app/incidents/create/page.tsx",
                                            lineNumber: 116,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            required: true,
                                            placeholder: "e.g. Mess Hall, Science Lab 2",
                                            value: formData.location,
                                            onChange: (e)=>setFormData({
                                                    ...formData,
                                                    location: e.target.value
                                                }),
                                            className: "w-full border rounded p-2 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                                        }, void 0, false, {
                                            fileName: "[project]/app/incidents/create/page.tsx",
                                            lineNumber: 117,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 115,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/incidents/create/page.tsx",
                            lineNumber: 106,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                    children: "Description of Event"
                                }, void 0, false, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 123,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    required: true,
                                    rows: 4,
                                    placeholder: "Describe exactly what happened...",
                                    value: formData.description,
                                    onChange: (e)=>setFormData({
                                            ...formData,
                                            description: e.target.value
                                        }),
                                    className: "w-full border rounded p-2 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                                }, void 0, false, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 124,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/incidents/create/page.tsx",
                            lineNumber: 122,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                    children: "Action Taken (Optional)"
                                }, void 0, false, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 129,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    rows: 2,
                                    placeholder: "Did you correct them on the spot? Assign cleaning?",
                                    value: formData.action_taken,
                                    onChange: (e)=>setFormData({
                                            ...formData,
                                            action_taken: e.target.value
                                        }),
                                    className: "w-full border rounded p-2 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                                }, void 0, false, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 130,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/incidents/create/page.tsx",
                            lineNumber: 128,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end pt-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: loading,
                                className: "bg-indigo-600 text-white px-6 py-2 rounded shadow font-bold hover:bg-indigo-700 disabled:opacity-50",
                                children: loading ? 'Submitting...' : 'Submit Incident'
                            }, void 0, false, {
                                fileName: "[project]/app/incidents/create/page.tsx",
                                lineNumber: 134,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/incidents/create/page.tsx",
                            lineNumber: 133,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/incidents/create/page.tsx",
                    lineNumber: 80,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/incidents/create/page.tsx",
            lineNumber: 77,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/incidents/create/page.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_s(CreateIncidentPage, "+Cu3admtCKWAevkpCuipbtD4b44=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = CreateIncidentPage;
var _c;
__turbopack_context__.k.register(_c, "CreateIncidentPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This file must be bundled in the app's client layer, it shouldn't be directly
// imported by the server.
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    callServer: null,
    createServerReference: null,
    findSourceMapURL: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    callServer: function() {
        return _appcallserver.callServer;
    },
    createServerReference: function() {
        return _client.createServerReference;
    },
    findSourceMapURL: function() {
        return _appfindsourcemapurl.findSourceMapURL;
    }
});
const _appcallserver = __turbopack_context__.r("[project]/node_modules/next/dist/client/app-call-server.js [app-client] (ecmascript)");
const _appfindsourcemapurl = __turbopack_context__.r("[project]/node_modules/next/dist/client/app-find-source-map-url.js [app-client] (ecmascript)");
const _client = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react-server-dom-turbopack/client.js [app-client] (ecmascript)"); //# sourceMappingURL=action-client-wrapper.js.map
}),
]);

//# sourceMappingURL=_99622861._.js.map