import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// --- State rendering ---

test("shows spinner when state is 'call'", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/App.jsx" },
    state: "call",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows spinner when state is 'partial-call'", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/App.jsx" },
    state: "partial-call",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when state is 'result' with truthy result", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/App.jsx" },
    state: "result",
    result: "Success",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when state is 'result' with falsy result", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/App.jsx" },
    state: "result",
    result: "",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

// --- str_replace_editor labels ---

test("renders 'Viewing <basename>' for str_replace_editor view", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "view", path: "src/App.jsx" },
    state: "result",
    result: "content",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Viewing App.jsx")).toBeDefined();
});

test("renders 'Creating <basename>' for str_replace_editor create", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/components/Button.tsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("renders 'Editing <basename>' for str_replace_editor str_replace", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "src/App.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("renders 'Editing <basename>' for str_replace_editor insert", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "insert", path: "src/App.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("falls back to tool name for str_replace_editor undo_edit", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "undo_edit", path: "src/App.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

// --- file_manager labels ---

test("renders 'Renaming <basename>' for file_manager rename", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "file_manager",
    args: { command: "rename", path: "src/Old.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Renaming Old.jsx")).toBeDefined();
});

test("renders 'Deleting <basename>' for file_manager delete", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "file_manager",
    args: { command: "delete", path: "src/Old.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Deleting Old.jsx")).toBeDefined();
});

// --- Edge cases ---

test("falls back to tool name for unknown tool", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "unknown_tool",
    args: {},
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("extracts basename from flat path (no slashes)", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "view", path: "App.jsx" },
    state: "result",
    result: "content",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Viewing App.jsx")).toBeDefined();
});

test("extracts basename from deeply nested path", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "a/b/c/Deep.tsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Creating Deep.tsx")).toBeDefined();
});

test("falls back to tool name when args have no command or path", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: {},
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

// --- Visual structure ---

test("wrapper has expected layout classes", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "view", path: "App.jsx" },
    state: "result",
    result: "ok",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper.className).toContain("inline-flex");
  expect(wrapper.className).toContain("items-center");
  expect(wrapper.className).toContain("bg-neutral-50");
  expect(wrapper.className).toContain("rounded-lg");
});

test("label is rendered in a span with text-neutral-700", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "view", path: "App.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  const span = screen.getByText("Viewing App.jsx");
  expect(span.tagName).toBe("SPAN");
  expect(span.className).toContain("text-neutral-700");
});
