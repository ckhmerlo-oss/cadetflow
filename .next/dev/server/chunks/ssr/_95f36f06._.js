module.exports = [
"[project]/app/components/SearchableSelect.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SearchableSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function SearchableSelect({ label, options, value, onChange, placeholder = 'Select...', required = false, disabled = false, error = false }) {
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const selectedItem = options.find((opt)=>opt.id === value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (selectedItem) {
            setSearch(selectedItem.label);
        } else {
            if (!isOpen) setSearch('');
        }
    }, [
        selectedItem,
        isOpen
    ]);
    const filteredOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return options.filter((opt)=>opt.label.toLowerCase().includes(search.toLowerCase()) || opt.group && opt.group.toLowerCase().includes(search.toLowerCase()));
    }, [
        options,
        search
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                if (selectedItem) setSearch(selectedItem.label);
                else setSearch('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>document.removeEventListener('mousedown', handleClickOutside);
    }, [
        selectedItem
    ]);
    const handleClear = (e)=>{
        e.stopPropagation();
        onChange('');
        setSearch('');
        setIsOpen(true);
        inputRef.current?.focus();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: containerRef,
        children: [
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                children: [
                    label,
                    " ",
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-y-0 right-0 flex items-center pr-2 gap-1",
                        children: [
                            value && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleClear,
                                className: "p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                                tabIndex: -1,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "h-4 w-4",
                                    fill: "none",
                                    stroke: "currentColor",
                                    viewBox: "0 0 24 24",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pointer-events-none text-gray-400",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "h-5 w-5",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    "aria-hidden": "true",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
            isOpen && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
                children: filteredOptions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                    className: "relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500 dark:text-gray-300",
                    children: "No results found."
                }, void 0, false, {
                    fileName: "[project]/app/components/SearchableSelect.tsx",
                    lineNumber: 124,
                    columnNumber: 13
                }, this) : filteredOptions.map((option, index)=>{
                    const showGroupHeader = option.group && (index === 0 || option.group !== filteredOptions[index - 1].group);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            showGroupHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 py-1 pl-2 pr-9 text-xs font-bold text-gray-500 dark:text-gray-400",
                                children: option.group
                            }, void 0, false, {
                                fileName: "[project]/app/components/SearchableSelect.tsx",
                                lineNumber: 133,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: `relative cursor-pointer select-none py-2 pr-9 text-gray-900 dark:text-white hover:bg-indigo-600 hover:text-white ${option.id === value ? 'bg-indigo-600 text-white' : ''} ${option.group ? 'pl-5' : 'pl-3'}`,
                                onClick: ()=>{
                                    onChange(option.id);
                                    setSearch(option.label);
                                    setIsOpen(false);
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `block truncate ${option.id === value ? 'font-semibold' : 'font-normal'}`,
                                        children: option.label
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/SearchableSelect.tsx",
                                        lineNumber: 147,
                                        columnNumber: 21
                                    }, this),
                                    option.id === value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "absolute inset-y-0 right-0 flex items-center pr-4 text-white",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "h-5 w-5",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor",
                                            "aria-hidden": "true",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
}),
"[project]/app/incidents/data:81250f [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40ea4824ebb15e230302cbedc00d4d62f0c65d0aa6":"submitIncident"},"app/incidents/actions.ts",""] */ __turbopack_context__.s([
    "submitIncident",
    ()=>submitIncident
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var submitIncident = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("40ea4824ebb15e230302cbedc00d4d62f0c65d0aa6", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "submitIncident"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAuLi4gKEV4aXN0aW5nIFR5cGVzIGFuZCBGZXRjaCBmdW5jdGlvbnMgcmVtYWluIHRoZSBzYW1lKSAuLi5cclxuXHJcbmV4cG9ydCB0eXBlIEluY2lkZW50UmVwb3J0ID0ge1xyXG4gIGlkOiBzdHJpbmdcclxuICBjcmVhdGVkX2F0OiBzdHJpbmdcclxuICByZXBvcnRlcl9pZDogc3RyaW5nXHJcbiAgc3ViamVjdF9jYWRldF9pZDogc3RyaW5nXHJcbiAgZGVzY3JpcHRpb246IHN0cmluZ1xyXG4gIGxvY2F0aW9uOiBzdHJpbmdcclxuICBpbmNpZGVudF90aW1lOiBzdHJpbmdcclxuICBhY3Rpb25fdGFrZW46IHN0cmluZyB8IG51bGxcclxuICBzdGF0dXM6ICdwZW5kaW5nJyB8ICdoYW5kbGVkJyB8ICdjb252ZXJ0ZWQnXHJcbiAgcmVzb2x2ZWRfYXQ6IHN0cmluZyB8IG51bGxcclxuICByZXNvbHZlZF9ieTogc3RyaW5nIHwgbnVsbFxyXG4gIHJlc29sdXRpb25fbm90ZXM6IHN0cmluZyB8IG51bGxcclxuICBoYW5kbGVkX2J5X2lkOiBzdHJpbmcgfCBudWxsXHJcbiAgLy8gSm9pbnNcclxuICByZXBvcnRlcjogeyBmaXJzdF9uYW1lOiBzdHJpbmc7IGxhc3RfbmFtZTogc3RyaW5nIH1cclxuICBzdWJqZWN0OiB7IGZpcnN0X25hbWU6IHN0cmluZzsgbGFzdF9uYW1lOiBzdHJpbmc7IGNvbXBhbnk/OiB7IGNvbXBhbnlfbmFtZTogc3RyaW5nIH0gfVxyXG4gIHJlc29sdmVyPzogeyBmaXJzdF9uYW1lOiBzdHJpbmc7IGxhc3RfbmFtZTogc3RyaW5nIH1cclxuICBoYW5kbGVyPzogeyBmaXJzdF9uYW1lOiBzdHJpbmc7IGxhc3RfbmFtZTogc3RyaW5nIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEluY2lkZW50cyhmaWx0ZXI6ICdwZW5kaW5nJyB8ICdyZXNvbHZlZCcgfCAnYWxsJyA9ICdwZW5kaW5nJykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gIGlmICghdXNlcikgcmV0dXJuIFtdXHJcblxyXG4gIGxldCBxdWVyeSA9IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgnaW5jaWRlbnRfcmVwb3J0cycpXHJcbiAgICAuc2VsZWN0KGBcclxuICAgICAgKixcclxuICAgICAgcmVwb3J0ZXI6cHJvZmlsZXMhcmVwb3J0ZXJfaWQoZmlyc3RfbmFtZSwgbGFzdF9uYW1lKSxcclxuICAgICAgc3ViamVjdDpwcm9maWxlcyFzdWJqZWN0X2NhZGV0X2lkKGZpcnN0X25hbWUsIGxhc3RfbmFtZSwgY29tcGFueTpjb21wYW5pZXMoY29tcGFueV9uYW1lKSksXHJcbiAgICAgIHJlc29sdmVyOnByb2ZpbGVzIXJlc29sdmVkX2J5KGZpcnN0X25hbWUsIGxhc3RfbmFtZSksXHJcbiAgICAgIGhhbmRsZXI6cHJvZmlsZXMhaGFuZGxlZF9ieV9pZChmaXJzdF9uYW1lLCBsYXN0X25hbWUpXHJcbiAgICBgKVxyXG4gICAgLm9yZGVyKCdjcmVhdGVkX2F0JywgeyBhc2NlbmRpbmc6IGZhbHNlIH0pXHJcblxyXG4gIGlmIChmaWx0ZXIgPT09ICdwZW5kaW5nJykgcXVlcnkgPSBxdWVyeS5lcSgnc3RhdHVzJywgJ3BlbmRpbmcnKVxyXG4gIGVsc2UgaWYgKGZpbHRlciA9PT0gJ3Jlc29sdmVkJykgcXVlcnkgPSBxdWVyeS5pbignc3RhdHVzJywgWydoYW5kbGVkJywgJ2NvbnZlcnRlZCddKVxyXG5cclxuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBxdWVyeVxyXG4gIGlmIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBpbmNpZGVudHM6JywgZXJyb3IpXHJcbiAgICAgIHJldHVybiBbXVxyXG4gIH1cclxuICByZXR1cm4gZGF0YSBhcyBJbmNpZGVudFJlcG9ydFtdXHJcbn1cclxuXHJcbi8vIC4uLiAoc3VibWl0SW5jaWRlbnQsIHJlc29sdmVBc0hhbmRsZWQsIGNvbnZlcnRUb0RlbWVyaXQgcmVtYWluIGV4YWN0bHkgdGhlIHNhbWUpIC4uLlxyXG50eXBlIEluY2lkZW50UGF5bG9hZCA9IHtcclxuICAgIGNhZGV0SWRzOiBzdHJpbmdbXVxyXG4gICAgZGVzY3JpcHRpb246IHN0cmluZ1xyXG4gICAgbG9jYXRpb246IHN0cmluZ1xyXG4gICAgaW5jaWRlbnRfdGltZTogc3RyaW5nIFxyXG4gICAgYWN0aW9uX3Rha2VuPzogc3RyaW5nXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdWJtaXRJbmNpZGVudChwYXlsb2FkOiBJbmNpZGVudFBheWxvYWQpIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gICAgY29uc3Qgcm93cyA9IHBheWxvYWQuY2FkZXRJZHMubWFwKGNhZGV0SWQgPT4gKHtcclxuICAgICAgICByZXBvcnRlcl9pZDogdXNlci5pZCxcclxuICAgICAgICBzdWJqZWN0X2NhZGV0X2lkOiBjYWRldElkLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiBwYXlsb2FkLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgIGxvY2F0aW9uOiBwYXlsb2FkLmxvY2F0aW9uLFxyXG4gICAgICAgIGluY2lkZW50X3RpbWU6IHBheWxvYWQuaW5jaWRlbnRfdGltZSxcclxuICAgICAgICBhY3Rpb25fdGFrZW46IHBheWxvYWQuYWN0aW9uX3Rha2VuIHx8IG51bGwsXHJcbiAgICAgICAgc3RhdHVzOiAncGVuZGluZydcclxuICAgIH0pKVxyXG5cclxuICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2luY2lkZW50X3JlcG9ydHMnKS5pbnNlcnQocm93cylcclxuICAgIGlmIChlcnJvcikgcmV0dXJuIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfVxyXG4gICAgXHJcbiAgICByZXZhbGlkYXRlUGF0aCgnL2luY2lkZW50cycpXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc29sdmVBc0hhbmRsZWQoaW5jaWRlbnRJZDogc3RyaW5nLCBub3Rlczogc3RyaW5nLCBoYW5kbGVkQnlJZDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gICAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfVxyXG5cclxuICAgIC8vIDEuIFVwZGF0ZSBJbmNpZGVudFxyXG4gICAgY29uc3QgeyBkYXRhOiBpbmNpZGVudCwgZXJyb3I6IHVwZGF0ZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdpbmNpZGVudF9yZXBvcnRzJylcclxuICAgICAgICAudXBkYXRlKHtcclxuICAgICAgICAgICAgc3RhdHVzOiAnaGFuZGxlZCcsXHJcbiAgICAgICAgICAgIHJlc29sdmVkX2J5OiB1c2VyLmlkLFxyXG4gICAgICAgICAgICByZXNvbHZlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgICAgICByZXNvbHV0aW9uX25vdGVzOiBub3RlcyxcclxuICAgICAgICAgICAgaGFuZGxlZF9ieV9pZDogaGFuZGxlZEJ5SWQgXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgaW5jaWRlbnRJZClcclxuICAgICAgICAuc2VsZWN0KClcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBpZiAodXBkYXRlRXJyb3IpIHJldHVybiB7IGVycm9yOiB1cGRhdGVFcnJvci5tZXNzYWdlIH1cclxuXHJcbiAgICAvLyAyLiBMb2cgdG8gTGVkZ2VyICgwIHZhbHVlIGhpc3RvcnkpXHJcbiAgICBjb25zdCB7IGVycm9yOiBsZWRnZXJFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgndG91cl9sZWRnZXInKVxyXG4gICAgICAgIC5pbnNlcnQoe1xyXG4gICAgICAgICAgICBjYWRldF9pZDogaW5jaWRlbnQuc3ViamVjdF9jYWRldF9pZCxcclxuICAgICAgICAgICAgc3RhZmZfaWQ6IGhhbmRsZWRCeUlkLCBcclxuICAgICAgICAgICAgYW1vdW50OiAwLFxyXG4gICAgICAgICAgICBhY3Rpb246ICdhZGp1c3RtZW50JyxcclxuICAgICAgICAgICAgY29tbWVudDogYEluY2lkZW50IEhhbmRsZWQ6ICR7bm90ZXN9YFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgaWYgKGxlZGdlckVycm9yKSBjb25zb2xlLmVycm9yKFwiTGVkZ2VyIGxvZ2dpbmcgZmFpbGVkOlwiLCBsZWRnZXJFcnJvcilcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aCgnL2luY2lkZW50cycpXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbnZlcnRUb0RlbWVyaXQoaW5jaWRlbnRJZDogc3RyaW5nLCBvZmZlbnNlVHlwZUlkOiBzdHJpbmcsIG5vdGVzOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXHJcbiAgICBpZiAoIXVzZXIpIHJldHVybiB7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9XHJcblxyXG4gICAgY29uc3QgeyBkYXRhOiBpbmNpZGVudCB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgnaW5jaWRlbnRfcmVwb3J0cycpLnNlbGVjdCgnKicpLmVxKCdpZCcsIGluY2lkZW50SWQpLnNpbmdsZSgpXHJcbiAgICBpZiAoIWluY2lkZW50KSByZXR1cm4geyBlcnJvcjogXCJJbmNpZGVudCBub3QgZm91bmRcIiB9XHJcblxyXG4gICAgY29uc3QgaW5jaWRlbnRUaW1lID0gbmV3IERhdGUoaW5jaWRlbnQuaW5jaWRlbnRfdGltZSkuZ2V0VGltZSgpXHJcbiAgICBjb25zdCBub3dUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIGNvbnN0IHNhZmVUaW1lc3RhbXAgPSAoaW5jaWRlbnRUaW1lID4gbm93VGltZSkgPyBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgOiBpbmNpZGVudC5pbmNpZGVudF90aW1lO1xyXG5cclxuICAgIGNvbnN0IHsgZXJyb3I6IHJwY0Vycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5ycGMoJ2NyZWF0ZV9uZXdfcmVwb3J0Jywge1xyXG4gICAgICAgIHBfc3ViamVjdF9jYWRldF9pZDogaW5jaWRlbnQuc3ViamVjdF9jYWRldF9pZCxcclxuICAgICAgICBwX29mZmVuc2VfdHlwZV9pZDogb2ZmZW5zZVR5cGVJZCxcclxuICAgICAgICBwX25vdGVzOiBub3RlcywgXHJcbiAgICAgICAgcF9vZmZlbnNlX3RpbWVzdGFtcDogc2FmZVRpbWVzdGFtcFxyXG4gICAgfSlcclxuXHJcbiAgICBpZiAocnBjRXJyb3IpIHJldHVybiB7IGVycm9yOiBcIkZhaWxlZCB0byBjcmVhdGUgcmVwb3J0OiBcIiArIHJwY0Vycm9yLm1lc3NhZ2UgfVxyXG5cclxuICAgIGNvbnN0IHsgZGF0YTogbmV3UmVwb3J0IH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdkZW1lcml0X3JlcG9ydHMnKVxyXG4gICAgICAgIC5zZWxlY3QoJ2lkJylcclxuICAgICAgICAuZXEoJ3N1Ym1pdHRlZF9ieScsIHVzZXIuaWQpXHJcbiAgICAgICAgLmVxKCdzdWJqZWN0X2NhZGV0X2lkJywgaW5jaWRlbnQuc3ViamVjdF9jYWRldF9pZClcclxuICAgICAgICAub3JkZXIoJ2NyZWF0ZWRfYXQnLCB7IGFzY2VuZGluZzogZmFsc2UgfSlcclxuICAgICAgICAubGltaXQoMSlcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICBpZiAobmV3UmVwb3J0KSB7XHJcbiAgICAgICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJykudXBkYXRlKHsgbGlua2VkX2luY2lkZW50X2lkOiBpbmNpZGVudElkIH0pLmVxKCdpZCcsIG5ld1JlcG9ydC5pZClcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdpbmNpZGVudF9yZXBvcnRzJylcclxuICAgICAgICAudXBkYXRlKHtcclxuICAgICAgICAgICAgc3RhdHVzOiAnY29udmVydGVkJyxcclxuICAgICAgICAgICAgcmVzb2x2ZWRfYnk6IHVzZXIuaWQsXHJcbiAgICAgICAgICAgIHJlc29sdmVkX2F0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgICAgIHJlc29sdXRpb25fbm90ZXM6IFwiQ29udmVydGVkIHRvIERlbWVyaXQgUmVwb3J0XCJcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5lcSgnaWQnLCBpbmNpZGVudElkKVxyXG5cclxuICAgIHJldmFsaWRhdGVQYXRoKCcvaW5jaWRlbnRzJylcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxyXG59XHJcblxyXG4vLyAqKiogVVBEQVRFRDogSGVscGVyOiBHZXQgRmFjdWx0eSBmb3IgRHJvcGRvd24gKioqXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRGYWN1bHR5TGlzdCgpIHtcclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICAgIFxyXG4gICAgLy8gRXhwbGljaXRseSBqb2luIHJvbGVzIHRhYmxlIGFuZCBmaWx0ZXIgYnkgbGV2ZWwgPj0gNTBcclxuICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgICAgIC5zZWxlY3QoYFxyXG4gICAgICAgICAgICBpZCwgXHJcbiAgICAgICAgICAgIGZpcnN0X25hbWUsIFxyXG4gICAgICAgICAgICBsYXN0X25hbWUsIFxyXG4gICAgICAgICAgICByb2xlOnJvbGVzIWlubmVyKGRlZmF1bHRfcm9sZV9sZXZlbClcclxuICAgICAgICBgKVxyXG4gICAgICAgIC5ndGUoJ3JvbGUuZGVmYXVsdF9yb2xlX2xldmVsJywgNTApXHJcbiAgICAgICAgLm9yZGVyKCdsYXN0X25hbWUnKVxyXG4gICAgXHJcbiAgICByZXR1cm4gZGF0YT8ubWFwKChwOiBhbnkpID0+ICh7XHJcbiAgICAgICAgaWQ6IHAuaWQsXHJcbiAgICAgICAgLy8gT3B0aW9uYWw6IEluY2x1ZGUgcm9sZSBpbmZvIGluIGxhYmVsIGlmIGRlc2lyZWQsIGUuZy4gXCJTbWl0aCwgSm9obiAoVEFDKVwiXHJcbiAgICAgICAgbGFiZWw6IGAke3AubGFzdF9uYW1lfSwgJHtwLmZpcnN0X25hbWV9YCBcclxuICAgIH0pKSB8fCBbXVxyXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJnU0FnRXNCIn0=
}),
"[project]/app/incidents/create/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CreateIncidentPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SearchableSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/SearchableSelect.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$data$3a$81250f__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/incidents/data:81250f [app-ssr] (ecmascript) <text/javascript>"); // From Phase 2
'use client';
;
;
;
;
;
;
function CreateIncidentPage() {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [cadets, setCadets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedCadets, setSelectedCadets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        action_taken: ''
    });
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function loadCadets() {
            // Reusing the search logic from sports/actions or similar RPC
            // For simplicity, we fetch the light roster here
            const { data } = await supabase.from('profiles').select('id, first_name, last_name, company:companies(company_name), role:roles!inner(default_role_level)').lt('role.default_role_level', 50) // Students only
            .order('last_name');
            if (data) {
                setCadets(data.map((c)=>({
                        id: c.id,
                        label: `${c.last_name}, ${c.first_name} (${c.company?.company_name || 'No Co'})`
                    })));
            }
        }
        loadCadets();
    }, [
        supabase
    ]);
    const cadetOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>cadets, [
        cadets
    ]);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (selectedCadets.length === 0) return alert("Select at least one cadet.");
        setLoading(true);
        const isoDate = new Date(`${formData.date}T${formData.time}:00`).toISOString();
        const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$data$3a$81250f__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["submitIncident"])({
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-2xl mx-auto p-4 sm:p-6 lg:p-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold text-gray-900 dark:text-white mb-6",
                    children: "Report an Incident"
                }, void 0, false, {
                    fileName: "[project]/app/incidents/create/page.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2",
                                    children: "Who was involved?"
                                }, void 0, false, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 84,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-2 mb-2",
                                    children: selectedCadets.map((id)=>{
                                        const c = cadets.find((x)=>x.id === id);
                                        return c ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded-full flex items-center gap-1",
                                            children: [
                                                c.label,
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SearchableSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                            children: "Date"
                                        }, void 0, false, {
                                            fileName: "[project]/app/incidents/create/page.tsx",
                                            lineNumber: 108,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                            children: "Time"
                                        }, void 0, false, {
                                            fileName: "[project]/app/incidents/create/page.tsx",
                                            lineNumber: 112,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "md:col-span-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                            children: "Location"
                                        }, void 0, false, {
                                            fileName: "[project]/app/incidents/create/page.tsx",
                                            lineNumber: 116,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                    children: "Description of Event"
                                }, void 0, false, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 123,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                                    children: "Action Taken (Optional)"
                                }, void 0, false, {
                                    fileName: "[project]/app/incidents/create/page.tsx",
                                    lineNumber: 129,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end pt-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
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
const _appcallserver = __turbopack_context__.r("[project]/node_modules/next/dist/client/app-call-server.js [app-ssr] (ecmascript)");
const _appfindsourcemapurl = __turbopack_context__.r("[project]/node_modules/next/dist/client/app-find-source-map-url.js [app-ssr] (ecmascript)");
const _client = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-server-dom-turbopack-client.js [app-ssr] (ecmascript)"); //# sourceMappingURL=action-client-wrapper.js.map
}),
];

//# sourceMappingURL=_95f36f06._.js.map