import type { Post } from "../components/PostCard";

const DEMOS = [
  {
    name: "Maya Laurent",
    headline: "Frontend developer · making everyday tools easier to use",
    timestamp: "2h",
    body: "We tested our signup form with five people this week.\n\nThree got stuck on the same field. We changed the label and removed a step.\n\nSmall fixes count when someone has to use your work every day.\n\n#webdev #accessibility",
    reactions: 128,
    comments: 14,
    reposts: 6,
  },
  {
    name: "Samir Nolan",
    headline: "Security engineer · practical checks for small teams",
    timestamp: "45m",
    body: "Today's project: a script that checks our public repositories for stale links.\n\nNothing fancy. It prints the broken URLs and exits with a useful status code.\n\nOne less manual check before a release.\n\n#opensource #automation",
    reactions: 76,
    comments: 9,
    reposts: 3,
  },
  {
    name: "Lena Moreau",
    headline: "Product designer · learning through prototypes",
    timestamp: "1d",
    body: "I brought a paper prototype to our planning session.\n\nTen minutes of trying it exposed a problem we had missed in a week of discussion.\n\nNext time, I am starting with something people can try.\n\n#design #product",
    reactions: 243,
    comments: 28,
    reposts: 11,
  },
  {
    name: "Theo Amari",
    headline: "Software developer · maintaining useful open-source projects",
    timestamp: "3h",
    body: "Our latest release removes a configuration file.\n\nThe defaults now cover the common case, and existing options still work.\n\nSometimes the nicest feature is one less thing to set up.\n\n#buildinpublic #software",
    reactions: 319,
    comments: 21,
    reposts: 17,
  },
] as const;

const TAG_NAMES = ["Maya Laurent", "Open Workshop", "Lena Moreau", "Community Makers"] as const;

function createDemo(index: number): Post {
  return {
    ...DEMOS[index],
    avatar: null,
    avatarShape: "circle",
    mentions: [],
    image: null,
    verified: true,
    clamp: false,
    theme: "light",
  };
}

export function selectExamples(random: () => number = Math.random) {
  const pick = () => Math.floor(random() * DEMOS.length);
  const post = createDemo(pick());
  const placeholders = {
    name: `Example: ${DEMOS[pick()].name}…`,
    headline: `Example: ${DEMOS[pick()].headline}…`,
    timestamp: `Example: ${DEMOS[pick()].timestamp}…`,
    body: `Example: ${DEMOS[pick()].body.split("\n")[0].replace(/[.!?]$/, "")}…`,
    mention: `Example: ${TAG_NAMES[Math.floor(random() * TAG_NAMES.length)]}…`,
  };
  return { post, placeholders };
}

// Initialization may race with a replayed input event. Only replace untouched fields.
export function applyDemo(current: Post, initial: Post, demo: Post): Post {
  const next = { ...current };
  function replace<K extends keyof Post>(key: K) {
    if (current[key] === initial[key]) next[key] = demo[key];
  }
  replace("name");
  replace("headline");
  replace("timestamp");
  replace("body");
  replace("reactions");
  replace("comments");
  replace("reposts");
  replace("theme");
  return next;
}

export function isPostDirty(post: Post, baseline: Post): boolean {
  return JSON.stringify(post) !== JSON.stringify(baseline);
}

// Shared by prerendering and the first client render, before random selection.
export const INITIAL_EXAMPLES = selectExamples(() => 0);
