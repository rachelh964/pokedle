import { getFormattedDate } from "./dateUtils"

describe("dateUtils", () => {
  it("formats date correctly (yyyy, mm, dd)", () => {
    const date = new Date(Date.UTC(2023, 3, 27, 0, 0, 0, 0));
    expect(getFormattedDate(date)).toBe("2023, 4, 27");
    const date2 = new Date(Date.UTC(2019, 11, 11, 0, 0, 0, 0));
    expect(getFormattedDate(date2)).toBe("2019, 12, 11");
    const date3 = new Date(Date.UTC(1996, 1, 9, 0, 0, 0, 0));
    expect(getFormattedDate(date3)).toBe("1996, 2, 9");
  });
})