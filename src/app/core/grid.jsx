import React, { useMemo, useRef, useState } from 'react';

export default function Grid({
    columns = [],
    data = [],
    onAdd,
    onNew,
    onOpen,
    onDelete,
    onEdit,
    onDeleteRow,
    height = 400
}) {
    const [colWidths, setColWidths] = useState({});
    const [search, setSearch] = useState('');

    const visibleColumns = useMemo(
        () => columns.filter(c => c?.hide !== true),
        [columns]
    );

    const filteredData = useMemo(() => {
        if (!search) return data;

        return data.filter(row =>
            Object.values(row).some(v =>
                String(v).toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [data, search]);

    const startResize = (e, field) => {
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

    return (
        <div className="w-full space-y-3">

            {/* TOOLBAR */}
            <div className="flex flex-wrap gap-2 items-center">

                <button onClick={onAdd}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Add
                </button>

                <button onClick={onNew}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
                    New
                </button>

                <button onClick={onOpen}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Open
                </button>

                <button onClick={onDelete}
                    className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700">
                    Delete
                </button>

                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="ml-auto px-3 py-1.5 border rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* TABLE WRAPPER (scroll both ways) */}
            <div
                className="border rounded overflow-auto"
                style={{ height }}
            >
                <table className="min-w-full border-collapse">

                    {/* HEADER */}
                    <thead className="sticky top-0 bg-gray-100 z-10">
                        <tr>
                            {visibleColumns.map(col => (
                                <th
                                    key={col.field}
                                    className="text-left px-3 py-2 border-b font-semibold relative whitespace-nowrap"
                                    style={{ width: colWidths[col.field] || 160 }}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{col.header}</span>

                                        {/* RESIZE HANDLE */}
                                        <span
                                            onMouseDown={(e) => startResize(e, col.field)}
                                            className="w-2 cursor-col-resize absolute right-0 top-0 bottom-0"
                                        />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {filteredData.map((row, i) => (
                            <tr
                                key={i}
                                className="hover:bg-gray-50 border-b"
                            >
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
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    );
}