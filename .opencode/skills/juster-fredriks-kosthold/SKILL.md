---
name: juster-fredriks-kosthold
description: Adjust Fredrik's diet in `fredriks-ukeplan` from current Athlora training and recovery data, subjective symptoms, and the LLM-wiki nutrition principles. Use whenever Fredrik asks to change calories, macros, meal timing, fasting, or workout fuel; wants a diet review for performance, recovery, or weight loss; or, in a Matkompass diet context, reports feeling weak, slow, flat, unusually hungry, poorly recovered, or terrible during training. Fredrik is the user. Do not use for training-plan-only questions, recipe-only requests, or another family member's diet.
compatibility: Requires Browser Control access to Fredrik's authenticated Athlora chat and read access to `/Users/fredriksigvartsen/my-remote-wiki`.
---

# Juster Fredriks kosthold

Juster den eksisterende planen, ikke bygg en ny diett fra bunnen av. Planen fungerer som utgangspunkt. Målet er den minste målbare endringen som støtter Fredriks trening, restitusjon, vektnedgang og hverdag uten å bryte matprinsippene eller familieplanen.

Skriv brukerrettet tekst og sluttrapport på norsk. Skriv spørsmål til Athlora i første person fordi Athlora oppfatter den som spør som Fredrik.

## Kildeansvar

Bruk hver kilde bare for det den faktisk er autoritativ for:

1. **Fredriks egen rapport** er sannheten om opplevd energi, sult, humør, prestasjon, smerte og etterlevelse.
2. **Athlora** er sannheten om gjennomført og planlagt trening og tilgjengelige trender fra Garmin, Oura, puls, hvilepuls, HRV og søvn. Athlora gir beslutningsstøtte, ikke medisinske diagnoser eller autoritative næringstall.
3. **Matkompass** er sannheten om dagens måltider, porsjoner, planregler og publiserte mål.
4. **Matvaretabellen-uttrekket** er sannheten om energi, protein, fett og karbohydrat i planen.
5. **LLM-wikien** er sannheten om hvilke Gary Brecka- og Ultimate Human-prinsipper planen bygger på, med wikiens evidens- og sikkerhetssider som nødvendig korrektiv.

Ikke la én kilde overstyre en annen på feil fagområde. Athlora kan for eksempel dokumentere en hard treningsuke, men de faktiske planmakroene skal fortsatt beregnes fra Matvaretabellen.

## Les ved hver kjøring

Les siste versjon av disse prosjektfilene for å forstå gjeldende plan:

- `CONTEXT.md`
- `src/content/meal-plan.ts`
- `src/lib/meal-plan.ts`

Les deretter `/Users/fredriksigvartsen/my-remote-wiki/CLAUDE.md` og `/Users/fredriksigvartsen/my-remote-wiki/index.md`. Finn de nyeste relevante sidene gjennom indeksen. Les minst de kanoniske prinsippene, utholdenhetsdrivstoffet, Fredriks helseplan og den personlige evidensgjennomgangen:

- `wiki/personal/Gary-Brecka-Diet-Principles.md`
- `wiki/personal/Endurance-Fueling-Fasting-and-Protein.md`
- `wiki/personal/Fredrik-Personal-Health-Optimization-Plan.md`
- `wiki/personal/Evidence-and-Safety-of-Gary-Personal-Health-Answers.md`

Les `Fredrik-Seven-Day-Whole-Food-Meal-Plan.md`, `Evidence-Quality-of-Ultimate-Human-Health-Hacks.md` og andre sider når symptomet eller spørsmålet krever det. Les side-, validerings- og handlelistefilene først når en faktisk endring skal implementeres. Ikke endre LLM-wikien under en kostholdsjustering. Råfiler i `raw/` er alltid urørlige.

## Arbeidsflyt

### 1. Avgrens problemet

Trekk ut følgende fra Fredriks melding før du spør mer:

