import type { GroceryItemId } from "../content/grocery-catalog";

export const childPortionFactor = 0.35;
export const familyPreset = { adults: 2, children: 0 } as const;

export interface FamilySize {
  adults: number;
  children: number;
}

export interface RecipeIngredient {
  amount?: number;
  maxAmount?: number;
  unit?: string;
  text: string;
  approximate?: boolean;
  optional?: boolean;
  scalable?: false;
  groceryItems?: GroceryItemId[];
}

export interface RecipeIngredientGroup {
  title?: string;
  items: RecipeIngredient[];
}

export function getFamilyScale(
  baseAdultPortions: number,
  family: FamilySize,
): number {
  if (!Number.isFinite(baseAdultPortions) || baseAdultPortions <= 0) {
    throw new Error("Grunnporsjoner må være større enn null");
  }

  if (
    !Number.isInteger(family.adults) ||
    family.adults < 1 ||
    !Number.isInteger(family.children) ||
    family.children < 0
  ) {
    throw new Error("Antall voksne og barn må være hele, gyldige tall");
  }

  return (
    (family.adults + family.children * childPortionFactor) /
    baseAdultPortions
  );
}

export function formatIngredientAmount(
  ingredient: RecipeIngredient,
  scale = 1,
): string | null {
  if (ingredient.amount === undefined) {
    return null;
  }

  const amount = formatQuantity(ingredient.amount, ingredient.unit, scale);
  const range =
    ingredient.maxAmount === undefined
      ? amount
      : `${amount}–${formatQuantity(ingredient.maxAmount, ingredient.unit, scale)}`;
  const quantity = ingredient.approximate ? `ca. ${range}` : range;

  return ingredient.unit ? `${quantity} ${ingredient.unit}` : quantity;
}

function formatQuantity(value: number, unit: string | undefined, scale: number): string {
  const scaled = value * scale;
  const rounded = scale === 1 ? scaled : roundForKitchen(scaled, unit);
  const integer = Math.floor(rounded);
  const fraction = rounded - integer;
  const fractionLabel = getFractionLabel(fraction);

  if (fractionLabel) {
    return integer === 0 ? fractionLabel : `${integer}${fractionLabel}`;
  }

  return new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: 2,
  }).format(rounded);
}

function roundForKitchen(value: number, unit: string | undefined): number {
  if ((unit === "g" || unit === "ml") && value >= 20) {
    return Math.round(value / 5) * 5;
  }

  if (unit === "dl" || unit === "l" || unit === "kg") {
    return Math.round(value * 10) / 10;
  }

  return Math.round(value * 4) / 4;
}

function getFractionLabel(fraction: number): string | null {
  if (Math.abs(fraction - 0.25) < 0.001) {
    return "¼";
  }

  if (Math.abs(fraction - 0.5) < 0.001) {
    return "½";
  }

  if (Math.abs(fraction - 0.75) < 0.001) {
    return "¾";
  }

  return null;
}
