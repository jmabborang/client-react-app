import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
    Plus,
    FilePlus,
    FolderOpen,
    Pencil,
    Trash2,
    Search,
    ArrowUpDown,
    ChevronUp,
    ChevronDown
} from 'lucide-react';

export default function Grid({
    columns = [],
    data = [],
    onAdd,
    onNew,
    onOpen,
    onEdit,
    onDelete,
    onSelectionChange,
    height = 420,
    minHeight,
    maxHeight,
    fillHeight = false,
    rowKey = 'id',
    loading = false,
    searchable = true,
    searchPlaceholder = 'Search...',
    emptyMessage = 'No records found'
}) {
    const [colWidths, setColWidths] = useState({});
    const [search, setSearch] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState(null);

    const selectAllRef = useRef(null);
    const resizeStateRef = useRef(null);

    const visibleColumns = useMemo(
        () => columns.filter(col => col?.hide !== true),
        [columns]
    );

    const getRowId = (row, index) => {
        if (typeof rowKey === 'function') {
            return rowKey(row, index);
        }

        return row?.[rowKey] ?? index;
    };

    const normalizedSearch = search.trim().toLowerCase();

    const filteredData = useMemo(() => {
        if (!normalizedSearch) return data;

        const fieldsToSearch = visibleColumns.map(col => col.field);

        return data.filter(row =>
            fieldsToSearch.some(field =>
                String(row?.[field] ?? '')
                    .toLowerCase()
                    .includes(normalizedSearch)
            )
        );
    }, [data, normalizedSearch, visibleColumns]);

    const sortedData = useMemo(() => {
        if (!sortConfig?.field) {
            return filteredData;
        }

        const { field, direction } = sortConfig;
        const column = columns.find(col => col.field === field);
        const sortAccessor = column?.sortAccessor;

        return [...filteredData].sort((leftRow, rightRow) => {
            const leftValue = sortAccessor
                ? sortAccessor(leftRow)
                : leftRow?.[field];
            const rightValue = sortAccessor
                ? sortAccessor(rightRow)
                : rightRow?.[field];

            if (leftValue == null && rightValue == null) return 0;
            if (leftValue == null) return 1;
            if (rightValue == null) return -1;

            if (
                typeof leftValue === 'number' &&
                typeof rightValue === 'number'
            ) {
                return direction === 'asc'
                    ? leftValue - rightValue
                    : rightValue - leftValue;
            }

            return direction === 'asc'
                ? String(leftValue).localeCompare(String(rightValue), undefined, {
                    numeric: true,
                    sensitivity: 'base'
                })
                : String(rightValue).localeCompare(String(leftValue), undefined, {
                    numeric: true,
                    sensitivity: 'base'
                });
        });
    }, [columns, filteredData, sortConfig]);

    const visibleRowIds = useMemo(
        () => sortedData.map((row, index) => getRowId(row, index)),
        [sortedData]
    );

    const selectedData = useMemo(
        () => sortedData.filter((row, index) => selectedRows.includes(getRowId(row, index))),
        [sortedData, selectedRows]
    );

    const allSelected =
        visibleRowIds.length > 0 &&
        visibleRowIds.every(id => selectedRows.includes(id));

    const partiallySelected =
        selectedData.length > 0 &&
        !allSelected;

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = partiallySelected;
        }
    }, [partiallySelected]);

    useEffect(() => {
        setSelectedRows(prev =>
            prev.filter(selectedId =>
                data.some((row, index) => getRowId(row, index) === selectedId)
            )
        );
    }, [data]);

    useEffect(() => {
        onSelectionChange?.(selectedData);
    }, [onSelectionChange, selectedData]);

    useEffect(() => () => {
        if (resizeStateRef.current) {
            document.removeEventListener('mousemove', resizeStateRef.current.onMove);
            document.removeEventListener('mouseup', resizeStateRef.current.onUp);
        }
    }, []);

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedRows(prev =>
                prev.filter(id => !visibleRowIds.includes(id))
            );
        } else {
            setSelectedRows(prev => [
                ...new Set([...prev, ...visibleRowIds])
            ]);
        }
    };

    const toggleRow = (rowId) => {
        setSelectedRows(prev =>
            prev.includes(rowId)
                ? prev.filter(id => id !== rowId)
                : [...prev, rowId]
        );
    };

    const startResize = (e, field) => {
        e.preventDefault();

        const startX = e.clientX;
        const startWidth = colWidths[field] || 160;

        const onMove = (ev) => {
            const newWidth = startWidth + (ev.clientX - startX);

            setColWidths(prev => ({
                ...prev,
                [field]: Math.max(80, newWidth)
            }));
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            resizeStateRef.current = null;
        };

        resizeStateRef.current = { onMove, onUp };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    const toggleSort = (field) => {
        setSortConfig(prev => {
            if (prev?.field !== field) {
                return { field, direction: 'asc' };
            }

            if (prev.direction === 'asc') {
                return { field, direction: 'desc' };
            }

            return null;
        });
    };

    const getSortIcon = (field) => {
        if (sortConfig?.field !== field) {
            return <ArrowUpDown size={14} className="text-gray-400" />;
        }

        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} className="text-teal-700" />
            : <ChevronDown size={14} className="text-teal-700" />;
    };

    const toolbarButton =
        'flex h-7 items-center gap-2 px-3 rounded-md border border-white/55 bg-white/46 text-teal-900 text-sm font-medium transition-colors hover:bg-white/72 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/46';

    return (
        <div className={fillHeight ? 'w-full h-full flex flex-col min-h-0' : 'w-full'}>

            {/* TOOLBAR */}
            <div
                className="flex flex-wrap gap-2 items-center rounded-t-lg border border-slate-200 border-b-0 px-3 py-2 shadow-sm"
                style={{
                    background: '#0cc3cc'
                }}
            >

                <button
                    onClick={() => onAdd?.()}
                    className={toolbarButton}
                >
                    <Plus size={16} />
                    Add
                </button>

                <button
                    onClick={() => onNew?.()}
                    className={toolbarButton}
                >
                    <FilePlus size={16} />
                    New
                </button>

                <button
                    onClick={() => onOpen?.(selectedData)}
                    className={toolbarButton}
                >
                    <FolderOpen size={16} />
                    Open
                </button>

                <button
                    onClick={() => onEdit?.(selectedData)}
                    className={toolbarButton}
                >
                    <Pencil size={16} />
                    Edit
                </button>

                <button
                    onClick={() => onDelete?.(selectedData)}
                    className={toolbarButton}
                >
                    <Trash2 size={16} />
                    Delete
                </button>

                {searchable && (
                    <div className="ml-auto relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="
                                h-7 pl-9 pr-2
                                border border-slate-200 rounded-md
                                bg-white
                                w-64 max-w-full
                                text-slate-700
                                focus:outline-none
                                focus:ring-2
                                focus:ring-emerald-100
                            "
                        />
                    </div>
                )}

            </div>

            {/* TABLE */}
            <div
                className={fillHeight ? 'overflow-auto flex-1 min-h-0 rounded-b-lg border border-slate-200 border-t-0 bg-white' : 'overflow-auto rounded-b-lg border border-slate-200 border-t-0 bg-white'}
                style={
                    fillHeight
                        ? undefined
                        : {
                            height,
                            minHeight,
                            maxHeight
                        }
                }
            >
                <table className="min-w-full border-collapse">

                    {/* HEADER */}
                    <thead className="sticky top-0 z-10 bg-slate-50">
                        <tr>

                            <th className="h-[44px] w-12 border-b border-slate-200 px-3 py-1.5 text-center align-middle">
                                <input
                                    ref={selectAllRef}
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                />
                            </th>

                            {visibleColumns.map(col => (
                                <th
                                    key={col.field}
                                    className="relative h-[10px] whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-left font-semibold text-slate-700"
                                    style={{
                                        width: colWidths[col.field] || col.width || 160
                                    }}
                                >
                                    <div className="flex justify-between items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => col.sortable !== false && toggleSort(col.field)}
                                            className={`flex items-center gap-1 ${
                                                col.sortable === false
                                                    ? 'cursor-default'
                                                    : 'cursor-pointer'
                                            }`}
                                        >
                                            <span>{col.header}</span>
                                            {col.sortable !== false && getSortIcon(col.field)}
                                        </button>

                                        <span
                                            onMouseDown={(e) =>
                                                startResize(e, col.field)
                                            }
                                            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize"
                                        />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody className="bg-white">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={visibleColumns.length + 1}
                                    className="h-48 py-8 text-center text-slate-500"
                                >
                                    Loading records...
                                </td>
                            </tr>
                        ) : sortedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={visibleColumns.length + 1}
                                    className="h-48 py-8 text-center text-slate-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((row, index) => {
                                const rowId = getRowId(row, index);

                                return (
                                <tr
                                    key={rowId}
                                    className={`
                                        border-b border-slate-100 hover:bg-slate-50
                                        ${
                                            selectedRows.includes(rowId)
                                                ? 'bg-emerald-50'
                                                : ''
                                        }
                                    `}
                                >
                                    <td
                                        className="h-[11px] w-12 px-3 py-1.5 text-center align-middle text-slate-700"
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(rowId)}
                                            onChange={() =>
                                                toggleRow(rowId)
                                            }
                                        />
                                    </td>

                                    {visibleColumns.map(col => (
                                        <td
                                            key={col.field}
                                            className="h-[11px] whitespace-nowrap px-3 py-1.5 text-slate-700"
                                            style={{
                                                width: colWidths[col.field] || col.width || 160
                                            }}
                                        >
                                            {col.render
                                                ? col.render(row)
                                                : row[col.field]}
                                        </td>
                                    ))}
                                </tr>
                                );
                            })
                        )}
                    </tbody>

                </table>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between border-x border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500">
                <div className="flex items-center gap-6">
                    <span className="inline-flex items-center gap-2">
                        <span className="text-slate-500">Records</span>
                        <span className="font-semibold text-teal-700">{sortedData.length}</span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="text-slate-500">Filtered</span>
                        <span className="font-semibold text-teal-700">{filteredData.length}</span>
                    </span>
                </div>

                <span className="inline-flex items-center gap-2">
                    <span className="text-slate-500">Selected</span>
                    <span className="font-semibold text-teal-700">{selectedData.length}</span>
                </span>
            </div>

        </div>
    );
}
