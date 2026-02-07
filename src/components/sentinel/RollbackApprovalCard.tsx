"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod/v3";

/**
 * Zod schema for RollbackApprovalCard component
 */
export const rollbackApprovalCardSchema = z.object({
    service: z.string().describe("Name of the service to rollback"),
    currentVersion: z.string().describe("Current deployed version"),
    targetVersion: z.string().describe("Target version to rollback to"),
    riskLevel: z
        .enum(["low", "medium", "high"])
        .describe("Risk level of the rollback operation"),
});

export type RollbackApprovalCardProps = z.infer<typeof rollbackApprovalCardSchema>;

/**
 * Risk level configuration with enhanced styling
 */
const riskConfig = {
    low: {
        gradient: "from-emerald-500 to-green-500",
        glow: "shadow-emerald-500/50",
        border: "border-emerald-500/50",
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        badge: "bg-gradient-to-r from-emerald-500 to-green-500",
        description: "Safe rollback with minimal impact.",
        emoji: "✅",
    },
    medium: {
        gradient: "from-amber-500 to-orange-500",
        glow: "shadow-amber-500/50",
        border: "border-amber-500/50",
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        badge: "bg-gradient-to-r from-amber-500 to-orange-500",
        description: "Review changes carefully before proceeding.",
        emoji: "⚠️",
    },
    high: {
        gradient: "from-red-500 to-rose-500",
        glow: "shadow-red-500/50",
        border: "border-red-500/50",
        bg: "bg-red-500/10",
        text: "text-red-400",
        badge: "bg-gradient-to-r from-red-500 to-rose-500",
        description: "High-risk! Ensure you have a recovery plan.",
        emoji: "🚨",
    },
};

export const RollbackApprovalCard = React.forwardRef<
    HTMLDivElement,
    RollbackApprovalCardProps
