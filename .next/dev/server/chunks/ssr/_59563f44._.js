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
"[project]/app/incidents/data:256532 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40ea4824ebb15e230302cbedc00d4d62f0c65d0aa6":"submitIncident"},"app/incidents/actions.ts",""] */ __turbopack_context__.s([
    "submitIncident",
    ()=>submitIncident
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var submitIncident = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("40ea4824ebb15e230302cbedc00d4d62f0c65d0aa6", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "submitIncident"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHNlcnZlcidcclxuXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2Uvc2VydmVyJ1xyXG5pbXBvcnQgeyByZXZhbGlkYXRlUGF0aCB9IGZyb20gJ25leHQvY2FjaGUnXHJcblxyXG4vLyAuLi4gKEV4aXN0aW5nIFR5cGVzIGFuZCBGZXRjaCBmdW5jdGlvbnMgcmVtYWluIHRoZSBzYW1lKSAuLi5cclxuXHJcbmV4cG9ydCB0eXBlIEluY2lkZW50UmVwb3J0ID0ge1xyXG4gIGlkOiBzdHJpbmdcclxuICBjcmVhdGVkX2F0OiBzdHJpbmdcclxuICByZXBvcnRlcl9pZDogc3RyaW5nXHJcbiAgc3ViamVjdF9jYWRldF9pZDogc3RyaW5nXHJcbiAgZGVzY3JpcHRpb246IHN0cmluZ1xyXG4gIGxvY2F0aW9uOiBzdHJpbmdcclxuICBpbmNpZGVudF90aW1lOiBzdHJpbmdcclxuICBhY3Rpb25fdGFrZW46IHN0cmluZyB8IG51bGxcclxuICBzdGF0dXM6ICdwZW5kaW5nJyB8ICdoYW5kbGVkJyB8ICdjb252ZXJ0ZWQnXHJcbiAgcmVzb2x2ZWRfYXQ6IHN0cmluZyB8IG51bGxcclxuICByZXNvbHZlZF9ieTogc3RyaW5nIHwgbnVsbFxyXG4gIHJlc29sdXRpb25fbm90ZXM6IHN0cmluZyB8IG51bGxcclxuICBoYW5kbGVkX2J5X2lkOiBzdHJpbmcgfCBudWxsXHJcbiAgLy8gSm9pbnNcclxuICByZXBvcnRlcjogeyBmaXJzdF9uYW1lOiBzdHJpbmc7IGxhc3RfbmFtZTogc3RyaW5nIH1cclxuICBzdWJqZWN0OiB7IGZpcnN0X25hbWU6IHN0cmluZzsgbGFzdF9uYW1lOiBzdHJpbmc7IGNvbXBhbnk/OiB7IGNvbXBhbnlfbmFtZTogc3RyaW5nIH0gfVxyXG4gIHJlc29sdmVyPzogeyBmaXJzdF9uYW1lOiBzdHJpbmc7IGxhc3RfbmFtZTogc3RyaW5nIH1cclxuICBoYW5kbGVyPzogeyBmaXJzdF9uYW1lOiBzdHJpbmc7IGxhc3RfbmFtZTogc3RyaW5nIH1cclxufVxyXG5cclxuLy8gMS4gVVBEQVRFRDogR2V0IEluY2lkZW50cyB3aXRoIENvbXBhbnkgRmlsdGVyaW5nXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRJbmNpZGVudHMoZmlsdGVyOiAncGVuZGluZycgfCAncmVzb2x2ZWQnIHwgJ2FsbCcgPSAncGVuZGluZycpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICBpZiAoIXVzZXIpIHJldHVybiBbXVxyXG5cclxuICAvLyBHZXQgVmlld2VyIFByb2ZpbGVcclxuICBjb25zdCB7IGRhdGE6IHZpZXdlciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAuc2VsZWN0KCdjb21wYW55X2lkLCByb2xlOnJvbGVzIWlubmVyKGRlZmF1bHRfcm9sZV9sZXZlbCknKVxyXG4gICAgLmVxKCdpZCcsIHVzZXIuaWQpXHJcbiAgICAuc2luZ2xlKClcclxuICBcclxuICBjb25zdCByb2xlTGV2ZWwgPSAodmlld2VyPy5yb2xlIGFzIGFueSk/LmRlZmF1bHRfcm9sZV9sZXZlbCB8fCAwXHJcbiAgY29uc3Qgdmlld2VyQ29tcGFueUlkID0gdmlld2VyPy5jb21wYW55X2lkXHJcblxyXG4gIC8vIEJhc2UgUXVlcnlcclxuICBsZXQgcXVlcnkgPSBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2luY2lkZW50X3JlcG9ydHMnKVxyXG4gICAgLnNlbGVjdChgXHJcbiAgICAgICosXHJcbiAgICAgIHJlcG9ydGVyOnByb2ZpbGVzIXJlcG9ydGVyX2lkKGZpcnN0X25hbWUsIGxhc3RfbmFtZSksXHJcbiAgICAgIHN1YmplY3Q6cHJvZmlsZXMhc3ViamVjdF9jYWRldF9pZChmaXJzdF9uYW1lLCBsYXN0X25hbWUsIGNvbXBhbnlfaWQsIGNvbXBhbnk6Y29tcGFuaWVzKGNvbXBhbnlfbmFtZSkpLFxyXG4gICAgICByZXNvbHZlcjpwcm9maWxlcyFyZXNvbHZlZF9ieShmaXJzdF9uYW1lLCBsYXN0X25hbWUpLFxyXG4gICAgICBoYW5kbGVyOnByb2ZpbGVzIWhhbmRsZWRfYnlfaWQoZmlyc3RfbmFtZSwgbGFzdF9uYW1lKVxyXG4gICAgYClcclxuICAgIC5vcmRlcignY3JlYXRlZF9hdCcsIHsgYXNjZW5kaW5nOiBmYWxzZSB9KVxyXG5cclxuICBpZiAoZmlsdGVyID09PSAncGVuZGluZycpIHF1ZXJ5ID0gcXVlcnkuZXEoJ3N0YXR1cycsICdwZW5kaW5nJylcclxuICBlbHNlIGlmIChmaWx0ZXIgPT09ICdyZXNvbHZlZCcpIHF1ZXJ5ID0gcXVlcnkuaW4oJ3N0YXR1cycsIFsnaGFuZGxlZCcsICdjb252ZXJ0ZWQnXSlcclxuXHJcbiAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgcXVlcnlcclxuICBpZiAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgaW5jaWRlbnRzOicsIGVycm9yKVxyXG4gICAgICByZXR1cm4gW11cclxuICB9XHJcblxyXG4gIGxldCByZXN1bHQgPSBkYXRhIGFzIGFueVtdXHJcblxyXG4gIC8vIEZJTFRFUjogSWYgVEFDICg2NS04OSksIG9ubHkgc2hvdyBvd24gY29tcGFueVxyXG4gIC8vIEFkbWlucyAoOTArKSBzZWUgYWxsLiBGYWN1bHR5ICg1MC02NCkgc2VlIG93biBzdWJtaXNzaW9ucyAoaGFuZGxlZCBieSBSTFMgdXN1YWxseSwgYnV0IHNhZmUgdG8gZmlsdGVyIGhlcmUgdG9vKS5cclxuICBpZiAocm9sZUxldmVsID49IDY1ICYmIHJvbGVMZXZlbCA8IDkwKSB7XHJcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIociA9PiByLnN1YmplY3Q/LmNvbXBhbnlfaWQgPT09IHZpZXdlckNvbXBhbnlJZClcclxuICB9XHJcblxyXG4gIHJldHVybiByZXN1bHQgYXMgSW5jaWRlbnRSZXBvcnRbXVxyXG59XHJcblxyXG4vLyAuLi4gKHN1Ym1pdEluY2lkZW50LCByZXNvbHZlQXNIYW5kbGVkLCBjb252ZXJ0VG9EZW1lcml0IHJlbWFpbiBleGFjdGx5IHRoZSBzYW1lKSAuLi5cclxudHlwZSBJbmNpZGVudFBheWxvYWQgPSB7XHJcbiAgICBjYWRldElkczogc3RyaW5nW11cclxuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmdcclxuICAgIGxvY2F0aW9uOiBzdHJpbmdcclxuICAgIGluY2lkZW50X3RpbWU6IHN0cmluZyBcclxuICAgIGFjdGlvbl90YWtlbj86IHN0cmluZ1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3VibWl0SW5jaWRlbnQocGF5bG9hZDogSW5jaWRlbnRQYXlsb2FkKSB7XHJcbiAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gICAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfVxyXG5cclxuICAgIGNvbnN0IHJvd3MgPSBwYXlsb2FkLmNhZGV0SWRzLm1hcChjYWRldElkID0+ICh7XHJcbiAgICAgICAgcmVwb3J0ZXJfaWQ6IHVzZXIuaWQsXHJcbiAgICAgICAgc3ViamVjdF9jYWRldF9pZDogY2FkZXRJZCxcclxuICAgICAgICBkZXNjcmlwdGlvbjogcGF5bG9hZC5kZXNjcmlwdGlvbixcclxuICAgICAgICBsb2NhdGlvbjogcGF5bG9hZC5sb2NhdGlvbixcclxuICAgICAgICBpbmNpZGVudF90aW1lOiBwYXlsb2FkLmluY2lkZW50X3RpbWUsXHJcbiAgICAgICAgYWN0aW9uX3Rha2VuOiBwYXlsb2FkLmFjdGlvbl90YWtlbiB8fCBudWxsLFxyXG4gICAgICAgIHN0YXR1czogJ3BlbmRpbmcnXHJcbiAgICB9KSlcclxuXHJcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdpbmNpZGVudF9yZXBvcnRzJykuaW5zZXJ0KHJvd3MpXHJcbiAgICBpZiAoZXJyb3IpIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH1cclxuICAgIFxyXG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9pbmNpZGVudHMnKVxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXNvbHZlQXNIYW5kbGVkKGluY2lkZW50SWQ6IHN0cmluZywgbm90ZXM6IHN0cmluZywgaGFuZGxlZEJ5SWQ6IHN0cmluZykge1xyXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gICAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcclxuICAgIGlmICghdXNlcikgcmV0dXJuIHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH1cclxuXHJcbiAgICAvLyAxLiBVcGRhdGUgSW5jaWRlbnRcclxuICAgIGNvbnN0IHsgZGF0YTogaW5jaWRlbnQsIGVycm9yOiB1cGRhdGVFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgnaW5jaWRlbnRfcmVwb3J0cycpXHJcbiAgICAgICAgLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIHN0YXR1czogJ2hhbmRsZWQnLFxyXG4gICAgICAgICAgICByZXNvbHZlZF9ieTogdXNlci5pZCxcclxuICAgICAgICAgICAgcmVzb2x2ZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICAgICAgcmVzb2x1dGlvbl9ub3Rlczogbm90ZXMsXHJcbiAgICAgICAgICAgIGhhbmRsZWRfYnlfaWQ6IGhhbmRsZWRCeUlkIFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmVxKCdpZCcsIGluY2lkZW50SWQpXHJcbiAgICAgICAgLnNlbGVjdCgpXHJcbiAgICAgICAgLnNpbmdsZSgpXHJcblxyXG4gICAgaWYgKHVwZGF0ZUVycm9yKSByZXR1cm4geyBlcnJvcjogdXBkYXRlRXJyb3IubWVzc2FnZSB9XHJcblxyXG4gICAgLy8gMi4gTG9nIHRvIExlZGdlciAoMCB2YWx1ZSBoaXN0b3J5KVxyXG4gICAgY29uc3QgeyBlcnJvcjogbGVkZ2VyRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgLmZyb20oJ3RvdXJfbGVkZ2VyJylcclxuICAgICAgICAuaW5zZXJ0KHtcclxuICAgICAgICAgICAgY2FkZXRfaWQ6IGluY2lkZW50LnN1YmplY3RfY2FkZXRfaWQsXHJcbiAgICAgICAgICAgIHN0YWZmX2lkOiBoYW5kbGVkQnlJZCwgXHJcbiAgICAgICAgICAgIGFtb3VudDogMCxcclxuICAgICAgICAgICAgYWN0aW9uOiAnYWRqdXN0bWVudCcsXHJcbiAgICAgICAgICAgIGNvbW1lbnQ6IGBJbmNpZGVudCBIYW5kbGVkOiAke25vdGVzfWBcclxuICAgICAgICB9KVxyXG5cclxuICAgIGlmIChsZWRnZXJFcnJvcikgY29uc29sZS5lcnJvcihcIkxlZGdlciBsb2dnaW5nIGZhaWxlZDpcIiwgbGVkZ2VyRXJyb3IpXHJcblxyXG4gICAgcmV2YWxpZGF0ZVBhdGgoJy9pbmNpZGVudHMnKVxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9XHJcbn1cclxuXHJcbi8vIDIuIFVQREFURUQ6IENvbnZlcnQgd2l0aCBTdWJtaXR0ZXIgU3dhcFxyXG4vLyAuLi4gaW1wb3J0c1xyXG5cclxuLy8gMi4gVVBEQVRFRDogQ29udmVydCB0byBEZW1lcml0XHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb252ZXJ0VG9EZW1lcml0KGluY2lkZW50SWQ6IHN0cmluZywgb2ZmZW5zZVR5cGVJZDogc3RyaW5nLCBncmVlblNoZWV0U3VtbWFyeTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgpXHJcbiAgICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKVxyXG4gICAgaWYgKCF1c2VyKSByZXR1cm4geyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfVxyXG5cclxuICAgIC8vIDEuIEdldCBJbmNpZGVudCBEYXRhXHJcbiAgICBjb25zdCB7IGRhdGE6IGluY2lkZW50IH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdpbmNpZGVudF9yZXBvcnRzJykuc2VsZWN0KCcqJykuZXEoJ2lkJywgaW5jaWRlbnRJZCkuc2luZ2xlKClcclxuICAgIGlmICghaW5jaWRlbnQpIHJldHVybiB7IGVycm9yOiBcIkluY2lkZW50IG5vdCBmb3VuZFwiIH1cclxuXHJcbiAgICAvLyAyLiBHZXQgT2ZmZW5zZSBEZXRhaWxzXHJcbiAgICBjb25zdCB7IGRhdGE6IG9mZmVuc2UgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgLmZyb20oJ29mZmVuc2VfdHlwZXMnKVxyXG4gICAgICAgIC5zZWxlY3QoJ2RlbWVyaXRzJylcclxuICAgICAgICAuZXEoJ2lkJywgb2ZmZW5zZVR5cGVJZClcclxuICAgICAgICAuc2luZ2xlKClcclxuICAgIFxyXG4gICAgaWYgKCFvZmZlbnNlKSByZXR1cm4geyBlcnJvcjogXCJPZmZlbnNlIHR5cGUgbm90IGZvdW5kXCIgfVxyXG5cclxuICAgIC8vIDMuIE5FVzogRmV0Y2ggdGhlIENvbW1hbmRhbnQncyBBcHByb3ZlciBHcm91cCAoVGhlIFwiQ29udmVydGVyJ3MgQXBwcm92ZXJcIilcclxuICAgIC8vIFdlIGFzc3VtZSB0aGUgZ3JvdXAgaXMgbmFtZWQgJ0NvbW1hbmRhbnQnLiBJZiB5b3VyIHN5c3RlbSB1c2VzIGEgZGlmZmVyZW50IG5hbWUgKGUuZy4sICdIUScpLCB1cGRhdGUgdGhpcyBsaW5lLlxyXG4gICAgY29uc3QgeyBkYXRhOiBjb21tYW5kYW50R3JvdXAgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgICAgLmZyb20oJ2FwcHJvdmVyX2dyb3VwcycpXHJcbiAgICAgICAgLnNlbGVjdCgnaWQnKVxyXG4gICAgICAgIC5lcSgnZ3JvdXBfbmFtZScsICdDb21tYW5kYW50JylcclxuICAgICAgICAuc2luZ2xlKClcclxuXHJcbiAgICAvLyA0LiBDcmVhdGUgUmVwb3J0XHJcbiAgICBjb25zdCB7IGVycm9yOiBpbnNlcnRFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgnZGVtZXJpdF9yZXBvcnRzJylcclxuICAgICAgICAuaW5zZXJ0KHtcclxuICAgICAgICAgICAgc3ViamVjdF9jYWRldF9pZDogaW5jaWRlbnQuc3ViamVjdF9jYWRldF9pZCxcclxuICAgICAgICAgICAgb2ZmZW5zZV90eXBlX2lkOiBvZmZlbnNlVHlwZUlkLFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgc3VibWl0dGVkX2J5OiBpbmNpZGVudC5yZXBvcnRlcl9pZCwgLy8gT3JpZ2luYWwgVGVhY2hlclxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZGF0ZV9vZl9vZmZlbnNlOiBuZXcgRGF0ZShpbmNpZGVudC5pbmNpZGVudF90aW1lKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBub3RlczogZ3JlZW5TaGVldFN1bW1hcnksICAgICAgICAgICAgICAgICAvLyBQdWJsaWNcclxuICAgICAgICAgICAgcmVwb3J0X2V4cGxhbmF0aW9uOiBpbmNpZGVudC5kZXNjcmlwdGlvbiwgLy8gUHJpdmF0ZVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZGVtZXJpdHNfZWZmZWN0aXZlOiBvZmZlbnNlLmRlbWVyaXRzLFxyXG4gICAgICAgICAgICBzdGF0dXM6ICdwZW5kaW5nX2FwcHJvdmFsJyxcclxuICAgICAgICAgICAgbGlua2VkX2luY2lkZW50X2lkOiBpbmNpZGVudElkLFxyXG5cclxuICAgICAgICAgICAgLy8gQ1JJVElDQUwgQ0hBTkdFOiBTZXQgdGhlIGFwcHJvdmFsIGNoYWluIHRvIHRoZSBDb21tYW5kYW50IGltbWVkaWF0ZWx5XHJcbiAgICAgICAgICAgIGN1cnJlbnRfYXBwcm92ZXJfZ3JvdXBfaWQ6IGNvbW1hbmRhbnRHcm91cD8uaWQgfHwgbnVsbCBcclxuICAgICAgICB9KVxyXG5cclxuICAgIGlmIChpbnNlcnRFcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDb252ZXJzaW9uIEVycm9yOlwiLCBpbnNlcnRFcnJvcilcclxuICAgICAgICByZXR1cm4geyBlcnJvcjogXCJGYWlsZWQgdG8gY3JlYXRlIHJlcG9ydDogXCIgKyBpbnNlcnRFcnJvci5tZXNzYWdlIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyA1LiBDbG9zZSBJbmNpZGVudFxyXG4gICAgYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAuZnJvbSgnaW5jaWRlbnRfcmVwb3J0cycpXHJcbiAgICAgICAgLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIHN0YXR1czogJ2NvbnZlcnRlZCcsXHJcbiAgICAgICAgICAgIHJlc29sdmVkX2J5OiB1c2VyLmlkLFxyXG4gICAgICAgICAgICByZXNvbHZlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgICAgICByZXNvbHV0aW9uX25vdGVzOiBcIkNvbnZlcnRlZCB0byBEZW1lcml0IFJlcG9ydFwiXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZXEoJ2lkJywgaW5jaWRlbnRJZClcclxuXHJcbiAgICByZXZhbGlkYXRlUGF0aCgnL2luY2lkZW50cycpXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH1cclxufVxyXG5cclxuLy8gMy4gVVBEQVRFRDogRmFjdWx0eSBMaXN0IHdpdGggUm9sZXNcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEZhY3VsdHlMaXN0KCkge1xyXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoKVxyXG4gICAgXHJcbiAgICAvLyBGZXRjaCBldmVyeW9uZSBsZXZlbCA1MCsgKEZhY3VsdHksIFRBQ3MsIEFkbWluKVxyXG4gICAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXHJcbiAgICAgICAgLnNlbGVjdChgXHJcbiAgICAgICAgICAgIGlkLCBcclxuICAgICAgICAgICAgZmlyc3RfbmFtZSwgXHJcbiAgICAgICAgICAgIGxhc3RfbmFtZSwgXHJcbiAgICAgICAgICAgIHJvbGU6cm9sZXMhaW5uZXIoZGVmYXVsdF9yb2xlX2xldmVsLCByb2xlX25hbWUpXHJcbiAgICAgICAgYClcclxuICAgICAgICAuZ3RlKCdyb2xlLmRlZmF1bHRfcm9sZV9sZXZlbCcsIDUwKVxyXG4gICAgICAgIC5vcmRlcignbGFzdF9uYW1lJylcclxuICAgIFxyXG4gICAgcmV0dXJuIGRhdGE/Lm1hcCgocDogYW55KSA9PiAoe1xyXG4gICAgICAgIGlkOiBwLmlkLFxyXG4gICAgICAgIC8vIExhYmVsIGluY2x1ZGVzIHJvbGUgdG8gdmVyaWZ5IHdobyBpcyB3aG9cclxuICAgICAgICBsYWJlbDogYCR7cC5sYXN0X25hbWV9LCAke3AuZmlyc3RfbmFtZX0gKCR7cC5yb2xlLnJvbGVfbmFtZX0pYCBcclxuICAgIH0pKSB8fCBbXVxyXG59XHJcblxyXG4vLyBORVc6IEZldGNoIFNpbmdsZSBJbmNpZGVudFxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SW5jaWRlbnQoaWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcclxuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ2luY2lkZW50X3JlcG9ydHMnKVxyXG4gICAgLnNlbGVjdChgXHJcbiAgICAgICosXHJcbiAgICAgIHJlcG9ydGVyOnByb2ZpbGVzIXJlcG9ydGVyX2lkKGZpcnN0X25hbWUsIGxhc3RfbmFtZSksXHJcbiAgICAgIHN1YmplY3Q6cHJvZmlsZXMhc3ViamVjdF9jYWRldF9pZChmaXJzdF9uYW1lLCBsYXN0X25hbWUsIGNvbXBhbnk6Y29tcGFuaWVzKGNvbXBhbnlfbmFtZSkpLFxyXG4gICAgICByZXNvbHZlcjpwcm9maWxlcyFyZXNvbHZlZF9ieShmaXJzdF9uYW1lLCBsYXN0X25hbWUpLFxyXG4gICAgICBoYW5kbGVyOnByb2ZpbGVzIWhhbmRsZWRfYnlfaWQoZmlyc3RfbmFtZSwgbGFzdF9uYW1lKVxyXG4gICAgYClcclxuICAgIC5lcSgnaWQnLCBpZClcclxuICAgIC5zaW5nbGUoKVxyXG5cclxuICBpZiAoZXJyb3IpIHJldHVybiBudWxsXHJcbiAgcmV0dXJuIGRhdGEgYXMgSW5jaWRlbnRSZXBvcnRcclxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiZ1NBcUZzQiJ9
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
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$data$3a$256532__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/app/incidents/data:256532 [app-ssr] (ecmascript) <text/javascript>"); // From Phase 2
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
        const { error } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$incidents$2f$data$3a$256532__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["submitIncident"])({
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

//# sourceMappingURL=_59563f44._.js.map