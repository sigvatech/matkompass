import { retailers } from "../src/content/retailers";
import {
  getGroceryListForDateRange,
  getWeeklyGroceryList,
  validateGroceryConfiguration,
} from "../src/lib/grocery-list";

const referenceDate = new Date("2026-07-20T12:00:00Z");

validateGroceryConfiguration(referenceDate);

const lists = [
  getWeeklyGroceryList("current", referenceDate),
  getWeeklyGroceryList("next", referenceDate),
];

assert(lists[0].week.type === "A", "Referanseuken skal være plan A");
assert(lists[1].week.type === "B", "Neste referanseuke skal være plan B");

const sameWeekList = getGroceryListForDateRange(
  new Date("2026-07-20T00:00:00Z"),
  new Date("2026-07-26T00:00:00Z"),
);
assert(
  JSON.stringify(sameWeekList.lines) === JSON.stringify(lists[0].lines),
  "En datoperiode på sju dager skal gi samme handleliste som ukevisningen",
);

const crossWeekList = getGroceryListForDateRange(
  new Date("2026-07-26T00:00:00Z"),
  new Date("2026-07-27T00:00:00Z"),
);
const crossWeekDinnerSources = new Set(
  crossWeekList.lines.flatMap((line) =>
    line.sources.filter((source) => source.endsWith("middag")),
  ),
);
assert(crossWeekDinnerSources.size === 2, "En datoperiode skal kunne krysse ukegrensen");

const singleDayList = getGroceryListForDateRange(
  new Date("2026-07-21T12:00:00Z"),
  new Date("2026-07-21T18:00:00Z"),
);
const singleDayDinnerSources = new Set(
  singleDayList.lines.flatMap((line) =>
    line.sources.filter((source) => source.endsWith("middag")),
  ),
);
assert(singleDayDinnerSources.size === 1, "En enkeltdato skal inkluderes nøyaktig én gang");

const yearBoundaryList = getGroceryListForDateRange(
  new Date("2026-12-28T00:00:00Z"),
  new Date("2027-01-10T00:00:00Z"),
);
const boundaryWeeks = [
  getWeeklyGroceryList("current", new Date("2026-12-28T12:00:00Z")),
  getWeeklyGroceryList("next", new Date("2026-12-28T12:00:00Z")),
];
const expectedBoundaryLines = new Map(
  boundaryWeeks.flatMap((list) => list.lines).map((line) => [line.id, line]),
);
assert(
  yearBoundaryList.lines.length === expectedBoundaryLines.size,
  "En datoperiode over årsskiftet skal inneholde begge planukene",
);
assert(
  getRequiredNumber(yearBoundaryList, "egg") ===
    boundaryWeeks.reduce((total, list) => total + getRequiredNumber(list, "egg"), 0),
  "En datoperiode over årsskiftet skal summere mengdene fra begge planukene",
);

const fourWeekList = getGroceryListForDateRange(
  new Date("2026-07-20T00:00:00Z"),
  new Date("2026-08-16T00:00:00Z"),
);
const twoWeekEggs = lists.reduce(
  (total, list) => total + getRequiredNumber(list, "egg"),
  0,
);
const fourWeekEggs = getRequiredNumber(fourWeekList, "egg");
assert(
  fourWeekEggs === twoWeekEggs * 2,
  "Flere komplette rotasjoner skal skalere mengdene uten en kunstig datogrense",
);

const twoWeekList = getGroceryListForDateRange(
  new Date("2026-07-20T00:00:00Z"),
  new Date("2026-08-02T00:00:00Z"),
);
const partialRotationList = getGroceryListForDateRange(
  new Date("2026-07-20T00:00:00Z"),
  new Date("2026-08-04T00:00:00Z"),
);
assert(
  getRequiredNumber(partialRotationList, "egg") ===
    getRequiredNumber(twoWeekList, "egg") + getRequiredNumber(singleDayList, "egg"),
  "En delvis ekstra rotasjon skal bare legge til dagene som er med i perioden",
);

