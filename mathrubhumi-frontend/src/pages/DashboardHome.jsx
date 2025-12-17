import React from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpenIcon,
    UsersIcon,
    CurrencyDollarIcon,
    ClipboardDocumentListIcon,
    PlusCircleIcon,
    ArrowTrendingUpIcon,
    BuildingStorefrontIcon,
    TruckIcon,
} from "@heroicons/react/24/outline";

/**
 * Dashboard Home Component
 * Displays welcome message, stats cards, and quick action buttons
 */
const DashboardHome = () => {
    const navigate = useNavigate();

    // Get current date/time for greeting
    const now = new Date();
    const hour = now.getHours();
    const greeting =
        hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
    const dateString = now.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Placeholder stats (can be connected to real API later)
    const stats = [
        {
            label: "Total Titles",
            value: "2,847",
            icon: BookOpenIcon,
            gradient: "from-blue-500 to-blue-600",
            shadowColor: "shadow-blue-500/25",
            trend: "+12%",
            trendUp: true,
        },
        {
            label: "Customers",
            value: "1,234",
            icon: UsersIcon,
            gradient: "from-emerald-500 to-teal-600",
            shadowColor: "shadow-emerald-500/25",
            trend: "+8%",
            trendUp: true,
        },
        {
            label: "This Month Sales",
            value: "₹4.2L",
            icon: CurrencyDollarIcon,
            gradient: "from-violet-500 to-purple-600",
            shadowColor: "shadow-violet-500/25",
            trend: "+23%",
            trendUp: true,
        },
        {
            label: "Pending Orders",
            value: "18",
            icon: ClipboardDocumentListIcon,
            gradient: "from-amber-500 to-orange-600",
            shadowColor: "shadow-amber-500/25",
            trend: "-5%",
            trendUp: false,
        },
    ];

    // Quick action buttons
    const quickActions = [
        {
            label: "New Sale Bill",
            icon: PlusCircleIcon,
            route: "/dashboard/sale-bill",
            color: "bg-blue-500 hover:bg-blue-600",
        },
        {
            label: "Goods Inward",
            icon: TruckIcon,
            route: "/dashboard/goods-inward",
            color: "bg-emerald-500 hover:bg-emerald-600",
        },
        {
            label: "Add Title",
            icon: BookOpenIcon,
            route: "/dashboard/title-master",
            color: "bg-violet-500 hover:bg-violet-600",
        },
        {
            label: "Manage Suppliers",
            icon: BuildingStorefrontIcon,
            route: "/dashboard/supplier-master",
            color: "bg-amber-500 hover:bg-amber-600",
        },
    ];

    // System status indicators (mimicking login page style)
    const systemStatus = [
        { label: "System Status", value: "Online", status: "good" },
        { label: "API Response", value: "45ms", status: "good" },
        { label: "Last Sync", value: "2 min ago", status: "good" },
    ];

    return (
        <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
            {/* Welcome Header */}
            <div className="mb-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-cyan-500/10 rounded-2xl blur-xl -z-10" />
                    <div className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl px-8 py-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">
                                    {greeting}, <span className="text-blue-600">Admin</span>
                                </h1>
                                <p className="text-gray-500 mt-1">{dateString}</p>
                            </div>
                            {/* System Status Pills */}
                            <div className="hidden md:flex items-center gap-3">
                                {systemStatus.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-gray-200/60 text-sm"
                                    >
                                        <span
                                            className={`w-2 h-2 rounded-full ${item.status === "good"
                                                    ? "bg-emerald-500"
                                                    : "bg-amber-500"
                                                }`}
                                        />
                                        <span className="text-gray-500">{item.label}:</span>
                                        <span className="font-medium text-gray-700">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="group relative bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                        {/* Background gradient on hover */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                        />

                        <div className="relative flex items-start justify-between">
                            {/* Icon */}
                            <div
                                className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.shadowColor}`}
                            >
                                <stat.icon className="w-6 h-6" />
                            </div>

                            {/* Trend Badge */}
                            <div
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stat.trendUp
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-rose-50 text-rose-600"
                                    }`}
                            >
                                <ArrowTrendingUpIcon
                                    className={`w-3.5 h-3.5 ${stat.trendUp ? "" : "transform rotate-180"
                                        }`}
                                />
                                {stat.trend}
                            </div>
                        </div>

                        {/* Value & Label */}
                        <div className="mt-4">
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.route)}
                            className={`${action.color} text-white rounded-xl px-4 py-4 flex flex-col items-center gap-2 shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                        >
                            <action.icon className="w-7 h-7" />
                            <span className="text-sm font-medium">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Two Column Layout for Activity & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {[
                            {
                                action: "Sale Bill #1247 created",
                                time: "10 minutes ago",
                                type: "sale",
                            },
                            {
                                action: "New title added: 'Modern React'",
                                time: "1 hour ago",
                                type: "title",
                            },
                            {
                                action: "Customer 'ABC Books' updated",
                                time: "2 hours ago",
                                type: "customer",
                            },
                            {
                                action: "Goods inward from XYZ Supplier",
                                time: "Yesterday",
                                type: "inward",
                            },
                        ].map((activity, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                            >
                                <div
                                    className={`w-2 h-2 rounded-full ${activity.type === "sale"
                                            ? "bg-blue-500"
                                            : activity.type === "title"
                                                ? "bg-violet-500"
                                                : activity.type === "customer"
                                                    ? "bg-emerald-500"
                                                    : "bg-amber-500"
                                        }`}
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700">{activity.action}</p>
                                    <p className="text-xs text-gray-400">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Overview */}
                <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        System Overview
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600">Active Masters</span>
                            <span className="font-semibold text-gray-800">14 modules</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600">Transaction Types</span>
                            <span className="font-semibold text-gray-800">7 types</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600">Session Timeout</span>
                            <span className="font-semibold text-gray-800">30 minutes</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600">User Role</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Administrator
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
