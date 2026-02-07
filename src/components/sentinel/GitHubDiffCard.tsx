"use client";

import React, { useState } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";

/**
 * Schema for GitHubDiffCard props - Tambo uses this to understand when to render
 */
export const githubDiffCardSchema = z.object({
    repository: z.string().describe("Full repository name (e.g., 'acme/checkout-service')"),
    pullRequestNumber: z.number().optional().describe("PR number if this is from a pull request"),
    commitSha: z.string().describe("Short commit SHA (7 characters)"),
    previousCommitSha: z.string().optional().describe("Previous commit SHA for comparison"),
    author: z.string().describe("Author name or GitHub username"),
    authorAvatar: z.string().optional().describe("URL to author's avatar"),
    message: z.string().describe("Commit message"),
    timestamp: z.string().describe("ISO timestamp of commit"),
    filesChanged: z.number().describe("Number of files changed"),
    additions: z.number().describe("Lines added"),
    deletions: z.number().describe("Lines deleted"),
    diffContent: z.array(z.object({
        filename: z.string(),
        status: z.enum(["added", "modified", "deleted"]),
        additions: z.number(),
        deletions: z.number(),
        patch: z.string().optional().describe("The actual diff patch content"),
    })).describe("Array of file changes with diff patches"),
    isSuspected: z.boolean().optional().describe("Whether this commit is suspected to cause the incident"),
});

export type GitHubDiffCardProps = z.infer<typeof githubDiffCardSchema>;

/**
 * Syntax highlighting for diff content
 */
function DiffLine({ line, lineNumber }: { line: string; lineNumber: number }) {
    const isAddition = line.startsWith('+') && !line.startsWith('+++');
    const isDeletion = line.startsWith('-') && !line.startsWith('---');
    const isHeader = line.startsWith('@@') || line.startsWith('diff') || line.startsWith('index') || line.startsWith('---') || line.startsWith('+++');

    return (
        <div
            className={cn(
                "font-mono text-xs px-3 py-0.5 flex gap-2",
                isAddition && "bg-emerald-500/10 text-emerald-400",
                isDeletion && "bg-red-500/10 text-red-400",
                isHeader && "bg-slate-700/30 text-slate-500",
                !isAddition && !isDeletion && !isHeader && "text-slate-400"
            )}
        >
            <span className="w-8 text-right text-slate-600 select-none">{lineNumber}</span>
            <span className="w-4 text-center select-none">
                {isAddition ? '+' : isDeletion ? '-' : ' '}
            </span>
            <span className="flex-1 whitespace-pre overflow-x-auto">
                {isAddition || isDeletion ? line.substring(1) : line}
            </span>
        </div>
    );
}

/**
 * GitHubDiffCard - Shows code changes that may have caused an incident
 * 
 * This is a CRITICAL component for root cause analysis. When the AI detects
 * that a recent deployment likely caused the incident, it renders this card
 * to show exactly what code changed.
 */
export function GitHubDiffCard({
    repository,
    pullRequestNumber,
    commitSha,
    previousCommitSha,
    author,
    authorAvatar,
    message,
    timestamp,
    filesChanged,
    additions,
    deletions,
    diffContent,
    isSuspected = false,
}: GitHubDiffCardProps) {
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
    const [showAllFiles, setShowAllFiles] = useState(false);

    const toggleFile = (filename: string) => {
        const newExpanded = new Set(expandedFiles);
        if (newExpanded.has(filename)) {
            newExpanded.delete(filename);
        } else {
            newExpanded.add(filename);
        }
        setExpandedFiles(newExpanded);
    };

    const timeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const visibleFiles = showAllFiles ? diffContent : diffContent.slice(0, 3);

    return (
        <div className={cn(
            "rounded-xl border overflow-hidden",
            isSuspected
                ? "bg-gradient-to-br from-red-950/40 via-slate-900/90 to-slate-900 border-red-500/50"
                : "bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/90 border-slate-700/50"
        )}>
            {/* Suspected Badge */}
            {isSuspected && (
                <div className="px-4 py-2 bg-red-500/20 border-b border-red-500/30 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-xs font-medium text-red-400">⚠️ SUSPECTED ROOT CAUSE</span>
                </div>
            )}

            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700/50">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {/* GitHub Icon or Avatar */}
                        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center overflow-hidden">
                            {authorAvatar ? (
                                <img src={authorAvatar} alt={author} className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">{repository}</span>
                                {pullRequestNumber && (
                                    <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs">
                                        PR #{pullRequestNumber}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{message}</p>
                        </div>
                    </div>

                    {/* Commit Badge */}
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-xs">
                            <span className="px-2 py-1 rounded bg-slate-800 font-mono text-amber-400 border border-slate-700/50">
                                {commitSha}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{timeAgo(timestamp)}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-xs">
                    <span className="text-slate-500">{author}</span>
                    <span className="text-slate-700">•</span>
                    <span className="text-slate-400">{filesChanged} file{filesChanged !== 1 ? 's' : ''}</span>
                    <span className="text-emerald-400">+{additions}</span>
                    <span className="text-red-400">-{deletions}</span>
                </div>
            </div>

            {/* Files */}
            <div className="divide-y divide-slate-700/30">
                {visibleFiles.map((file) => (
                    <div key={file.filename}>
                        {/* File Header */}
                        <button
                            onClick={() => toggleFile(file.filename)}
                            className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    file.status === "added" && "bg-emerald-500",
                                    file.status === "modified" && "bg-amber-500",
                                    file.status === "deleted" && "bg-red-500"
                                )} />
                                <span className="text-xs font-mono text-slate-300">{file.filename}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-emerald-400">+{file.additions}</span>
                                <span className="text-xs text-red-400">-{file.deletions}</span>
                                <svg
                                    className={cn(
                                        "w-4 h-4 text-slate-500 transition-transform",
                                        expandedFiles.has(file.filename) && "rotate-180"
                                    )}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        {/* Diff Content */}
                        {expandedFiles.has(file.filename) && file.patch && (
                            <div className="bg-slate-950/50 border-t border-slate-700/30 max-h-64 overflow-auto">
                                {file.patch.split('\n').map((line, i) => (
                                    <DiffLine key={i} line={line} lineNumber={i + 1} />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Show More */}
            {diffContent.length > 3 && !showAllFiles && (
                <button
                    onClick={() => setShowAllFiles(true)}
                    className="w-full px-4 py-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/50 transition-colors border-t border-slate-700/30"
                >
                    Show {diffContent.length - 3} more file{diffContent.length - 3 !== 1 ? 's' : ''}...
                </button>
            )}

            {/* Footer Actions */}
            <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-2">
                    {previousCommitSha && (
                        <span className="text-xs text-slate-500">
                            Compared with <span className="font-mono text-slate-400">{previousCommitSha}</span>
                        </span>
                    )}
                </div>
                <a
                    href={`https://github.com/${repository}/commit/${commitSha}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 transition-all flex items-center gap-1.5"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on GitHub
                </a>
            </div>
        </div>
    );
}
