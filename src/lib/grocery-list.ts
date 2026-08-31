import {
  getGroceryCatalogItem,
  groceryCategoryOrder,
  type GroceryCategory,
  type GroceryItemId,
  type GrocerySection,
  type PurchaseUnit,
} from "../content/grocery-catalog";
import { retailers, type RetailerId } from "../content/retailers";
import {
  fredrikAfterDinnerAdditions,
  type FoodId,
  type IngredientAmount,
  type PlannedMeal,
} from "../content/meal-plan";
import {
  formatDateRange,
  getCurrentPlanWeeks,
  getFredrikDaytimePlan,
  getPlanDaysInRange,
  normalizeToUtcDate,
  type DatedPlanDay,
  type DatedPlanWeek,
} from "./meal-plan";
import {
  familyPreset,
  getFamilyScale,
  type FamilySize,
  type RecipeIngredient,
} from "./recipe-ingredients";
import { getRecipe, type RecipeReference } from "./recipes";

export type GroceryWeekSelection = "current" | "next";

export interface GroceryRetailerOffer {
  id: string;
  retailerId: RetailerId;
  retailerLabel: string;
  retailerOrder: number;
  url: string;
  linkKind: "search";
  purchaseLabel: string;
}

export interface GroceryListLine {
  id: GroceryItemId;
  label: string;
  category: GroceryCategory;
  categoryOrder: number;
  section: GrocerySection;
  requiredLabel: string;
  purchaseLabel: string;
  conversionNote?: string;
  sources: string[];
  offers: GroceryRetailerOffer[];
  defaultOfferId: string;
}

export interface GroceryList {
  range: {
    startDate: string;
    endDate: string;
    label: string;
  };
  lines: GroceryListLine[];
}

export interface WeeklyGroceryList extends GroceryList {
  week: {
    type: "A" | "B";
    weekNumber: number;
  };
}

interface GroceryContribution {
  id: GroceryItemId;
  amount: number | null;
  unit: PurchaseUnit;
  optional: boolean;
  source: string;
}

interface GroceryAccumulator {
  amount: number;
  hasAmount: boolean;
  hasUnquantified: boolean;
  sources: Set<string>;
}

const planFoodMappings: Partial<Record<FoodId, GroceryItemId>> = {
  "01.028": "cottage-cheese",
  "02.001": "egg",
  "03.004": "turkey",
  "03.066": "sirloin",
  "03.126": "ground-beef",
  "03.205": "chicken-breast",
  "03.332": "chicken-thigh",
  "04.015": "salmon",
  "04.018": "smoked-salmon",
  "04.107": "tuna",
  "04.387": "shrimp",
  "05.030": "sesame",
  "05.340": "wild-rice",
  "05.420": "almond-flour",
  "06.010": "cucumber",
  "06.016": "cauliflower",
  "06.018": "broccoli",
  "06.035": "kale",
  "06.036": "carrot",
  "06.042": "onion",
  "06.048": "red-pepper",
  "06.062": "mushroom",
  "06.064": "spinach",
  "06.085": "squash",
  "06.093": "red-cabbage",
  "06.136": "sweet-potato",
  "06.138": "romaine",
  "06.207": "heart-lettuce",
  "06.262": "potato",
  "06.524": "avocado",
  "06.525": "banana",
  "06.560": "walnuts",
  "06.616": "quinoa",
  "06.701": "coconut-milk",
  "06.752": "cherry-tomato",
  "08.112": "olive-oil",
  "08.249": "coconut-oil",
  "08.252": "ghee",
  "09.003": "honey",
  "oda-68777": "dark-chocolate-85",
};

export function getWeeklyGroceryList(
  selection: GroceryWeekSelection,
  now = new Date(),
): WeeklyGroceryList {
  const weeks = getCurrentPlanWeeks(now);
  const week = weeks[selection === "current" ? 0 : 1];
  const contributions = week.days.flatMap((day) => getDayContributions(day));
  const lines = aggregateContributions(contributions);

  return {
    range: {
      startDate: week.start.toISOString().slice(0, 10),
      endDate: week.end.toISOString().slice(0, 10),
      label: formatDateRange(week.start, week.end),
    },
    week: {
      type: week.type,
      weekNumber: week.weekNumber,
    },
    lines,
  };
}

