"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod/v3";

/**
 * Schema for service node in the topology
 */
const serviceNodeSchema = z.object({
    serviceName: z.string().describe("Name of the Kubernetes service"),
    health: z
        .enum(["healthy", "degraded", "down"])
        .describe("Health status of the service"),
    cpuUsage: z.number().describe("CPU usage percentage (0-100)"),
    memoryUsage: z.number().describe("Memory usage percentage (0-100)"),
});

/**
 * Schema for edge connection between services
 */
const serviceEdgeSchema = z.object({
    source: z.string().describe("Source service name"),
    target: z.string().describe("Target service name"),
    latencyMs: z.number().describe("Latency in milliseconds between services"),
});

/**
 * Zod schema for ClusterTopologyMap component
 */
export const clusterTopologyMapSchema = z.object({
    nodes: z
        .array(serviceNodeSchema)
        .describe("Array of Kubernetes service nodes to visualize"),
    edges: z
        .array(serviceEdgeSchema)
        .describe("Array of connections between services"),
});

export type ClusterTopologyMapProps = z.infer<typeof clusterTopologyMapSchema>;
export type ServiceNode = z.infer<typeof serviceNodeSchema>;
export type ServiceEdge = z.infer<typeof serviceEdgeSchema>;

/**
 * Health status colors with enhanced styling
 */
const healthColors = {
    healthy: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/50",
        text: "text-emerald-400",
        glow: "shadow-emerald-500/50",
        gradient: "from-emerald-400 to-green-500",
        dot: "bg-emerald-500",
        emoji: "✅",
    },
    degraded: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/50",
        text: "text-amber-400",
        glow: "shadow-amber-500/50",
        gradient: "from-amber-400 to-orange-500",
        dot: "bg-amber-500",
        emoji: "⚠️",
    },
    down: {
        bg: "bg-red-500/10",
        border: "border-red-500/50",
        text: "text-red-400",
        glow: "shadow-red-500/50",
        gradient: "from-red-400 to-rose-500",
        dot: "bg-red-500",
        emoji: "🔴",
    },
};

/**
 * Service Node Component with enhanced styling
 */
