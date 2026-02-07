"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod/v3";

/**
 * Zod schema for RemediationRunbook component
 */
export const remediationRunbookSchema = z.object({
    title: z.string().describe("Title of the runbook"),
    description: z.string().optional().describe("Brief description of what this runbook addresses"),
    steps: z.array(z.object({
        id: z.string().describe("Unique step identifier"),
        title: z.string().describe("Step title"),
        command: z.string().optional().describe("Optional command to run"),
        description: z.string().optional().describe("Detailed step description"),
        isAutomated: z.boolean().optional().describe("Whether this step can be automated"),
        riskLevel: z.enum(["low", "medium", "high"]).optional().describe("Risk level of this step"),
    })).describe("List of remediation steps"),
    estimatedTime: z.string().optional().describe("Estimated time to complete all steps"),
});

export type RemediationRunbookProps = z.infer<typeof remediationRunbookSchema>;

/**
 * RemediationRunbook - Interactive checklist for incident remediation
 * 
 * INTERACTIVE: Users check off steps as they complete them.
 * AI can observe progress and suggest next actions.
 */
export const RemediationRunbook = React.forwardRef<
    HTMLDivElement,
    RemediationRunbookProps
>(({ title, description, steps, estimatedTime }, ref) => {
    const [completedSteps, setCompletedSteps] = React.useState<Set<string>>(new Set());
    const [expandedStep, setExpandedStep] = React.useState<string | null>(null);
    const [runningStep, setRunningStep] = React.useState<string | null>(null);

    const toggleStep = (id: string) => {
        setCompletedSteps((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const simulateRun = (id: string) => {
        setRunningStep(id);
        setTimeout(() => {
            setRunningStep(null);
            setCompletedSteps((prev) => new Set(prev).add(id));
        }, 2000);
    };

    const progress = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0;
    const isComplete = completedSteps.size === steps.length;

    const riskColors = {
        low: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
        medium: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
        high: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
    };

    if (!steps || steps.length === 0) {
        return (
            <div
                ref={ref}
                className="w-full bg-slate-900/50 rounded-xl border border-slate-700 p-6 flex items-center justify-center"
            >
                <div className="text-gray-400 text-sm">No remediation steps available</div>
            </div>
        );
    }

    return (
        <div ref={ref} className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-30" />

            <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
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
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">{title}</h3>
                                {description && (
                                    <p className="text-xs text-gray-500">{description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {estimatedTime && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{estimatedTime}</span>
                                </div>
                            )}
                            <div className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-bold",
                                isComplete
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-amber-500/20 text-amber-400"
                            )}>
                                {completedSteps.size}/{steps.length} Complete
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500 ease-out",
                                isComplete
                                    ? "bg-gradient-to-r from-emerald-500 to-green-400"
                                    : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                            )}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Steps List */}
                <div className="p-4 space-y-2">
                    {steps.map((step, index) => {
                        const isCompleted = completedSteps.has(step.id);
                        const isExpanded = expandedStep === step.id;
                        const isRunning = runningStep === step.id;
                        const risk = step.riskLevel || "low";
                        const riskStyle = riskColors[risk];

                        return (
                            <div
                                key={step.id}
                                className={cn(
                                    "rounded-xl border transition-all",
                                    isCompleted
                                        ? "bg-emerald-500/5 border-emerald-500/20"
                                        : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                                )}
                            >
                                {/* Step Header */}
                                <div
                                    className="flex items-center gap-4 px-4 py-3 cursor-pointer"
                                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleStep(step.id);
                                        }}
                                        className={cn(
                                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0",
                                            isCompleted
                                                ? "bg-emerald-500 border-emerald-500"
                                                : "border-slate-600 hover:border-violet-500"
                                        )}
                                    >
                                        {isCompleted && (
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Step Number & Title */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 font-mono">#{index + 1}</span>
                                            <span className={cn(
                                                "font-medium transition-colors",
                                                isCompleted ? "text-gray-500 line-through" : "text-white"
                                            )}>
                                                {step.title}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Risk Badge */}
                                    {step.riskLevel && (
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                                            riskStyle.text,
                                            riskStyle.bg,
                                            riskStyle.border,
                                            "border"
                                        )}>
                                            {step.riskLevel}
                                        </span>
                                    )}

                                    {/* Automated Badge */}
                                    {step.isAutomated && !isCompleted && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                simulateRun(step.id);
                                            }}
                                            disabled={isRunning}
                                            className={cn(
                                                "px-3 py-1 rounded-lg text-xs font-medium transition-all",
                                                isRunning
                                                    ? "bg-cyan-500/20 text-cyan-400 cursor-wait"
                                                    : "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                                            )}
                                        >
                                            {isRunning ? (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                                                    Running...
                                                </span>
                                            ) : (
                                                "▶ Run"
                                            )}
                                        </button>
                                    )}

                                    {/* Expand Icon */}
                                    <svg
                                        className={cn(
                                            "w-5 h-5 text-gray-500 transition-transform",
                                            isExpanded && "rotate-180"
                                        )}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-2 border-t border-slate-700/50 space-y-3">
                                        {step.description && (
                                            <p className="text-sm text-gray-400">{step.description}</p>
                                        )}
                                        {step.command && (
                                            <div className="relative">
                                                <pre className="bg-slate-900 rounded-lg p-3 text-sm font-mono text-cyan-400 overflow-x-auto">
                                                    <code>{step.command}</code>
                                                </pre>
                                                <button
                                                    className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-700 text-xs text-gray-400 hover:text-white"
                                                    onClick={() => navigator.clipboard.writeText(step.command || "")}
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Completion Message */}
                {isComplete && (
                    <div className="px-6 py-4 border-t border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">✅</span>
                            <div>
                                <p className="text-emerald-400 font-medium">All steps completed!</p>
                                <p className="text-xs text-gray-500">Ask AI to generate a post-mortem report</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

RemediationRunbook.displayName = "RemediationRunbook";
