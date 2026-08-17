import {
  dinnerShares,
  getActiveFredrikFuelTrial,
  getCurrentPlanWeeks,
  getDinnerIngredients,
  getFredrikPlanDay,
  getTodayInOslo,
  roundNutrition,
} from "../src/lib/meal-plan";
import { daytimeMeals } from "../src/content/meal-plan";

const weeks = getCurrentPlanWeeks(new Date("2026-07-20T12:00:00Z"));
const calorieTolerance = 100;
const proteinMinimum = 160;
const preferredRanges = {
  fat: { min: 50, max: 70 },
  carbs: { min: 185, max: 210 },
} as const;
const expectedRotation = {
  A: [
    "sitron-og-urtekylling-med-gronnsaker-i-en-panne",
    "biffbiter",
    "poke-med-varmebehandlet-laks-og-quinoa",
    "salatinnpakkede-storfeburgere",
    "stopjernsbiff-med-avgiftende-bladgront",
    "betennelsesdempende-kyllingcurrybolle",
    "hvitloksreker-med-squashnudler-i-en-panne",
  ],
  B: [
    "laksetaco-i-hjertesalat",
    "stopjernsbiff-med-avgiftende-bladgront",
    "rene-kalkunkjottboller-med-blomkalmos",
    "villaks-med-sitron-dill-og-ovnsstekte-gronnsaker",
    "biffbiter",
    "tacobowl-med-sotpotet-og-cottage-cheese",
    "kyllinggryte-med-gurkemeie-og-kokos",
  ],
} as const;
const steakRecipes = new Set([
  "biffbiter",
  "stopjernsbiff-med-avgiftende-bladgront",
]);
const dinnerParticipants = ["Fredrik", "Kamilla"] as const;
let failed = false;

if (dinnerShares.Fredrik !== dinnerShares.Kamilla) {
  throw new Error("Fredrik og Kamilla skal alltid ha samme grunnandel av middagen");
}

if (Object.values(dinnerShares).reduce((sum, share) => sum + share, 0) !== 1) {
  throw new Error("Middagsandelene skal til sammen være 100 %");
}

if (Object.keys(dinnerShares).length !== 2) {
  throw new Error("Middagsplanen skal bare fordeles mellom de to voksne");
}

const steakTipsDay = weeks
  .flatMap((week) => week.days)
  .find((day) => day.dinner.recipe.slug === "biffbiter");
const fredriksSteak = steakTipsDay
  ? getDinnerIngredients("Fredrik", steakTipsDay.dinner).find(
      (ingredient) => ingredient.foodId === "03.066",
    )
  : undefined;

if (!fredriksSteak || Math.abs(fredriksSteak.grams - 224.825) > 0.0001) {
  throw new Error("To-voksenfordelingen skal bevare Fredriks eksisterende biffmengde");
}

for (const [day, meals] of Object.entries(daytimeMeals)) {
  if (meals.some((meal) => meal?.ingredients.some((ingredient) => ingredient.foodId === "02.002"))) {
    throw new Error(`${day} bruker eggehvite som separat proteintillegg`);
  }
}

