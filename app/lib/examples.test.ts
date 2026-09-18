import { expect, test } from "bun:test";
import { applyDemo, INITIAL_EXAMPLES, isPostDirty, selectExamples } from "./examples";

test("selection covers distinct complete demos and field-specific examples", () => {
  const names = new Set<string>();
  for (const sample of [0, 0.25, 0.5, 0.999999]) {
    const { post, placeholders } = selectExamples(() => sample);
    names.add(post.name);
    expect(post.body).toContain("\n\n");
    expect(post.avatar).toBeNull();
    expect(post.image).toBeNull();
    expect(post.mentions).toEqual([]);
    expect(post.reactions).toBeGreaterThan(0);
    expect(placeholders.name).toContain(post.name);
    expect(placeholders.timestamp).toContain(post.timestamp);
    expect(Object.values(placeholders).every((value) => value.startsWith("Example: "))).toBe(true);
  }
  expect(names.size).toBe(4);
});

test("selection creates fresh data and may repeat across loads", () => {
  const first = selectExamples(() => 0);
  expect(first).toEqual(INITIAL_EXAMPLES);
  first.post.mentions.push("An edit");
  first.post.theme = "dark";
  expect(selectExamples(() => 0)).toEqual(INITIAL_EXAMPLES);
});

test("selected demo is clean; edits are dirty; reset to baseline is clean", () => {
  const initial = INITIAL_EXAMPLES.post;
  const baseline = selectExamples(() => 0.5).post;
  baseline.theme = "dark";
  const initialized = applyDemo(initial, initial, baseline);
  expect(initialized).toEqual(baseline);
  expect(isPostDirty(initialized, baseline)).toBe(false);
  expect(isPostDirty({ ...initialized, body: "My draft" }, baseline)).toBe(true);
  expect(isPostDirty({ ...baseline }, baseline)).toBe(false);
});

test("initialization preserves early edits, uploads, mentions and theme changes", () => {
  const initial = INITIAL_EXAMPLES.post;
  const current = {
    ...initial,
    name: "My name",
    body: "",
    reactions: 0,
    theme: "dark" as const,
    image: "data:image/png;base64,example",
    mentions: ["Someone"],
  };
  const baseline = selectExamples(() => 0.75).post;
  const initialized = applyDemo(current, initial, baseline);
  expect(initialized).toEqual({
    ...current,
    headline: baseline.headline,
    timestamp: baseline.timestamp,
    comments: baseline.comments,
    reposts: baseline.reposts,
  });
  expect(isPostDirty(initialized, baseline)).toBe(true);
});
