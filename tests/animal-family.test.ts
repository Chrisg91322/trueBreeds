import { describe, expect, it } from "vitest";
import {
  findParentByName,
  linkedPuppies,
  parentBioLink,
  parentLinkUpdates,
  puppyParentLink,
} from "@/lib/animal-family";

const willow = { id: "willow", name: "Willow" };
const bear = { id: "bear", name: "Bear" };
const daisy = { id: "daisy", name: "Daisy" };

describe("findParentByName", () => {
  it("matches one animal and ignores the animal itself", () => {
    expect(findParentByName(" bear ", [willow, bear], willow.id)?.id).toBe("bear");
    expect(findParentByName("Willow", [willow, bear], willow.id)).toBeNull();
  });

  it("does not link when two animals share the name", () => {
    expect(findParentByName("Bear", [bear, { id: "bear-2", name: "Bear" }])).toBeNull();
  });
});

describe("parent links", () => {
  it("stores an id when the sire or dam name matches", () => {
    expect(
      parentLinkUpdates([
        { id: "pup", name: "Pip", sireName: "Bear", damName: "Willow", sireId: null, damId: null },
        willow,
        bear,
      ])
    ).toEqual([{ id: "pup", sireId: "bear", damId: "willow" }]);
  });

  it("builds a bio link from the saved parent id", () => {
    expect(parentBioLink("pup", "Old name", "bear", [willow, bear])).toEqual({
      name: "Bear",
      href: "/our-dogs/bear",
    });
  });

  it("keeps unmatched names as plain text", () => {
    expect(parentBioLink("pup", "Unknown", null, [willow])).toEqual({
      name: "Unknown",
      href: null,
    });
  });
});

describe("puppies", () => {
  it("links a puppy to the animal being saved", () => {
    expect(puppyParentLink({ id: "willow", name: "Willow", sex: "female" })).toEqual({
      damId: "willow",
      damName: "Willow",
      sireId: null,
      sireName: null,
    });
    expect(
      puppyParentLink(
        { id: "bear", name: "Bear", sex: "male" },
        { damId: "willow", damName: "Willow" }
      )
    ).toEqual({
      sireId: "bear",
      sireName: "Bear",
      damId: "willow",
      damName: "Willow",
    });
  });

  it("lists children on the parent", () => {
    const animals = [
      { ...willow, sex: "female" as const },
      { ...bear, sex: "male" as const },
      {
        id: "pip",
        name: "Pip",
        sireId: "bear",
        damId: "willow",
        sireName: "Bear",
        damName: "Willow",
        dateOfBirth: "2024-03-01",
      },
      { ...daisy, sireName: "Bear", damName: "Willow" },
    ];
    expect(linkedPuppies("willow", animals).map((animal) => animal.id)).toEqual(["pip", "daisy"]);
  });
});
