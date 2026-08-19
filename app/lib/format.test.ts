import { expect, test } from "bun:test";
import { formatCount, initials, segments } from "./format";

test("formatCount switches to a compact form past 999", () => {
  expect(formatCount(0)).toBe("0");
  expect(formatCount(-5)).toBe("0");
  expect(formatCount(999)).toBe("999");
  expect(formatCount(1000)).toBe("1K");
  expect(formatCount(1500)).toBe("1.5K");
  expect(formatCount(12_400)).toBe("12K");
  expect(formatCount(2_300_000)).toBe("2.3M");
});

test("initials take the first two words", () => {
  expect(initials("Gaya Kaci")).toBe("GK");
  expect(initials("  ada  lovelace  byron ")).toBe("AL");
  expect(initials("")).toBe("?");
  // Non-BMP first characters must not be split into a lone surrogate.
  expect(initials("🚀 launcher")).toBe("🚀L");
});

test("segments isolate hashtags and mentions", () => {
  expect(segments("hi #dev and @ada!")).toEqual([
    { text: "hi ", kind: "text" },
    { text: "#dev", kind: "tag" },
    { text: " and ", kind: "text" },
    { text: "@ada", kind: "tag" },
    { text: "!", kind: "text" },
  ]);
  expect(segments("plain")).toEqual([{ text: "plain", kind: "text" }]);
  expect(segments("")).toEqual([]);
});