export function getGroceryListForDateRange(start: Date, end: Date): GroceryList {
  const normalizedStart = normalizeToUtcDate(start);
  const normalizedEnd = normalizeToUtcDate(end);
  const dayCount =
    Math.floor((normalizedEnd.getTime() - normalizedStart.getTime()) / 86_400_000) + 1;

  if (dayCount < 1) {
    throw new Error("Startdato må være før eller lik sluttdato");
  }

  const rotationDays = 14;
  const rotationSegmentEnd = new Date(normalizedStart);
  rotationSegmentEnd.setUTCDate(
    rotationSegmentEnd.getUTCDate() + Math.min(dayCount, rotationDays) - 1,
  );
  const rotationSegment = getPlanDaysInRange(normalizedStart, rotationSegmentEnd);
  const completeRotations = Math.floor(dayCount / rotationDays);
  const remainingDays = dayCount % rotationDays;
  const contributions = rotationSegment.flatMap((day, index) => {
    const occurrences = completeRotations + (index < remainingDays ? 1 : 0);
    return getDayContributions(day).map((contribution) => ({
      ...contribution,
      amount: contribution.amount === null
        ? null
        : contribution.amount * occurrences,
    }));
  });

  return {
    range: {
      startDate: normalizedStart.toISOString().slice(0, 10),
      endDate: normalizedEnd.toISOString().slice(0, 10),
      label: formatDateRange(normalizedStart, normalizedEnd),
    },
    lines: aggregateContributions(contributions),
  };
}

export function validateGroceryConfiguration(now = new Date("2026-07-20T12:00:00Z")) {
  const weeks = getCurrentPlanWeeks(now);

  for (const week of weeks) {
    for (const day of week.days) {
      getDayContributions(day);
    }
  }
}

function getDayContributions(day: DatedPlanDay): GroceryContribution[] {
  const daytime = getFredrikDaytimePlan(day).flatMap((meal, index) =>
    meal
      ? getMealContributions(
          meal,
          meal.sharedWithFamily ? familyPreset : { adults: 1, children: 0 },
          `${day.profile.name} · ${index === 0 ? "kl. 10–11" : "kl. 14"}`,
        )
      : [],
  );
  const dinner = getDinnerContributions(day.dinner, `${day.profile.name} · middag`);
  const afterDinnerAdditions = (fredrikAfterDinnerAdditions[day.profile.name] ?? []).map(
    (ingredient) =>
      getPlanContribution(ingredient, `${day.profile.name} · Fredriks sjokolade`),
  );

  return [...daytime, ...dinner, ...afterDinnerAdditions];
}

function getMealContributions(
  meal: PlannedMeal,
  family: FamilySize,
  source: string,
): GroceryContribution[] {
  const planScale = getFamilyScale(1, family);
  const planned = meal.ingredients.map((ingredient) =>
    getPlanContribution(
      { ...ingredient, grams: ingredient.grams * planScale },
      source,
    ),
  );

  if (!meal.recipe) {
    return planned;
  }

  return mergeRecipeWithPlan(
    meal.recipe,
    family,
    planned,
    source,
    meal.omittedRecipeGroceryItems,
  );
}

function getDinnerContributions(
  dinner: DatedPlanWeek["days"][number]["dinner"],
  source: string,
): GroceryContribution[] {
  const planned = dinner.plannedIngredients.map((ingredient) =>
    getPlanContribution(ingredient, source),
  );

  return mergeRecipeWithPlan(dinner.recipe, familyPreset, planned, source);
}

function mergeRecipeWithPlan(
  reference: RecipeReference,
  family: FamilySize,
  planned: GroceryContribution[],
  source: string,
  omittedRecipeGroceryItems: GroceryItemId[] = [],
): GroceryContribution[] {
  const recipe = getRecipe(reference.category, reference.slug);

  if (!recipe?.baseAdultPortions) {
    throw new Error(`Mangler grunnporsjoner for ${reference.category}/${reference.slug}`);
  }

  const scale = getFamilyScale(recipe.baseAdultPortions, family);
  const plannedIds = new Set(planned.map((contribution) => contribution.id));
  const replacements = new Set(omittedRecipeGroceryItems);
  const recipeContributions = recipe.ingredients.flatMap((group) =>
    group.items.flatMap((ingredient) => {
      return getRecipeContributions(ingredient, scale, source).filter(
        (contribution) =>
          !plannedIds.has(contribution.id) && !replacements.has(contribution.id),
      );
    }),
  );

  return [...planned, ...recipeContributions];
}

