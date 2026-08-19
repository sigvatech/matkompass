import {
  dayProfiles,
  daytimeMeals,
  dinnerRotation,
  fredrikFuelTrial,
  mealPlanNutritionMetadata,
  nutritionTargets,
  type DayProfile,
  type DaytimeMeal,
  type DinnerDefinition,
  type IngredientAmount,
  type PlannedMeal,
} from "../content/meal-plan";
import { foodDataSource, foods } from "../content/matvaretabellen.generated";
import {
  resolveRecipeReference,
  type ResolvedRecipeReference,
} from "./recipes";

export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface DatedPlanWeek {
  type: "A" | "B";
  weekNumber: number;
  start: Date;
  end: Date;
  days: DatedPlanDay[];
}

export interface DatedPlanDay {
  date: Date;
  profile: DayProfile;
  dinner: ResolvedDinnerDefinition;
}

export interface ResolvedDinnerDefinition
  extends DinnerDefinition,
    ResolvedRecipeReference {}

export interface ResolvedIngredientAmount extends IngredientAmount {
  label: string;
}

export type DinnerParticipant = keyof typeof dinnerShares;

export interface FredrikMeal {
  title: string;
  href?: string;
  ingredients: ResolvedIngredientAmount[];
  details?: string[];
  time: string;
  nutrition: Nutrition;
  nutritionTracked: boolean;
}

export interface FredrikPlanDay extends DatedPlanDay {
  meals: FredrikMeal[];
  nutrition: Nutrition;
  nutritionComplete: boolean;
  target: (typeof nutritionTargets)[keyof typeof nutritionTargets];
}

const dinnerShares = {
  Fredrik: 0.5,
  Kamilla: 0.5,
} as const;

const foodsById = new Map(foods.map((food) => [food.id, food]));
const rotationEpoch = Date.UTC(2026, 6, 20);
const millisecondsPerWeek = 7 * 86_400_000;

export {
  dinnerShares,
  foodDataSource,
  fredrikFuelTrial,
  mealPlanNutritionMetadata,
  nutritionTargets,
};

