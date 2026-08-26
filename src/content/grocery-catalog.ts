export type GroceryCategory =
  | "Frukt og grønt"
  | "Kjøtt"
  | "Fisk og sjømat"
  | "Kjøl og egg"
  | "Hermetikk"
  | "Tørrvarer"
  | "Oljer og sauser"
  | "Krydder";

export type GrocerySection = "buy" | "check" | "optional";
export type PurchaseUnit = "g" | "ml" | "stk";

export interface GroceryCatalogItem {
  label: string;
  category: GroceryCategory;
  section: Exclude<GrocerySection, "optional">;
  purchaseUnit: PurchaseUnit;
  roundTo: number;
  packageSize?: number;
  searchTerm?: string;
  conversion?: {
    gramsPerEach?: number;
    gramsPerMl?: number;
    mlPerEach?: number;
    purchaseGramsPerPlanGram?: number;
    note?: string;
  };
}

export const groceryCatalog = {
  "almond-flour": item("Mandelmel", "Tørrvarer", "check", "g", 50),
  avocado: item("Avokado", "Frukt og grønt", "buy", "stk", 1, { gramsPerEach: 150 }),
  "avocado-oil": item("Avokadoolje", "Oljer og sauser", "check", "ml", 100, { gramsPerMl: 0.91 }),
  banana: item("Banan", "Frukt og grønt", "buy", "stk", 1, { gramsPerEach: 120 }),
  "bone-broth": item("Beinbuljong", "Hermetikk", "check", "ml", 250),
  broccoli: item("Brokkoli", "Frukt og grønt", "buy", "g", 100),
  butter: item("Smør", "Kjøl og egg", "check", "g", 50, { gramsPerMl: 0.96 }),
  carrot: item("Gulrot", "Frukt og grønt", "buy", "g", 100),
  cauliflower: item("Blomkål", "Frukt og grønt", "buy", "g", 100, { gramsPerEach: 600 }),
  cheese: item("Geite- eller sauemelksost", "Kjøl og egg", "buy", "stk", 1),
  "cherry-tomato": item("Cherrytomater", "Frukt og grønt", "buy", "g", 50),
  "chicken-breast": item("Kyllingfilet", "Kjøtt", "buy", "g", 50),
  "chicken-thigh": item("Kyllinglår", "Kjøtt", "buy", "g", 50),
  chili: item("Chiliflak", "Krydder", "check", "g", 1),
  cinnamon: item("Ceylonkanel", "Krydder", "check", "g", 1),
  "coconut-aminos": item("Kokosaminos", "Oljer og sauser", "check", "ml", 50),
  "coconut-milk": item("Kokosmelk", "Hermetikk", "buy", "ml", 100, { gramsPerMl: 1 }, 400),
  "coconut-oil": item("Kokosolje", "Oljer og sauser", "check", "g", 50),
  "dark-chocolate-85": item(
    "Kolonihagen økologisk mørk sjokolade 85 %",
    "Tørrvarer",
    "buy",
    "g",
    90,
    undefined,
    90,
    "Kolonihagen økologisk mørk sjokolade 85%",
  ),
  coriander: item("Koriander", "Frukt og grønt", "buy", "stk", 1),
  "cottage-cheese": item("Cottage cheese", "Kjøl og egg", "buy", "g", 100, undefined, 400),
  cucumber: item("Agurk", "Frukt og grønt", "buy", "stk", 1, { gramsPerEach: 300 }),
  cumin: item("Spisskummen", "Krydder", "check", "g", 1),
  dill: item("Dill", "Frukt og grønt", "buy", "stk", 1),
  egg: item("Egg", "Kjøl og egg", "buy", "stk", 1, { gramsPerEach: 50 }, 6),
  garlic: item("Hvitløk", "Frukt og grønt", "buy", "stk", 1),
  "garlic-powder": item("Hvitløkspulver", "Krydder", "check", "g", 1),
  ghee: item("Ghee", "Oljer og sauser", "check", "g", 50),
  ginger: item("Ingefær", "Frukt og grønt", "buy", "g", 10),
  "ground-beef": item("Karbonadedeig", "Kjøtt", "buy", "g", 100),
  "heart-lettuce": item("Hjertesalat", "Frukt og grønt", "buy", "stk", 1, { gramsPerEach: 150 }),
  honey: item("Honning", "Tørrvarer", "check", "g", 50),
  "hot-honey": item("Hot honey", "Oljer og sauser", "buy", "ml", 50),
  kale: item("Grønnkål", "Frukt og grønt", "buy", "g", 100),
  lemon: item("Sitron", "Frukt og grønt", "buy", "stk", 1, { mlPerEach: 30 }),
  lime: item("Lime", "Frukt og grønt", "buy", "stk", 1, { mlPerEach: 25 }),
  "microgreens": item("Mikrogrønt", "Frukt og grønt", "buy", "stk", 1),
  mushroom: item("Sjampinjong", "Frukt og grønt", "buy", "g", 100),
  mustard: item("Sennep", "Oljer og sauser", "check", "ml", 50),
  "nutritional-yeast": item("Næringsgjær", "Tørrvarer", "buy", "g", 10),
  "olive-oil": item("Olivenolje", "Oljer og sauser", "check", "ml", 100, { gramsPerMl: 0.91 }),
  onion: item("Gul løk", "Frukt og grønt", "buy", "stk", 1, { gramsPerEach: 150 }),
  oregano: item("Oregano", "Krydder", "check", "g", 1),
  paprika: item("Paprikapulver", "Krydder", "check", "g", 1),
  potato: item("Potet", "Frukt og grønt", "buy", "g", 100, {
    purchaseGramsPerPlanGram: 1.1,
    note: "Kokt potet er omregnet til rå kjøpsvekt med faktor 1,10.",
  }),
  "protein-powder": item("Aminosyre- eller kollagenpulver", "Tørrvarer", "buy", "stk", 1),
  quinoa: item("Quinoa", "Tørrvarer", "buy", "g", 50, {
    purchaseGramsPerPlanGram: 0.34,
    note: "Kokt quinoa er omregnet til tørr kjøpsvekt med faktor 0,34.",
  }),
  "red-cabbage": item("Rødkål", "Frukt og grønt", "buy", "g", 100),
  "red-onion": item("Rødløk", "Frukt og grønt", "buy", "stk", 1, { gramsPerEach: 100 }),
  "red-pepper": item("Rød paprika", "Frukt og grønt", "buy", "stk", 1, { gramsPerEach: 160 }),
  romaine: item("Romanosalat", "Frukt og grønt", "buy", "stk", 1, { gramsPerEach: 150 }),
  rosemary: item("Rosmarin", "Frukt og grønt", "check", "stk", 1),
  salmon: item("Laksefilet", "Fisk og sjømat", "buy", "g", 50),
  "salt-pepper": item("Havsalt og pepper", "Krydder", "check", "g", 1),
  sesame: item("Sesamfrø", "Tørrvarer", "check", "g", 10),
  shrimp: item("Reker, skrelt", "Fisk og sjømat", "buy", "g", 50),
  sirloin: item("Ytrefilet", "Kjøtt", "buy", "g", 50),
  "smoked-paprika": item("Røkt paprika", "Krydder", "check", "g", 1),
  "smoked-salmon": item("Norsk røkt laks", "Fisk og sjømat", "buy", "g", 50),
  spinach: item("Spinat", "Frukt og grønt", "buy", "g", 100),
  squash: item("Squash", "Frukt og grønt", "buy", "stk", 1, { gramsPerEach: 300 }),
  "sweet-potato": item("Søtpotet", "Frukt og grønt", "buy", "g", 100),
  thyme: item("Timian", "Frukt og grønt", "check", "stk", 1),
  tuna: item("Tunfisk i olje", "Hermetikk", "buy", "stk", 1, {
    gramsPerEach: 120,
    note: "Én boks er beregnet som 120 g avrent tunfisk.",
  }),
  turmeric: item("Gurkemeie", "Krydder", "check", "g", 1),
  turkey: item("Kalkunkjøttdeig", "Kjøtt", "buy", "g", 50),
  walnuts: item("Valnøtter", "Tørrvarer", "check", "g", 50),
  "waffle-toppings": item("Valgfritt vaffeltilbehør", "Frukt og grønt", "buy", "stk", 1),
  "wild-rice": item("Villris", "Tørrvarer", "buy", "g", 50, {
    purchaseGramsPerPlanGram: 0.34,
    note: "Kokt villris er omregnet til tørr kjøpsvekt med faktor 0,34.",
  }),
} as const satisfies Record<string, GroceryCatalogItem>;

export type GroceryItemId = keyof typeof groceryCatalog;

export const groceryCategoryOrder: GroceryCategory[] = [
  "Frukt og grønt",
  "Kjøtt",
  "Fisk og sjømat",
  "Kjøl og egg",
  "Hermetikk",
  "Tørrvarer",
  "Oljer og sauser",
  "Krydder",
];

export function getGroceryCatalogItem(id: GroceryItemId): GroceryCatalogItem {
  return groceryCatalog[id];
}

export function isGroceryItemId(value: unknown): value is GroceryItemId {
  return typeof value === "string" && value in groceryCatalog;
}

function item(
  label: string,
  category: GroceryCategory,
  section: GroceryCatalogItem["section"],
  purchaseUnit: PurchaseUnit,
  roundTo: number,
  conversion?: GroceryCatalogItem["conversion"],
  packageSize?: number,
  searchTerm?: string,
): GroceryCatalogItem {
  return {
    label,
    category,
    section,
    purchaseUnit,
    roundTo,
    packageSize,
    conversion,
    searchTerm,
  };
}