>(({ service, currentVersion, targetVersion, riskLevel }, ref) => {
    const [status, setStatus] = React.useState<
        "pending" | "approved" | "rejected" | "executing"
    >("pending");
    const [showConfirm, setShowConfirm] = React.useState(false);

    const safeRiskLevel = riskLevel && riskLevel in riskConfig ? riskLevel : "medium";
    const config = riskConfig[safeRiskLevel];

    const handleApprove = () => {
        if (safeRiskLevel === "high" && !showConfirm) {
            setShowConfirm(true);
            return;
        }
        setStatus("executing");
        setTimeout(() => {
            setStatus("approved");
        }, 2000);
    };

    const handleReject = () => {
        setStatus("rejected");
    };

    if (!service) {
        return (
            <div
                ref={ref}
                className="w-full h-48 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex items-center justify-center backdrop-blur-sm"
            >
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading rollback details...</span>
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} className="relative group">
            {/* Outer glow based on status/risk */}
            <div className={cn(
                "absolute -inset-1 rounded-2xl blur-xl transition-opacity",
                status === "pending" && `bg-gradient-to-r ${config.gradient} opacity-30 group-hover:opacity-50`,
                status === "approved" && "bg-gradient-to-r from-emerald-500 to-green-500 opacity-40",
                status === "rejected" && "bg-slate-700 opacity-20",
                status === "executing" && "bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50 animate-pulse"
            )} />

            {/* Main container */}
            <div className={cn(
                "relative rounded-2xl border-2 overflow-hidden backdrop-blur-sm transition-all duration-300",
                status === "pending" && config.border,
                status === "approved" && "border-emerald-500",
                status === "rejected" && "border-slate-600",
                status === "executing" && "border-cyan-500"
            )}>
                {/* Animated gradient bar at top */}
                <div className={cn(
                    "h-1 w-full bg-gradient-to-r transition-all duration-500",
                    status === "pending" && config.gradient,
                    status === "approved" && "from-emerald-400 to-green-500",
                    status === "rejected" && "from-slate-600 to-slate-500",
                    status === "executing" && "from-cyan-400 to-blue-500 animate-pulse"
                )} />

                {/* Header */}
                <div className={cn(
                    "px-6 py-4 border-b border-white/5 flex items-center justify-between",
                    config.bg
                )}>
                    <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg",
                            status === "pending" && `bg-gradient-to-br ${config.gradient} ${config.glow}`,
                            status === "approved" && "bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/50",
                            status === "rejected" && "bg-slate-700",
                            status === "executing" && "bg-gradient-to-br from-cyan-500 to-blue-500 shadow-cyan-500/50"
                        )}>
                            {status === "executing" ? (
                                <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : status === "approved" ? (
                                <span>✅</span>
                            ) : status === "rejected" ? (
                                <span>❌</span>
                            ) : (
                                <span>{config.emoji}</span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Rollback Approval</h3>
                            <p className="text-sm font-mono text-gray-400">{service}</p>
                        </div>
                    </div>

                    {/* Risk Badge */}
                    <div className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg",
                        config.badge,
                        config.glow
                    )}>
                        {safeRiskLevel} Risk
                    </div>
                </div>

                {/* Version Info */}
                <div className="p-6 bg-slate-900/40">
                    <div className="flex items-center justify-center gap-6 mb-6">
                        {/* Current Version */}
                        <div className="text-center flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Current</p>
                            <div className="inline-flex items-center gap-2.5 px-5 py-3 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                <span className="text-red-400 font-mono text-lg font-bold">
                                    {currentVersion || "v?.?.?"}
                                </span>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex flex-col items-center gap-1">
                            <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <span className="text-xs text-gray-600">rollback</span>
                        </div>

                        {/* Target Version */}
                        <div className="text-center flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Rollback To</p>
                            <div className="inline-flex items-center gap-2.5 px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl backdrop-blur-sm">
                                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-emerald-400 font-mono text-lg font-bold">
                                    {targetVersion || "v?.?.?"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Risk Description */}
                    <div className={cn(
                        "p-4 rounded-xl mb-5 flex items-center gap-3",
                        config.bg,
                        "border",
                        config.border
                    )}>
                        <span className="text-xl">{config.emoji}</span>
                        <p className={cn("text-sm font-medium", config.text)}>{config.description}</p>
                    </div>

                    {/* High-Risk Confirmation */}
                    {showConfirm && safeRiskLevel === "high" && status === "pending" && (
                        <div className="p-4 rounded-xl mb-5 bg-red-500/10 border border-red-500/30 animate-pulse">
                            <p className="text-red-400 font-bold mb-1">🚨 Final Confirmation Required</p>
                            <p className="text-sm text-gray-400">This is a high-risk operation. Click "Confirm Rollback" to proceed.</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {status === "pending" && (
                        <div className="flex gap-4">
                            <button
                                onClick={handleReject}
                                className="flex-1 px-6 py-4 bg-slate-700/80 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-500"
                            >
                                <span>❌</span>
                                Reject
                            </button>
                            <button
                                onClick={handleApprove}
                                className={cn(
                                    "flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02]",
                                    showConfirm
                                        ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/50"
                                        : safeRiskLevel === "high"
                                            ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
                                            : `bg-gradient-to-r ${config.gradient} text-white ${config.glow}`
                                )}
                            >
                                <span>✅</span>
                                {showConfirm ? "Confirm Rollback" : "Approve Rollback"}
                            </button>
                        </div>
                    )}

                    {/* Status Displays */}
                    {status === "executing" && (
                        <div className="text-center py-6 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                            <div className="flex items-center justify-center gap-3 text-cyan-400 font-bold text-lg mb-2">
                                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Executing rollback...
                            </div>
                            <p className="text-sm text-gray-400">Please wait while the operation completes</p>
                        </div>
                    )}

                    {status === "approved" && (
                        <div className="text-center py-6 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                            <p className="text-emerald-400 font-bold text-lg mb-1">✅ Rollback Completed!</p>
                            <p className="text-sm text-gray-400">
                                {service} successfully rolled back to {targetVersion}
                            </p>
                        </div>
                    )}

                    {status === "rejected" && (
                        <div className="text-center py-6 bg-slate-700/50 rounded-xl border border-slate-600">
                            <p className="text-gray-400 font-bold text-lg mb-1">❌ Rollback Cancelled</p>
                            <p className="text-sm text-gray-500">No changes were made to {service}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

RollbackApprovalCard.displayName = "RollbackApprovalCard";
