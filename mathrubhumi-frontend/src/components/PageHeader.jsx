import React from 'react';

/**
 * Reusable page header component with icon, title, and optional actions.
 * Props:
 *  - icon: React node (SVG icon)
 *  - title: string
 *  - subtitle: string (optional)
 *  - children: action buttons or additional content (optional)
 *  - compact: boolean to reduce padding/font sizes
 */
const PageHeader = ({ icon, title, subtitle, children, compact = false }) => {
    const containerClasses = compact
        ? "bg-white/85 backdrop-blur-sm border border-gray-200/60 rounded-lg px-4 py-3 shadow-sm"
        : "bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl px-6 py-4 shadow-sm";
    const iconClasses = compact
        ? "flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 text-sm"
        : "flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25";
    const titleClasses = compact ? "text-lg font-semibold text-gray-800 tracking-tight" : "text-xl font-semibold text-gray-800 tracking-tight";
    const wrapperClasses = compact ? "relative mb-4" : "relative mb-6";
    const underlineClasses = compact ? "mt-3 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-full opacity-50" : "mt-4 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-full opacity-60";

    return (
        <div className={wrapperClasses}>
            {/* Background gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-cyan-500/10 rounded-2xl blur-xl -z-10" />

            <div className={containerClasses}>
                <div className="flex items-center justify-between">
                    {/* Left: Icon + Title */}
                    <div className="flex items-center gap-4">
                        {/* Icon container */}
                        <div className={iconClasses}>
                            {icon || (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            )}
                        </div>

                        {/* Text */}
                        <div>
                            <h1 className={titleClasses}>{title}</h1>
                            {subtitle && (
                                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    {children && (
                        <div className="flex items-center gap-2">
                            {children}
                        </div>
                    )}
                </div>

                {/* Gradient underline accent */}
                <div className={underlineClasses} />
            </div>
        </div>
    );
};

export default PageHeader;
