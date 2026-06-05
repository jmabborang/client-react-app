import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
    Plus,
    FilePlus,
    FolderOpen,
    Pencil,
    Trash2,
    Search
} from 'lucide-react';

export default function Grid({
    columns = [],
    data = [],
    onAdd,
    onNew,
    onOpen,
    onEdit,
    onDelete,
    height = 400
}) {
    const [colWidths, setColWidths] = useState({});
    const [search, setSearch] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    const selectAllRef = useRef(null);

    const visibleColumns = useMemo(
        () => columns.filter(col => col?.hide !== true),
        [columns]
    );

    const filteredData = useMemo(() => {
        if (!search) return data;

        return data.filter(row =>
            Object.values(row).some(value =>
                String(value)
                    .toLowerCase()
                    .includes(search.toLowerCase())
            )
        );
    }, [data, search]);

    const allSelected =
        filteredData.length > 0 &&
        selectedRows.length === filteredData.length;

    const partiallySelected =
        selectedRows.length > 0 &&
        selectedRows.length < filteredData.length;

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = partiallySelected;
        }
    }, [partiallySelected]);

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredData.map((_, index) => index));
        }
    };

    const toggleRow = (index) => {
        setSelectedRows(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
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
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    const toolbarButton =
        'flex items-center gap-2 px-3 py-2 rounded-md text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <div className="w-full space-y-3">

            {/* TOOLBAR */}
            <div className="flex flex-wrap gap-2 items-center">

                <button
                    onClick={onAdd}
                    className={`${toolbarButton} bg-blue-600 hover:bg-blue-700`}
                >
                    <Plus size={16} />
                    Add
                </button>

                <button
                    onClick={onNew}
                    className={`${toolbarButton} bg-indigo-600 hover:bg-indigo-700`}
                >
                    <FilePlus size={16} />
                    New
                </button>

                <button
                    onClick={() =>
                        onOpen?.(
                            selectedRows.map(index => filteredData[index])
                        )
                    }
                    disabled={selectedRows.length === 0}
                    className={`${toolbarButton} bg-emerald-600 hover:bg-emerald-700`}
                >
                    <FolderOpen size={16} />
                    Open
                </button>

                <button
                    onClick={() =>
                        onEdit?.(
                            selectedRows.map(index => filteredData[index])
                        )
                    }
                    disabled={selectedRows.length === 0}
                    className={`${toolbarButton} bg-amber-500 hover:bg-amber-600`}
                >
                    <Pencil size={16} />
                    Edit
                </button>

                <button
                    onClick={() =>
                        onDelete?.(
                            selectedRows.map(index => filteredData[index])
                        )
                    }
                    disabled={selectedRows.length === 0}
                    className={`${toolbarButton} bg-red-600 hover:bg-red-700`}
                >
                    <Trash2 size={16} />
                    Delete
                </button>

                <div className="ml-auto relative">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="
                            pl-9 pr-3 py-2
                            border rounded-md
                            w-64
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-400
                        "
                    />
                </div>

            </div>

            {/* TABLE */}
            <div
                className="border rounded overflow-auto"
                style={{ height }}
            >
                <table className="min-w-full border-collapse">

                    {/* HEADER */}
                    <thead className="sticky top-0 bg-gray-100 z-10">
                        <tr>

                            <th className="px-3 py-2 border-b w-12">
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
                                    className="text-left px-3 py-2 border-b font-semibold relative whitespace-nowrap bg-gray-100"
                                    style={{
                                        width: colWidths[col.field] || 160
                                    }}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{col.header}</span>

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
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={visibleColumns.length + 1}
                                    className="text-center py-8 text-gray-500"
                                >
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((row, index) => (
                                <tr
                                    key={index}
                                    onClick={() => toggleRow(index)}
                                    className={`
                                        border-b cursor-pointer
                                        hover:bg-gray-50
                                        ${
                                            selectedRows.includes(index)
                                                ? 'bg-blue-50'
                                                : ''
                                        }
                                    `}
                                >
                                    <td
                                        className="px-3 py-2"
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(index)}
                                            onChange={() =>
                                                toggleRow(index)
                                            }
                                        />
                                    </td>

                                    {visibleColumns.map(col => (
                                        <td
                                            key={col.field}
                                            className="px-3 py-2 whitespace-nowrap"
                                        >
                                            {col.render
                                                ? col.render(row)
                                                : row[col.field]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                    Records: {filteredData.length}
                </span>

                <span>
                    Selected: {selectedRows.length}
                </span>
            </div>

        </div>
    );
}