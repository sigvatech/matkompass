import { ScrollToTarget } from "@/app/_components/scroll-to-target";
import {
  formatDate,
  formatDateRange,
  getCurrentPlanWeeks,
  getTodayInOslo,
} from "@/lib/meal-plan";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Middagsplan",
  description:
    "Familiens faste toukersplan med én oppskrift for hver dag.",
};

export default async function DinnerPlanPage() {
  await connection();
  const weeks = getCurrentPlanWeeks();
  const today = getTodayInOslo().toISOString().slice(0, 10);

  return (
    <main className="content-page plan-page">
      <ScrollToTarget behavior="auto" targetId="middag-i-dag" />
      <header className="page-intro plan-intro">
        <p className="eyebrow">Denne og neste kalenderuke</p>
        <h1>Middagsplan</h1>
        <p className="page-intro__description">
          Se hva vi skal spise i dag, og åpne oppskriften for ingredienser og
          fremgangsmåte.
        </p>
      </header>

      {weeks.map((week, weekIndex) => (
        <section className="plan-week" key={week.weekNumber} aria-labelledby={`uke-${week.weekNumber}`}>
          <header className="plan-week__header">
            <div>
              <p className="eyebrow">{weekIndex === 0 ? "Denne uken" : "Neste uke"}</p>
              <h2 id={`uke-${week.weekNumber}`}>Uke {week.weekNumber} · Plan {week.type}</h2>
            </div>
            <p>{formatDateRange(week.start, week.end)}</p>
          </header>

          <div className="dinner-plan-list">
            {week.days.map((day) => {
              const date = day.date.toISOString().slice(0, 10);
              const isToday = date === today;

              return (
                <Link
                  className={`dinner-plan-day${isToday ? " dinner-plan-day--today" : ""}`}
                  href={day.dinner.href}
                  key={day.date.toISOString()}
                  id={isToday ? "middag-i-dag" : undefined}
                >
                  <span className="dinner-plan-day__date">
                    <strong>{day.profile.shortName}</strong>
                    <time dateTime={date} aria-current={isToday ? "date" : undefined}>
                      {formatDate(day.date)}
                    </time>
                  </span>
                  <span className="dinner-plan-day__title">{day.dinner.title}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
