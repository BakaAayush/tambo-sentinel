"use client";

// Load polyfills first
import "@/lib/polyfills";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider, useTamboThread } from "@tambo-ai/react";
import { SplitPane } from "@/components/layout/SplitPane";
import React, { useState, useEffect, useMemo } from "react";

/**
 * Canvas Component - Right pane for rendering AI-generated components
 * Uses useTamboThread to access the message thread and extract rendered components
 */
function Canvas() {
  const { thread } = useTamboThread();
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);

  // Extract all rendered components from the thread
  const renderedComponents = useMemo(() => {
    if (!thread?.messages) return [];

    return thread.messages
      .map((msg, index) => ({
        index,
        component: msg.renderedComponent,
        role: msg.role,
      }))
      .filter((item) => item.component != null);
  }, [thread?.messages]);

  // Auto-select the latest component
  useEffect(() => {
    if (renderedComponents.length > 0 && selectedMessageIndex === null) {
      setSelectedMessageIndex(renderedComponents[renderedComponents.length - 1].index);
    }
  }, [renderedComponents, selectedMessageIndex]);

  // Get the currently selected component
  const activeComponent = useMemo(() => {
    if (selectedMessageIndex === null) return null;
    const item = renderedComponents.find((c) => c.index === selectedMessageIndex);
    return item?.component || null;
  }, [renderedComponents, selectedMessageIndex]);

  return (
    <div className="h-full flex flex-col bg-slate-950/50">
      {/* Canvas Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-700/50 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${renderedComponents.length > 0 ? 'bg-emerald-500' : 'bg-cyan-500'} animate-pulse`} />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Component Canvas
            </span>
            {renderedComponents.length > 0 && (
              <span className="text-xs text-slate-600">
                ({renderedComponents.length} component{renderedComponents.length !== 1 ? 's' : ''})
              </span>
            )}
          </div>
          <div className="text-xs text-slate-600">
            AI-rendered UI appears here
          </div>
        </div>

        {/* Component tabs - show if multiple components */}
        {renderedComponents.length > 1 && (
          <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
            {renderedComponents.map((item, i) => (
              <button
                key={item.index}
                onClick={() => setSelectedMessageIndex(item.index)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${selectedMessageIndex === item.index
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800/50 text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
              >
                Component {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Canvas Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeComponent ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeComponent}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
              </div>
              <p className="text-slate-500 text-sm mb-2">
                No components yet
              </p>
              <p className="text-slate-600 text-xs">
                Describe an incident and AI will generate visualization components here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Chat Pane - Left side with conversation thread
 * CRITICAL: Must have strict height constraints to prevent overflow
 */
function ChatPane() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Quick Start Examples - Fixed height */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-700/50">
        <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">
          ⚡ Quick Start
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { text: "Checkout is slow", icon: "🐌" },
            { text: "5xx errors in payments", icon: "💳" },
            { text: "notification-service down", icon: "🔔" },
          ].map((example, i) => (
            <button
              key={i}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-cyan-500/30 hover:bg-slate-700/50 transition-all"
            >
              <span className="mr-1.5">{example.icon}</span>
              {example.text}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread - MUST be overflow-hidden with flex-1 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageThreadFull className="h-full" />
      </div>
    </div>
  );
}

/**
 * Sentinel Console - Split Pane Layout with Alert Trigger System
 * CRITICAL: Use h-screen instead of min-h-screen to prevent infinite scroll
 */
function SentinelConsoleInner() {
  const [alertActive, setAlertActive] = useState(false);
  const [showAlertBanner, setShowAlertBanner] = useState(false);

  // Simulate an incoming alert - for hackathon demo purposes
  const triggerAlert = () => {
    setAlertActive(true);
    setShowAlertBanner(true);

    // Play alert sound (using Web Audio API)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Audio not supported, continue silently
    }

    // Flash effect duration
    setTimeout(() => setAlertActive(false), 1500);
  };

  // Dismiss alert banner
  const dismissAlert = () => {
    setShowAlertBanner(false);
  };

  return (
    <div className="h-screen bg-[#0a0a0f] relative overflow-hidden flex flex-col">
      {/* RED ALERT FLASH OVERLAY */}
      {alertActive && (
        <div className="fixed inset-0 z-[100] pointer-events-none animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/30 via-transparent to-red-500/20" />
          <div className="absolute inset-0 border-4 border-red-500/50 animate-ping" />
        </div>
      )}

      {/* ALERT BANNER */}
      {showAlertBanner && (
        <div className="fixed top-0 left-0 right-0 z-[90] bg-gradient-to-r from-red-900/90 via-red-800/90 to-red-900/90 border-b border-red-500/50 backdrop-blur-sm animate-in slide-in-from-top duration-300">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-semibold text-red-100">🚨 CRITICAL ALERT: checkout-service experiencing 5xx errors</span>
              <span className="text-xs text-red-300/70">Production • US-East-1</span>
            </div>
            <button
              onClick={dismissAlert}
              className="px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-medium hover:bg-red-500/30 transition-colors"
            >
              Investigate →
            </button>
          </div>
        </div>
      )}

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(56, 189, 248, 0.3) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Gradient orbs - turn red during alert */}
        <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] animate-pulse transition-colors duration-500 ${alertActive ? 'bg-red-500/30' : 'bg-cyan-500/20'}`} />
        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse [animation-delay:1s] transition-colors duration-500 ${alertActive ? 'bg-red-500/20' : 'bg-violet-500/15'}`} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header - Fixed height */}
      <header className={`relative z-50 border-b flex-shrink-0 transition-colors duration-500 ${showAlertBanner ? 'mt-[52px]' : ''} ${alertActive ? 'border-red-500/30' : 'border-white/5'}`}>
        <div className={`absolute inset-0 backdrop-blur-xl transition-colors duration-500 ${alertActive ? 'bg-gradient-to-r from-red-900/80 via-slate-800/50 to-red-900/80' : 'bg-gradient-to-r from-slate-900/80 via-slate-800/50 to-slate-900/80'}`} />
        <div className="relative px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="relative group">
                <div className={`absolute -inset-1 rounded-xl blur-md transition-all duration-500 ${alertActive ? 'bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-80' : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 opacity-60'} group-hover:opacity-100`} />
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500 ${alertActive ? 'bg-gradient-to-br from-red-400 via-orange-500 to-red-500' : 'bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500'}`}>
                  <svg
                    className="w-5 h-5 text-white drop-shadow-lg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent tracking-tight">
                  Sentinel
                </h1>
                <p className="text-[9px] text-cyan-400/80 uppercase tracking-[0.2em] font-medium">
                  Generative DevOps UI
                </p>
              </div>
            </div>

            {/* Status + Demo Button */}
            <div className="flex items-center gap-3">
              {/* Simulate Alert Button - For Demo */}
              <button
                onClick={triggerAlert}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Simulate Alert
              </button>

              {/* Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-emerald-400">AI Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Split Pane Content - MUST use flex-1 and min-h-0 */}
      <main className="relative z-10 flex-1 min-h-0 overflow-hidden">
        <SplitPane
          leftPane={
            <div className="h-full bg-slate-900/40 backdrop-blur-sm border-r border-slate-700/30 overflow-hidden">
              <ChatPane />
            </div>
          }
          rightPane={<Canvas />}
          defaultLeftWidth={40}
          minLeftWidth={30}
          maxLeftWidth={55}
        />
      </main>

      {/* Footer - Fixed height */}
      <footer className="relative z-50 border-t border-white/5 flex-shrink-0">
        <div className="bg-slate-900/50 backdrop-blur-sm px-6 py-2">
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-amber-400">⚡</span>
            <span className="text-gray-500">AI composes the UI</span>
            <span className="text-gray-700">•</span>
            <span className="text-gray-500">Humans approve actions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Sentinel MVP — Generative UI for DevOps
 */
export default function SentinelConsole() {
  const mcpServers = useMcpServers();

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
    >
      <SentinelConsoleInner />
    </TamboProvider>
  );
}
