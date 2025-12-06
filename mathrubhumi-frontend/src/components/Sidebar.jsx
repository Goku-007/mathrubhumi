import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

const Sidebar = () => {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    Masters: false,
    Transactions: false,
    Reports: false,
    Utilities: false,
    Window: false,
    Help: false,
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "info",
    buttons: [],
  });

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const showModal = (
    message,
    type = "info",
    buttons = [
      {
        label: "OK",
        onClick: () => closeModal(),
        className: "bg-blue-500 hover:bg-blue-600",
      },
    ]
  ) => {
    setModal({ isOpen: true, message, type, buttons });
  };

  const closeModal = () => {
    setModal({ isOpen: false, message: "", type: "info", buttons: [] });
  };

  const performLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
    closeModal();
  };

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
    setUserMenuOpen(false);
  };

  const menuStructure = {
    Masters: [
      { label: "Categories", route: "/dashboard/categories-master" },
      { label: "Sub Categories", route: "/dashboard/sub-categories-master" },
      { label: "Publisher Maintenance", route: "/dashboard/publisher-master" },
      { label: "Author Maintenance", route: "/dashboard/author-master" },
      { label: "Title Maintenance", route: "/dashboard/title-master" },
      { label: "Pre Publication Books", route: "/dashboard/pp-books-master" },
      { label: "Places", route: "/dashboard/places-master" },
      { label: "Supplier Maintenance", route: "/dashboard/supplier-master" },
      { label: "Credit Customer Maintenance", route: "/dashboard/credit-customer-master" },
      { label: "Pre Publication Customers", route: "/dashboard/pp-customers-master" },
      { label: "Privilegers", route: "/dashboard/privilegers-master" },
      { label: "Agents", route: "/dashboard/agents-master" },
      { label: "Purchase Breakups", route: "/dashboard/purchase-breakups-master" },
      { label: "Royalty Recipients", route: "/dashboard/royalty-recipients-master" },
    ],
    Transactions: [
      { label: "Goods Inward", route: "/dashboard/goods-inward" },
      { label: "Sale Bill", route: "/dashboard/sale-bill" },
      { label: "Goods Inward Return", route: "/dashboard/goods-inward-return" },
      { label: "Sale Bill Return", route: "/dashboard/sale-bill-return" },
      { label: "P P Receipt Entry", route: "/dashboard/pp-receipt-entry" },
      { label: "Remittance Entry", route: "/dashboard/remittance-entry" },
      { label: "Credit Realisation Entry", route: "/dashboard/credit-realisation-entry" },
    ],
    Reports: [],
    Utilities: [],
    Window: [],
    Help: [],
  };

  const menuIcons = {
    Masters: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    Transactions: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    Reports: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    Utilities: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    ),
    Window: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
    Help: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const handleLogout = () => {
    showModal("Log out?", "info", [
      { label: "Cancel", onClick: closeModal, className: "bg-gray-600 hover:bg-gray-700" },
      { label: "Confirm", onClick: performLogout, className: "bg-red-600 hover:bg-red-700" },
    ]);
  };

  // mock user; replace with real session later
  const user = {
    name: "Sudheer P",
    email: "sudheer@example.com",
    role: "Admin L1",
    initials: "MG",
  };

  return (
    <div
      className={`relative h-screen ${collapsed ? "w-16" : "w-64 md:w-72"} flex flex-col transition-all duration-300 ease-in-out
      bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950 text-slate-100
      border-r border-white/10 shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)] overflow-hidden`}
    >
      <Modal isOpen={modal.isOpen} message={modal.message} type={modal.type} buttons={modal.buttons} />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <span className="font-semibold text-base tracking-wide">
          {collapsed ? (
            <svg className="w-6 h-6 text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            "Control Panel"
          )}
        </span>
        <button
          onClick={toggleSidebar}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-100 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition"
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Dashboard Home */}
      <div
        onClick={() => navigate("/dashboard")}
        className={`mx-3 my-3 rounded-xl border border-white/10 bg-white/5 hover:bg-blue-800/40
        shadow-sm transition cursor-pointer ${collapsed ? "py-3" : "px-4 py-3"}`}
        title="Dashboard Home"
        aria-label="Dashboard Home"
      >
        {collapsed ? (
          <svg className="w-6 h-6 mx-auto text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7m-9 5v6h4v-6m-6 0h6" />
          </svg>
        ) : (
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7m-9 5v6h4v-6m-6 0h6" />
            </svg>
            <span className="text-sm font-medium tracking-wide">Dashboard Home</span>
          </span>
        )}
      </div>

      {/* Menus */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 overscroll-contain">
        {Object.keys(menuStructure).map((menu) => {
          const open = expandedMenus[menu];
          return (
            <div key={menu} className="mb-1.5">
              <div
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer
                border border-transparent hover:border-white/10
                bg-white/5 hover:bg-blue-900/40 transition`}
                onClick={() => toggleMenu(menu)}
                aria-expanded={open}
                aria-label={`${menu} menu`}
              >
                <span className="flex items-center">
                  <span className="text-slate-200">{menuIcons[menu]}</span>
                  {!collapsed && (
                    <span className="ml-3 text-sm font-medium tracking-wide">{menu}</span>
                  )}
                </span>
                {!collapsed && (
                  <svg
                    className={`w-4 h-4 text-slate-300 transition-transform ${open ? "rotate-90" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>

              {/* Animated submenu with scroll */}
              <div
                className={`transition-[max-height,opacity,transform] duration-300 ease-out
                ${open && !collapsed ? "max-h-96 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1"}
                overflow-hidden`}
              >
                {!collapsed && (
                  <ul className="mt-1 ml-2 rounded-xl border border-blue-200/10 bg-blue-900/40 backdrop-blur-sm max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600/60 scrollbar-track-transparent">
                    {menuStructure[menu].length === 0 && (
                      <li className="px-3 py-2 text-xs text-slate-300">No items</li>
                    )}
                    {menuStructure[menu].map((item) => (
                      <li
                        key={item.label}
                        onClick={() => navigate(item.route)}
                        className="group relative flex items-center gap-2 px-3 py-2 text-sm text-slate-100
                        hover:bg-blue-800/50 rounded-lg mx-1 my-0.5 cursor-pointer transition"
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-blue-300" />
                        <span className="truncate">{item.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Footer */}
      <div className="relative p-3 border-t border-white/10 bg-white/5 backdrop-blur-sm">
        {/* Click layer keeps the menu inside the sidebar bounds */}
        <button
          onClick={() => setUserMenuOpen((s) => !s)}
          className={`w-full ${collapsed ? "p-2" : "px-3 py-2"} rounded-xl border border-white/10
            bg-white/5 hover:bg-blue-900/40 transition flex items-center gap-3 focus:outline-none
            focus-visible:ring-2 focus-visible:ring-blue-400`}
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
        >
          {/* Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs font-semibold shadow ring-1 ring-white/20">
            {user.initials}
          </div>

          {/* Identity */}
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <svg
                  className={`ml-2 h-4 w-4 text-slate-300 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="truncate text-[11px] text-slate-300/80">{user.email}</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-blue-100">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {user.role}
              </div>
            </div>
          )}
        </button>

        {/* Drop-up menu (stays within sidebar) */}
        <div
          className={`absolute left-3 right-3 bottom-16 transition-all duration-200 origin-bottom
            ${userMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
        >
          <div className="rounded-xl border border-white/10 bg-blue-950/90 backdrop-blur-xl shadow-xl overflow-hidden">
            {/* Profile quick actions */}
            {!collapsed && (
              <div className="px-3 py-3 border-b border-white/10">
                <div className="text-xs text-slate-300/80">Signed in as</div>
                <div className="text-sm font-medium text-slate-100 truncate">{user.email}</div>
              </div>
            )}

            <ul className="py-1 max-h-56 overflow-y-auto">
              <li>
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-100 hover:bg-blue-900/60"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.938 13.938 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View profile
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-100 hover:bg-blue-900/60"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h10M4 17h16" />
                  </svg>
                  Organization
                </button>
              </li>
              <li className="border-t border-white/10 my-1" />
              {/* RBAC placeholder */}
              <li>
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
                  title="RBAC coming soon"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zM6 20v-1a6 6 0 0112 0v1" />
                  </svg>
                  Roles and permissions
                  <span className="ml-auto text-[10px] rounded-full border border-white/10 px-1.5 py-0.5 text-slate-400">soon</span>
                </button>
              </li>
              <li className="border-t border-white/10 my-1" />
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-200 hover:bg-rose-900/40"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
