/** Convert a user-facing major unit value (e.g. 100.50) to minor units (10050) */
export function toMinorUnits(major: number): number {
  return Math.round(major * 100);
}

/** Convert stored minor units (10050) back to major units for API responses (100.50) */
export function toMajorUnits(minor: number | bigint): number {
  return Number(minor) / 100;
}
