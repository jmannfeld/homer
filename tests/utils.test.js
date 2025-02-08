import { formatFileSize } from "../lib/utils.js";
import { describe, it } from "node:test";
import assert from "node:assert";

describe("formatFileSize function", () => {
  it('should return "1.00 GB" for sizeBytes = 1073741824', () => {
    assert.strictEqual(formatFileSize(1073741824), "1.00 GB");
  });
});
