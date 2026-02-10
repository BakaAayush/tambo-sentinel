"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Terminal typing effect lines
const terminalLines = [
  { text: "$ kubectl get pods -n production", delay: 0 },
  { text: "NAME                          READY   STATUS    RESTARTS", delay: 800, isOutput: true },
  { text: "checkout-svc-7d4f8c9b5-x2k9l  1/1     Running   0", delay: 1000, isOutput: true },
  { text: "payment-svc-5c8f7d6a4-m3n8p   0/1     CrashLoop 5", delay: 1200, isOutput: true, isError: true },
  { text: "$ sentinel analyze --service payment-svc", delay: 2500 },
  { text: "⚡ Incident detected: Payment service crash loop", delay: 3300, isOutput: true, isWarning: true },
  { text: "🔍 Correlating logs with recent deployments...", delay: 3800, isOutput: true },
  { text: "✓ Root cause: Memory leak in v2.4.1 (commit a3f8b2c)", delay: 4500, isOutput: true, isSuccess: true },
  { text: "→ Rendering RollbackApprovalCard for human review", delay: 5200, isOutput: true, isSuccess: true },
];

// Integration logos
const integrations = [
  { name: "Kubernetes", icon: "☸️" },
  { name: "AWS", icon: "🔶" },
  { name: "GitHub", icon: "🐙" },
  { name: "PagerDuty", icon: "🔔" },
  { name: "Prometheus", icon: "🔥" },
  { name: "Datadog", icon: "🐕" },
  { name: "Slack", icon: "💬" },
  { name: "Docker", icon: "🐳" },
];

function TerminalTypingEffect() {
  const [visibleLines, setVisibleLines] = useState<Set<number>>(new Set());
  const [currentText, setCurrentText] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    terminalLines.forEach((line, index) => {
      setTimeout(() => {
        setVisibleLines((prev) => new Set([...prev, index]));
        // Typing effect for each line
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          if (charIndex <= line.text.length) {
            setCurrentText((prev) => ({
              ...prev,
              [index]: line.text.slice(0, charIndex),
            }));
            charIndex++;
          } else {
            clearInterval(typeInterval);
          }
        }, line.isOutput ? 5 : 25);
      }, line.delay);
    });

    // Loop the animation
    const loopTimeout = setTimeout(() => {
      setVisibleLines(new Set());
      setCurrentText({});
    }, 8000);

    return () => clearTimeout(loopTimeout);
  }, [visibleLines.size === 0]);

  return (
    <div className="absolute left-8 top-1/2 -translate-y-1/2 w-[420px] opacity-40 pointer-events-none hidden xl:block">
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border-b border-slate-700/50">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-slate-400 font-mono">terminal — sentinel</span>
        </div>
        {/* Terminal content */}
        <div className="p-4 font-mono text-xs leading-relaxed h-[280px] overflow-hidden">
          {Array.from(visibleLines).map((lineIndex) => {
            const line = terminalLines[lineIndex];
            const text = currentText[lineIndex] || "";
            return (
              <div
                key={lineIndex}
                className={`${line.isError
                  ? "text-red-400"
                  : line.isWarning
                    ? "text-amber-400"
                    : line.isSuccess
                      ? "text-emerald-400"
                      : line.isOutput
                        ? "text-slate-400"
                        : "text-cyan-400"
                  }`}
              >
                {text}
                {text.length < (terminalLines[lineIndex]?.text.length || 0) && (
                  <span className="inline-block w-2 h-4 bg-current animate-pulse ml-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BeforeAfterComparison() {
  return (
    <div className="w-full max-w-4xl mx-auto mb-16">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Before - Grafana mess */}
        <div className="relative group">
          <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-slate-900/80 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">The Old Way</span>
            </div>
            {/* Fake cluttered dashboard */}
            <div className="grid grid-cols-3 gap-2 opacity-60">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded bg-slate-800 border border-slate-700 flex items-center justify-center"
                >
                  <div className="w-8 h-1.5 bg-slate-600 rounded" />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 flex-1 rounded bg-slate-800 border border-slate-700" />
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">
              15 dashboards • 47 panels • Where&apos;s the problem?
            </p>
          </div>
        </div>

        {/* After - Sentinel clean */}
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-slate-900/80 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">The Sentinel Way</span>
            </div>
            {/* Clean incident card */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-lg">
                  ⚠️
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Payment Service Down</p>
                  <p className="text-xs text-slate-400">Root cause: v2.4.1 memory leak</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-3 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/30">
                  ✓ Approve Rollback
                </button>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">
              1 card • 1 action • Problem solved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationMarquee() {
  return (
    <div className="w-full overflow-hidden py-8 border-t border-slate-800/50">
      <p className="text-xs text-slate-600 text-center mb-4 uppercase tracking-widest">
        Connects to your stack
      </p>
      <div className="relative">
        <div className="flex animate-marquee gap-12">
          {[...integrations, ...integrations].map((integration, i) => (
            <div
              key={`${i < integrations.length ? 'first' : 'second'}-${integration.name}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/30 rounded-lg border border-slate-700/30 whitespace-nowrap"
            >
              <span className="text-xl">{integration.icon}</span>
              <span className="text-sm text-slate-400 font-medium">{integration.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.5) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(56, 189, 248, 0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-cyan-500/30 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-violet-500/25 rounded-full blur-[180px] animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[150px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Terminal Typing Effect - Left side */}
      <TerminalTypingEffect />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="max-w-4xl w-full text-center">
          {/* Animated Logo */}
          <div className="relative inline-block mb-10">
            {/* Outer glow ring */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-3xl blur-2xl opacity-50 animate-pulse" />

            {/* Logo container */}
            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
              <svg
                className="w-14 h-14 text-white drop-shadow-lg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>

          {/* Title with gradient */}
          <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              Sentinel
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl font-medium mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Generative UI for DevOps
            </span>
          </p>

          {/* Description */}
          <p className="text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed text-lg">
            An AI-orchestrated control plane where the AI composes the right operational UI for each
            incident, while humans retain control over all critical actions.
          </p>

          {/* Before/After Comparison */}
          <BeforeAfterComparison />

          {/* CTA Button */}
          <Link
            href="/chat"
            className="group relative inline-flex items-center gap-3 px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105"
          >
            {/* Button glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Button background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-2xl pointer-events-none" />

            {/* Button content */}
            <span className="relative text-white drop-shadow-lg">Describe an Incident</span>
            <svg
              className="relative w-6 h-6 text-white group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>

          {/* Footer */}
          <div className="mt-16 space-y-3">
            <p className="text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              &quot;AI decides the UI. Humans decide the actions.&quot;
            </p>
            <p className="text-xs text-gray-600">Built with Tambo AI • WeMakeDevs Hackathon 2026</p>
          </div>
        </div>

      </div>
    </div>
  );
}
