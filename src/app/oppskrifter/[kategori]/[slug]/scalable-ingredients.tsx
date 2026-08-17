"use client";

import {
  familyPreset,
  formatIngredientAmount,
  getFamilyScale,
  type FamilySize,
  type RecipeIngredientGroup,
} from "@/lib/recipe-ingredients";
import { useState } from "react";

interface ScalableIngredientsProps {
  baseAdultPortions?: number;
  groups: RecipeIngredientGroup[];
  yieldLabel: string;
}

export function ScalableIngredients({
  baseAdultPortions,
  groups,
  yieldLabel,
}: ScalableIngredientsProps) {
  const [family, setFamily] = useState<FamilySize | null>(familyPreset);
  const scale = family && baseAdultPortions
    ? getFamilyScale(baseAdultPortions, family)
    : 1;

  function updateFamily(key: keyof FamilySize, change: number) {
    setFamily((current) => {
      const next = current ?? familyPreset;
      const minimum = key === "adults" ? 1 : 0;
      return { ...next, [key]: Math.max(minimum, next[key] + change) };
    });
  }

  return (
    <section className="recipe-ingredients" aria-labelledby="ingredienser">
      <div className="recipe-ingredients__heading">
        <div>
          <p className="eyebrow">
            {baseAdultPortions ? "Tilpass mengden" : "Oppskriften"}
          </p>
          <h2 id="ingredienser">Ingredienser</h2>
        </div>
        {baseAdultPortions ? (
          <div className="serving-controls">
            <div
              className="serving-presets"
              role="group"
              aria-label="Velg porsjonsstørrelse"
            >
              <button
                type="button"
                className={family ? "" : "is-active"}
                aria-pressed={!family}
                onClick={() => setFamily(null)}
              >
                Original{yieldLabel ? ` · ${yieldLabel}` : ""}
              </button>
              <button
                type="button"
                className={family?.adults === 2 && family?.children === 0 ? "is-active" : ""}
                aria-pressed={family?.adults === 2 && family?.children === 0}
                onClick={() => setFamily(familyPreset)}
              >
                Vår familie
              </button>
            </div>

            {family ? (
              <div
                className="family-counters"
                role="group"
                aria-label="Tilpass familiestørrelse"
              >
                <FamilyCounter
                  label="Voksne"
                  value={family.adults}
                  minimum={1}
                  onDecrease={() => updateFamily("adults", -1)}
                  onIncrease={() => updateFamily("adults", 1)}
                />
                <FamilyCounter
                  label="Barn"
                  value={family.children}
                  minimum={0}
                  onDecrease={() => updateFamily("children", -1)}
                  onIncrease={() => updateFamily("children", 1)}
                />
              </div>
            ) : null}

            <p className="serving-controls__summary" aria-live="polite">
              {family
                ? `${family.adults} voksne${family.children > 0 ? ` + ${family.children} barn` : ""} · ${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(scale)}× originalen`
                : "Viser originaloppskriften"}
            </p>
            <p className="serving-controls__note">
              Mengder med alternative mål må skaleres manuelt.
            </p>
          </div>
        ) : null}
      </div>

      <div className="ingredient-groups">
        {groups.map((group, groupIndex) => (
          <section className="ingredient-group" key={`${group.title ?? "ingredienser"}-${groupIndex}`}>
            {group.title ? <h3>{group.title}</h3> : null}
            <ul>
              {group.items.map((ingredient, ingredientIndex) => {
                const amount = formatIngredientAmount(ingredient, scale);

                return (
                  <li key={`${ingredient.text}-${ingredientIndex}`}>
                    {amount ? <strong>{amount}</strong> : null}
                    <span className={amount ? "" : "ingredient-group__full-width"}>
                      {ingredient.text}
                      {ingredient.optional ? <small>Valgfritt</small> : null}
                      {ingredient.scalable === false ? <small>Skaler manuelt</small> : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

interface FamilyCounterProps {
  label: string;
  value: number;
  minimum: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

function FamilyCounter({
  label,
  value,
  minimum,
  onDecrease,
  onIncrease,
}: FamilyCounterProps) {
  return (
    <div className="family-counter">
      <span>{label}</span>
      <div>
        <button
          type="button"
          aria-label={`Færre ${label.toLocaleLowerCase("nb")}`}
          disabled={value <= minimum}
          onClick={onDecrease}
        >
          −
        </button>
        <output aria-label={`Antall ${label.toLocaleLowerCase("nb")}`}>{value}</output>
        <button
          type="button"
          aria-label={`Flere ${label.toLocaleLowerCase("nb")}`}
          onClick={onIncrease}
        >
          +
        </button>
      </div>
    </div>
  );
}
