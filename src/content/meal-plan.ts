import { foods } from "./matvaretabellen.generated";
import type { RecipeReference } from "../lib/recipes";
import type { GroceryItemId } from "./grocery-catalog";

export type FoodId = (typeof foods)[number]["id"];

export interface IngredientAmount {
  foodId: FoodId;
  grams: number;
  label?: string;
}

export interface PlannedMeal {
  title?: string;
  recipe?: RecipeReference;
  ingredients: IngredientAmount[];
  omittedRecipeGroceryItems?: GroceryItemId[];
  sharedWithFamily?: boolean;
  details?: string[];
}

export interface DinnerDefinition {
  recipe: RecipeReference;
  plannedIngredients: IngredientAmount[];
}

export type DayKind = "active" | "rest" | "long";
export type DayName =
  | "Mandag"
  | "Tirsdag"
  | "Onsdag"
  | "Torsdag"
  | "Fredag"
  | "Lørdag"
  | "Søndag";

export interface DayProfile {
  name: DayName;
  shortName: string;
  kind: DayKind;
  fredrikTrains: boolean;
  kamillaTrains: boolean;
  officeDay: boolean;
}

export const dayProfiles: DayProfile[] = [
  {
    name: "Mandag",
    shortName: "Man",
    kind: "active",
    fredrikTrains: true,
    kamillaTrains: false,
    officeDay: true,
  },
  {
    name: "Tirsdag",
    shortName: "Tir",
    kind: "rest",
    fredrikTrains: false,
    kamillaTrains: true,
    officeDay: false,
  },
  {
    name: "Onsdag",
    shortName: "Ons",
    kind: "active",
    fredrikTrains: true,
    kamillaTrains: false,
    officeDay: false,
  },
  {
    name: "Torsdag",
    shortName: "Tor",
    kind: "rest",
    fredrikTrains: false,
    kamillaTrains: true,
    officeDay: true,
  },
  {
    name: "Fredag",
    shortName: "Fre",
    kind: "active",
    fredrikTrains: true,
    kamillaTrains: false,
    officeDay: false,
  },
  {
    name: "Lørdag",
    shortName: "Lør",
    kind: "long",
    fredrikTrains: true,
    kamillaTrains: true,
    officeDay: false,
  },
  {
    name: "Søndag",
    shortName: "Søn",
    kind: "rest",
    fredrikTrains: false,
    kamillaTrains: false,
    officeDay: false,
  },
];

export const nutritionTargets = {
  active: { calories: 1950, protein: 160, fat: 57, carbs: 200 },
  rest: { calories: 1950, protein: 160, fat: 57, carbs: 200 },
  long: { calories: 1950, protein: 160, fat: 57, carbs: 200 },
} as const;

export const mealPlanNutritionMetadata = {
  calculatedAt: "2026-08-10",
  notes: [
    "Fredriks grunnplan ligger rundt 1 950 kcal med minst 160 g protein hver dag.",
    "Oppskriftenes kjerneingredienser og fettmengder beholdes. Karbohydrat maksimeres deretter, med omtrent 200 g som et mykt mål.",
    "Banan, dadler og eventuelt ett eller to egg på aktive dager er valgfritt drivstoff i tillegg til grunnplanen og er ikke medregnet.",
    "Kalkunkjøttdeig bruker Kalkun, kjøtt med skinn, rå som nærmeste tilgjengelige Matvaretabellen-verdi.",
    "Avokadoolje bruker extra virgin olivenolje som nærmeste tilgjengelige Matvaretabellen-verdi; begge er rene fettkilder.",
    "Kyllinglår med skinn bruker kyllinglår uten skinn som nærmeste tilgjengelige Matvaretabellen-verdi.",
    "Lørdagens eggerøre lages dobbelt, og søndagsporsjonen kjøles raskt ned. Proteinvaflene lages til hele familien begge helgedager.",
  ],
} as const;

export const fredrikFuelTrial = {
  visibleFrom: "2026-08-02",
  startsOn: "2026-08-03",
  endsOn: "2026-08-16",
  reviewOn: "2026-08-16",
  preTrainingCarbs: 30,
  previousGuidance: "Valgfri banan eller dadler uten fast mengde før aktive dager.",
  guidance:
    "karbohydrat 20–30 minutter før morgenøkter. Dette kommer i tillegg til grunnplanen; de tre faste måltidene og proteinmålet beholdes.",
  successCriteria:
    "Vurder følelse og fart ved sammenlignbar intensitet, evne til å holde planlagt sykkelwatt og vekttrend.",
} as const;