export function calculateNutrition(ingredients: IngredientAmount[]): Nutrition {
  return ingredients.reduce<Nutrition>(
    (total, ingredient) => {
      const food = foodsById.get(ingredient.foodId);

      if (!food) {
        throw new Error(`Mangler næringsdata for ${ingredient.foodId}`);
      }

      const factor = ingredient.grams / 100;
      total.calories += food.per100g.calories * factor;
      total.protein += food.per100g.protein * factor;
      total.fat += food.per100g.fat * factor;
      total.carbs += food.per100g.carbs * factor;
      return total;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

export function getFoodLabel(foodId: IngredientAmount["foodId"]): string {
  const food = foodsById.get(foodId);

  if (!food) {
    throw new Error(`Mangler matvare ${foodId}`);
  }

  return food.name;
}

export function getPlannedDinnerIngredients(
  dinner: DinnerDefinition,
): ResolvedIngredientAmount[] {
  return resolveIngredientLabels(dinner.plannedIngredients);
}

export function sumNutrition(items: Nutrition[]): Nutrition {
  return items.reduce<Nutrition>(
    (total, item) => ({
      calories: total.calories + item.calories,
      protein: total.protein + item.protein,
      fat: total.fat + item.fat,
      carbs: total.carbs + item.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

export function roundNutrition(nutrition: Nutrition): Nutrition {
  return {
    calories: Math.round(nutrition.calories),
    protein: Math.round(nutrition.protein),
    fat: Math.round(nutrition.fat),
    carbs: Math.round(nutrition.carbs),
  };
}

export function getFredrikDinnerIngredients(
  dinner: DinnerDefinition,
): ResolvedIngredientAmount[] {
  return getDinnerIngredients("Fredrik", dinner);
}

export function getDinnerIngredients(
  person: DinnerParticipant,
  dinner: DinnerDefinition,
): ResolvedIngredientAmount[] {
  return resolveIngredientLabels(dinner.plannedIngredients).map((ingredient) => ({
    ...ingredient,
    grams: ingredient.grams * dinnerShares[person],
  }));
}

export function getFredrikPlanDay(day: DatedPlanDay): FredrikPlanDay {
  const mealsForDay = getFredrikDaytimePlan(day);
  const daytimeMealTimes = ["Kl. 10–11", "Kl. 14"] as const;
  const meals: FredrikMeal[] = mealsForDay.flatMap((meal, index) =>
    meal ? [createFredrikMeal(daytimeMealTimes[index], meal)] : [],
  );

  const dinnerIngredients = getFredrikDinnerIngredients(day.dinner);
  meals.push({
    time: "Kl. 17",
    title: day.dinner.title,
    href: day.dinner.href,
    ingredients: dinnerIngredients,
    details: undefined,
    nutrition: calculateNutrition(dinnerIngredients),
    nutritionTracked: true,
  });

  return {
    ...day,
    meals,
    nutrition: sumNutrition(meals.map((meal) => meal.nutrition)),
    nutritionComplete:
      meals.length === daytimeMealTimes.length + 1 &&
      meals.every((meal) => meal.nutritionTracked),
    target: nutritionTargets[day.profile.kind],
  };
}

export function getFredrikDaytimePlan(
  day: DatedPlanDay,
): readonly [DaytimeMeal, DaytimeMeal] {
  return daytimeMeals[day.profile.name];
}

export function getCurrentPlanWeeks(now = new Date()): [DatedPlanWeek, DatedPlanWeek] {
  const today = getOsloDate(now);
  const currentMonday = startOfWeek(today);
  return [createPlanWeek(currentMonday), createPlanWeek(addDays(currentMonday, 7))];
}

export function getPlanDaysInRange(start: Date, end: Date): DatedPlanDay[] {
  const normalizedStart = normalizeToUtcDate(start);
  const normalizedEnd = normalizeToUtcDate(end);

  if (normalizedStart > normalizedEnd) {
    throw new Error("Startdato må være før eller lik sluttdato");
  }

  const days: DatedPlanDay[] = [];
  let monday = startOfWeek(normalizedStart);

  while (monday <= normalizedEnd) {
    days.push(
      ...createPlanWeek(monday).days.filter(
        (day) => day.date >= normalizedStart && day.date <= normalizedEnd,
      ),
    );
    monday = addDays(monday, 7);
  }

  return days;
}

export function normalizeToUtcDate(date: Date): Date {
  if (Number.isNaN(date.getTime())) {
    throw new Error("Ugyldig dato");
  }

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function getTodayInOslo(now = new Date()): Date {
  return getOsloDate(now);
}

export function getActiveFredrikFuelTrial(now = new Date()) {
  const today = getOsloDate(now).toISOString().slice(0, 10);

  if (today < fredrikFuelTrial.visibleFrom || today > fredrikFuelTrial.reviewOn) {
    return undefined;
  }

  return fredrikFuelTrial;
}

export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    ...options,
  }).format(date);
}

export function formatDateRange(start: Date, end: Date): string {
  return `${formatDate(start)}–${formatDate(end, { day: "numeric", month: "short", year: "numeric" })}`;
}

export function formatGrams(grams: number): string {
  const rounded = grams >= 100 ? Math.round(grams / 5) * 5 : Math.round(grams);
  return `${rounded} g`;
}

function createFredrikMeal(time: string, meal: PlannedMeal): FredrikMeal {
  const recipe = meal.recipe ? resolveRecipeReference(meal.recipe) : undefined;
  const title = meal.title ?? recipe?.title;

  if (!title) {
    throw new Error("Et planlagt måltid må ha tittel eller oppskriftsreferanse");
  }

  return {
    title,
    href: recipe?.href,
    ingredients: resolveIngredientLabels(meal.ingredients),
    details: meal.details,
    time,
    nutrition: calculateNutrition(meal.ingredients),
    nutritionTracked: meal.nutritionTracked !== false,
  };
}

function resolveIngredientLabels(
  ingredients: IngredientAmount[],
): ResolvedIngredientAmount[] {
  return ingredients.map((ingredient) => ({
    ...ingredient,
    label: ingredient.label ?? getFoodLabel(ingredient.foodId),
  }));
}

function createPlanWeek(monday: Date): DatedPlanWeek {
  const weekNumber = getIsoWeek(monday);
  const weeksSinceEpoch = Math.floor(
    (monday.getTime() - rotationEpoch) / millisecondsPerWeek,
  );
  const type = ((weeksSinceEpoch % 2) + 2) % 2 === 0 ? "A" : "B";
  const days = dayProfiles.map((profile, index) => {
    const dinner = dinnerRotation[type][profile.name];

    return {
      date: addDays(monday, index),
      profile,
      dinner: {
        ...dinner,
        ...resolveRecipeReference(dinner.recipe),
      },
    };
  });

  return {
    type,
    weekNumber,
    start: monday,
    end: addDays(monday, 6),
    days,
  };
}

function getOsloDate(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)));
}

function startOfWeek(date: Date): Date {
  const day = date.getUTCDay() || 7;
  return addDays(date, 1 - day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function getIsoWeek(date: Date): number {
  const thursday = new Date(date);
  const day = thursday.getUTCDay() || 7;
  thursday.setUTCDate(thursday.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  return Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}
