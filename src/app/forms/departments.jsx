export const config = {
    caption: {
        add: 'New Department',
        new: 'New Department',
        edit: 'Edit Department',
        open: 'Department Details',
        default: 'Department'
    }
};


function DepartmentsForm({ mode, record, onClose }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <label className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <span className="mb-2 block text-sm font-medium text-slate-600">Code</span>
                    <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                    />
                </label>
            </div>
        </div>
    );
}

export default DepartmentsForm;
