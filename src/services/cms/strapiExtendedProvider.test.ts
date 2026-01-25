import { describe, expect, it } from "vitest";
import { __strapiExtendedInternal } from "./strapiExtendedProvider";

describe("strapiExtendedProvider internals", () => {
  it("normalizes Strapi API base URLs", () => {
    expect(__strapiExtendedInternal.normalizeStrapiApiUrl("http://localhost:1337")).toBe("http://localhost:1337/api");
    expect(__strapiExtendedInternal.normalizeStrapiApiUrl("http://localhost:1337/")).toBe("http://localhost:1337/api");
    expect(__strapiExtendedInternal.normalizeStrapiApiUrl("http://localhost:1337/api")).toBe("http://localhost:1337/api");
    expect(__strapiExtendedInternal.normalizeStrapiApiUrl("http://localhost:1337/api/")).toBe("http://localhost:1337/api");
    expect(__strapiExtendedInternal.normalizeStrapiApiUrl("http://localhost:1337/api/v1")).toBe("http://localhost:1337/api/v1");
  });

  it("normalizes Strapi entity attributes and media URLs", () => {
    const origin = __strapiExtendedInternal.getOrigin("http://localhost:1337/api");
    const normalized = __strapiExtendedInternal.normalizeEntity(
      {
        id: 5,
        attributes: {
          titleHindi: "शीर्षक",
          image: { data: { attributes: { url: "/uploads/x.jpg" } } },
          gallery: {
            data: [
              { id: 1, attributes: { url: "/uploads/g1.jpg" } },
              { id: 2, url: "/uploads/g2.jpg" },
            ],
          },
          seo: {
            metaTitle: "SEO Title",
            metaDescription: "SEO Description",
            keywords: "a, b ,  c",
            metaImage: { data: { attributes: { url: "/uploads/seo.jpg" } } },
          },
        },
      },
      origin,
    ) as any;

    expect(normalized.id).toBe("5");
    expect(normalized.image).toBe("http://localhost:1337/uploads/x.jpg");
    expect(normalized.gallery).toEqual([
      "http://localhost:1337/uploads/g1.jpg",
      "http://localhost:1337/uploads/g2.jpg",
    ]);
    expect(normalized.seo).toEqual({
      title: "SEO Title",
      description: "SEO Description",
      keywords: ["a", "b", "c"],
      canonical: undefined,
      imageUrl: "http://localhost:1337/uploads/seo.jpg",
    });
    expect(normalized.seoTitle).toBe("SEO Title");
    expect(normalized.seoDescription).toBe("SEO Description");
  });
});