- hva som føltes annerledes
- hvilken økt eller periode det gjelder
- når endringen startet
- om planen faktisk ble fulgt
- hva Fredrik vil forbedre

Ikke krev data Fredrik allerede har gitt eller som Athlora kan hente. Spør Fredrik kort bare om nødvendig informasjon som verken finnes i meldingen, Athlora eller planen, for eksempel sykdomssymptomer, matinntak som avvek fra planen eller alvorlige faresignaler.

### 2. Hent treningssannheten fra Athlora

Last `browser-control`-skillen og bruk dens inspect-act-verify-løkke mot `https://athlora.ai/chat`. Bruk Fredriks autentiserte, tilknyttede Chromium-fane. Kontroller at siden faktisk er Athlora-chatten før du skriver.

Alle spørsmål skal være formulert som om Fredrik selv spør. Ikke skriv «Fredrik», «brukeren», «han» eller forklar at en agent spør på hans vegne.

Kjør `pnpm run check:plans` først og bygg hovedspørsmålet med de faktiske beregnede målverdiene og måltidstidene. Ikke gjenbruk gamle makrotall fra denne skillen. Tilpass denne malen til situasjonen:

```text
I am reviewing my current diet because [first-person description of symptom or goal]. My Matkompass base plan currently has [actual meal schedule and actual calculated targets by current day type]. [State accurately whether optional workout fuel is included in those totals.]

Using my actual data, summarize the last 14 days of training and recovery, today's relevant workout, and the next 7 days of planned training. Include duration, intensity, sport, key sessions, sleep, resting heart rate, HRV, and other recovery trends relative to my own baseline where available. Also include my latest known weight trend if you have it.

Assess whether [symptom or goal] is plausibly related to underfueling, meal timing, accumulated training load, sleep/recovery, illness, heat, pacing, or another factor. Separate observations from hypotheses.

Recommend a conservative starting point for base-plan calories and carbohydrate for the recurring day categories represented in my actual week. Distinguish rest, easy, quality, and long sessions in your analysis even when two currently share a Matkompass target. Keep protein at 160-165 g unless there is a clear reason not to. Separately recommend any pre-, during-, and post-session carbohydrate, fluid, and sodium for the actual upcoming sessions. Explain which recommendations are supported by my data, state uncertainty, and flag anything that should be reviewed by a clinician rather than solved through diet.
```

Be om oppklaring i samme samtale dersom svaret mangler:

- konkrete gjennomførte og kommende økter
- trend mot Fredriks egen baseline
- skille mellom fakta og hypotese
- skille mellom grunnplan og drivstoff rundt økten
- nok grunnlag til å velge en liten, testbar endring

Ta vare på en kort faktasammenfatning i arbeidskonteksten. Ikke lagre rå Athlora-, Oura- eller Garmin-data i repoet med mindre Fredrik uttrykkelig ber om det.

Hvis Browser Control eller den autentiserte fanen ikke er tilgjengelig, forklar den konkrete blokkeringen og be Fredrik koble til fanen. Ikke gjett treningsbelastning eller endre makromål uten Athlora-data med mindre Fredrik uttrykkelig velger å gå videre uten dem.

### 3. Sammenlign belastning, symptomer og dagens plan

Bruk resultatet fra `pnpm run check:plans` for å se de beregnede makroene for begge A/B-ukene. Sammenlign dette med:

- Fredriks opplevelse og etterlevelse
- Athloras siste 14 dager og neste 7 dager
- gjeldende vekttrend når den finnes
- wikiens regler for protein, energidefisit, karbohydrat rundt krevende økter og fleksibel faste

Skill mellom disse beslutningene:

- **Grunnenergi:** mat som skal inngå i dagens tre beregnede måltider.
- **Planlagt øktkarbohydrat:** mat før eller etter krevende morgenøkter som bør inngå i planen når behovet er forutsigbart.
- **Drivstoff under økten:** veiledning som kommer i tillegg og skaleres med varighet, intensitet, varme, svetterate og toleranse.
- **Ikke et kostholdsproblem:** tegn på sykdom, uvanlig smerte, feil pacing, søvnmangel eller annen belastning som mat alene ikke forklarer.

