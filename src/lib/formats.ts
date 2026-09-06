import type { CollectionEntry } from 'astro:content';

/**
 * For a file format, the status dot *is* the documentation state — so it is
 * derived, not stored.
 *
 * Holding both as data let them disagree, and they did: `.map` shipped as
 * "active" with documentation "partial", which rendered a green dot beside the
 * words "Partially documented". One source of truth removes the whole class of
 * mistake.
 */
export type Documentation = CollectionEntry<'fileFormats'>['data']['documentation'];

const STATUS = {
  documented: 'active',
  partial: 'dormant',
  undocumented: 'dead',
} as const;

const LABEL = {
  documented: 'Documented',
  partial: 'Partially documented',
  undocumented: 'Undocumented',
} as const;

export const formatStatus = (documentation: Documentation) => STATUS[documentation];
export const formatLabel = (documentation: Documentation) => LABEL[documentation];
