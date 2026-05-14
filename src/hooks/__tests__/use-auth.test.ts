import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../use-auth";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

const mockSignIn = vi.mocked(signInAction);
const mockSignUp = vi.mocked(signUpAction);
const mockGetAnonWorkData = vi.mocked(getAnonWorkData);
const mockClearAnonWork = vi.mocked(clearAnonWork);
const mockGetProjects = vi.mocked(getProjects);
const mockCreateProject = vi.mocked(createProject);

const SUCCESS = { success: true } as const;
const FAILURE = { success: false, error: "Invalid credentials" } as const;

const ANON_WORK = {
  messages: [{ id: "1", role: "user", content: "hello" }],
  fileSystemData: { "/": { type: "directory" }, "/App.jsx": { type: "file", content: "..." } },
};

const PROJECTS = [
  { id: "proj-1", name: "My Design", createdAt: new Date(), updatedAt: new Date() },
  { id: "proj-2", name: "Older Design", createdAt: new Date(), updatedAt: new Date() },
];

const NEW_PROJECT = {
  id: "proj-new",
  name: "New Design #42",
  userId: "user-1",
  messages: "[]",
  data: "{}",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAnonWorkData.mockReturnValue(null);
  mockGetProjects.mockResolvedValue(PROJECTS);
  mockCreateProject.mockResolvedValue(NEW_PROJECT);
});

// ─── isLoading ────────────────────────────────────────────────────────────────

describe("isLoading", () => {
  test("is false initially", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(false);
  });

  test("is true while signIn is in flight, false after it resolves", async () => {
    let resolveSignIn!: (v: typeof SUCCESS) => void;
    mockSignIn.mockReturnValue(new Promise((r) => (resolveSignIn = r)));

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signIn("a@b.com", "password");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveSignIn(SUCCESS);
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("resets to false after signIn failure result", async () => {
    mockSignIn.mockResolvedValue(FAILURE);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "wrong");
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("resets to false even when signIn throws", async () => {
    mockSignIn.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "password").catch(() => {});
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("is true while signUp is in flight, false after it resolves", async () => {
    let resolveSignUp!: (v: typeof SUCCESS) => void;
    mockSignUp.mockReturnValue(new Promise((r) => (resolveSignUp = r)));

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signUp("a@b.com", "password");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveSignUp(SUCCESS);
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("resets to false even when signUp throws", async () => {
    mockSignUp.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("a@b.com", "password").catch(() => {});
    });

    expect(result.current.isLoading).toBe(false);
  });
});

// ─── signIn ───────────────────────────────────────────────────────────────────

describe("signIn", () => {
  test("calls signInAction with email and password", async () => {
    mockSignIn.mockResolvedValue(SUCCESS);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "secret123");
    });

    expect(mockSignIn).toHaveBeenCalledWith("user@example.com", "secret123");
  });

  test("returns the result from signInAction on success", async () => {
    mockSignIn.mockResolvedValue(SUCCESS);

    const { result } = renderHook(() => useAuth());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.signIn("a@b.com", "pass");
    });

    expect(returnValue).toEqual(SUCCESS);
  });

  test("returns the result from signInAction on failure", async () => {
    mockSignIn.mockResolvedValue(FAILURE);

    const { result } = renderHook(() => useAuth());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.signIn("a@b.com", "wrong");
    });

    expect(returnValue).toEqual(FAILURE);
  });

  test("does not call getProjects or createProject when sign-in fails", async () => {
    mockSignIn.mockResolvedValue(FAILURE);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "wrong");
    });

    expect(mockGetProjects).not.toHaveBeenCalled();
    expect(mockCreateProject).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

// ─── signUp ───────────────────────────────────────────────────────────────────

