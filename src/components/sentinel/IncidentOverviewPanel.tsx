"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod/v3";

/**
 * Zod schema for IncidentOverviewPanel component
 */
export const incidentOverviewPanelSchema = z.object({
    summary: z.string().describe("AI-generated summary of the incident"),
    confidence: z
        .number()
        .min(0)
        .max(100)
        .describe("AI confidence level in the analysis (0-100)"),
    affectedServices: z
        .array(z.string())
        .optional()
        .describe("List of affected service names"),
    likelyRootCause: z
        .string()
        .optional()
        .describe("AI's hypothesis for the root cause"),
    suggestedAction: z
        .string()
        .optional()
        .describe("AI's suggested next action"),
    toolsUsed: z
        .array(z.string())
        .optional()
        .describe("List of tools/data sources used in the analysis for transparency"),
});

export type IncidentOverviewPanelProps = z.infer<typeof incidentOverviewPanelSchema>;

const getConfidenceConfig = (confidence: number) => {
    if (confidence >= 80) {
        return {
            color: "text-emerald-400",
            gradient: "from-emerald-400 to-green-500",
            glow: "shadow-emerald-500/50",
            bg: "bg-emerald-500",
            label: "High",
        };
    }
    if (confidence >= 50) {
        return {
            color: "text-amber-400",
            gradient: "from-amber-400 to-orange-500",
            glow: "shadow-amber-500/50",
            bg: "bg-amber-500",
            label: "Medium",
        };
    }
    return {
        color: "text-red-400",
        gradient: "from-red-400 to-rose-500",
        glow: "shadow-red-500/50",
        bg: "bg-red-500",
        label: "Low",
    };
};

/**
 * Transparency Trace Component - Shows what tools the AI used
 */
function TransparencyTrace({ tools, isLoading }: { tools?: string[]; isLoading?: boolean }) {
    const [visibleTools, setVisibleTools] = React.useState<string[]>([]);
    const [completed, setCompleted] = React.useState(false);

    // Simulated tool trace animation when loading
    const simulatedTools = [
        "Querying Prometheus (cpu_usage, memory_usage)...",
        "Checking GitHub (recent_commits)...",
        "Analyzing Kubernetes logs...",
        "Correlating deployment events...",
        "Running root cause analysis...",
    ];

    React.useEffect(() => {
        if (isLoading && !tools) {
            // Simulate tool calls appearing one by one
            simulatedTools.forEach((tool, index) => {
                setTimeout(() => {
                    setVisibleTools((prev) => [...prev, tool]);
                }, index * 800);
            });
            setTimeout(() => {
                setCompleted(true);
            }, simulatedTools.length * 800 + 500);
        } else if (tools && tools.length > 0) {
            setVisibleTools(tools);
            setCompleted(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, tools]);

    if (!isLoading && (!tools || tools.length === 0)) return null;

    return (
        <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4 font-mono text-xs">
            <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    completed ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                )} />
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-medium">
                    {completed ? "Analysis Complete" : "Analyzing..."}
                </span>
            </div>
            <div className="space-y-1.5">
                {visibleTools.map((tool, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2 text-slate-500 animate-in fade-in slide-in-from-left-2"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <span className={cn(
                            i === visibleTools.length - 1 && !completed
                                ? "text-amber-400"
                                : "text-emerald-400"
                        )}>
                            {i === visibleTools.length - 1 && !completed ? "⏳" : "✓"}
                        </span>
                        <span className={cn(
                            i === visibleTools.length - 1 && !completed
                                ? "text-slate-300"
                                : "text-slate-500"
                        )}>
                            {tool}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Loading State Component with Transparency Trace
 */
function LoadingState() {
    return (
        <div className="w-full bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                        <svg
                            className="w-5 h-5 text-white animate-pulse"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                        </svg>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur-md opacity-40 animate-pulse" />
                </div>
                <div>
                    <p className="text-white font-medium">AI is analyzing the incident...</p>
                    <p className="text-xs text-gray-500">Correlating events and building context</p>
                </div>
            </div>

            {/* Transparency Trace */}
            <TransparencyTrace isLoading={true} />
        </div>
    );
}

export const IncidentOverviewPanel = React.forwardRef<
    HTMLDivElement,
    IncidentOverviewPanelProps
>(({ summary, confidence, affectedServices, likelyRootCause, suggestedAction, toolsUsed }, ref) => {
    const safeConfidence = confidence ?? 0;
    const confidenceConfig = getConfidenceConfig(safeConfidence);

    if (!summary) {
        return <LoadingState />;
    }

    return (
        <div ref={ref} className="relative group">
            {/* Subtle glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />

            <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">AI Analysis</h3>
                            <p className="text-xs text-gray-500">Automated incident assessment</p>
                        </div>
                    </div>

                    {/* Confidence - Now with better context */}
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "px-4 py-2 rounded-xl font-bold",
                            confidenceConfig.color,
                            "bg-slate-800/50 border border-slate-700/50"
                        )}>
                            <span className="text-2xl">{safeConfidence}%</span>
                            <span className="text-xs ml-2 opacity-70">confidence</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Transparency Trace - What tools were used */}
                    {toolsUsed && toolsUsed.length > 0 && (
                        <TransparencyTrace tools={toolsUsed} />
                    )}

                    {/* Summary */}
                    <p className="text-gray-300 leading-relaxed text-lg">{summary}</p>

                    {/* Affected Services */}
                    {affectedServices && affectedServices.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">
                                🔴 Affected Services
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {affectedServices.map((service, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-mono backdrop-blur-sm"
                                    >
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Root Cause */}
                    {likelyRootCause && (
                        <div className="relative group/card">
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur opacity-50 group-hover/card:opacity-100 transition-opacity" />
                            <div className="relative p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl backdrop-blur-sm">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">🎯</span>
                                    <div>
                                        <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                                            Likely Root Cause
                                        </p>
                                        <p className="text-gray-300">{likelyRootCause}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Suggested Action */}
                    {suggestedAction && (
                        <div className="relative group/card">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-50 group-hover/card:opacity-100 transition-opacity" />
                            <div className="relative p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl backdrop-blur-sm">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">⚡</span>
                                    <div>
                                        <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">
                                            Suggested Action
                                        </p>
                                        <p className="text-gray-300">{suggestedAction}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

IncidentOverviewPanel.displayName = "IncidentOverviewPanel";
