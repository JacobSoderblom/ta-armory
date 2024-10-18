import { describe, test, expect, vi, afterEach } from "vitest";
import { z } from "zod";
import { typesafeEnv } from "../index.js";

vi.spyOn(console, "warn").mockImplementation(() => { });
vi.spyOn(console, "error").mockImplementation(() => { });

describe("typesafeEnv", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const schema = z.object({
    NODE_ENV: z.string(),
    PORT: z.string().regex(/^\d+$/, "Must be a number"),
  });

  test("should return parsed env variables when schema validation succeeds", () => {
    const envs = { NODE_ENV: "development", PORT: "3000" };
    const parsedEnv = typesafeEnv(schema)(envs);

    expect(parsedEnv.NODE_ENV).toBe("development");
    expect(parsedEnv.PORT).toBe("3000");
  });

  test("should return default values when env variables are missing", () => {
    const envs = {};
    const parsedEnv = typesafeEnv(
      z.object({
        NODE_ENV: z.string().default("development"),
        PORT: z.string().regex(/^\d+$/, "Must be a number").default("3000"),
      }),
    )(envs);

    expect(parsedEnv.NODE_ENV).toBe("development");
    expect(parsedEnv.PORT).toBe("3000");
  });

  test("should log a warning and return undefined when validation fails with warn = true", () => {
    const envs = { NODE_ENV: "development", PORT: "abc" };
    const parsedEnv = typesafeEnv(schema, {
      failFast: false,
      throw: false,
      warn: true,
    })(envs);

    expect(parsedEnv.PORT).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Environment validation failed"),
    );
  });

  test("should transform values based on the Zod schema", () => {
    const envs = { NODE_ENV: "production", PORT: "8080" };
    const parsedEnv = typesafeEnv(
      z.object({
        NODE_ENV: z.string(),
        PORT: z.string().transform((val) => parseInt(val, 10)),
      }),
    )(envs);

    expect(parsedEnv.NODE_ENV).toBe("production");
    expect(parsedEnv.PORT).toBe(8080);
  });

  test("should log an error and return undefined when validation fails with failFast = false and throw = false", () => {
    const envs = { NODE_ENV: "development", PORT: "abc" };
    const parsedEnv = typesafeEnv(schema, { failFast: false, throw: false })(
      envs,
    );

    expect(parsedEnv.PORT).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Environment validation failed"),
    );
  });

  test("should fail fast and throw error with default options", () => {
    const envs = { NODE_ENV: "development", PORT: "abc" };

    expect(() => {
      typesafeEnv(schema)(envs);
    }).toThrowError("Environment validation failed");
    expect(() => {
      typesafeEnv(schema, { throw: true })(envs).PORT;
    }).toThrowError("Environment validation failed");
  });

  test("should return immediately in failFast mode if validation fails", () => {
    const envs = { NODE_ENV: "development", PORT: "abc" };
    const parsedEnv = typesafeEnv(schema, { failFast: true, throw: false })(
      envs,
    );

    expect(parsedEnv).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Environment validation failed"),
    );
  });
});
