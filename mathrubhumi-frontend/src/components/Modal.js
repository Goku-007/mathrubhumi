import React from 'react';

const Modal = ({
  isOpen,
  message,
  type = 'info',
  buttons = [{ label: 'OK', onClick: () => {}, className: 'bg-blue-500 hover:bg-blue-600' }],
  children,                 // ← NEW: optional body content
  size = 'sm',              // ← NEW: 'sm' | 'lg' for wider content like tables
  contentClassName = '',    // ← NEW: optional extra classes for the content wrapper
}) => {
  if (!isOpen) return null;

  // Determine styling based on type (info, success, error)
  const bgColor =
    type === 'error' ? 'bg-red-50'
    : type === 'success' ? 'bg-green-50'
    : 'bg-white';

  const title =
    type === 'error' ? 'Error'
    : type === 'success' ? 'Success'
    : 'Message';

  const titleColor =
    type === 'error' ? 'text-red-700'
    : type === 'success' ? 'text-green-700'
    : 'text-gray-800';

  // width presets; sm keeps old behavior, lg for tables
  const widthClass = size === 'lg'
    ? 'max-w-5xl w-[min(95vw,1000px)]'
    : 'max-w-sm w-full';

  // if you want outside-click to trigger Cancel, we need this class present
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
      {/* overlay */}
      <div
        className="modal-overlay absolute inset-0 bg-gray-900 bg-opacity-50"
        onClick={outsideCancel}
      />
      {/* dialog */}
      <div
        className={`relative rounded-xl ${bgColor} shadow-lg p-0 mx-4 transform transition-all duration-300 scale-100 ${widthClass} max-h-[85vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 id="modal-title" className={`text-lg font-semibold ${titleColor}`}>{title}</h3>
          {/* keep the legacy message line for backward compatibility */}
          {message ? <p className="text-sm text-gray-600 mt-2">{message}</p> : null}
        </div>

        {/* body: render children if provided, else nothing (legacy modals still work) */}
        {children ? (
          <div className={`p-4 overflow-auto ${contentClassName}`}>
            {children}
          </div>
        ) : null}

        {/* footer */}
        <div className="px-6 py-3 border-t bg-gray-50 flex justify-end space-x-2">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className={`${button.className} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                button.className?.includes('bg-blue') ? 'focus:ring-blue-500' : 'focus:ring-gray-500'
              }`}
              autoFocus={index === buttons.length - 1}
              type="button"
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modal;