for (const list of lists) {
  assert(list.lines.length > 30, `Uke ${list.week.weekNumber} har for få dagligvarer`);
  assert(
    new Set(list.lines.map((line) => line.id)).size === list.lines.length,
    `Uke ${list.week.weekNumber} har dupliserte dagligvarer`,
  );

  for (const line of list.lines) {
    assert(
      line.offers.length === retailers.length,
      `${line.label} mangler butikkalternativer`,
    );
    assert(
      line.offers.some((offer) => offer.id === line.defaultOfferId),
      `${line.label} mangler gyldig standardbutikk`,
    );

    for (const offer of line.offers) {
      const retailer = retailers.find((candidate) => candidate.id === offer.retailerId);
      const url = new URL(offer.url);

      assert(retailer !== undefined, `${line.label} viser ukjent butikk`);
      assert(url.protocol === "https:", `${line.label} har en usikker butikklenke`);
      assert(
        url.hostname === retailer.hostname,
        `${line.label} peker ikke til ${retailer.label}`,
      );
    }
  }

  const wildRice = list.lines.find((line) => line.id === "wild-rice");
  const sirloin = list.lines.find((line) => line.id === "sirloin");
  const garlic = list.lines.find((line) => line.id === "garlic");
  const eggs = list.lines.find((line) => line.id === "egg");
  const bananas = list.lines.find((line) => line.id === "banana");
  const dinnerSources = new Set(
    list.lines.flatMap((line) => line.sources.filter((source) => source.endsWith("middag"))),
  );

  assert(wildRice !== undefined, `Uke ${list.week.weekNumber} mangler villris`);
  assert(
    wildRice.conversionNote?.includes("faktor 0,34") === true,
    `Uke ${list.week.weekNumber} mangler synlig omregning for villris`,
  );
  assert(
    sirloin?.requiredLabel === "1,49 kg",
    `Uke ${list.week.weekNumber} dobbeltteller biff eller ytrefilet`,
  );
  assert(
    garlic?.sources.some((source) => source.endsWith("middag")) === true,
    `Uke ${list.week.weekNumber} mangler hvitløk fra middagsoppskriftene`,
  );
  assert(
    eggs?.purchaseLabel === (list.week.type === "A" ? "3 × 6 stk" : "4 × 6 stk"),
    `Uke ${list.week.weekNumber} runder ikke egg til praktiske pakker`,
  );
  assert(
    bananas?.requiredLabel === "4 stk",
    `Uke ${list.week.weekNumber} skalerer ikke helgevaflene til familien`,
  );
  assert(
    !list.lines.some((line) => line.id === "tuna"),
    `Uke ${list.week.weekNumber} kjøper tunfisk til tomme kontormåltider`,
  );
  assert(
    !list.lines.some((line) => line.id === "protein-powder"),
    `Uke ${list.week.weekNumber} inkluderer proteinpulver som planen har utelatt`,
  );
  assert(dinnerSources.size === 7, `Uke ${list.week.weekNumber} mangler en familiemiddag`);

  if (list.week.type === "A") {
    assert(
      list.lines.some((line) => line.id === "avocado-oil"),
      "Plan A skal kjøpe avokadoolje til storfeburgerne",
    );
  }

  if (list.week.type === "B") {
    assert(
      list.lines.some((line) => line.id === "butter"),
      "Plan B skal bevare smør fra tacobowl-oppskriften",
    );
  }
  console.log(
    `OK Uke ${list.week.weekNumber} (${list.week.type}): ${list.lines.length} dagligvarer, ` +
      `${list.lines.filter((line) => line.section === "buy").length} må kjøpes`,
  );
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function getRequiredNumber(
  list: { lines: Array<{ id: string; requiredLabel: string }> },
  id: string,
): number {
  return Number.parseFloat(
    list.lines.find((line) => line.id === id)?.requiredLabel.replace(",", ".") ?? "0",
  );
}
