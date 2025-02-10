import {
  getNextMinorVersion,
  getNextMajorVersion,
  getShortVersion,
} from "../lib/utils.js";
import { describe } from "node:test";

describe("getNextMajorVersion function", () => {
  test("should return the next major pre-release version", () => {
    expect(getNextMajorVersion("1.2.3")).toBe("2.0.0-rc.0");
  });

  test('should return "2.0.0-rc.0" for currentVersion = "1.0.0"', () => {
    expect(getNextMajorVersion("1.0.0")).toBe("2.0.0-rc.0");
  });

  test('should return "5.0.0-rc.0" for currentVersion = "4.2.1"', () => {
    expect(getNextMajorVersion("4.2.1")).toBe("5.0.0-rc.0");
  });

  test("should throw an error for an invalid version", () => {
    expect(() => getNextMajorVersion("invalid.version")).toThrow(
      "Failed to determine the next major version."
    );
  });
});

describe("getNextMinorVersion function", () => {
  test('should return "3.5.0-rc.1" for currentVersion = "3.5.0-rc.0"', () => {
    expect(getNextMinorVersion("3.5.0-rc.0")).toBe("3.5.0-rc.1");
  });

  test('should return "2.3.0-rc.2" for currentVersion = "2.3.0-rc.1"', () => {
    expect(getNextMinorVersion("2.3.0-rc.1")).toBe("2.3.0-rc.2");
  });

  test('should return "4.0.0-rc.3" for currentVersion = "4.0.0-rc.2"', () => {
    expect(getNextMinorVersion("4.0.0-rc.2")).toBe("4.0.0-rc.3");
  });

  test("should throw an error for a final tag", () => {
    expect(() => getNextMinorVersion("1.0.1")).toThrow(
      "Failed to determine the next minor version."
    );
  });

  test("should throw an error for an invalid version", () => {
    expect(() => getNextMinorVersion("invalid.version")).toThrow(
      "Failed to determine the next minor version."
    );
  });

  test("should throw an error if given an empty string", () => {
    expect(() => getNextMinorVersion("")).toThrow(
      "Failed to determine the next minor version."
    );
  });

  test("should throw an error if given null", () => {
    expect(() => getNextMinorVersion(null)).toThrow(
      "Failed to determine the next minor version."
    );
  });

  test("should throw an error if given undefined", () => {
    expect(() => getNextMinorVersion(undefined)).toThrow(
      "Failed to determine the next minor version."
    );
  });
});

describe("getShortVersion function", () => {
  test('should return "1.2" for version "1.2.3"', () => {
    expect(getShortVersion("1.2.3")).toBe("1.2");
  });

  test('should return "4.5" for version "4.5.6"', () => {
    expect(getShortVersion("4.5.6")).toBe("4.5");
  });

  test('should return "10.0" for version "10.0.1"', () => {
    expect(getShortVersion("10.0.1")).toBe("10.0");
  });

  test('should return "7.3" for version "7.3.0"', () => {
    expect(getShortVersion("7.3.0")).toBe("7.3");
  });

  test('should handle versions without a patch number, e.g., "2.1"', () => {
    expect(getShortVersion("2.1")).toBe("2.1");
  });

  test('should handle versions with extra parts, e.g., "5.4.3-beta.1"', () => {
    expect(getShortVersion("5.4.3-beta.1")).toBe("5.4");
  });

  test("should throw an error for an invalid version string", () => {
    expect(() => getShortVersion("invalid")).toThrow(
      "Invalid version format. Expected 'X.Y.Z' or 'X.Y'"
    );
  });

  test("should throw an error for an empty string", () => {
    expect(() => getShortVersion("")).toThrow(
      "Invalid version format. Expected 'X.Y.Z' or 'X.Y'"
    );
  });

  test('should throw an error for a single number version like "1"', () => {
    expect(() => getShortVersion("1")).toThrow(
      "Invalid version format. Expected 'X.Y.Z' or 'X.Y'"
    );
  });
});
