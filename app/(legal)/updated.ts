export const LEGAL_UPDATED = "2026-09-18";

export const LEGAL_UPDATED_LABEL = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(LEGAL_UPDATED));
