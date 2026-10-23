import { describe, expect, it } from "vitest";
import { youngAnimalLabel } from "@/lib/species";

describe("youngAnimalLabel", () => {
  it("uses puppy, kitten, or offspring", () => {
    expect(youngAnimalLabel("dog", 1)).toBe("puppy");
    expect(youngAnimalLabel("dog", 3)).toBe("puppies");
    expect(youngAnimalLabel("cat", 1)).toBe("kitten");
    expect(youngAnimalLabel("cat", 2)).toBe("kittens");
    expect(youngAnimalLabel("livestock", 1)).toBe("offspring");
    expect(youngAnimalLabel("livestock", 4)).toBe("offspring");
  });
});
