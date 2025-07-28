export const NUM_QUESTIONS = 25;

export const TOPIC_OPTIONS = [
  "Algebra",
  "Geometry",
  "Number Theory",
  "Combinatorics",
  "Other",
];

import { TestType } from "@/types/amc";

export const TEST_TYPES: { value: TestType; label: string }[] = [
  { value: "amc8", label: "AMC 8" },
  { value: "amc10", label: "AMC 10" },
  { value: "amc12", label: "AMC 12" },
];

export const MIN_YEAR = 2000;
export const MAX_YEAR = new Date().getFullYear() + 1; // Allow up to next year
