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

test("segments isolate hashtags and @tokens", () => {
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

test("segments highlight tagged names wherever they appear", () => {
  const text = "Alongside Amel Skendraoui and Amel Skendraoui again";
  expect(segments(text, ["Amel Skendraoui"])).toEqual([
    { text: "Alongside ", kind: "text" },
    { text: "Amel Skendraoui", kind: "mention" },
    { text: " and ", kind: "text" },
    { text: "Amel Skendraoui", kind: "mention" },
    { text: " again", kind: "text" },
  ]);
});

test("the longest tagged name wins over a shorter overlapping one", () => {
  expect(segments("thanks Micro Club usthb", ["Micro Club", "Micro Club usthb"])).toEqual([
    { text: "thanks ", kind: "text" },
    { text: "Micro Club usthb", kind: "mention" },
  ]);
});

test("tagged names match case-insensitively but keep the post's casing", () => {
  expect(segments("ping MAHDI debbah", ["Mahdi DEBBAH"])).toEqual([
    { text: "ping ", kind: "text" },
    { text: "MAHDI debbah", kind: "mention" },
  ]);
});

test("hashtags still win outside a tagged name, and blanks are ignored", () => {
  expect(segments("#ctf with Rania", ["  ", "Rania"])).toEqual([
    { text: "#ctf", kind: "tag" },
    { text: " with ", kind: "text" },
    { text: "Rania", kind: "mention" },
  ]);
});