const recipeRef = (
  category: RecipeReference["category"],
  slug: string,
): RecipeReference => ({ category, slug });

const officeBreakfast = (
  cottageCheese: number,
  banana: number,
  walnuts: number,
  honey: number,
): PlannedMeal => ({
  title: "Cottage cheese med banan og valnøtter",
  ingredients: [
    { foodId: "01.028", grams: cottageCheese, label: "cottage cheese" },
    { foodId: "06.525", grams: banana, label: "banan" },
    { foodId: "06.560", grams: walnuts, label: "valnøtter" },
    ...(honey > 0
      ? [{ foodId: "09.003" as const, grams: honey, label: "rå honning" }]
      : []),
  ],
  details: ["Pakkes på under to minutter kvelden før; bananen kan tas med hel."],
});

const officeLunch = (
  tuna: number,
  sweetPotato: number,
): PlannedMeal => ({
  recipe: recipeRef("lunsj", "tunfisktarn-med-sotpotet"),
  ingredients: [
    { foodId: "04.107", grams: tuna, label: "tunfisk i olje, avrent" },
    { foodId: "06.010", grams: 100, label: "agurk" },
    { foodId: "06.136", grams: sweetPotato, label: "søtpotet" },
  ],
  details: ["Søtpoteten bakes i batch; tunfisken åpnes når måltidet settes sammen."],
});

const morningScramble = (
  protein: "karbonadedeig" | "ytrefilet",
  proteinGrams: number,
  sweetPotato: number,
  details: string[],
): PlannedMeal => ({
  recipe: recipeRef("frokost", "morgeneggerore"),
  ingredients: [
    { foodId: "02.001", grams: 100, label: "egg, ca. 2 stk." },
    {
      foodId: protein === "karbonadedeig" ? "03.126" : "03.066",
      grams: proteinGrams,
      label: protein,
    },
    { foodId: "06.064", grams: 100, label: "spinat" },
    { foodId: "06.062", grams: 100, label: "sjampinjong" },
    ...(sweetPotato > 0
      ? [{ foodId: "06.136" as const, grams: sweetPotato, label: "søtpotet til servering" }]
      : []),
    { foodId: "08.252", grams: 14, label: "ghee" },
  ],
  omittedRecipeGroceryItems: protein === "ytrefilet" ? ["ground-beef"] : undefined,
  details,
});

const hormoneHarmonyBowl = (
  protein: "kyllingfilet" | "norsk røkt laks",
  proteinGrams: number,
  sweetPotato: number,
  details: string[],
): PlannedMeal => ({
  recipe: recipeRef("lunsj", "hormonbalansebolle"),
  ingredients: [
    {
      foodId: protein === "kyllingfilet" ? "03.205" : "04.018",
      grams: proteinGrams,
      label: protein,
    },
    { foodId: "06.136", grams: sweetPotato, label: "søtpotet" },
    { foodId: "06.035", grams: 100, label: "grønnkål" },
    { foodId: "06.524", grams: 75, label: "avokado" },
    { foodId: "08.112", grams: 14, label: "olivenolje" },
  ],
  omittedRecipeGroceryItems: ["salmon"],
  details,
});

const weekendProteinWaffles: PlannedMeal = {
  recipe: recipeRef("frokost", "barnevennlige-proteinvafler"),
  ingredients: [
    { foodId: "02.001", grams: 100, label: "egg, ca. 2 stk." },
    { foodId: "06.525", grams: 120, label: "banan" },
    { foodId: "05.420", grams: 15, label: "mandelmel" },
    { foodId: "08.249", grams: 3, label: "kokosolje til vaffeljernet" },
    { foodId: "01.028", grams: 285, label: "cottage cheese til servering" },
  ],
  omittedRecipeGroceryItems: ["protein-powder"],
  sharedWithFamily: true,
  details: [
    "Mengdene viser Fredriks porsjon. Handlelisten skalerer vaflene til to voksne og ett barn.",
    "Avkjøl vaflene på rist før de pakkes, og hold cottage cheese kald frem til servering.",
  ],
};

