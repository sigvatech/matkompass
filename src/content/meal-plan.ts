import { foods } from "./matvaretabellen.generated";
import { productFoods } from "./product-foods";
import type { RecipeReference } from "../lib/recipes";
import type { GroceryItemId } from "./grocery-catalog";

export type FoodId =
  | (typeof foods)[number]["id"]
  | (typeof productFoods)[number]["id"];

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
  nutritionTracked?: boolean;
  details?: string[];
}

export type DaytimeMeal = PlannedMeal | null;

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
  calculatedAt: "2026-08-25",
  notes: [
    "Dager med full måltidsplan ligger rundt 1 950 kcal med minst 160 g protein.",
    "Oppskriftenes kjerneingredienser og fettmengder beholdes. Karbohydrat maksimeres deretter, med omtrent 200 g som et mykt mål.",
    "Banan, dadler og eventuelt ett eller to egg på aktive dager er valgfritt drivstoff i tillegg til grunnplanen og er ikke medregnet.",
    "Kalkunkjøttdeig bruker Kalkun, kjøtt med skinn, rå som nærmeste tilgjengelige Matvaretabellen-verdi.",
    "Avokadoolje bruker extra virgin olivenolje som nærmeste tilgjengelige Matvaretabellen-verdi; begge er rene fettkilder.",
    "Kyllinglår med skinn bruker kyllinglår uten skinn som nærmeste tilgjengelige Matvaretabellen-verdi.",
    "Lørdagens eggerøre lages dobbelt, og søndagsporsjonen kjøles raskt ned. Proteinvaflene lages til hele familien begge helgedager.",
    "Frokost og lunsj er ikke planlagt mandag og torsdag; bare middagen er medregnet i dagens makrototal og handleliste.",
    "Kolonihagen økologisk mørk sjokolade 85 % er beregnet fra produktets næringsdeklarasjon hos Oda.",
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
    "karbohydrat 20–30 minutter før morgenøkter. Dette kommer i tillegg til dagens planlagte måltider.",
  successCriteria:
    "Vurder følelse og fart ved sammenlignbar intensitet, evne til å holde planlagt sykkelwatt og vekttrend.",
} as const;

const recipeRef = (
  category: RecipeReference["category"],
  slug: string,
): RecipeReference => ({ category, slug });

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
    "Mengdene viser Fredriks porsjon. Handlelisten skalerer vaflene til to voksne.",
    "Avkjøl vaflene på rist før de pakkes, og hold cottage cheese kald frem til servering.",
  ],
};

export const fredrikDinnerAdditions: Partial<Record<DayName, IngredientAmount[]>> = {
  Tirsdag: [
    {
      foodId: "oda-68777",
      grams: 23,
      label: "Kolonihagen mørk sjokolade 85 % etter middagen",
    },
  ],
  Onsdag: [
    {
      foodId: "oda-68777",
      grams: 23,
      label: "Kolonihagen mørk sjokolade 85 % etter middagen",
    },
  ],
  Fredag: [
    {
      foodId: "oda-68777",
      grams: 23,
      label: "Kolonihagen mørk sjokolade 85 % etter middagen",
    },
  ],
};

