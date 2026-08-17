import {
  familyPreset,
  formatIngredientAmount,
  getFamilyScale,
} from "../src/lib/recipe-ingredients";
import { getAllRecipes } from "../src/lib/recipes";

const recipes = getAllRecipes();

assert(recipes.length === 58, `Forventet 58 oppskrifter, fant ${recipes.length}`);

for (const recipe of recipes) {
  assert(recipe.ingredients.length > 0, `${recipe.slug} mangler ingrediensgrupper`);
  assert(
    !recipe.content.includes("## Ingredienser"),
    `${recipe.slug} har duplisert ingrediensseksjon i Markdown-innholdet`,
  );

  if (["frokost", "lunsj", "middag"].includes(recipe.category)) {
    assert(
      recipe.baseAdultPortions !== undefined,
      `${recipe.slug} mangler grunnlag for familieporsjoner`,
    );
  }

  for (const group of recipe.ingredients) {
    for (const ingredient of group.items) {
      if (ingredient.amount === undefined && /[0-9¼½¾]/.test(ingredient.text)) {
        assert(
          ingredient.scalable === false,
          `${recipe.slug} har en tekstmengde som ikke er merket for manuell skalering`,
        );
      }
    }
  }
}

assert(
  getFamilyScale(2, familyPreset) === 1,
  "Familiefaktoren for to grunnporsjoner er feil",
);
assert(
  Math.abs(getFamilyScale(1, { adults: 1, children: 1 }) - 1.35) < 0.0001,
  "Ett barn skal tilsvare 0,35 voksenporsjon",
);
assert(
  formatIngredientAmount({ amount: 450, unit: "g", text: "kylling" }, 1) ===
    "450 g",
  "Gram skal avrundes til praktisk kjøkkenmengde",
);
assert(
  formatIngredientAmount({ amount: 0.5, unit: "ts", text: "salt" }) === "½ ts",
  "Originale kjøkkenbrøker skal bevares",
);
assert(
  formatIngredientAmount({ text: "salt etter smak" }, 1.175) === null,
  "Ingredienser uten mengde skal ikke skaleres",
);
assert(
  formatIngredientAmount(
    { amount: 1, maxAmount: 2, unit: "ts", text: "oregano", approximate: true },
    1.175,
  ) === "ca. 1¼–2¼ ts",
  "Intervaller og omtrentlige mengder skal skaleres",
);

const chickenStew = recipes.find(
  (recipe) => recipe.slug === "kyllinggryte-med-gurkemeie-og-kokos",
);
const onion = chickenStew?.ingredients
  .flatMap((group) => group.items)
  .find((ingredient) => ingredient.text.startsWith("løk"));

assert(
  onion?.amount === 0.5 && onion.unit === undefined,
  "En halv løk skal ikke tolkes som liter",
);

assertRecipeFat("hormonbalansebolle", "olivenolje", 2);
assertRecipeFat(
  "sitron-og-urtekylling-med-gronnsaker-i-en-panne",
  "olivenolje",
  2,
);
assertRecipeFat(
  "villaks-med-sitron-dill-og-ovnsstekte-gronnsaker",
  "olivenolje",
  1,
);
assertRecipeFat("salatinnpakkede-storfeburgere", "avokadoolje", 1);

const hormoneHarmonyBowl = recipes.find(
  (recipe) => recipe.slug === "hormonbalansebolle",
);
assert(
  !hormoneHarmonyBowl?.ingredients
    .flatMap((group) => group.items)
    .some((ingredient) => ingredient.text.toLocaleLowerCase("nb").includes("ghee")),
  "Hormonbalansebollen skal ikke inneholde ghee ifølge wiki-råkilden",
);

console.log(
  `Alle ${recipes.length} oppskrifter har gyldige strukturerte ingredienser og skaleringsregler.`,
);

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertRecipeFat(slug: string, text: string, amount: number) {
  const recipe = recipes.find((candidate) => candidate.slug === slug);
  const ingredient = recipe?.ingredients
    .flatMap((group) => group.items)
    .find((candidate) => candidate.text === text);

  assert(
    ingredient?.amount === amount && ingredient.unit === "ss",
    `${slug} skal inneholde ${amount} ss ${text} ifølge wiki-råkilden`,
  );
}
