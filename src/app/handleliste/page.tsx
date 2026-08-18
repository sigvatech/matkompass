import { GroceryListClient } from "./grocery-list-client";
import styles from "./grocery-list.module.css";
import {
  getGroceryListForDateRange,
  getWeeklyGroceryList,
  type GroceryWeekSelection,
} from "@/lib/grocery-list";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Handleliste",
  description:
    "Handleliste for Fredriks måltider og familiens middager i en valgt periode.",
};

interface GroceryListPageProps {
  searchParams: Promise<{
    uke?: string | string[];
    fra?: string | string[];
    til?: string | string[];
  }>;
}

export default async function GroceryListPage({ searchParams }: GroceryListPageProps) {
  await connection();
  const params = await searchParams;
  const selection: GroceryWeekSelection = params.uke === "neste" ? "next" : "current";
  const [currentList, nextList] = [
    getWeeklyGroceryList("current"),
    getWeeklyGroceryList("next"),
  ];
  const weeklyList = selection === "current" ? currentList : nextList;
  const startValue = getStringParam(params.fra);
  const endValue = getStringParam(params.til);
  const customRange = getCustomRange(startValue, endValue);
  const list = customRange.range
    ? getGroceryListForDateRange(customRange.range.start, customRange.range.end)
    : weeklyList;
  const isCustomRange = customRange.range !== undefined;
  const hasRangeError = customRange.error !== undefined;
  const startInputValue = parseDate(startValue) ? startValue : list.period.startDate;
  const endInputValue = parseDate(endValue) ? endValue : list.period.endDate;

  return (
    <main className={`content-page ${styles.page}`}>
      <header className={`page-intro ${styles.intro}`}>
        <p className="eyebrow">
          {hasRangeError
            ? "Ugyldig periode"
            : isCustomRange
            ? "Egendefinert periode"
            : `Uke ${weeklyList.week.weekNumber} · Plan ${weeklyList.week.type}`}
        </p>
        <h1>Handleliste</h1>
        <p className="page-intro__description">
          Fredriks planlagte måltider og familiens middag, samlet uten å telle
          Fredriks middagsandel to ganger. Valgfritt treningsdrivstoff er ikke med.
        </p>
        <p className={styles.dateRange}>
          {hasRangeError ? "Rett datoene for å vise handlelisten." : list.period.label}
        </p>
      </header>

      <nav className={styles.weekNav} aria-label="Velg handleuke">
        <Link
          aria-current={!isCustomRange && selection === "current" ? "page" : undefined}
          className={!isCustomRange && selection === "current" ? styles.activeWeek : undefined}
          href="/handleliste"
        >
          Denne uken · {currentList.week.weekNumber}
        </Link>
        <Link
          aria-current={!isCustomRange && selection === "next" ? "page" : undefined}
          className={!isCustomRange && selection === "next" ? styles.activeWeek : undefined}
          href="/handleliste?uke=neste"
        >
          Neste uke · {nextList.week.weekNumber}
        </Link>
      </nav>

      <section className={styles.rangePanel} aria-labelledby="velg-periode">
        <div className={styles.rangeCopy}>
          <p className="eyebrow">Egendefinert</p>
          <h2 id="velg-periode">Velg datoene du handler for.</h2>
          <p id="periode-hjelp">
            Start- og sluttdato er med i handlelisten.
          </p>
        </div>
        <Form action="/handleliste" className={styles.rangeForm}>
          <label>
            <span>Fra</span>
            <input
              aria-describedby={`periode-hjelp${customRange.error ? " periode-feil" : ""}`}
              aria-invalid={customRange.error ? true : undefined}
              defaultValue={startInputValue}
              name="fra"
              required
              type="date"
            />
          </label>
          <label>
            <span>Til</span>
            <input
              aria-describedby={`periode-hjelp${customRange.error ? " periode-feil" : ""}`}
              aria-invalid={customRange.error ? true : undefined}
              defaultValue={endInputValue}
              name="til"
              required
              type="date"
            />
          </label>
          <button type="submit">Vis handleliste</button>
        </Form>
        {customRange.error ? (
          <p className={styles.rangeError} id="periode-feil" role="alert">
            {customRange.error}
          </p>
        ) : null}
      </section>

      {!hasRangeError ? (
        <>
          <section className={styles.explainer} aria-labelledby="slik-leses-listen">
            <div>
              <p className="eyebrow">To mengder</p>
              <h2 id="slik-leses-listen">Behov først, praktisk kjøpsmengde etterpå.</h2>
            </div>
            <p>
              Kokt ris, quinoa og potet er omregnet til mengden som kjøpes.
              Butikklenkene åpner et søk hos valgt butikk; pris og lagerstatus
              kontrolleres der.
            </p>
          </section>

          <GroceryListClient list={list} />
        </>
      ) : null}
    </main>
  );
}

function getStringParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getCustomRange(startValue?: string, endValue?: string): {
  range?: { start: Date; end: Date };
  error?: string;
} {
  if (startValue === undefined && endValue === undefined) {
    return {};
  }

  const start = parseDate(startValue);
  const end = parseDate(endValue);

  if (!start || !end) {
    return { error: "Velg både en gyldig startdato og sluttdato." };
  }

  if (start > end) {
    return { error: "Startdatoen må være før eller lik sluttdatoen." };
  }

  return { range: { start, end } };
}

function parseDate(value?: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString().slice(0, 10) === value ? date : undefined;
}
