import { NutritionSummary } from "@/app/_components/nutrition-summary";
import { ScrollToTarget } from "@/app/_components/scroll-to-target";
import {
  foodDataSource,
  formatDate,
  formatDateRange,
  formatGrams,
  getActiveFredrikFuelTrial,
  getCurrentPlanWeeks,
  getFredrikPlanDay,
  getTodayInOslo,
  mealPlanNutritionMetadata,
} from "@/lib/meal-plan";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Fredriks ukeplan",
  description:
    "Fredriks måltider, porsjoner og makromål for inneværende kalenderuke.",
};

export default async function FredrikWeekPlanPage() {
  await connection();
  const now = new Date();
  const [week] = getCurrentPlanWeeks(now);
  const days = week.days.map(getFredrikPlanDay);
  const today = getTodayInOslo(now).toISOString().slice(0, 10);
  const fuelTrial = getActiveFredrikFuelTrial(now);

  return (
    <main className="content-page plan-page fredrik-plan">
      <ScrollToTarget block="start" targetId="fredriks-plan-i-dag" />
      <header className="page-intro plan-intro">
        <p className="eyebrow">Uke {week.weekNumber} · Plan {week.type}</p>
        <h1>Fredriks ukeplan</h1>
        <p className="page-intro__description">
          Tre faste måltider hver dag. Protein er et absolutt gulv, oppskriftene
          beholdes, og karbohydrat maksimeres innenfor energirammen.
        </p>
        <p className="plan-intro__dates">{formatDateRange(week.start, week.end)}</p>
      </header>

      <nav className="week-jump-nav" aria-label="Hopp til ukedag">
        {days.map((day) => {
          const isToday = day.date.toISOString().slice(0, 10) === today;

          return (
            <a
              aria-current={isToday ? "date" : undefined}
              href={`#${day.profile.name.toLowerCase()}`}
              key={day.profile.name}
            >
              {day.profile.shortName}
            </a>
          );
        })}
      </nav>

      <section className="macro-key" aria-labelledby="dagsmaal">
        <div>
          <p className="eyebrow">Dagsmål</p>
          <h2 id="dagsmaal">Samme grunnmål hver dag</h2>
        </div>
        <p>
          Grunnplanen skal ligge innenfor ±100 kcal av 1 950 kcal og aldri under
          160 g protein. Omtrent 200 g karbohydrat er et mykt mål; fett får variere
          med oppskriftene. Valgfritt treningsdrivstoff kommer i tillegg.
        </p>
      </section>

      {fuelTrial ? (
        <section className="macro-key fuel-trial" aria-labelledby="drivstofftest">
          <div>
            <p className="eyebrow">Tidsavgrenset prøve</p>
            <h2 id="drivstofftest">Karbohydrat før morgenøkter</h2>
          </div>
          <p>
            <time dateTime={fuelTrial.startsOn}>
              {formatDate(new Date(`${fuelTrial.startsOn}T00:00:00Z`))}
            </time>
            –
            <time dateTime={fuelTrial.endsOn}>
              {formatDate(new Date(`${fuelTrial.endsOn}T00:00:00Z`))}
            </time>
            : Spis omtrent {fuelTrial.preTrainingCarbs} g {fuelTrial.guidance} Før
            forsøket var regelen: {fuelTrial.previousGuidance}
            {` Vurderes ${formatDate(new Date(`${fuelTrial.reviewOn}T00:00:00Z`))}: ${fuelTrial.successCriteria}`}
          </p>
        </section>
      ) : null}

      <section className="prep-guide" aria-labelledby="batchplan">
        <header>
          <p className="eyebrow">Minst mulig matlaging</p>
          <h2 id="batchplan">Batchmat for ukedager og helg.</h2>
          <p>
            Mandag og torsdag pakkes på forhånd. Tirsdagens frokost og lunsj lages
            dobbelt, slik at onsdag bare krever oppvarming og montering. Lørdagens
            eggerøre lages samtidig til søndag, og proteinvaflene pakkes til familien.
          </p>
        </header>
        <div className="prep-guide__steps">
          <section>
            <p className="eyebrow">Søndag</p>
            <h3>Gjør kontordagene klare</h3>
            <ul>
              <li>Bak søtpotet til mandag og tirsdag.</li>
              <li>Porsjoner cottage cheese, banan, valnøtter, honning og ferdigbakt søtpotet.</li>
              <li>Pakk de kalde delene; åpne tunfisken ved servering.</li>
            </ul>
          </section>
          <section>
            <p className="eyebrow">Tirsdag</p>
            <h3>Lag dobbelt</h3>
            <ul>
              <li>Stek dobbel eggerørebase med ytrefilet.</li>
              <li>Lag to hormonbalanseboller med kylling.</li>
              <li>Sett onsdagsporsjonene raskt kaldt og oppbevar avokadoen separat.</li>
            </ul>
          </section>
          <section>
            <p className="eyebrow">Onsdag kveld</p>
            <h3>Fyll opp til helgen</h3>
            <ul>
              <li>Bak søtpotet til torsdag–søndag.</li>
              <li>Pakk torsdagens cottage cheese-frokost og tunfisklunsj.</li>
              <li>Kok ekstra villris eller quinoa når middagen allerede bruker det, og frys porsjonene.</li>
            </ul>
          </section>
          <section>
            <p className="eyebrow">Lørdag</p>
            <h3>Lag helgefrokost dobbelt</h3>
            <ul>
              <li>Lag dobbel eggerøre med karbonadedeig og sett av søndagsporsjonen.</li>
              <li>Kjøl restene raskt ned og varm dem helt gjennom søndag.</li>
              <li>Lag og pakk proteinvafler til hele familien.</li>
            </ul>
          </section>
        </div>
        <aside
          className="prep-guide__note"
          aria-labelledby="sotpotet-batch-label sotpotet-batch"
        >
          <div>
            <p className="eyebrow" id="sotpotet-batch-label">Søtpotet i batch</p>
            <h3 id="sotpotet-batch">Hel for minst arbeid, terninger for sprø kanter.</h3>
          </div>
          <ul>
            <li>
              <strong>Hel:</strong> Skrubb søtpotetene, prikk skallet med en gaffel
              og bak ved 190 °C i 45–50 minutter, til de er helt møre.
            </li>
            <li>
              <strong>I terninger:</strong> Skjær i omtrent 2 cm store terninger.
              Vend dem i oljen eller gheen som allerede står oppført i måltidet,
              krydre med salt og bak ved 200 °C i 25–30 minutter. Vend halvveis.
            </li>
            <li>
              Gramvektene i planen gjelder rå søtpotet. Vei batchen før steking,
              avkjøl raskt og fordel den etter dagsmengdene. Frys porsjonene som
              skal spises senere i uken, og tin dem i kjøleskapet.
            </li>
          </ul>
        </aside>
      </section>

      <div className="fredrik-days">
        {days.map((day) => {
          const date = day.date.toISOString().slice(0, 10);
          const dayId = day.profile.name.toLowerCase();
          const isToday = date === today;

          return (
            <article
              aria-labelledby={`${dayId}-heading`}
              className={`fredrik-day${isToday ? " fredrik-day--today" : ""}`}
              id={dayId}
              key={day.date.toISOString()}
            >
              <header
                className="fredrik-day__header"
                id={isToday ? "fredriks-plan-i-dag" : undefined}
              >
                <div>
                  <p className="eyebrow">
                    {day.profile.kind === "long"
                      ? "Langkjøring"
                      : day.profile.kind === "active"
                        ? "Aktiv dag"
                        : "Hviledag"}
                    {day.profile.officeDay ? " · Kontor" : ""}
                  </p>
                  <h2 id={`${dayId}-heading`}>{day.profile.name}</h2>
                  <time dateTime={date} aria-current={isToday ? "date" : undefined}>
                    {formatDate(day.date)}
                  </time>
                  {isToday ? <span className="fredrik-day__today-label">I dag</span> : null}
                </div>
                <NutritionSummary
                  label="Planlagt / mål"
                  nutrition={day.nutrition}
                  target={day.target}
                />
              </header>

              <div className="meal-timeline">
                {day.meals.map((meal) => (
                  <section className="meal-card" key={`${meal.time}-${meal.title}`}>
                    <p className="meal-card__time">{meal.time}</p>
                    <h3>
                      {meal.href ? <Link href={meal.href}>{meal.title}</Link> : meal.title}
                    </h3>
                    <ul className="amount-list">
                      {meal.ingredients.map((ingredient) => (
                        <li key={`${ingredient.foodId}-${ingredient.label}`}>
                          <span>{ingredient.label}</span>
                          <strong>{formatGrams(ingredient.grams)}</strong>
                        </li>
                      ))}
                    </ul>
                    {meal.details?.map((detail) => <p className="meal-card__detail" key={detail}>{detail}</p>)}
                    <NutritionSummary label="Måltidet" nutrition={meal.nutrition} />
                  </section>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <aside className="plan-source" aria-labelledby="fredrik-beregning">
        <p className="eyebrow">Datagrunnlag</p>
        <h2 id="fredrik-beregning">Beregnet fra mat, ikke fra generiske måltider.</h2>
        <p>
          Hver råvare er veid i gram og beregnet med {foodDataSource.name}, hentet
          {` ${foodDataSource.retrievedAt}`}. Planen ble beregnet
          {` ${mealPlanNutritionMetadata.calculatedAt}`}. Verdiene er representative estimater;
          produkt, råvare og tilberedning vil gi noe naturlig variasjon.
        </p>
        {mealPlanNutritionMetadata.notes.map((note) => <p key={note}>{note}</p>)}
        <Link href="/middagsplan">Se familiens middagsplan</Link>
      </aside>
    </main>
  );
}
