"use client";

import type { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

function getLabel(toolInvocation: ToolInvocation): string {
  const args = toolInvocation.args as Record<string, unknown>;
  const command = typeof args.command === "string" ? args.command : undefined;
  const path = typeof args.path === "string" ? args.path : undefined;
  const basename = path ? (path.split("/").pop() ?? path) : undefined;

  if (toolInvocation.toolName === "str_replace_editor" && basename) {
    switch (command) {
      case "view":        return `Viewing ${basename}`;
      case "create":      return `Creating ${basename}`;
      case "str_replace": return `Editing ${basename}`;
      case "insert":      return `Editing ${basename}`;
    }
  }

  if (toolInvocation.toolName === "file_manager" && basename) {
    switch (command) {
      case "rename": return `Renaming ${basename}`;
      case "delete": return `Deleting ${basename}`;
    }
  }

  return toolInvocation.toolName;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const isDone =
    toolInvocation.state === "result" && !!toolInvocation.result;
  const label = getLabel(toolInvocation);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
