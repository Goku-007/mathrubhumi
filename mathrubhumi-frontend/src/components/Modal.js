import React from 'react';

const Modal = ({
  isOpen,
  message,
  type = 'info',
  buttons = [{ label: 'OK', onClick: () => { }, className: 'bg-blue-500 hover:bg-blue-600' }],
  children,
  size = 'sm',
  contentClassName = '',
}) => {
  if (!isOpen) return null;

  // Type-specific styling
  const typeStyles = {
    error: {
      bg: 'bg-red-50',
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Error',
      titleColor: 'text-red-700',
      headerBg: 'bg-gradient-to-r from-red-50 to-red-100',
    },
    success: {
      bg: 'bg-emerald-50',
      icon: (
        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Success',
      titleColor: 'text-emerald-700',
      headerBg: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
    },
    warning: {
      bg: 'bg-amber-50',
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      title: 'Warning',
      titleColor: 'text-amber-700',
      headerBg: 'bg-gradient-to-r from-amber-50 to-amber-100',
    },
    info: {
      bg: 'bg-white',
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Message',
      titleColor: 'text-gray-800',
      headerBg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  const widthClass = size === 'lg'
    ? 'max-w-5xl w-[min(95vw,1000px)]'
    : 'max-w-sm w-full';

  const outsideCancel = () => {
    const cancel = buttons.find(btn => btn.label?.toLowerCase() === 'cancel');
    if (cancel?.onClick) cancel.onClick();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay with blur */}
      <div
        className="modal-overlay absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={outsideCancel}
      />

      {/* Dialog */}
      <div
        className={`relative rounded-2xl ${style.bg} shadow-2xl mx-4 transform transition-all duration-300 
                    scale-100 ${widthClass} max-h-[85vh] overflow-hidden border border-gray-200/50
                    animate-[modalEnter_0.2s_ease-out]`}
        onClick={(e) => e.stopPropagation()}
        style={{
          animationName: 'modalEnter',
          animationDuration: '0.2s',
          animationTimingFunction: 'ease-out',
        }}
      >
        {/* Header */}
        <div className={`px-5 py-4 ${style.headerBg} border-b border-gray-100`}>
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              {style.icon}
            </div>
            {/* Title & Message */}
            <div className="flex-1 min-w-0">
              <h3 id="modal-title" className={`text-base font-semibold ${style.titleColor}`}>
                {style.title}
              </h3>
              {message && (
                <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Body (if children provided) */}
        {children && (
          <div className={`p-5 overflow-auto ${contentClassName}`}>
            {children}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-2">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className={`${button.className} text-white px-4 py-2 rounded-lg text-sm font-medium 
                         transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]
                         focus:outline-none focus:ring-2 focus:ring-offset-2 ${button.className?.includes('bg-blue') ? 'focus:ring-blue-500 shadow-blue-500/20' :
                  button.className?.includes('bg-red') ? 'focus:ring-red-500 shadow-red-500/20' :
                    button.className?.includes('bg-green') || button.className?.includes('bg-emerald') ? 'focus:ring-emerald-500 shadow-emerald-500/20' :
                      'focus:ring-gray-500 shadow-gray-500/20'
                }`}
              autoFocus={index === buttons.length - 1}
              type="button"
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {/* Keyframe animation (injected) */}
      <style>{`
        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
