"use client";

import React, { useState, useRef, useCallback, ReactNode } from "react";

interface SplitPaneProps {
    leftPane: ReactNode;
    rightPane: ReactNode;
    defaultLeftWidth?: number; // percentage
    minLeftWidth?: number; // percentage
    maxLeftWidth?: number; // percentage
}

export function SplitPane({
    leftPane,
    rightPane,
    defaultLeftWidth = 40,
    minLeftWidth = 25,
    maxLeftWidth = 60,
}: SplitPaneProps) {
    const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            if (newLeftWidth >= minLeftWidth && newLeftWidth <= maxLeftWidth) {
                setLeftWidth(newLeftWidth);
            }
        },
        [isResizing, minLeftWidth, maxLeftWidth]
    );

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    React.useEffect(() => {
        if (isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
        } else {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return (
        <div ref={containerRef} className="flex h-full w-full">
            {/* Left Pane */}
            <div
                className="h-full overflow-hidden flex-shrink-0"
                style={{ width: `${leftWidth}%` }}
            >
                {leftPane}
            </div>

            {/* Resizer */}
            <div
                className={`relative w-1 flex-shrink-0 cursor-col-resize group ${isResizing ? "bg-cyan-500" : "bg-slate-700/50 hover:bg-cyan-500/50"
                    } transition-colors`}
                onMouseDown={handleMouseDown}
            >
                {/* Visual handle */}
                <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 rounded-full transition-all ${isResizing
                            ? "bg-cyan-400 scale-110"
                            : "bg-slate-600 group-hover:bg-cyan-400"
                        }`}
                />
                {/* Wider hit area */}
                <div className="absolute inset-y-0 -left-2 -right-2" />
            </div>

            {/* Right Pane */}
            <div className="h-full flex-1 overflow-hidden">{rightPane}</div>
        </div>
    );
}