export const daytimeMeals: Record<DayName, [PlannedMeal, PlannedMeal]> = {
  Mandag: [
    officeBreakfast(250, 230, 5, 15),
    officeLunch(300, 450),
  ],
  Tirsdag: [
    morningScramble("ytrefilet", 225, 85, [
      "Lag dobbel kjøtt- og grønnsaksbase; halvparten settes kaldt til onsdag.",
    ]),
    hormoneHarmonyBowl("kyllingfilet", 200, 200, [
      "Lag to boller samtidig. Onsdagsporsjonen oppbevares kaldt og monteres ved servering.",
    ]),
  ],
  Onsdag: [
    morningScramble("ytrefilet", 225, 105, [
      "Varm opp basen fra tirsdag og tilsett dagens egg.",
    ]),
    hormoneHarmonyBowl("kyllingfilet", 200, 200, [
      "Bruk den ferdige kyllingen og søtpoteten fra tirsdag; tilsett grønnkål ved servering.",
    ]),
  ],
  Torsdag: [
    officeBreakfast(425, 385, 5, 21),
    officeLunch(250, 200),
  ],
  Fredag: [
    morningScramble("ytrefilet", 250, 10, [
      "Ytrefileten stekes raskt i strimler og vendes inn i samme eggerørebase som tirsdag og onsdag.",
    ]),
    hormoneHarmonyBowl("norsk røkt laks", 130, 170, [
      "Bruk norsk røkt laks med kun laks og salt i ingredienslisten; ingen varmebehandling er nødvendig.",
    ]),
  ],
  Lørdag: [
    morningScramble("karbonadedeig", 300, 0, [
      "Lag dobbel porsjon lørdag. Kjøl søndagsporsjonen raskt ned og oppbevar den kaldt.",
    ]),
    weekendProteinWaffles,
  ],
  Søndag: [
    morningScramble("karbonadedeig", 300, 0, [
      "Varm opp porsjonen som ble laget lørdag, og sørg for at den er gjennomvarm.",
    ]),
    weekendProteinWaffles,
  ],
};

