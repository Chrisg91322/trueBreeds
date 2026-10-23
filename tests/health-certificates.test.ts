import { describe, expect, it } from "vitest";
import { parseHealthCertificates } from "@/lib/health-certificates";
import { animalSchema } from "@/lib/validations/kennel";

const animal = {
  name: "Willow",
  species: "dog",
  sex: "female",
};

describe("parseHealthCertificates", () => {
  it("keeps labeled http(s) certificates", () => {
    expect(
      parseHealthCertificates([
        { label: " OFA Hips ", url: "https://cdn.example.com/ofa.pdf" },
        { label: "Photo", url: "http://localhost:3002/cert.jpg" },
      ])
    ).toEqual([
      { label: "OFA Hips", url: "https://cdn.example.com/ofa.pdf" },
      { label: "Photo", url: "http://localhost:3002/cert.jpg" },
    ]);
  });

  it("drops unsafe or incomplete entries", () => {
    expect(
      parseHealthCertificates([
        { label: "Bad", url: "javascript:alert(1)" },
        { label: "", url: "https://cdn.example.com/ofa.pdf" },
        { url: "https://cdn.example.com/ofa.pdf" },
        "not-an-object",
      ])
    ).toEqual([]);
    expect(parseHealthCertificates(null)).toEqual([]);
    expect(parseHealthCertificates({ label: "OFA", url: "https://cdn.example.com/ofa.pdf" })).toEqual(
      []
    );
  });
});

describe("animalSchema parents and certificates", () => {
  it("accepts sire, dam, and uploaded certificates", () => {
    const parsed = animalSchema.parse({
      ...animal,
      sireName: " Bear ",
      damName: "Daisy",
      healthCertificatesJson: JSON.stringify([
        { label: "OFA Hips", url: "https://cdn.example.com/ofa.pdf" },
      ]),
    });

    expect(parsed.sireName).toBe("Bear");
    expect(parsed.damName).toBe("Daisy");
    expect(parsed.healthCertificatesJson).toEqual([
      { label: "OFA Hips", url: "https://cdn.example.com/ofa.pdf" },
    ]);
  });

  it("treats a missing certificate list as empty", () => {
    expect(animalSchema.parse(animal).healthCertificatesJson).toEqual([]);
    expect(animalSchema.parse({ ...animal, healthCertificatesJson: "" }).healthCertificatesJson).toEqual(
      []
    );
  });

  it("rejects certificates that are not http(s) links", () => {
    const result = animalSchema.safeParse({
      ...animal,
      healthCertificatesJson: JSON.stringify([{ label: "OFA", url: "javascript:alert(1)" }]),
    });
    expect(result.success).toBe(false);
  });
});
