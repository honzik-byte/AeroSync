import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { AirplaneForm } from "@/components/airplanes/AirplaneForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { getNavigationItemsForRole } from "@/lib/authorization";
import { getActiveAeroclubSlug } from "@/lib/config";
import { buildTimeSlots, formatTimeLabel } from "@/lib/dates";

describe("formatTimeLabel", () => {
  it("formátuje čas do českého času pro Prahu", () => {
    expect(formatTimeLabel(new Date("2026-03-31T08:15:00Z"))).toBe("10:15");
  });
});

describe("getActiveAeroclubSlug", () => {
  it("vrací slug aktivního aeroklubu z konfigurace", () => {
    const originalValue = process.env.ACTIVE_AEROCLUB_SLUG;

    try {
      process.env.ACTIVE_AEROCLUB_SLUG = "aeroklub-brno";

      expect(getActiveAeroclubSlug()).toBe("aeroklub-brno");
    } finally {
      if (originalValue === undefined) {
        delete process.env.ACTIVE_AEROCLUB_SLUG;
      } else {
        process.env.ACTIVE_AEROCLUB_SLUG = originalValue;
      }
    }
  });

  it("selže, když ACTIVE_AEROCLUB_SLUG není nastavený", () => {
    const originalValue = process.env.ACTIVE_AEROCLUB_SLUG;

    try {
      delete process.env.ACTIVE_AEROCLUB_SLUG;

      expect(() => getActiveAeroclubSlug()).toThrow("Chybí proměnná ACTIVE_AEROCLUB_SLUG.");
    } finally {
      if (originalValue === undefined) {
        delete process.env.ACTIVE_AEROCLUB_SLUG;
      } else {
        process.env.ACTIVE_AEROCLUB_SLUG = originalValue;
      }
    }
  });
});

describe("Sidebar", () => {
  it("zobrazuje české položky navigace", () => {
    render(
      createElement(Sidebar, {
        navigationItems: getNavigationItemsForRole("club_admin"),
        currentPathname: "/dashboard",
      }),
    );

    expect(screen.getByText("Přehled")).toBeInTheDocument();
    expect(screen.getByText("Kalendář")).toBeInTheDocument();
    expect(screen.getByText("Letadla")).toBeInTheDocument();
    expect(screen.getByText("Piloti")).toBeInTheDocument();
    expect(screen.getByText("Členové")).toBeInTheDocument();
    expect(screen.getByText("Pozvánky")).toBeInTheDocument();
  });
});

describe("AirplaneForm", () => {
  it("zobrazuje formulář letadla v češtině", () => {
    render(
      createElement(AirplaneForm, {
        onSubmit: () => undefined,
        onCancel: () => undefined,
      }),
    );

    expect(screen.getByLabelText("Imatrikulace")).toBeInTheDocument();
    expect(screen.getByLabelText("Typ letadla")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Uložit letadlo" })).toBeInTheDocument();
  });
});

describe("buildTimeSlots", () => {
  it("vytváří sloty po 15 minutách", () => {
    expect(buildTimeSlots(8, 9)).toEqual(["08:00", "08:15", "08:30", "08:45"]);
  });
});
