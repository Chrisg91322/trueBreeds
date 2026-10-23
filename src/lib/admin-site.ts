import slugify from "slugify";

/** Site address derived from a kennel name. Lowercase, hyphenated, and capped. */
export function websiteSlugFromName(name: string) {
  return slugify(name, { lower: true, strict: true }).slice(0, 48);
}

export function websiteCreateBlock(input: { slugTaken: boolean; emailTaken: boolean }) {
  if (input.slugTaken && input.emailTaken) {
    return "That site address is already taken, and that email already has a login.";
  }
  if (input.slugTaken) return "That site address is already taken.";
  if (input.emailTaken) return "That email already has a login.";
  return null;
}