export const dinnerDefinitions: Record<string, DinnerDefinition> = {
  lemonChicken: {
    recipe: recipeRef("middag", "sitron-og-urtekylling-med-gronnsaker-i-en-panne"),
    plannedIngredients: [
      { foodId: "03.332", grams: 430 },
      { foodId: "05.340", grams: 433 },
      { foodId: "06.018", grams: 250 },
      { foodId: "06.048", grams: 200 },
      { foodId: "06.085", grams: 250 },
      { foodId: "08.112", grams: 16 },
    ],
  },
  salmonTacos: {
    recipe: recipeRef("middag", "laksetaco-i-hjertesalat"),
    plannedIngredients: [
      { foodId: "04.015", grams: 420 },
      { foodId: "05.340", grams: 455 },
      { foodId: "06.207", grams: 150 },
      { foodId: "06.010", grams: 300 },
      { foodId: "06.752", grams: 150 },
      { foodId: "06.042", grams: 100, label: "rødløk" },
      { foodId: "06.524", grams: 132 },
    ],
  },
  steakTips: {
    recipe: recipeRef("middag", "biffbiter"),
    plannedIngredients: [
      { foodId: "03.066", grams: 529 },
      { foodId: "06.262", grams: 580 },
      { foodId: "06.018", grams: 250 },
      { foodId: "06.048", grams: 200 },
      { foodId: "08.112", grams: 49 },
    ],
  },
  castIronSteak: {
    recipe: recipeRef("middag", "stopjernsbiff-med-avgiftende-bladgront"),
    plannedIngredients: [
      { foodId: "03.066", grams: 405 },
      { foodId: "06.262", grams: 620 },
      { foodId: "06.035", grams: 300 },
      { foodId: "08.252", grams: 16 },
    ],
  },
  salmonPoke: {
    recipe: recipeRef("middag", "poke-med-varmebehandlet-laks-og-quinoa"),
    plannedIngredients: [
      { foodId: "04.015", grams: 353 },
      { foodId: "06.616", grams: 466 },
      { foodId: "06.093", grams: 300 },
      { foodId: "06.036", grams: 150 },
      { foodId: "06.010", grams: 250 },
      { foodId: "08.112", grams: 16 },
      { foodId: "05.030", grams: 16 },
    ],
  },
  turkeyMeatballs: {
    recipe: recipeRef("middag", "rene-kalkunkjottboller-med-blomkalmos"),
    plannedIngredients: [
      { foodId: "03.004", grams: 264, label: "kalkunkjøttdeig" },
      { foodId: "02.001", grams: 29 },
      { foodId: "05.420", grams: 9 },
      { foodId: "06.016", grams: 500 },
      { foodId: "06.262", grams: 600 },
      { foodId: "08.252", grams: 16 },
    ],
  },
  beefBurgers: {
    recipe: recipeRef("middag", "salatinnpakkede-storfeburgere"),
    plannedIngredients: [
      { foodId: "03.126", grams: 529 },
      { foodId: "06.136", grams: 350 },
      { foodId: "06.524", grams: 176 },
      { foodId: "06.138", grams: 150 },
      { foodId: "06.042", grams: 100, label: "rødløk" },
      { foodId: "08.112", grams: 16, label: "avokadoolje" },
    ],
  },
  lemonSalmon: {
    recipe: recipeRef("middag", "villaks-med-sitron-dill-og-ovnsstekte-gronnsaker"),
    plannedIngredients: [
      { foodId: "04.015", grams: 300 },
      { foodId: "06.262", grams: 620 },
      { foodId: "06.018", grams: 250 },
      { foodId: "06.085", grams: 250 },
      { foodId: "08.112", grams: 16 },
    ],
  },
  chickenCurry: {
    recipe: recipeRef("middag", "betennelsesdempende-kyllingcurrybolle"),
    plannedIngredients: [
      { foodId: "03.205", grams: 264 },
      { foodId: "06.701", grams: 141 },
      { foodId: "05.340", grams: 470 },
      { foodId: "06.085", grams: 250 },
      { foodId: "06.016", grams: 350 },
      { foodId: "08.249", grams: 8 },
    ],
  },
  tacoBowl: {
    recipe: recipeRef("middag", "tacobowl-med-sotpotet-og-cottage-cheese"),
    plannedIngredients: [
      { foodId: "03.126", grams: 353 },
      { foodId: "01.028", grams: 235 },
      { foodId: "06.136", grams: 350 },
      { foodId: "06.752", grams: 200 },
      { foodId: "06.524", grams: 176 },
      { foodId: "08.252", grams: 39, label: "ghee og smør" },
    ],
  },
  garlicShrimp: {
    recipe: recipeRef("middag", "hvitloksreker-med-squashnudler-i-en-panne"),
    plannedIngredients: [
      { foodId: "04.387", grams: 529 },
      { foodId: "05.340", grams: 500 },
      { foodId: "06.085", grams: 600 },
      { foodId: "08.112", grams: 33 },
    ],
  },
  chickenStew: {
    recipe: recipeRef("middag", "kyllinggryte-med-gurkemeie-og-kokos"),
    plannedIngredients: [
      { foodId: "03.332", grams: 264, label: "kyllinglår" },
      { foodId: "06.701", grams: 141 },
      { foodId: "06.262", grams: 620 },
      { foodId: "06.085", grams: 250 },
      { foodId: "06.042", grams: 150 },
      { foodId: "08.249", grams: 8 },
    ],
  },
};

export const dinnerRotation = {
  A: {
    Mandag: dinnerDefinitions.lemonChicken,
    Tirsdag: dinnerDefinitions.steakTips,
    Onsdag: dinnerDefinitions.salmonPoke,
    Torsdag: dinnerDefinitions.beefBurgers,
    Fredag: dinnerDefinitions.castIronSteak,
    Lørdag: dinnerDefinitions.chickenCurry,
    Søndag: dinnerDefinitions.garlicShrimp,
  },
  B: {
    Mandag: dinnerDefinitions.salmonTacos,
    Tirsdag: dinnerDefinitions.castIronSteak,
    Onsdag: dinnerDefinitions.turkeyMeatballs,
    Torsdag: dinnerDefinitions.lemonSalmon,
    Fredag: dinnerDefinitions.steakTips,
    Lørdag: dinnerDefinitions.tacoBowl,
    Søndag: dinnerDefinitions.chickenStew,
  },
} as const;