describe("signUp", () => {
  test("calls signUpAction with email and password", async () => {
    mockSignUp.mockResolvedValue(SUCCESS);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("new@example.com", "mypassword");
    });

    expect(mockSignUp).toHaveBeenCalledWith("new@example.com", "mypassword");
  });

  test("returns the result from signUpAction on success", async () => {
    mockSignUp.mockResolvedValue(SUCCESS);

    const { result } = renderHook(() => useAuth());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.signUp("a@b.com", "pass");
    });

    expect(returnValue).toEqual(SUCCESS);
  });

  test("returns the result from signUpAction on failure", async () => {
    mockSignUp.mockResolvedValue(FAILURE);

    const { result } = renderHook(() => useAuth());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.signUp("a@b.com", "short");
    });

    expect(returnValue).toEqual(FAILURE);
  });

  test("does not navigate when sign-up fails", async () => {
    mockSignUp.mockResolvedValue(FAILURE);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("a@b.com", "short");
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});

// ─── handlePostSignIn — anon work present ────────────────────────────────────

describe("post sign-in: anonymous work exists", () => {
  beforeEach(() => {
    mockSignIn.mockResolvedValue(SUCCESS);
    mockGetAnonWorkData.mockReturnValue(ANON_WORK);
    mockCreateProject.mockResolvedValue({ ...NEW_PROJECT, id: "proj-from-anon" });
  });

  test("creates a project with the anon work data", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "pass");
    });

    expect(mockCreateProject).toHaveBeenCalledWith({
      name: expect.stringContaining("Design from"),
      messages: ANON_WORK.messages,
      data: ANON_WORK.fileSystemData,
    });
  });

  test("clears anon work after creating the project", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "pass");
    });

    expect(mockClearAnonWork).toHaveBeenCalled();
  });

  test("navigates to the new project", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "pass");
    });

    expect(mockPush).toHaveBeenCalledWith("/proj-from-anon");
  });

  test("does not call getProjects when anon work is migrated", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "pass");
    });

    expect(mockGetProjects).not.toHaveBeenCalled();
  });

  test("works the same way via signUp", async () => {
    mockSignUp.mockResolvedValue(SUCCESS);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("new@b.com", "pass1234");
    });

    expect(mockCreateProject).toHaveBeenCalled();
    expect(mockClearAnonWork).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/proj-from-anon");
  });
});

// ─── handlePostSignIn — anon work empty messages ─────────────────────────────

describe("post sign-in: anon work data has empty messages", () => {
  beforeEach(() => {
    mockSignIn.mockResolvedValue(SUCCESS);
    mockGetAnonWorkData.mockReturnValue({ messages: [], fileSystemData: {} });
  });

  test("falls through to fetching existing projects", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "pass");
    });

    expect(mockGetProjects).toHaveBeenCalled();
  });

  test("does not create an anon-work project", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "pass");
    });

    expect(mockClearAnonWork).not.toHaveBeenCalled();
  });
});

// ─── handlePostSignIn — no anon work, projects exist ─────────────────────────

describe("post sign-in: no anon work, user has existing projects", () => {
  beforeEach(() => {
    mockSignIn.mockResolvedValue(SUCCESS);
    mockGetAnonWorkData.mockReturnValue(null);
    mockGetProjects.mockResolvedValue(PROJECTS);
  });

  test("navigates to the most recent project", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "pass");
    });

    expect(mockPush).toHaveBeenCalledWith(`/${PROJECTS[0].id}`);
  });

  test("does not create a new project", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "pass");
    });

    expect(mockCreateProject).not.toHaveBeenCalled();
  });
});

// ─── handlePostSignIn — no anon work, no projects ────────────────────────────

describe("post sign-in: no anon work, no existing projects", () => {
  beforeEach(() => {
    mockSignIn.mockResolvedValue(SUCCESS);
    mockGetAnonWorkData.mockReturnValue(null);
    mockGetProjects.mockResolvedValue([]);
    mockCreateProject.mockResolvedValue(NEW_PROJECT);
  });

  test("creates a new blank project", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "pass");
    });

    expect(mockCreateProject).toHaveBeenCalledWith({
      name: expect.stringMatching(/^New Design #\d+$/),
      messages: [],
      data: {},
    });
  });

  test("navigates to the newly created project", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("a@b.com", "pass");
    });

    expect(mockPush).toHaveBeenCalledWith(`/${NEW_PROJECT.id}`);
  });
});