export const daytimeMeals: Record<DayName, [DaytimeMeal, DaytimeMeal]> = {
  Mandag: [null, null],
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
  Torsdag: [null, null],
  Fredag: [
    morningScramble("ytrefilet", 250, 10, [
      "Ytrefileten stekes raskt i strimler og vendes inn i samme eggerørebase som tirsdag og onsdag.",
    ]),
    hormoneHarmonyBowl("kyllingfilet", 200, 255, [
      "Kyllingen stekes på forhånd og pakkes kald sammen med resten av bollen.",
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
      { foodId: "03.332", grams: 365.5 },
      { foodId: "05.340", grams: 368.05 },
      { foodId: "06.018", grams: 212.5 },
      { foodId: "06.048", grams: 170 },
      { foodId: "06.085", grams: 212.5 },
      { foodId: "08.112", grams: 13.6 },
    ],
  },
  salmonTacos: {
    recipe: recipeRef("middag", "laksetaco-i-hjertesalat"),
    plannedIngredients: [
      { foodId: "04.015", grams: 357 },
      { foodId: "05.340", grams: 386.75 },
      { foodId: "06.207", grams: 127.5 },
      { foodId: "06.010", grams: 255 },
      { foodId: "06.752", grams: 127.5 },
      { foodId: "06.042", grams: 85, label: "rødløk" },
      { foodId: "06.524", grams: 112.2 },
    ],
  },
  steakTips: {
    recipe: recipeRef("middag", "biffbiter"),
    plannedIngredients: [
      { foodId: "03.066", grams: 449.65 },
      { foodId: "06.262", grams: 493 },
      { foodId: "06.018", grams: 212.5 },
      { foodId: "06.048", grams: 170 },
      { foodId: "08.112", grams: 41.65 },
    ],
  },
  castIronSteak: {
    recipe: recipeRef("middag", "stopjernsbiff-med-avgiftende-bladgront"),
    plannedIngredients: [
      { foodId: "03.066", grams: 344.25 },
      { foodId: "06.262", grams: 527 },
      { foodId: "06.035", grams: 255 },
      { foodId: "08.252", grams: 13.6 },
    ],
  },
  salmonPoke: {
    recipe: recipeRef("middag", "poke-med-varmebehandlet-laks-og-quinoa"),
    plannedIngredients: [
      { foodId: "04.015", grams: 300.05 },
      { foodId: "06.616", grams: 396.1 },
      { foodId: "06.093", grams: 255 },
      { foodId: "06.036", grams: 127.5 },
      { foodId: "06.010", grams: 212.5 },
      { foodId: "08.112", grams: 13.6 },
      { foodId: "05.030", grams: 13.6 },
    ],
  },
  turkeyMeatballs: {
    recipe: recipeRef("middag", "rene-kalkunkjottboller-med-blomkalmos"),
    plannedIngredients: [
      { foodId: "03.004", grams: 224.4, label: "kalkunkjøttdeig" },
      { foodId: "02.001", grams: 24.65 },
      { foodId: "05.420", grams: 7.65 },
      { foodId: "06.016", grams: 425 },
      { foodId: "06.262", grams: 510 },
      { foodId: "08.252", grams: 13.6 },
    ],
  },
  beefBurgers: {
    recipe: recipeRef("middag", "salatinnpakkede-storfeburgere"),
    plannedIngredients: [
      { foodId: "03.126", grams: 449.65 },
      { foodId: "06.136", grams: 297.5 },
      { foodId: "06.524", grams: 149.6 },
      { foodId: "06.138", grams: 127.5 },
      { foodId: "06.042", grams: 85, label: "rødløk" },
      { foodId: "08.112", grams: 13.6, label: "avokadoolje" },
    ],
  },
  lemonSalmon: {
    recipe: recipeRef("middag", "villaks-med-sitron-dill-og-ovnsstekte-gronnsaker"),
    plannedIngredients: [
      { foodId: "04.015", grams: 255 },
      { foodId: "06.262", grams: 527 },
      { foodId: "06.018", grams: 212.5 },
      { foodId: "06.085", grams: 212.5 },
      { foodId: "08.112", grams: 13.6 },
    ],
  },
  chickenCurry: {
    recipe: recipeRef("middag", "betennelsesdempende-kyllingcurrybolle"),
    plannedIngredients: [
      { foodId: "03.205", grams: 224.4 },
      { foodId: "06.701", grams: 119.85 },
      { foodId: "05.340", grams: 399.5 },
      { foodId: "06.085", grams: 212.5 },
      { foodId: "06.016", grams: 297.5 },
      { foodId: "08.249", grams: 6.8 },
    ],
  },
  tacoBowl: {
    recipe: recipeRef("middag", "tacobowl-med-sotpotet-og-cottage-cheese"),
    plannedIngredients: [
      { foodId: "03.126", grams: 300.05 },
      { foodId: "01.028", grams: 199.75 },
      { foodId: "06.136", grams: 297.5 },
      { foodId: "06.752", grams: 170 },
      { foodId: "06.524", grams: 149.6 },
      { foodId: "08.252", grams: 33.15, label: "ghee og smør" },
    ],
  },
  garlicShrimp: {
    recipe: recipeRef("middag", "hvitloksreker-med-squashnudler-i-en-panne"),
    plannedIngredients: [
      { foodId: "04.387", grams: 449.65 },
      { foodId: "05.340", grams: 425 },
      { foodId: "06.085", grams: 510 },
      { foodId: "08.112", grams: 28.05 },
    ],
  },
  chickenStew: {
    recipe: recipeRef("middag", "kyllinggryte-med-gurkemeie-og-kokos"),
    plannedIngredients: [
      { foodId: "03.332", grams: 224.4, label: "kyllinglår" },
      { foodId: "06.701", grams: 119.85 },
      { foodId: "06.262", grams: 527 },
      { foodId: "06.085", grams: 212.5 },
      { foodId: "06.042", grams: 127.5 },
      { foodId: "08.249", grams: 6.8 },
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