function getPlanContribution(
  ingredient: IngredientAmount,
  source: string,
): GroceryContribution {
  const id = getPlanGroceryId(ingredient);
  const catalogItem = getGroceryCatalogItem(id);
  const purchaseGrams =
    ingredient.grams * (catalogItem.conversion?.purchaseGramsPerPlanGram ?? 1);
  const amount = convertQuantity(id, "g", purchaseGrams);

  if (amount === null) {
    throw new Error(`Kan ikke konvertere planmengde for ${id}`);
  }

  return {
    id,
    amount,
    unit: catalogItem.purchaseUnit,
    optional: false,
    source,
  };
}

function getPlanGroceryId(ingredient: IngredientAmount): GroceryItemId {
  if (ingredient.label === "rødløk") {
    return "red-onion";
  }

  if (ingredient.label === "avokadoolje") {
    return "avocado-oil";
  }

  const id = planFoodMappings[ingredient.foodId];

  if (!id) {
    throw new Error(`Mangler dagligvaremapping for ${ingredient.foodId}`);
  }

  return id;
}

function getRecipeContributions(
  ingredient: RecipeIngredient,
  scale: number,
  source: string,
): GroceryContribution[] {
  if (ingredient.groceryItems === undefined) {
    throw new Error(
      `Oppskriftsingrediensen «${ingredient.text}» mangler strukturerte dagligvarer`,
    );
  }

  const sourceQuantity = getRecipeSourceQuantity(ingredient, scale);
  return ingredient.groceryItems.map((id) => {
    const catalogItem = getGroceryCatalogItem(id);
    const amount = sourceQuantity
      ? convertQuantity(id, sourceQuantity.unit, sourceQuantity.amount)
      : null;

    return {
      id,
      amount,
      unit: catalogItem.purchaseUnit,
      optional: ingredient.optional === true,
      source,
    };
  });
}

function getRecipeSourceQuantity(
  ingredient: RecipeIngredient,
  scale: number,
): { amount: number; unit: "g" | "ml" | "stk" } | null {
  if (ingredient.amount === undefined) {
    return null;
  }

  const amount = (ingredient.maxAmount ?? ingredient.amount) * scale;

  switch (ingredient.unit) {
    case "g":
      return { amount, unit: "g" };
    case "kg":
      return { amount: amount * 1000, unit: "g" };
    case "ml":
      return { amount, unit: "ml" };
    case "dl":
      return { amount: amount * 100, unit: "ml" };
    case "l":
      return { amount: amount * 1000, unit: "ml" };
    case "ss":
      return { amount: amount * 15, unit: "ml" };
    case "ts":
      return { amount: amount * 5, unit: "ml" };
    case undefined:
    case "måleskje":
      return { amount, unit: "stk" };
    default:
      throw new Error(`Ukjent oppskriftsenhet: ${ingredient.unit}`);
  }
}

function convertQuantity(
  id: GroceryItemId,
  sourceUnit: PurchaseUnit,
  amount: number,
): number | null {
  const item = getGroceryCatalogItem(id);

  if (sourceUnit === item.purchaseUnit) {
    return amount;
  }

  if (sourceUnit === "g" && item.purchaseUnit === "stk" && item.conversion?.gramsPerEach) {
    return amount / item.conversion.gramsPerEach;
  }

  if (sourceUnit === "g" && item.purchaseUnit === "ml" && item.conversion?.gramsPerMl) {
    return amount / item.conversion.gramsPerMl;
  }

  if (sourceUnit === "stk" && item.purchaseUnit === "g" && item.conversion?.gramsPerEach) {
    return amount * item.conversion.gramsPerEach;
  }

  if (sourceUnit === "stk" && item.purchaseUnit === "ml" && item.conversion?.mlPerEach) {
    return amount * item.conversion.mlPerEach;
  }

  if (sourceUnit === "ml" && item.purchaseUnit === "g" && item.conversion?.gramsPerMl) {
    return amount * item.conversion.gramsPerMl;
  }

  if (sourceUnit === "ml" && item.purchaseUnit === "stk" && item.conversion?.mlPerEach) {
    return amount / item.conversion.mlPerEach;
  }

  return null;
}

