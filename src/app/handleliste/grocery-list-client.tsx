"use client";

import styles from "./grocery-list.module.css";
import type {
  GroceryList,
  GroceryListLine,
  GroceryRetailerOffer,
} from "@/lib/grocery-list";
import { startTransition, useEffect, useState } from "react";

interface GroceryListClientProps {
  list: GroceryList;
}

type SortMode = "store" | "category" | "alphabetical";
type OfferPreferences = Record<string, string>;
type CheckedItems = Record<string, boolean>;

interface DisplayLine {
  line: GroceryListLine;
  offer: GroceryRetailerOffer;
}

const preferenceStorageKey = "matkompass:grocery-preferences:v1";
const sectionLabels = {
  buy: "Kjøp",
  check: "Sjekk hjemme",
  optional: "Valgfritt",
} as const;
const sectionOrder = { buy: 0, check: 1, optional: 2 } as const;

export function GroceryListClient({ list }: GroceryListClientProps) {
  const checkedStorageKey = "week" in list
    ? `matkompass:grocery-checked:${list.range.startDate}:v1`
    : `matkompass:grocery-checked:${list.range.startDate}:${list.range.endDate}:v1`;
  const [sortMode, setSortMode] = useState<SortMode>("store");
  const [preferences, setPreferences] = useState<OfferPreferences>({});
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setPreferences(readStorage<OfferPreferences>(preferenceStorageKey));
    setCheckedItems(readStorage<CheckedItems>(checkedStorageKey));
  }, [checkedStorageKey]);

  const displayLines = list.lines.map((line) => ({
    line,
    offer: getSelectedOffer(line, preferences[line.id]),
  }));
  const groups = groupLines(displayLines, sortMode);
  const completedCount = displayLines.filter(({ line }) => checkedItems[line.id]).length;

  function handleOfferChange(line: GroceryListLine, offerId: string) {
    const offer = getSelectedOffer(line, offerId);
    const nextPreferences = { ...preferences, [line.id]: offer.id };

    writeStorage(preferenceStorageKey, nextPreferences);
    setAnnouncement(`${line.label} er flyttet til ${offer.retailerLabel}.`);
    startTransition(() => setPreferences(nextPreferences));
  }

  function handleCheckedChange(lineId: string, checked: boolean) {
    const nextCheckedItems = { ...checkedItems, [lineId]: checked };
    writeStorage(checkedStorageKey, nextCheckedItems);
    setCheckedItems(nextCheckedItems);
  }

  return (
    <section className={styles.listSection} aria-labelledby="periodens-varer">
      <header className={styles.toolbar}>
        <div>
          <p className="eyebrow">{completedCount} av {displayLines.length} håndtert</p>
          <h2 id="periodens-varer">Varer for perioden</h2>
        </div>
        <div className={styles.toolbarActions}>
          <button
            className={styles.resetButton}
            onClick={() => {
              writeStorage(preferenceStorageKey, {});
              setAnnouncement("Butikkvalgene er tilbakestilt til Oda.");
              startTransition(() => setPreferences({}));
            }}
            type="button"
          >
            Tilbakestill butikker
          </button>
          <label className={styles.sortControl}>
            <span>Sorter etter</span>
            <select
              value={sortMode}
              onChange={(event) => {
                const value = event.target.value as SortMode;
                startTransition(() => setSortMode(value));
              }}
            >
              <option value="store">Butikk</option>
              <option value="category">Varegruppe</option>
              <option value="alphabetical">A–Å</option>
            </select>
          </label>
        </div>
      </header>

      <p className="sr-only" aria-live="polite">{announcement}</p>

      <div className={styles.groups}>
        {groups.map((group) => (
          <section className={styles.group} key={group.label} aria-labelledby={group.id}>
            <header className={styles.groupHeader}>
              <h3 id={group.id}>{group.label}</h3>
              <span>{group.lines.length} varer</span>
            </header>
            <ul className={styles.items}>
              {group.lines.map(({ line, offer }) => {
                const checkboxId = `grocery-${line.id}`;
                const isChecked = checkedItems[line.id] ?? false;

                return (
                  <li className={`${styles.item}${isChecked ? ` ${styles.checked}` : ""}`} key={line.id}>
                    <div className={styles.itemMain}>
                      <input
                        aria-label={`Marker ${line.label} som håndtert`}
                        checked={isChecked}
                        className={styles.checkbox}
                        id={checkboxId}
                        onChange={(event) => handleCheckedChange(line.id, event.target.checked)}
                        type="checkbox"
                      />
                      <div className={styles.itemCopy}>
                        <label htmlFor={checkboxId}>{line.label}</label>
                        <span className={styles.meta}>
                          {sectionLabels[line.section]} · {line.category}
                        </span>
                        <dl className={styles.amounts}>
                          <div>
                            <dt>Behov</dt>
                            <dd>{line.requiredLabel}</dd>
                          </div>
                          <div>
                            <dt>Kjøp</dt>
                            <dd>{offer.purchaseLabel}</dd>
                          </div>
                        </dl>
                        {line.conversionNote ? (
                          <p className={styles.conversionNote}>{line.conversionNote}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className={styles.itemActions}>
                      <label>
                        <span>Butikk</span>
                        <select
                          aria-label={`Velg butikk for ${line.label}`}
                          value={offer.id}
                          onChange={(event) => handleOfferChange(line, event.target.value)}
                        >
                          {line.offers.map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                              {candidate.retailerLabel}
                            </option>
                          ))}
                        </select>
                      </label>
                      <a href={offer.url} rel="noreferrer" target="_blank">
                        Søk hos {offer.retailerLabel}
                        <span aria-hidden="true"> ↗</span>
                        <span className="sr-only">, åpnes i ny fane</span>
                      </a>
                    </div>

                    <details className={styles.sources}>
                      <summary>Vis måltider</summary>
                      <ul>
                        {line.sources.map((source) => <li key={source}>{source}</li>)}
                      </ul>
                    </details>
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

function getSelectedOffer(line: GroceryListLine, preferredOfferId?: string) {
  return line.offers.find((offer) => offer.id === preferredOfferId) ??
    line.offers.find((offer) => offer.id === line.defaultOfferId) ??
    line.offers[0];
}

function groupLines(lines: DisplayLine[], sortMode: SortMode) {
  const sorted = lines.toSorted((a, b) => compareDisplayLines(a, b, sortMode));
  const groups = new Map<string, DisplayLine[]>();

  for (const line of sorted) {
    const label =
      sortMode === "store"
        ? `${line.offer.retailerLabel} · ${sectionLabels[line.line.section]}`
        : sortMode === "category"
          ? line.line.category
          : "Alle varer";
    const existing = groups.get(label) ?? [];
    existing.push(line);
    groups.set(label, existing);
  }

  return [...groups].map(([label, groupLines], index) => ({
    id: `grocery-group-${index}`,
    label,
    lines: groupLines,
  }));
}

function compareDisplayLines(a: DisplayLine, b: DisplayLine, sortMode: SortMode) {
  if (sortMode === "store") {
    const storeDifference = a.offer.retailerOrder - b.offer.retailerOrder;
    const sectionDifference = sectionOrder[a.line.section] - sectionOrder[b.line.section];
    return storeDifference || sectionDifference || a.line.label.localeCompare(b.line.label, "nb");
  }

  if (sortMode === "category") {
    const categoryDifference = a.line.categoryOrder - b.line.categoryOrder;
    return categoryDifference || a.line.label.localeCompare(b.line.label, "nb");
  }

  return a.line.label.localeCompare(b.line.label, "nb");
}

function readStorage<T extends object>(key: string): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : {} as T;
  } catch {
    return {} as T;
  }
}

function writeStorage(key: string, value: object) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The list remains usable when storage is disabled or full.
  }
}
