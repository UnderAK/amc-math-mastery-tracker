export const TOPICS = ["Algebra", "Geometry", "Number Theory", "Combinatorics", "Other"] as const;

export type Topic = typeof TOPICS[number];

export function isTopic(value: string): value is Topic {
  return (TOPICS as readonly string[]).includes(value);
}