function aggregateContributions(contributions: GroceryContribution[]): GroceryListLine[] {
  const required = new Map<GroceryItemId, GroceryAccumulator>();
  const optional = new Map<GroceryItemId, GroceryAccumulator>();

  for (const contribution of contributions) {
    addContribution(contribution.optional ? optional : required, contribution);
  }

  const ids = new Set([...required.keys(), ...optional.keys()]);
  return [...ids]
    .map((id) => {
      const catalogItem = getGroceryCatalogItem(id);
      const requiredEntry = required.get(id);
      const entry = requiredEntry ?? optional.get(id);

      if (!entry) {
        throw new Error(`Mangler aggregert dagligvare ${id}`);
      }

      const section: GrocerySection = requiredEntry
        ? catalogItem.section
        : "optional";
      const requiredLabel = formatRequiredAmount(entry, catalogItem.purchaseUnit);
      const purchaseLabel = formatPurchaseAmount(entry, id);
      const offers = retailers.map((retailer) => ({
        id: `${id}:${retailer.id}`,
        retailerId: retailer.id,
        retailerLabel: retailer.label,
        retailerOrder: retailer.order,
        url: `${retailer.searchUrl}${encodeURIComponent(catalogItem.searchTerm ?? catalogItem.label)}`,
        linkKind: "search" as const,
        purchaseLabel,
      }));

      return {
        id,
        label: catalogItem.label,
        category: catalogItem.category,
        categoryOrder: groceryCategoryOrder.indexOf(catalogItem.category),
        section,
        requiredLabel,
        purchaseLabel,
        conversionNote: catalogItem.conversion?.note,
        sources: [...entry.sources].toSorted((a, b) => a.localeCompare(b, "nb")),
        offers,
        defaultOfferId: `${id}:oda`,
      };
    })
    .toSorted(compareGroceryLines);
}

function addContribution(
  entries: Map<GroceryItemId, GroceryAccumulator>,
  contribution: GroceryContribution,
) {
  const current = entries.get(contribution.id) ?? {
    amount: 0,
    hasAmount: false,
    hasUnquantified: false,
    sources: new Set<string>(),
  };

  if (contribution.amount === null) {
    current.hasUnquantified = true;
  } else {
    current.amount += contribution.amount;
    current.hasAmount = true;
  }

  current.sources.add(contribution.source);
  entries.set(contribution.id, current);
}

function formatRequiredAmount(entry: GroceryAccumulator, unit: PurchaseUnit): string {
  if (!entry.hasAmount) {
    return "Etter behov";
  }

  const amount = formatAmount(entry.amount, unit);
  return entry.hasUnquantified ? `${amount} + etter behov` : amount;
}

function formatPurchaseAmount(entry: GroceryAccumulator, id: GroceryItemId): string {
  if (!entry.hasAmount) {
    return "Sjekk behovet";
  }

  const item = getGroceryCatalogItem(id);

  if (item.packageSize) {
    const packages = Math.ceil(entry.amount / item.packageSize);
    const packageLabel = formatAmount(item.packageSize, item.purchaseUnit);
    return packages === 1 ? packageLabel : `${packages} × ${packageLabel}`;
  }

  const rounded = Math.ceil(entry.amount / item.roundTo) * item.roundTo;
  return formatAmount(rounded, item.purchaseUnit);
}

function formatAmount(amount: number, unit: PurchaseUnit): string {
  if (unit === "g" && amount >= 1000) {
    return `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(amount / 1000)} kg`;
  }

  if (unit === "ml" && amount >= 1000) {
    return `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(amount / 1000)} l`;
  }

  return `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: unit === "stk" ? 1 : 0 }).format(amount)} ${unit}`;
}

function compareGroceryLines(a: GroceryListLine, b: GroceryListLine): number {
  const categoryDifference =
    groceryCategoryOrder.indexOf(a.category) - groceryCategoryOrder.indexOf(b.category);
  return categoryDifference || a.label.localeCompare(b.label, "nb");
}