En enkelt dårlig økt kan være støy, men den skal heller ikke bortforklares når den følger en ny diett eller sammenfaller med flere tegn på lav energitilgjengelighet. Foretrekk en reversibel justering og et tydelig vurderingstidspunkt fremfor en stor permanent endring.

Klassifiser beslutningen før kode endres:

- **Varig grunnplan:** dataene støtter at den repeterende standarduken er feil også utover neste uke. Den statiske planen kan endres.
- **Tidsavgrenset prøve:** endringen skal testes i 7-14 dager. Ikke bak den inn som en permanent standard uten et synlig vurderingstidspunkt og en dokumentert tidligere verdi å gå tilbake til.
- **Engangsdrivstoff:** behovet gjelder en konkret økt eller en midlertidig uke. Behold grunnplanen og gi øktspesifikk veiledning, eller implementer en eksplisitt datobundet override dersom Fredrik vil ha den logget i ukeplanen.
- **Ikke et kostholdsproblem:** ikke endre planen bare fordi Athlora kan foreslå makroer.

### 4. Velg den minste forsvarlige justeringen

Bevar disse invariantene med mindre Fredrik uttrykkelig endrer dem:

- minst 160 g protein per dag
- hele råvarer og protein fordelt gjennom dagen
- tre beregnede måltider; øktdrivstoff vises separat når det faktisk er valgfritt
- samme frokost- og lunsjmønster i uke A og B
- fast middagsfordeling på 50 % / 50 % mellom Fredrik og Kamilla uten personlige middagstillegg
- oppskriftenes kjerneingredienser og fettmengder
- ingen separat eggehvite som proteintillegg
- kontordagenes praktiske krav
- Matvaretabellen som makrokilde

Når mer energi trengs bare for Fredrik, juster frokost, lunsj eller tidspunkt før du rører familiemiddagen. Legg fortrinnsvis ekstra karbohydrat nær kvalitetsøkter og langkjøring. Ikke fjern hele egg, olivenolje, avokado, kokosmelk, nøtter eller fet fisk bare for å treffe en kunstig fettgrense.

Hold normalt proteinmålet stabilt og endre først energi, karbohydrat eller måltidstidspunkt. Endre én hovedvariabel om gangen når det er mulig. For en tidsavgrenset prøve, definer 7-14 dager og hva som teller som bedring, for eksempel:

- bedre følelse og fart ved sammenlignbar puls
- normalisert sult, energi og humør
- stabil eller bedre søvn, hvilepuls og HRV mot egen baseline
- tilfredsstillende restitusjon til neste nøkkeløkt
- fortsatt moderat vekttrend uten tydelig prestasjonsfall

### 5. Gjør planen konsistent

Når beslutningsgrunnlaget støtter en endring og Fredrik har bedt om å justere dietten, implementer den i stedet for bare å beskrive den. Les nå også:

- `src/app/fredriks-ukeplan/page.tsx`
- `scripts/check-meal-plans.ts`
- `scripts/check-grocery-lists.ts`

Oppdater alle berørte sannhetskilder i samme endring:

- porsjoner og `nutritionTargets` i `src/content/meal-plan.ts`
- `mealPlanNutritionMetadata.calculatedAt` og nøkterne noter
- forklarende måltekst i `src/app/fredriks-ukeplan/page.tsx`
- dynamiske valideringsgrenser i `scripts/check-meal-plans.ts` når dagstypene får ulike mål
- `CONTEXT.md` når en varig planregel, måltidsrytme eller makroregel endres

Ikke hardkod Athlora-målinger eller en enkelt dårlig økt i brukergrensesnittet. Planen skal uttrykke beslutningen, mens sluttrapporten forklarer det tidsavgrensede rasjonalet.

