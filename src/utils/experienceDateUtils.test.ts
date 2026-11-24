import { describe, expect, it } from "bun:test";
import {
  formatExperiencePeriod,
  isPresentDateToken,
  normalizeExperiencePeriod,
  parseExperienceDateRange,
} from "./experienceDateUtils";

describe("experienceDateUtils", () => {
  it("splits a combined range stored in startDate and omits extra Present", () => {
    const normalized = normalizeExperiencePeriod({
      startDate: "Sep 2023 – Oct 2024",
      endDate: "",
      isCurrent: false,
    });

    expect(normalized).toEqual({
      startDate: "Sep 2023",
      endDate: "Oct 2024",
      isCurrent: false,
    });

    expect(formatExperiencePeriod(normalized, { language: "es" })).toBe(
      "Sep 2023 — Oct 2024"
    );
    expect(
      formatExperiencePeriod(
        {
          startDate: "Sep 2023 – Oct 2024",
          endDate: "",
          isCurrent: false,
        },
        { language: "en" }
      )
    ).toBe("Sep 2023 — Oct 2024");
  });

  it("detects Present / Actualidad tokens cleanly in ranges and endDate", () => {
    expect(parseExperienceDateRange("2022 - Present")).toEqual({
      startDate: "2022",
      endDate: "",
      isCurrent: true,
    });

    expect(parseExperienceDateRange("Ene 2021 a Actualidad")).toEqual({
      startDate: "Ene 2021",
      endDate: "",
      isCurrent: true,
    });

    expect(
      normalizeExperiencePeriod({
        startDate: "2023",
        endDate: "Present",
        isCurrent: false,
      })
    ).toEqual({
      startDate: "2023",
      endDate: "",
      isCurrent: true,
    });

    expect(
      formatExperiencePeriod(
        { startDate: "2022 - Present" },
        { language: "es" }
      )
    ).toBe("2022 — Actualidad");

    expect(
      formatExperiencePeriod(
        { startDate: "2022 - Present" },
        { language: "en" }
      )
    ).toBe("2022 — Present");
  });

  it("never splits YYYY-MM formats and handles year-year hyphens", () => {
    expect(parseExperienceDateRange("2022-03")).toBeNull();
    expect(
      formatExperiencePeriod(
        { startDate: "2022-03", endDate: "2024-06", isCurrent: false },
        { language: "es" }
      )
    ).toBe("2022-03 — 2024-06");

    expect(parseExperienceDateRange("2021-2024")).toEqual({
      startDate: "2021",
      endDate: "2024",
      isCurrent: false,
    });
  });

  it("strips trailing location suffix attached with middle dot in legacy ranges", () => {
    expect(parseExperienceDateRange("2022 - Present · Remoto")).toEqual({
      startDate: "2022",
      endDate: "",
      isCurrent: true,
    });
  });

  it("does not fabricate Inicio or Present when dates are missing or partial", () => {
    expect(
      formatExperiencePeriod(
        { startDate: "", endDate: "", isCurrent: false },
        { language: "es" }
      )
    ).toBe("Sin fechas definidas");

    expect(
      formatExperiencePeriod(
        { startDate: "", endDate: "", isCurrent: false },
        { language: "en" }
      )
    ).toBe("Dates not specified");

    expect(
      formatExperiencePeriod(
        { startDate: "2023", endDate: "", isCurrent: false },
        { language: "es" }
      )
    ).toBe("2023");

    expect(isPresentDateToken("Actualidad")).toBe(true);
    expect(isPresentDateToken("Oct 2024")).toBe(false);
  });
});
