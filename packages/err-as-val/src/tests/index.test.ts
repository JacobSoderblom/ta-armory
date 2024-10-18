import { describe, test, expect } from "vitest";
import { Ok, Err, isSuccess, isFailure } from "../index.js";

describe("Result Tests", () => {
  test("should create a Success with a value", () => {
    const result = Ok(42);
    expect(isSuccess(result)).toBe(true);
    expect(isFailure(result)).toBe(false);
    expect(result.value).toBe(42);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(42);
    expect(result[1]).toBe(undefined);
  });

  test("should create a Failure with an error", () => {
    const error = "An error occurred";
    const result = Err(error);
    expect(isSuccess(result)).toBe(false);
    expect(isFailure(result)).toBe(true);
    expect(result.error).toBe(error);
    expect(result.length).toBe(2);
    expect(result[1]).toBe(error);
    expect(result[0]).toBe(undefined);
  });

  test("isSuccess should return false for Failure", () => {
    const result = Err("Error");
    expect(isSuccess(result)).toBe(false);
  });

  test("isFailure should return false for Success", () => {
    const result = Ok(123);
    expect(isFailure(result)).toBe(false);
  });

  test("Success should not have an error property", () => {
    const result = Ok("Success");
    expect("error" in result).toBeFalsy();
  });

  test("Failure should not have a value property", () => {
    const result = Err("Failure");
    expect("value" in result).toBeFalsy();
  });
});

describe("Result Array Methods Tests", () => {
  test("should create a Success with map working correctly", () => {
    const result = Ok(42);

    expect(result.value).toBe(42);

    const mappedResult = result.map((x) => (x !== undefined ? x * 2 : x));
    expect(mappedResult).toEqual([84, undefined]);
  });

  test("should create a Failure with map working correctly", () => {
    const errorResult = Err("An error occurred");

    expect(errorResult.error).toBe("An error occurred");

    const mappedErrorResult = errorResult.map((x) => (x ? x.toUpperCase() : x));
    expect(mappedErrorResult).toEqual([undefined, "AN ERROR OCCURRED"]);
  });

  test("should create a Success with other array methods working correctly", () => {
    const result = Ok(100);

    const filteredResult = result.filter((x) => typeof x === "number");
    expect(filteredResult).toEqual([100]);

    let sum = 0;
    result.forEach((x) => {
      if (typeof x === "number") {
        sum += x;
      }
    });
    expect(sum).toBe(100);
  });

  test("should create a Failure with other array methods working correctly", () => {
    const errorResult = Err("Critical Error");

    const filteredErrorResult = errorResult.filter(
      (x) => typeof x === "string",
    );
    expect(filteredErrorResult).toEqual(["Critical Error"]);

    const hasError = errorResult.some((x) => typeof x === "string");
    expect(hasError).toBe(true);
  });
});