for (const week of weeks) {
  console.log(`\nUke ${week.weekNumber} (${week.type})`);

  const actualRotation = week.days.map((day) => day.dinner.recipe.slug);
  const rotationMatches = actualRotation.every(
    (slug, index) => slug === expectedRotation[week.type][index],
  );
  const steakDays = actualRotation
    .map((slug, index) => (steakRecipes.has(slug) ? index : -1))
    .filter((index) => index >= 0);

  if (!rotationMatches || steakDays.join(",") !== "1,4") {
    console.error(`FEIL Uke ${week.type} samsvarer ikke med fast rotasjon og biffdager`);
    failed = true;
  }

  for (const day of week.days) {
    for (const person of dinnerParticipants) {
      const ingredients = getDinnerIngredients(person, day.dinner);
      const hasExactShare =
        ingredients.length === day.dinner.plannedIngredients.length &&
        ingredients.every(
          (ingredient, index) =>
            ingredient.foodId === day.dinner.plannedIngredients[index].foodId &&
            ingredient.grams ===
              day.dinner.plannedIngredients[index].grams * dinnerShares[person],
        );

      if (!hasExactShare) {
        console.error(
          `FEIL ${day.profile.name}: ${person} har ingredienser utenfor den faste middagsandelen`,
        );
        failed = true;
      }
    }

    const plan = getFredrikPlanDay(day);
    const actual = roundNutrition(plan.nutrition);

    if (!plan.nutritionComplete) {
      const untrackedMeals = plan.meals.filter((meal) => !meal.nutritionTracked);
      const hasEmptyOfficeMeals = day.profile.officeDay && plan.meals.length === 1;

      if (!hasEmptyOfficeMeals || untrackedMeals.length !== 0) {
        console.error(
          `FEIL ${day.profile.name}: bare kontordager kan ha tom frokost og lunsj`,
        );
        failed = true;
      } else {
        console.log(
          `UFULLSTENDIG ${day.profile.name.padEnd(8)} ` +
            `${actual.calories} kcal, P ${actual.protein}, F ${actual.fat}, K ${actual.carbs} ` +
            `(frokost og lunsj er tomme)`,
        );
      }

      continue;
    }

    const differences = {
      calories: actual.calories - plan.target.calories,
      protein: actual.protein - plan.target.protein,
      fat: actual.fat - plan.target.fat,
      carbs: actual.carbs - plan.target.carbs,
    };
    const valid =
      Math.abs(differences.calories) <= calorieTolerance &&
      actual.protein >= proteinMinimum;
    const preferences = [
      actual.fat < preferredRanges.fat.min || actual.fat > preferredRanges.fat.max
        ? `fett ${actual.fat} g utenfor foretrukket ${preferredRanges.fat.min}–${preferredRanges.fat.max} g`
        : null,
      actual.carbs < preferredRanges.carbs.min || actual.carbs > preferredRanges.carbs.max
        ? `karbohydrat ${actual.carbs} g utenfor foretrukket ${preferredRanges.carbs.min}–${preferredRanges.carbs.max} g`
        : null,
    ].filter((preference): preference is string => preference !== null);

    if (!valid) {
      failed = true;
    }

    console.log(
      `${valid ? "OK" : "FEIL"} ${day.profile.name.padEnd(8)} ` +
        `${actual.calories} kcal, P ${actual.protein}, F ${actual.fat}, K ${actual.carbs} ` +
        `(avvik ${differences.calories >= 0 ? "+" : ""}${differences.calories} kcal, ` +
        `P ${differences.protein >= 0 ? "+" : ""}${differences.protein}, ` +
        `F ${differences.fat >= 0 ? "+" : ""}${differences.fat}, ` +
        `K ${differences.carbs >= 0 ? "+" : ""}${differences.carbs})`,
    );

    if (preferences.length > 0) {
      console.log(`  ADVARSEL ${preferences.join("; ")}`);
    }

    if (!valid) {
      for (const meal of plan.meals) {
        const nutrition = roundNutrition(meal.nutrition);
        console.log(
          `  ${meal.time.padEnd(16)} ${nutrition.calories} kcal, P ${nutrition.protein}, F ${nutrition.fat}, K ${nutrition.carbs}`,
        );
      }
    }
  }
}

if (failed) {
  process.exitCode = 1;
}

const [lastWeekOf2026] = getCurrentPlanWeeks(new Date("2026-12-28T12:00:00Z"));
const [firstWeekOf2027] = getCurrentPlanWeeks(new Date("2027-01-04T12:00:00Z"));

if (lastWeekOf2026.type === firstWeekOf2027.type) {
  console.error("FEIL A/B-rotasjonen gjentas over årsskiftet");
  process.exitCode = 1;
} else {
  console.log(
    `\nOK Årsskifte: uke ${lastWeekOf2026.weekNumber} (${lastWeekOf2026.type}) → ` +
      `uke ${firstWeekOf2027.weekNumber} (${firstWeekOf2027.type})`,
  );
}

const osloDateAfterUtcMidnight = getTodayInOslo(
  new Date("2026-07-26T22:30:00Z"),
).toISOString().slice(0, 10);

if (osloDateAfterUtcMidnight !== "2026-07-27") {
  console.error(`FEIL Oslo-dato: forventet 2026-07-27, fikk ${osloDateAfterUtcMidnight}`);
  process.exitCode = 1;
} else {
  console.log("OK Oslo-dato følger lokal kalenderdag");
}

const fuelTrialAtStart = getActiveFredrikFuelTrial(
  new Date("2026-08-03T12:00:00Z"),
);
const fuelTrialAfterReview = getActiveFredrikFuelTrial(
  new Date("2026-08-17T12:00:00Z"),
);

if (
  fuelTrialAtStart?.preTrainingCarbs !== 30 ||
  fuelTrialAfterReview !== undefined
) {
  console.error("FEIL Den tidsavgrensede drivstoffprøven har feil gyldighet");
  process.exitCode = 1;
} else {
  console.log("OK Drivstoffprøven er datobundet og utløper etter vurderingsdatoen");
}