const ServiceNodeCard: React.FC<{
    node: ServiceNode;
    position: { x: number; y: number };
    onClick?: () => void;
    isSelected?: boolean;
}> = ({ node, position, onClick, isSelected }) => {
    const healthKey = node.health && node.health in healthColors ? node.health : "degraded";
    const colors = healthColors[healthKey];
    const cpu = node.cpuUsage ?? 0;
    const mem = node.memoryUsage ?? 0;

    return (
        <div
            className={cn(
                "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300",
                isSelected && "z-20"
            )}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            onClick={onClick}
        >
            {/* Outer glow when selected */}
            {isSelected && (
                <div className={cn(
                    "absolute -inset-2 rounded-2xl blur-xl opacity-60",
                    `bg-gradient-to-r ${colors.gradient}`
                )} />
            )}

            {/* Card */}
            <div className={cn(
                "relative w-48 p-4 rounded-xl border-2 backdrop-blur-md transition-all duration-300",
                colors.bg,
                colors.border,
                isSelected && `shadow-lg ${colors.glow}`,
                "hover:scale-105 hover:border-2"
            )}>
                {/* Health indicator strip */}
                <div className={cn(
                    "absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r",
                    colors.gradient,
                    healthKey === "down" && "animate-pulse"
                )} />

                {/* Header */}
                <div className="flex items-center gap-2.5 mb-3 mt-1">
                    {/* Animated status dot */}
                    <div className="relative">
                        <div className={cn("w-3 h-3 rounded-full", colors.dot)} />
                        {healthKey !== "healthy" && (
                            <div className={cn(
                                "absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-50",
                                colors.dot
                            )} />
                        )}
                    </div>
                    <span className="font-mono text-sm font-bold text-white truncate">
                        {node.serviceName}
                    </span>
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                    {/* CPU */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">CPU</span>
                            <span className={cn("font-mono font-bold", colors.text)}>{cpu.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                            <div
                                className={cn(
                                    "h-2 rounded-full transition-all duration-500 bg-gradient-to-r",
                                    cpu > 80
                                        ? "from-red-500 to-rose-500"
                                        : cpu > 60
                                            ? "from-amber-500 to-orange-500"
                                            : "from-emerald-500 to-green-500"
                                )}
                                style={{ width: `${Math.min(cpu, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Memory */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Memory</span>
                            <span className={cn("font-mono font-bold", colors.text)}>{mem.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                            <div
                                className={cn(
                                    "h-2 rounded-full transition-all duration-500 bg-gradient-to-r",
                                    mem > 80
                                        ? "from-red-500 to-rose-500"
                                        : mem > 60
                                            ? "from-amber-500 to-orange-500"
                                            : "from-emerald-500 to-green-500"
                                )}
                                style={{ width: `${Math.min(mem, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * ClusterTopologyMap - Visualizes Kubernetes services and their dependencies
 */
export const ClusterTopologyMap = React.forwardRef<
    HTMLDivElement,
    ClusterTopologyMapProps
>(({ nodes, edges }, ref) => {
    const [selectedNode, setSelectedNode] = React.useState<string | null>(null);

    // Simple layout algorithm - arrange nodes in a circular pattern
    const nodePositions = React.useMemo(() => {
        const positions: Record<string, { x: number; y: number }> = {};
        const count = nodes?.length || 0;
        const centerX = 50;
        const centerY = 50;
        const radius = 35;

        nodes?.forEach((node, index) => {
            const angle = (2 * Math.PI * index) / count - Math.PI / 2;
            positions[node.serviceName] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            };
        });

        return positions;
    }, [nodes]);

    if (!nodes || nodes.length === 0) {
        return (
            <div
                ref={ref}
                className="w-full h-96 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex items-center justify-center backdrop-blur-sm"
            >
                <div className="flex flex-col items-center gap-4 text-gray-400">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                    <span className="text-sm font-medium">Loading cluster topology...</span>
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} className="relative group">
            {/* Outer glow */}
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
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Cluster Topology</h3>
                            <p className="text-xs text-gray-500">{nodes.length} services connected</p>
                        </div>
                    </div>

                    {/* Health Legend */}
                    <div className="flex items-center gap-5 text-xs">
                        {[
                            { label: "Healthy", color: "bg-emerald-500" },
                            { label: "Degraded", color: "bg-amber-500" },
                            { label: "Down", color: "bg-red-500" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2">
                                <div className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
                                <span className="text-gray-400">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Topology Visualization */}
                <div className="relative h-[420px] p-4">
                    {/* Background grid */}
                    <div
                        className="absolute inset-4 opacity-[0.03]"
                        style={{
                            backgroundImage: `radial-gradient(circle, rgba(56, 189, 248, 0.5) 1px, transparent 1px)`,
                            backgroundSize: '30px 30px'
                        }}
                    />

                    {/* Draw edges as SVG */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#475569" />
                                <stop offset="100%" stopColor="#64748b" />
                            </linearGradient>
                            <linearGradient id="highLatencyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="100%" stopColor="#f97316" />
                            </linearGradient>
                        </defs>
                        {edges?.map((edge, index) => {
                            const sourcePos = nodePositions[edge.source];
                            const targetPos = nodePositions[edge.target];
                            if (!sourcePos || !targetPos) return null;

                            const isHighLatency = edge.latencyMs > 100;

                            return (
                                <g key={index}>
                                    {/* Glow for high latency */}
                                    {isHighLatency && (
                                        <line
                                            x1={`${sourcePos.x}%`}
                                            y1={`${sourcePos.y}%`}
                                            x2={`${targetPos.x}%`}
                                            y2={`${targetPos.y}%`}
                                            stroke="#ef4444"
                                            strokeWidth="6"
                                            strokeOpacity="0.2"
                                            strokeLinecap="round"
                                        />
                                    )}
                                    <line
                                        x1={`${sourcePos.x}%`}
                                        y1={`${sourcePos.y}%`}
                                        x2={`${targetPos.x}%`}
                                        y2={`${targetPos.y}%`}
                                        stroke={isHighLatency ? "url(#highLatencyGradient)" : "url(#edgeGradient)"}
                                        strokeWidth="2"
                                        strokeDasharray={isHighLatency ? "8,4" : undefined}
                                        strokeLinecap="round"
                                        className={isHighLatency ? "animate-pulse" : ""}
                                    />
                                    {/* Latency label */}
                                    <text
                                        x={`${(sourcePos.x + targetPos.x) / 2}%`}
                                        y={`${(sourcePos.y + targetPos.y) / 2}%`}
                                        fill={isHighLatency ? "#ef4444" : "#94a3b8"}
                                        fontSize="11"
                                        fontWeight="600"
                                        fontFamily="monospace"
                                        textAnchor="middle"
                                        dy="-8"
                                    >
                                        {edge.latencyMs}ms
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Render nodes */}
                    {nodes.map((node) => (
                        <ServiceNodeCard
                            key={node.serviceName}
                            node={node}
                            position={nodePositions[node.serviceName]}
                            isSelected={selectedNode === node.serviceName}
                            onClick={() =>
                                setSelectedNode(
                                    selectedNode === node.serviceName ? null : node.serviceName
                                )
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

ClusterTopologyMap.displayName = "ClusterTopologyMap";
