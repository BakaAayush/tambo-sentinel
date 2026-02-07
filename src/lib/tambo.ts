/**
 * @file tambo.ts
 * @description Central configuration file for Sentinel MVP — Generative UI for DevOps
 *
 * This file registers all Sentinel components and tools with Tambo.
 * The AI uses these registrations to dynamically compose UI for incident response.
 *
 * Key Rule: AI decides UI. Humans decide actions.
 * 
 * MVP Scope: 5 Components
 * - IncidentHeader (Persistent)
 * - IncidentOverviewPanel (Generative)
 * - ClusterTopologyMap (Generative)
 * - RootCauseTimeline (Generative)
 * - RollbackApprovalCard (Interactable, Human-in-the-Loop)
 */

import {
  IncidentHeader,
  incidentHeaderSchema,
  IncidentOverviewPanel,
  incidentOverviewPanelSchema,
  ClusterTopologyMap,
  clusterTopologyMapSchema,
  RootCauseTimeline,
  rootCauseTimelineSchema,
  RollbackApprovalCard,
  rollbackApprovalCardSchema,
  LogStreamConsole,
  logStreamConsoleSchema,
  RemediationRunbook,
  remediationRunbookSchema,
  GitHubDiffCard,
  githubDiffCardSchema,
  PostMortemReport,
  postMortemReportSchema,
} from "@/components/sentinel";
import type { TamboComponent, TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * Mock Kubernetes MCP Tool - Get cluster status
 */
const getClusterStatus = async (params: {
  namespace?: string;
  serviceName?: string;
}) => {
  // Simulated cluster data
  const services = [
    {
      serviceName: "api-gateway",
      health: "healthy" as const,
      cpuUsage: 45.2,
      memoryUsage: 62.1,
    },
    {
      serviceName: "checkout-service",
      health: "degraded" as const,
      cpuUsage: 89.5,
      memoryUsage: 78.3,
    },
    {
      serviceName: "payment-service",
      health: "healthy" as const,
      cpuUsage: 32.1,
      memoryUsage: 41.5,
    },
    {
      serviceName: "inventory-service",
      health: "healthy" as const,
      cpuUsage: 28.7,
      memoryUsage: 55.2,
    },
    {
      serviceName: "notification-service",
      health: "down" as const,
      cpuUsage: 0,
      memoryUsage: 0,
    },
    {
      serviceName: "user-service",
      health: "healthy" as const,
      cpuUsage: 38.4,
      memoryUsage: 49.8,
    },
  ];

  const edges = [
    { source: "api-gateway", target: "checkout-service", latencyMs: 245 },
    { source: "api-gateway", target: "user-service", latencyMs: 12 },
    { source: "checkout-service", target: "payment-service", latencyMs: 85 },
    { source: "checkout-service", target: "inventory-service", latencyMs: 156 },
    { source: "checkout-service", target: "notification-service", latencyMs: 5000 },
    { source: "payment-service", target: "notification-service", latencyMs: 5000 },
  ];

  if (params.serviceName) {
    const service = services.find((s) => s.serviceName === params.serviceName);
    return { nodes: service ? [service] : [], edges: [] };
  }

  return { nodes: services, edges };
};

/**
 * Mock tool - Get recent events for root cause analysis
 */
const getRecentEvents = async (params: { serviceName?: string; hours?: number }) => {
  const now = new Date();
  const events = [
    {
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      type: "error" as const,
      description: "Multiple 5xx errors detected in checkout-service",
    },
    {
      timestamp: new Date(now.getTime() - 8 * 60000).toISOString(),
      type: "latency" as const,
      description: "P99 latency increased to 2.4s in checkout-service",
    },
    {
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
      type: "deploy" as const,
      description: "Deployed checkout-service v2.3.1 to production",
    },
    {
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
      type: "deploy" as const,
      description: "Deployed notification-service v1.8.0 to production",
    },
    {
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
      type: "latency" as const,
      description: "Minor latency spike in api-gateway (resolved)",
    },
  ];

  if (params.serviceName) {
    return events.filter((e) =>
      e.description.toLowerCase().includes(params.serviceName!.toLowerCase())
    );
  }

  return events;
};

/**
 * Mock tool - Get rollback recommendation
 */
const getRollbackRecommendation = async (params: { serviceName: string }) => {
  const recommendations: Record<
    string,
    {
      service: string;
      currentVersion: string;
      targetVersion: string;
      riskLevel: "low" | "medium" | "high";
    }
  > = {
    "checkout-service": {
      service: "checkout-service",
      currentVersion: "v2.3.1",
      targetVersion: "v2.3.0",
      riskLevel: "medium",
    },
    "notification-service": {
      service: "notification-service",
      currentVersion: "v1.8.0",
      targetVersion: "v1.7.2",
      riskLevel: "low",
    },
    "payment-service": {
      service: "payment-service",
      currentVersion: "v3.1.0",
      targetVersion: "v3.0.5",
      riskLevel: "high",
    },
  };

  return (
    recommendations[params.serviceName] || {
      service: params.serviceName,
      currentVersion: "v1.0.0",
      targetVersion: "v0.9.0",
      riskLevel: "medium",
    }
  );
};

/**
 * Sentinel Tools
 *
 * These tools allow the AI to fetch data from DevOps systems.
 * They can READ and ANALYZE but NOT execute destructive actions.
 */
export const tools: TamboTool[] = [
  {
    name: "getClusterStatus",
    description:
      "Get the current status of Kubernetes cluster services including health, CPU, and memory usage. Use this to understand the current state of services when investigating incidents.",
    tool: getClusterStatus,
    inputSchema: z.object({
      namespace: z
        .string()
        .optional()
        .describe("Optional namespace to filter services"),
      serviceName: z
        .string()
        .optional()
        .describe("Optional specific service to check"),
    }),
    outputSchema: z.object({
      nodes: z.array(
        z.object({
          serviceName: z.string(),
          health: z.enum(["healthy", "degraded", "down"]),
          cpuUsage: z.number(),
          memoryUsage: z.number(),
        })
      ),
      edges: z.array(
        z.object({
          source: z.string(),
          target: z.string(),
          latencyMs: z.number(),
        })
      ),
    }),
  },
  {
    name: "getRecentEvents",
    description:
      "Get recent deployment, error, and latency events for root cause analysis. Use this to correlate events and identify what might have caused an incident.",
    tool: getRecentEvents,
    inputSchema: z.object({
      serviceName: z
        .string()
        .optional()
        .describe("Optional service name to filter events"),
      hours: z
        .number()
        .optional()
        .describe("Number of hours to look back (default: 24)"),
    }),
    outputSchema: z.array(
      z.object({
        timestamp: z.string(),
        type: z.enum(["deploy", "error", "latency"]),
        description: z.string(),
      })
    ),
  },
  {
    name: "getRollbackRecommendation",
    description:
      "Get a rollback recommendation for a service. This will analyze the service and suggest a safe version to rollback to. IMPORTANT: Always use this before rendering a RollbackApprovalCard. The user must ALWAYS approve the rollback.",
    tool: getRollbackRecommendation,
    inputSchema: z.object({
      serviceName: z.string().describe("Name of the service to get rollback recommendation for"),
    }),
    outputSchema: z.object({
      service: z.string(),
      currentVersion: z.string(),
      targetVersion: z.string(),
      riskLevel: z.enum(["low", "medium", "high"]),
    }),
  },
];

/**
 * Sentinel Components — MVP Scope
 *
 * These are the generative UI components that the AI can render.
 * Each component has a clear description to help the AI decide when to use it.
 * 
 * Component Types:
 * - Persistent: Always shown for context (IncidentHeader)
 * - Generative: AI decides when to show based on incident
 * - Interactable: Requires human action (RollbackApprovalCard)
 */
export const components: TamboComponent[] = [
  // ============================================
  // PERSISTENT COMPONENT
  // ============================================
  {
    name: "IncidentHeader",
    description:
      "ALWAYS render this component FIRST when responding to an incident. Displays incident context including title, severity (critical/high/medium/low), environment (production/staging/development), and status. This provides persistent context for the entire incident investigation.",
    component: IncidentHeader,
    propsSchema: incidentHeaderSchema,
  },

  // ============================================
  // GENERATIVE COMPONENTS
  // ============================================
  {
    name: "IncidentOverviewPanel",
    description:
      "Render this component immediately after IncidentHeader to provide an AI-generated summary of the incident. Shows your analysis confidence (0-100%), affected services, likely root cause hypothesis, and suggested next action. This helps users quickly understand the situation.",
    component: IncidentOverviewPanel,
    propsSchema: incidentOverviewPanelSchema,
  },
  {
    name: "ClusterTopologyMap",
    description:
      "Visualize Kubernetes service topology with health status, CPU/memory usage, and service-to-service latency. Use this component when the incident involves service dependencies, network issues, or to show which services are affected. Displays nodes for each service with health indicators (healthy/degraded/down) and edges showing connections with latency.",
    component: ClusterTopologyMap,
    propsSchema: clusterTopologyMapSchema,
  },
  {
    name: "RootCauseTimeline",
    description:
      "Display a timeline of correlated events (deployments, errors, latency spikes) for root cause analysis. Use this component when investigating WHAT CAUSED an incident. Shows events in chronological order to help identify patterns like 'deploy happened, then errors started'. Very useful for post-mortems.",
    component: RootCauseTimeline,
    propsSchema: rootCauseTimelineSchema,
  },

  // ============================================
  // INTERACTABLE COMPONENT (HUMAN-IN-THE-LOOP)
  // ============================================
  {
    name: "RollbackApprovalCard",
    description:
      "CRITICAL SAFETY COMPONENT: Use ONLY when recommending a rollback operation. Shows current version, target version, and risk level (low/medium/high). The user MUST explicitly approve the rollback — AI can NEVER auto-execute this action. Always call getRollbackRecommendation tool first to get the rollback details before rendering this component.",
    component: RollbackApprovalCard,
    propsSchema: rollbackApprovalCardSchema,
  },

  // ============================================
  // INTERACTIVE COMPONENTS (User can interact while AI observes)
  // ============================================
  {
    name: "LogStreamConsole",
    description:
      "Live log streaming console for Kubernetes pods. Supports regex filtering and line selection. Use when the user needs to investigate pod logs or search for specific error patterns. The user can type regex filters and the AI will observe their filter to provide relevant suggestions.",
    component: LogStreamConsole,
    propsSchema: logStreamConsoleSchema,
  },
  {
    name: "RemediationRunbook",
    description:
      "Interactive checklist of remediation steps with progress tracking. Use when providing a step-by-step guide to resolve an incident. Shows progress bar, risk levels per step, copyable commands, and automated step execution. The user checks off steps as they complete them and the AI can observe progress.",
    component: RemediationRunbook,
    propsSchema: remediationRunbookSchema,
  },

  // ============================================
  // ANALYSIS COMPONENTS
  // ============================================
  {
    name: "GitHubDiffCard",
    description:
      "Show code changes that may have caused an incident. Use when a recent deployment or commit is suspected to be the root cause. Displays syntax-highlighted diffs with expandable files, commit metadata (author, SHA, message), and a 'SUSPECTED ROOT CAUSE' badge when isSuspected=true. Perfect for correlating deployments with incidents.",
    component: GitHubDiffCard,
    propsSchema: githubDiffCardSchema,
  },

  // ============================================
  // REPORT COMPONENTS
  // ============================================
  {
    name: "PostMortemReport",
    description:
      "Comprehensive incident summary for post-incident review. Use AFTER an incident is resolved to generate a detailed post-mortem. Includes tabbed interface (Overview/Timeline/Actions), severity badges, impact summary, root cause analysis, remediation steps, lessons learned, and action items. Has 'Export PDF' button for sharing.",
    component: PostMortemReport,
    propsSchema: postMortemReportSchema,
  },
];
