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

const sameWeekRange = getGroceryListForDateRange(
  new Date("2026-07-20T00:00:00Z"),
  new Date("2026-07-26T00:00:00Z"),
);
assert(
  JSON.stringify(sameWeekRange.lines) === JSON.stringify(lists[0].lines),
  "En datoperiode på sju dager skal gi samme handleliste som ukevisningen",
);

const crossWeekRange = getGroceryListForDateRange(
  new Date("2026-07-26T00:00:00Z"),
  new Date("2026-07-27T00:00:00Z"),
);
const crossWeekDinners = new Set(
  crossWeekRange.lines.flatMap((line) =>
    line.sources.filter((source) => source.endsWith("middag")),
  ),
);
assert(crossWeekDinners.size === 2, "En datoperiode skal kunne krysse ukegrensen");

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
