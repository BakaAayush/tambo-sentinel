"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod/v3";

/**
 * Zod schema for IncidentHeader component
 */
export const incidentHeaderSchema = z.object({
    incidentId: z.string().optional().describe("Unique incident identifier"),
    title: z.string().describe("Brief title describing the incident"),
    severity: z
        .enum(["critical", "high", "medium", "low"])
        .describe("Severity level of the incident"),
    environment: z
        .enum(["production", "staging", "development"])
        .describe("Environment where the incident is occurring"),
    startedAt: z.string().optional().describe("ISO timestamp when incident started"),
    status: z
        .enum(["investigating", "identified", "monitoring", "resolved"])
        .optional()
        .describe("Current incident status"),
});

export type IncidentHeaderProps = z.infer<typeof incidentHeaderSchema>;

/**
 * Severity configuration with enhanced styling
 */
const severityConfig = {
    critical: {
        gradient: "from-red-500 via-red-600 to-rose-600",
        glow: "shadow-red-500/50",
        border: "border-red-500/50",
        bg: "bg-red-500/10",
        text: "text-red-400",
        badge: "bg-gradient-to-r from-red-500 to-rose-500",
        pulse: true,
    },
    high: {
        gradient: "from-orange-500 via-orange-600 to-amber-600",
        glow: "shadow-orange-500/50",
        border: "border-orange-500/50",
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        badge: "bg-gradient-to-r from-orange-500 to-amber-500",
        pulse: true,
    },
    medium: {
        gradient: "from-amber-500 via-yellow-500 to-amber-600",
        glow: "shadow-amber-500/50",
        border: "border-amber-500/50",
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        badge: "bg-gradient-to-r from-amber-500 to-yellow-500",
        pulse: false,
    },
    low: {
        gradient: "from-blue-500 via-cyan-500 to-blue-600",
        glow: "shadow-blue-500/50",
        border: "border-blue-500/50",
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        badge: "bg-gradient-to-r from-blue-500 to-cyan-500",
        pulse: false,
    },
};

const statusConfig = {
    investigating: { text: "Investigating", color: "text-amber-400", icon: "🔍", bg: "bg-amber-500/20" },
    identified: { text: "Identified", color: "text-orange-400", icon: "🎯", bg: "bg-orange-500/20" },
    monitoring: { text: "Monitoring", color: "text-cyan-400", icon: "👀", bg: "bg-cyan-500/20" },
    resolved: { text: "Resolved", color: "text-emerald-400", icon: "✓", bg: "bg-emerald-500/20" },
};

/**
 * Live Timer Hook - Updates every second
 */
function useLiveTimer(startedAt?: string) {
    const [elapsed, setElapsed] = React.useState<string>("T+00:00:00");

    React.useEffect(() => {
        if (!startedAt) return;

        const updateTimer = () => {
            const start = new Date(startedAt);
            const now = new Date();
            const diffMs = now.getTime() - start.getTime();

            if (diffMs < 0) {
                setElapsed("T+00:00:00");
                return;
            }

            const hours = Math.floor(diffMs / 3600000);
            const minutes = Math.floor((diffMs % 3600000) / 60000);
            const seconds = Math.floor((diffMs % 60000) / 1000);

            setElapsed(
                `T+${hours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [startedAt]);

    return elapsed;
}

export const IncidentHeader = React.forwardRef<
    HTMLDivElement,
    IncidentHeaderProps
>(({ incidentId, title, severity, environment, startedAt, status }, ref) => {
    const safeSeverity = severity && severity in severityConfig ? severity : "medium";
    const safeStatus = status && status in statusConfig ? status : "investigating";
    const sevConfig = severityConfig[safeSeverity];
    const statConfig = statusConfig[safeStatus];
    const liveTimer = useLiveTimer(startedAt);

    if (!title) {
        return (
            <div
                ref={ref}
                className="sticky top-0 z-50 w-full h-24 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex items-center justify-center backdrop-blur-sm"
            >
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Loading incident details...</span>
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} className="sticky top-0 z-50 relative group">
            {/* Outer glow */}
            <div className={cn(
                "absolute -inset-1 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity",
                `bg-gradient-to-r ${sevConfig.gradient}`
            )} />

            {/* Main container */}
            <div className={cn(
                "relative rounded-2xl border overflow-hidden backdrop-blur-xl",
                sevConfig.border,
                sevConfig.bg
            )}>
                {/* Animated gradient bar at top */}
                <div className={cn(
                    "h-1.5 w-full bg-gradient-to-r",
                    sevConfig.gradient,
                    sevConfig.pulse && "animate-pulse"
                )} />

                <div className="px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Title & ID */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                {/* Animated severity indicator */}
                                <div className="relative">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full bg-gradient-to-r",
                                        sevConfig.gradient,
                                        sevConfig.pulse && "animate-pulse"
                                    )} />
                                    {sevConfig.pulse && (
                                        <div className={cn(
                                            "absolute inset-0 w-5 h-5 rounded-full bg-gradient-to-r animate-ping opacity-50",
                                            sevConfig.gradient
                                        )} />
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-white truncate">
                                    {title}
                                </h1>
                            </div>
                            {incidentId && (
                                <p className="text-xs text-gray-500 font-mono ml-8 mt-1 flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-slate-800/50 rounded-md border border-slate-700/50">
                                        {incidentId}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Center: LIVE TIMER */}
                        <div className="flex-shrink-0">
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold tracking-wider",
                                sevConfig.bg,
                                sevConfig.text,
                                "border",
                                sevConfig.border
                            )}>
                                <svg
                                    className={cn("w-5 h-5", sevConfig.pulse && "animate-pulse")}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span>{liveTimer}</span>
                            </div>
                        </div>

                        {/* Right: Badges */}
                        <div className="flex items-center gap-3 shrink-0">
                            {/* Severity Badge */}
                            <div className={cn(
                                "px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider text-white shadow-lg",
                                sevConfig.badge,
                                `shadow-lg ${sevConfig.glow}`
                            )}>
                                {safeSeverity}
                            </div>

                            {/* Environment Badge */}
                            <div className="px-3 py-2 rounded-xl text-sm font-medium bg-slate-800/80 text-gray-300 uppercase tracking-wider border border-slate-700/50 backdrop-blur-sm">
                                {environment || "production"}
                            </div>

                            {/* Status Badge */}
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold",
                                statConfig.bg,
                                statConfig.color
                            )}>
                                <span className="text-base">{statConfig.icon}</span>
                                <span>{statConfig.text}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

IncidentHeader.displayName = "IncidentHeader";
