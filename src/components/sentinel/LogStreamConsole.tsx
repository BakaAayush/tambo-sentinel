"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod/v3";

/**
 * Zod schema for LogStreamConsole component
 */
export const logStreamConsoleSchema = z.object({
    podName: z.string().describe("Name of the Kubernetes pod to stream logs from"),
    namespace: z.string().describe("Kubernetes namespace of the pod"),
    filter: z.string().optional().describe("Optional filter string or regex pattern to search logs"),
});

export type LogStreamConsoleProps = z.infer<typeof logStreamConsoleSchema>;

/**
 * Mock log entry type
 */
interface LogEntry {
    timestamp: string;
    level: "INFO" | "WARN" | "ERROR" | "DEBUG";
    message: string;
}

/**
 * Generate mock log entries for demo purposes - with realistic error patterns
 */
const generateMockLogs = (podName: string): LogEntry[] => {
    const logPatterns: LogEntry[] = [
        { timestamp: "", level: "INFO", message: "Request processed successfully" },
        { timestamp: "", level: "INFO", message: "Connection pool initialized" },
        { timestamp: "", level: "INFO", message: "Cache miss for key: user_session_abc123" },
        { timestamp: "", level: "INFO", message: "Database query completed in 45ms" },
        { timestamp: "", level: "INFO", message: "Health check passed" },
        { timestamp: "", level: "WARN", message: "Memory usage at 78%" },
        { timestamp: "", level: "INFO", message: "Incoming request from 10.0.0.42" },
        { timestamp: "", level: "INFO", message: "Response sent with status 200" },
        { timestamp: "", level: "WARN", message: "Retry attempt 1/3 for external API" },
        { timestamp: "", level: "INFO", message: "Configuration reloaded successfully" },
        { timestamp: "", level: "WARN", message: "High CPU usage detected: 89%" },
        { timestamp: "", level: "ERROR", message: "Connection refused to downstream service" },
        { timestamp: "", level: "ERROR", message: "Failed to parse request body: invalid JSON" },
        { timestamp: "", level: "ERROR", message: "Timeout waiting for response from payment-gateway (30000ms)" },
        { timestamp: "", level: "ERROR", message: "Circuit breaker opened for service-api" },
        { timestamp: "", level: "ERROR", message: "Database connection pool exhausted" },
        { timestamp: "", level: "ERROR", message: "OOM killed: container exceeded memory limit" },
        { timestamp: "", level: "DEBUG", message: "Trace ID: abc123-def456-ghi789" },
    ];

    const logs: LogEntry[] = [];
    const now = new Date();

    for (let i = 0; i < 25; i++) {
        const time = new Date(now.getTime() - (25 - i) * 3000);
        const pattern = logPatterns[Math.floor(Math.random() * logPatterns.length)];

        logs.push({
            timestamp: time.toISOString(),
            level: pattern.level,
            message: `${pattern.message} [${podName}]`,
        });
    }

    return logs;
};

/**
 * Level color mapping
 */
const levelColors = {
    INFO: "text-cyan-400",
    WARN: "text-amber-400",
    ERROR: "text-red-400",
    DEBUG: "text-gray-400",
};

const levelBgColors = {
    INFO: "bg-cyan-500/10",
    WARN: "bg-amber-500/10",
    ERROR: "bg-red-500/10",
    DEBUG: "bg-gray-500/10",
};

/**
 * LogStreamConsole - Live log streaming console with REGEX filter
 *
 * INTERACTIVE COMPONENT: Users can type regex filters and the AI observes.
 */
export const LogStreamConsole = React.forwardRef<
    HTMLDivElement,
    LogStreamConsoleProps
