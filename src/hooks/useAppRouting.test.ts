import { describe, expect, test } from "bun:test";
import {
  extractPublicUsernameFromLocation,
  resolveInitialActiveView,
  resolvePathForView,
} from "./useAppRouting";

describe("useAppRouting path helpers", () => {
  test("resolveInitialActiveView routes root to quarters when user is logged in", () => {
    expect(resolveInitialActiveView("/", "", true)).toBe("quarters");
    expect(resolveInitialActiveView("/", "", false)).toBe("landing");
  });

  test("resolveInitialActiveView resolves explicit view routes regardless of auth", () => {
    expect(resolveInitialActiveView("/docs", "", false)).toBe("docs");
    expect(resolveInitialActiveView("/features", "", true)).toBe("features");
    expect(resolveInitialActiveView("/offers", "", false)).toBe("offers");
    expect(resolveInitialActiveView("/public", "", false)).toBe("public");
    expect(resolveInitialActiveView("/u/rjara001", "", false)).toBe("public");
    expect(resolveInitialActiveView("/", "#deck=abc", false)).toBe("public");
  });

  test("extractPublicUsernameFromLocation handles path and hash formats", () => {
    expect(extractPublicUsernameFromLocation("/u/rjara001", "")).toBe("rjara001");
    expect(extractPublicUsernameFromLocation("/", "#/u/devlead/extra")).toBe("devlead");
    expect(extractPublicUsernameFromLocation("/quarters", "")).toBeNull();
  });

  test("resolvePathForView returns canonical pathnames", () => {
    expect(resolvePathForView("landing")).toBe("/");
    expect(resolvePathForView("quarters")).toBe("/quarters");
    expect(resolvePathForView("docs")).toBe("/docs");
    expect(resolvePathForView("features")).toBe("/features");
    expect(resolvePathForView("offers")).toBe("/offers");
    expect(resolvePathForView("public")).toBe("/public");
  });
});
