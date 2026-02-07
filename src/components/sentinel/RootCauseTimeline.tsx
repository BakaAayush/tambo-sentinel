"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod/v3";

/**
 * Timeline event schema
 */
const timelineEventSchema = z.object({
    timestamp: z.string().describe("ISO timestamp of the event"),
    type: z
        .enum(["deploy", "error", "latency"])
        .describe("Type of event - deployment, error spike, or latency increase"),
    description: z.string().describe("Human-readable description of the event"),
});

/**
 * Zod schema for RootCauseTimeline component
 */
export const rootCauseTimelineSchema = z.object({
    events: z
        .array(timelineEventSchema)
        .describe("Array of timeline events to display for root cause analysis"),
});

export type RootCauseTimelineProps = z.infer<typeof rootCauseTimelineSchema>;
export type TimelineEvent = z.infer<typeof timelineEventSchema>;

/**
 * Event type configuration with enhanced styling
 */
const eventTypeConfig = {
    deploy: {
        emoji: "🚀",
        gradient: "from-blue-400 to-cyan-500",
        glow: "shadow-blue-500/50",
        bg: "bg-blue-500/10",
        border: "border-blue-500/50",
        text: "text-blue-400",
        line: "bg-gradient-to-b from-blue-500 to-blue-500/20",
        label: "Deployment",
    },
    error: {
        emoji: "🔥",
        gradient: "from-red-400 to-rose-500",
        glow: "shadow-red-500/50",
        bg: "bg-red-500/10",
        border: "border-red-500/50",
        text: "text-red-400",
        line: "bg-gradient-to-b from-red-500 to-red-500/20",
        label: "Error Spike",
    },
    latency: {
        emoji: "⏱️",
        gradient: "from-amber-400 to-orange-500",
        glow: "shadow-amber-500/50",
        bg: "bg-amber-500/10",
        border: "border-amber-500/50",
        text: "text-amber-400",
        line: "bg-gradient-to-b from-amber-500 to-amber-500/20",
        label: "Latency Spike",
    },
};

const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return eventTime.toLocaleDateString();
};

export const RootCauseTimeline = React.forwardRef<
    HTMLDivElement,
    RootCauseTimelineProps
>(({ events }, ref) => {
    const [selectedEvent, setSelectedEvent] = React.useState<number | null>(null);

    // Sort events by timestamp (most recent first)
    const sortedEvents = React.useMemo(() => {
        if (!events) return [];
        return [...events].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }, [events]);

    if (!events || events.length === 0) {
        return (
            <div
                ref={ref}
                className="w-full h-64 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex items-center justify-center backdrop-blur-sm"
            >
                <div className="flex flex-col items-center gap-4 text-gray-400">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <span className="text-3xl animate-pulse">📊</span>
                        </div>
                    </div>
                    <span className="text-sm font-medium">Loading timeline events...</span>
                </div>
            </div>
        );
    }

    // Find if there's a pattern (deploy followed by errors)
    const deployIndex = sortedEvents.findIndex((e) => e.type === "deploy");
    const errorIndex = sortedEvents.findIndex((e) => e.type === "error");
    const hasCorrelation = deployIndex > -1 && errorIndex > -1 && deployIndex > errorIndex;

    return (
        <div ref={ref} className="relative group">
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />

            <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <span className="text-lg">📊</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Root Cause Timeline</h3>
                            <p className="text-xs text-gray-500">{events.length} events correlated</p>
                        </div>
                    </div>

                    {/* Event Type Legend */}
                    <div className="flex items-center gap-5 text-xs">
                        {Object.entries(eventTypeConfig).map(([key, config]) => (
                            <div key={key} className="flex items-center gap-2">
                                <span>{config.emoji}</span>
                                <span className={config.text}>{config.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Correlation Insight */}
                {hasCorrelation && (
                    <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🎯</span>
                            <div>
                                <p className="text-violet-400 font-bold text-sm">Correlation Detected</p>
                                <p className="text-gray-400 text-sm">
                                    Errors started after a deployment — this is likely the root cause.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="p-6">
                    <div className="relative">
                        {sortedEvents.map((event, index) => {
                            // Safe fallback for undefined event type during streaming
                            const safeType = event.type && event.type in eventTypeConfig ? event.type : "error";
                            const config = eventTypeConfig[safeType];
                            const isSelected = selectedEvent === index;
                            const isFirst = index === 0;
                            const isLast = index === sortedEvents.length - 1;

                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        "relative flex gap-5 cursor-pointer transition-all duration-300",
                                        !isLast && "pb-6"
                                    )}
                                    onClick={() => setSelectedEvent(isSelected ? null : index)}
                                >
                                    {/* Timeline line and dot */}
                                    <div className="flex flex-col items-center">
                                        {/* Dot */}
                                        <div className="relative z-10">
                                            {isSelected && (
                                                <div className={cn(
                                                    "absolute -inset-2 rounded-full blur-md opacity-60",
                                                    `bg-gradient-to-r ${config.gradient}`
                                                )} />
                                            )}
                                            <div className={cn(
                                                "relative w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 shadow-lg",
                                                `bg-gradient-to-br ${config.gradient}`,
                                                config.glow,
                                                isSelected && "scale-110"
                                            )}>
                                                {config.emoji}
                                            </div>
                                        </div>
                                        {/* Line */}
                                        {!isLast && (
                                            <div className={cn(
                                                "w-0.5 flex-1 mt-2",
                                                config.line
                                            )} />
                                        )}
                                    </div>

                                    {/* Event content */}
                                    <div className={cn(
                                        "flex-1 pt-1 transition-all duration-300",
                                        isSelected && "transform scale-[1.02]"
                                    )}>
                                        <div className={cn(
                                            "p-4 rounded-xl border transition-all duration-300",
                                            config.bg,
                                            isSelected ? config.border : "border-transparent",
                                            "hover:border-white/10"
                                        )}>
                                            {/* Time & Type */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={cn("text-xs font-bold uppercase tracking-wider", config.text)}>
                                                    {config.label}
                                                </span>
                                                <span className="text-xs text-gray-500 font-mono">
                                                    {formatRelativeTime(event.timestamp)}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-300 leading-relaxed">
                                                {event.description}
                                            </p>

                                            {/* First event indicator */}
                                            {isFirst && (
                                                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                                    <span className="text-xs text-cyan-400 font-medium">Most Recent</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
});

RootCauseTimeline.displayName = "RootCauseTimeline";