Ikke representer neste ukes økter ved å endre repeterende `dayProfiles`, `daytimeMeals` eller `nutritionTargets`. For en tidsavgrenset endring som skal vises i appen, legg til den minste eksplisitte datobundne override-modellen med vurderingsdato og tidligere verdi. En varig endring kan oppdatere den repeterende grunnplanen.

Matkompass har `rest`, `active` og `long` som dagens dagstyper. Bruk dem når de fortsatt uttrykker den varige planen. Dersom vedvarende lette og kvalitetsdager trenger forskjellige grunnmål, utvid modellen, UI-et og valideringen eksplisitt; ikke skjul forskjellen bak ett `active`-mål. For en engangs kvalitetsøkt er datobundet override eller separat øktdrivstoff riktigere enn en ny permanent dagstype.

Måltidstidene er hardkodet i `src/lib/meal-plan.ts`. Ved en varig endring av tidene innenfor tre-måltidsrytmen, flytt tid til typed plandata og oppdater UI-et. Et valgfritt ekstra inntak for en økt forblir veiledning og et eventuelt beregnet fjerde måltid krever at Fredrik uttrykkelig endrer tre-måltidskontrakten i `CONTEXT.md`.

Begge middagsrotasjonene må fortsatt bestå. En dags frokost og lunsj skal være identiske i uke A og B og må fungere mot middagene i begge ukene. Hvis ett felles dagsmåltid ikke treffer begge middagsukene innen toleransen, revurder mål, porsjoner eller toleranse; ikke innfør A/B-spesifikke frokoster og lunsjer eller skjulte personlige middagstillegg.

### 6. Verifiser

Kjør minst:

1. `pnpm run check:plans`
2. `pnpm run check:groceries`
3. `pnpm run build`

Kontroller i resultatet at:

- alle dager er innenfor gjeldende energitoleranse
- ingen dag er under proteinminimumet
- karbohydratmål og veiledning samsvarer med dagstype og Athloras faktiske økter
- familieandelene og biffdagene er uendret
- handlelisten følger de nye porsjonene
- brukerrettet tekst ikke lenger påstår at alle dagstyper har samme mål dersom det er endret

## Sikkerhetsgrenser

Dette er kostholdsplanlegging, ikke diagnostikk. Stopp en ren kostholdsjustering og anbefal relevant helsehjelp ved blant annet brystsmerter, besvimelse, pustevansker, tydelig sykdom, vedvarende markert svakhet, ny fokal eller økende beinsmerte, smerte i hvile eller andre alvorlige symptomer.

Ikke foreskriv kosttilskudd, høye elektrolyttdoser, blodprøvetolkning eller behandling som løsning. Ved vedvarende prestasjonsfall, rask vektnedgang, fallende HRV, stigende hvilepuls, dårlig søvn, libidoendring eller uvanlig tretthet: reduser et aggressivt underskudd og foreslå klinisk vurdering fremfor å optimalisere hardere.

Gary Brecka- og Ultimate Human-materialet er et valgt kostholdsrammeverk, ikke bevis for alle mekanisme- eller helseclaims. Bruk wikiens evidenssider til å skille lavrisiko matprinsipper fra medisinske påstander.

## Sluttrapport

Rapporter kort i denne rekkefølgen:

```markdown
## Beslutning
[Hva som ble endret eller hvorfor ingen endring ble gjort]

## Grunnlag
- Egen opplevelse: ...
- Athlora: ...
- Planen før endring: ...
- Wiki-prinsipp: ...

## Ny plan
- Gjeldende dagstyper eller ukedager: ...
- Øktdrivstoff: ...
- Gyldighet og vurderingsdato: ...

## Oppfølging
[7-14 dagers vurderingspunkt og målbare signaler]

## Verifisering
[Kommandoer og resultat]
```

Hvis Athlora eller annen nødvendig kilde var utilgjengelig, rapporter blokkeringen i `Beslutning` og ikke presenter gjetninger som en ny plan.
