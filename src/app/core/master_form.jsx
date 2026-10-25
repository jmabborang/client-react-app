import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../shared/ui/Button';

const formModules = import.meta.glob('../forms/**/*.{js,jsx}');

const resolveFormImporter = (forms) => {
    if (!forms || typeof forms !== 'string') {
        return null;
    }

    const normalizedPath = forms
        .trim()
        .replace(/^\.?\//, '')
        .replace(/\.(jsx|js)$/i, '');

    const candidatePaths = [
        `../${normalizedPath}.jsx`,
        `../${normalizedPath}.js`,
        `../${normalizedPath}/index.jsx`,
        `../${normalizedPath}/index.js`
    ];

    return candidatePaths
        .map((path) => formModules[path])
        .find(Boolean) ?? null;
};

const getDefaultCaption = (mode) => {
    if (!mode) {
        return 'Record';
    }

    return mode.charAt(0).toUpperCase() + mode.slice(1);
};

const resolveCaption = (captionConfig, mode) => {
    if (!captionConfig) {
        return getDefaultCaption(mode);
    }

    if (typeof captionConfig === 'function') {
        return captionConfig(mode) || getDefaultCaption(mode);
    }

    if (typeof captionConfig === 'string') {
        return captionConfig;
    }

    if (typeof captionConfig === 'object') {
        return captionConfig[mode] || captionConfig.default || getDefaultCaption(mode);
    }

    return getDefaultCaption(mode);
};

const resolveFormConfig = (module) => {
    if (!module || typeof module !== 'object') {
        return {};
    }

    if (module.config && typeof module.config === 'object') {
        return module.config;
    }

    return {};
};

export default function MasterForm({
    forms,
    formState,
    onClose
}) {
    const [loadedFormComponent, setLoadedFormComponent] = useState(null);
    const [formCaption, setFormCaption] = useState('');
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [formLoadError, setFormLoadError] = useState('');
    const formImporter = useMemo(() => resolveFormImporter(forms), [forms]);

    useEffect(() => {
        if (!formState) {
            setLoadedFormComponent(null);
            setFormCaption('');
            setIsFormLoading(false);
            setFormLoadError('');
            return;
        }

        if (!formImporter) {
            setLoadedFormComponent(null);
            setFormCaption(getDefaultCaption(formState.mode));
            setIsFormLoading(false);
            setFormLoadError(`Form "${forms}" was not found in src/app/forms.`);
            return;
        }

        let isMounted = true;

        setIsFormLoading(true);
        setFormLoadError('');

        formImporter()
            .then((module) => {
                if (!isMounted) {
                    return;
                }

                const ResolvedFormComponent = module.default;
                const formConfig = resolveFormConfig(module);

                if (!ResolvedFormComponent) {
                    setLoadedFormComponent(null);
                    setFormCaption(getDefaultCaption(formState.mode));
                    setFormLoadError(`Form "${forms}" does not have a default export.`);
                    return;
                }

                setFormCaption(
                    resolveCaption(
                        formConfig.caption ?? module.caption,
                        formState.mode
                    )
                );
                setLoadedFormComponent(() => ResolvedFormComponent);
            })
            .catch((error) => {
                if (!isMounted) {
                    return;
                }

                setLoadedFormComponent(null);
                setFormCaption(getDefaultCaption(formState.mode));
                setFormLoadError(error?.message || `Unable to load form "${forms}".`);
            })
            .finally(() => {
                if (isMounted) {
                    setIsFormLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [formImporter, formState, forms]);

    if (!formState) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/45">
            <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {formCaption || getDefaultCaption(formState.mode)}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close form"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-auto bg-slate-50 px-6 py-6">
                    {isFormLoading ? (
                        <div className="flex h-full min-h-[calc(100dvh-89px)] items-center justify-center">
                            <div
                                className="flex min-w-[280px] flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm"
                                role="status"
                                aria-live="polite"
                                aria-label="Loading form"
                            >
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" aria-hidden="true" />
                                <div>
                                    <p className="text-base font-semibold text-slate-900">Loading form</p>
                                    <p className="mt-1 text-sm text-slate-500">Please wait while we open {forms}.</p>
                                </div>
                            </div>
                        </div>
                    ) : formLoadError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-sm text-red-700">
                            {formLoadError}
                        </div>
                    ) : loadedFormComponent ? (
                        React.createElement(loadedFormComponent, {
                            mode: formState.mode,
                            record: formState.selectedRecord,
                            records: formState.selectedRecords,
                            onClose
                        })
                    ) : null}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="border border-slate-300 bg-white px-5 py-2 text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        className="bg-teal-600 px-5 py-2 text-white hover:bg-teal-700"
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
}
