"use client";

import React, { useState, useRef } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";

/**
 * Schema for PostMortemReport props - Tambo uses this to understand when to render
 */
export const postMortemReportSchema = z.object({
    incidentId: z.string().describe("Unique incident identifier"),
    title: z.string().describe("Incident title (e.g., 'checkout-service 5xx errors')"),
    severity: z.enum(["critical", "high", "medium", "low"]).describe("Incident severity"),
    startTime: z.string().describe("ISO timestamp when incident started"),
    endTime: z.string().optional().describe("ISO timestamp when incident was resolved"),
    duration: z.string().describe("Human-readable duration (e.g., '47 minutes')"),
    impactSummary: z.string().describe("Brief description of user/business impact"),
    rootCause: z.string().describe("Identified root cause of the incident"),
    timeline: z.array(z.object({
        time: z.string().describe("ISO timestamp or relative time"),
        event: z.string().describe("Description of what happened"),
        type: z.enum(["detection", "investigation", "action", "resolution"]),
    })).describe("Chronological timeline of events"),
    affectedServices: z.array(z.string()).describe("List of affected service names"),
    responders: z.array(z.object({
        name: z.string(),
        role: z.string().optional(),
    })).optional().describe("People involved in response"),
    remediation: z.object({
        immediate: z.string().describe("What was done to fix the issue"),
        longTerm: z.string().optional().describe("Longer-term fixes planned"),
    }),
    lessonsLearned: z.array(z.string()).optional().describe("Key takeaways from the incident"),
    actionItems: z.array(z.object({
        task: z.string(),
        owner: z.string().optional(),
        dueDate: z.string().optional(),
        priority: z.enum(["high", "medium", "low"]).optional(),
    })).optional().describe("Follow-up action items"),
});

export type PostMortemReportProps = z.infer<typeof postMortemReportSchema>;

/**
 * PostMortemReport - Comprehensive incident summary for post-incident review
 * 
 * This component is rendered by the AI after an incident is resolved to provide
 * a complete summary of what happened, why, and how it was fixed.
 */
export function PostMortemReport({
    incidentId,
    title,
    severity,
    startTime,
    endTime,
    duration,
    impactSummary,
    rootCause,
    timeline,
    affectedServices,
    responders,
    remediation,
    lessonsLearned,
    actionItems,
}: PostMortemReportProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "actions">("overview");
    const reportRef = useRef<HTMLDivElement>(null);

    const handleExportPDF = () => {
        if (reportRef.current) {
            window.print();
        }
    };

    const severityColors = {
        critical: "text-red-400 bg-red-500/10 border-red-500/30",
        high: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
        low: "text-slate-400 bg-slate-500/10 border-slate-500/30",
    };

    const typeIcons = {
        detection: "🔍",
        investigation: "🔬",
        action: "⚡",
        resolution: "✅",
    };

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div
            ref={reportRef}
            className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/90 overflow-hidden print:bg-white print:text-black"
        >
            {/* Header with Gradient */}
            <div className="relative px-6 py-5 border-b border-slate-700/50 bg-gradient-to-r from-cyan-500/10 via-transparent to-violet-500/10">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-violet-500/5" />

                <div className="relative flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Post-Mortem Report</h2>
                                <p className="text-xs text-slate-400 font-mono">{incidentId}</p>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-white mt-3">{title}</h3>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", severityColors[severity])}>
                            {severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            RESOLVED
                        </span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="relative mt-4 grid grid-cols-3 gap-4">
                    <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/30">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Duration</p>
                        <p className="text-sm font-semibold text-white">{duration}</p>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/30">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Started</p>
                        <p className="text-sm font-semibold text-white">{formatTime(startTime)}</p>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/30">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Services</p>
                        <p className="text-sm font-semibold text-white">{affectedServices.length} affected</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-700/50 bg-slate-900/50">
                {(["overview", "timeline", "actions"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wider transition-all",
                            activeTab === tab
                                ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5"
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Impact */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Impact</h4>
                            <p className="text-sm text-slate-300 leading-relaxed">{impactSummary}</p>
                        </div>

                        {/* Root Cause */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Root Cause</h4>
                            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                                <p className="text-sm text-slate-300 leading-relaxed">{rootCause}</p>
                            </div>
                        </div>

                        {/* Affected Services */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Affected Services</h4>
                            <div className="flex flex-wrap gap-2">
                                {affectedServices.map((service) => (
                                    <span key={service} className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700/50 text-xs font-mono text-slate-300">
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Remediation */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Remediation</h4>
                            <div className="space-y-3">
                                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                    <p className="text-xs text-emerald-400 font-medium mb-1">Immediate Fix</p>
                                    <p className="text-sm text-slate-300">{remediation.immediate}</p>
                                </div>
                                {remediation.longTerm && (
                                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/30">
                                        <p className="text-xs text-slate-500 font-medium mb-1">Long-term Prevention</p>
                                        <p className="text-sm text-slate-300">{remediation.longTerm}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lessons Learned */}
                        {lessonsLearned && lessonsLearned.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Lessons Learned</h4>
                                <ul className="space-y-2">
                                    {lessonsLearned.map((lesson, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                            <span className="text-cyan-400 mt-0.5">→</span>
                                            {lesson}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Timeline Tab */}
                {activeTab === "timeline" && (
                    <div className="space-y-1 animate-in fade-in duration-200">
                        {timeline.map((event, i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="flex flex-col items-center">
                                    <span className="text-lg">{typeIcons[event.type]}</span>
                                    {i < timeline.length - 1 && (
                                        <div className="w-px flex-1 bg-slate-700/50 my-1" />
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="text-xs text-slate-500 font-mono">{event.time}</p>
                                    <p className="text-sm text-slate-300 mt-1">{event.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions Tab */}
                {activeTab === "actions" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        {actionItems && actionItems.length > 0 ? (
                            actionItems.map((item, i) => (
                                <div
                                    key={i}
                                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/30 flex items-start justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" className="mt-1 rounded border-slate-600 bg-slate-800" />
                                        <div>
                                            <p className="text-sm text-slate-300">{item.task}</p>
                                            {item.owner && (
                                                <p className="text-xs text-slate-500 mt-1">Owner: {item.owner}</p>
                                            )}
                                        </div>
                                    </div>
                                    {item.priority && (
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-xs font-medium",
                                            item.priority === "high" && "bg-red-500/20 text-red-400",
                                            item.priority === "medium" && "bg-amber-500/20 text-amber-400",
                                            item.priority === "low" && "bg-slate-500/20 text-slate-400"
                                        )}>
                                            {item.priority}
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-8">No action items defined yet</p>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {responders && responders.length > 0 && (
                        <span className="text-xs text-slate-500">
                            Responders: {responders.map(r => r.name).join(", ")}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                </button>
            </div>
        </div>
    );
}