>(({ podName, namespace, filter }, ref) => {
    const [localFilter, setLocalFilter] = React.useState(filter || "");
    const [isRegex, setIsRegex] = React.useState(false);
    const [regexError, setRegexError] = React.useState<string | null>(null);
    const [logs, setLogs] = React.useState<LogEntry[]>([]);
    const [isStreaming, setIsStreaming] = React.useState(true);
    const [selectedLine, setSelectedLine] = React.useState<number | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Initialize logs
    React.useEffect(() => {
        if (podName) {
            setLogs(generateMockLogs(podName));
        }
    }, [podName]);

    // Simulate streaming logs
    React.useEffect(() => {
        if (!isStreaming || !podName) return;

        const errorMessages = [
            "Timeout waiting for response",
            "Connection refused",
            "Memory limit exceeded",
            "Database query failed",
            "Request processed OK",
        ];

        const interval = setInterval(() => {
            const levels: LogEntry["level"][] = ["INFO", "INFO", "WARN", "ERROR", "DEBUG"];
            const level = levels[Math.floor(Math.random() * levels.length)];
            const message = errorMessages[Math.floor(Math.random() * errorMessages.length)];

            const newLog: LogEntry = {
                timestamp: new Date().toISOString(),
                level,
                message: `${message} [${podName}]`,
            };

            setLogs((prev) => [...prev.slice(-50), newLog]);
        }, 2000);

        return () => clearInterval(interval);
    }, [isStreaming, podName]);

    // Auto-scroll to bottom
    React.useEffect(() => {
        if (scrollRef.current && selectedLine === null) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, selectedLine]);

    // Filter logs with regex support
    const filteredLogs = React.useMemo(() => {
        if (!localFilter) {
            setRegexError(null);
            return logs;
        }

        if (isRegex) {
            try {
                const regex = new RegExp(localFilter, "i");
                setRegexError(null);
                return logs.filter((log) => regex.test(log.message) || regex.test(log.level));
            } catch (e) {
                setRegexError((e as Error).message);
                return logs;
            }
        }

        const lowerFilter = localFilter.toLowerCase();
        return logs.filter(
            (log) =>
                log.message.toLowerCase().includes(lowerFilter) ||
                log.level.toLowerCase().includes(lowerFilter)
        );
    }, [logs, localFilter, isRegex]);

    // Highlight matching text
    const highlightMatch = (text: string): React.ReactNode => {
        if (!localFilter) return text;

        try {
            const regex = isRegex ? new RegExp(`(${localFilter})`, "gi") : new RegExp(`(${localFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
            const parts = text.split(regex);

            return parts.map((part, i) =>
                regex.test(part) ? (
                    <span key={i} className="bg-amber-500/30 text-amber-200 px-0.5 rounded">
                        {part}
                    </span>
                ) : (
                    part
                )
            );
        } catch {
            return text;
        }
    };

    if (!podName) {
        return (
            <div
                ref={ref}
                className="w-full h-80 bg-slate-900/50 rounded-xl border border-slate-700 flex items-center justify-center"
            >
                <div className="text-gray-400 text-sm">Waiting for pod selection...</div>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden"
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-violet-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold font-mono text-sm">
                                {namespace}/{podName}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span
                                    className={cn(
                                        "flex items-center gap-1",
                                        isStreaming ? "text-emerald-400" : "text-gray-500"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            isStreaming ? "bg-emerald-400 animate-pulse" : "bg-gray-500"
                                        )}
                                    />
                                    {isStreaming ? "Live" : "Paused"}
                                </span>
                                <span>•</span>
                                <span>{filteredLogs.length} entries</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsStreaming(!isStreaming)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                isStreaming
                                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            )}
                        >
                            {isStreaming ? "⏸ Pause" : "▶ Resume"}
                        </button>
                    </div>
                </div>

                {/* Filter Input with Regex Toggle */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            value={localFilter}
                            onChange={(e) => setLocalFilter(e.target.value)}
                            placeholder={isRegex ? "Enter regex pattern... (e.g., timeout|error)" : "Filter logs..."}
                            className={cn(
                                "w-full bg-slate-800/50 border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 font-mono",
                                regexError ? "border-red-500" : "border-slate-600"
                            )}
                        />
                    </div>
                    <button
                        onClick={() => setIsRegex(!isRegex)}
                        className={cn(
                            "px-3 py-2 rounded-lg text-xs font-mono font-bold transition-colors border",
                            isRegex
                                ? "bg-violet-500/20 text-violet-400 border-violet-500/50"
                                : "bg-slate-700/50 text-gray-400 border-slate-600 hover:text-white"
                        )}
                        title="Toggle regex mode"
                    >
                        .*
                    </button>
                </div>
                {regexError && (
                    <p className="text-red-400 text-xs mt-1 font-mono">Invalid regex: {regexError}</p>
                )}

                {/* AI Observation Hint */}
                {localFilter && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-cyan-400/70">
                        <span className="animate-pulse">🤖</span>
                        <span>AI is observing your filter: &quot;{localFilter}&quot;</span>
                    </div>
                )}
            </div>

            {/* Log Stream */}
            <div
                ref={scrollRef}
                className="h-72 overflow-y-auto font-mono text-xs p-3 space-y-1"
            >
                {filteredLogs.map((log, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedLine(selectedLine === index ? null : index)}
                        className={cn(
                            "flex gap-3 py-1.5 px-2 rounded transition-colors cursor-pointer",
                            levelBgColors[log.level],
                            selectedLine === index && "ring-1 ring-cyan-500 bg-cyan-500/10"
                        )}
                    >
                        <span className="text-gray-500 shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span
                            className={cn(
                                "shrink-0 font-semibold w-14",
                                levelColors[log.level]
                            )}
                        >
                            [{log.level}]
                        </span>
                        <span className="text-gray-300">{highlightMatch(log.message)}</span>
                    </div>
                ))}
            </div>

            {/* Selected Line Context */}
            {selectedLine !== null && filteredLogs[selectedLine] && (
                <div className="px-4 py-3 border-t border-slate-700 bg-cyan-500/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-cyan-400">
                            <span>📌</span>
                            <span>Line selected - Ask AI to analyze this error</span>
                        </div>
                        <button
                            onClick={() => setSelectedLine(null)}
                            className="text-xs text-gray-500 hover:text-white"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

LogStreamConsole.displayName = "LogStreamConsole";
