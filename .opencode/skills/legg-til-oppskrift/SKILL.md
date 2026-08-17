---
name: legg-til-oppskrift
description: Legg til eller importer oppskrifter i Matkompass-biblioteket. Bruk når brukeren vil lagre en rett, importere en oppskrift eller opprette en ny oppskriftsfil; ikke ved ren idémyldring om mat.
---

# Legg til oppskrift

En ny oppskrift får bare bli en del av Matkompass når hver ingrediens finnes i «Mat vi spiser» og hele retten følger «Prinsipper». Behandle disse sidene som en publiseringsport, ikke som inspirasjon.

## Kilder

Les disse filene på nytt ved hver kjøring:

1. `src/content/site-content.ts`
   - `principles`
   - `mealPattern`
   - `practicalPriorities`
   - `foodSections`
   - `avoidSections`
   - `temporaryRestrictions`
2. `src/lib/recipe-categories.ts`
3. `src/lib/recipes.ts`
4. `CONTEXT.md` når oppskriften er ment for familiens middags- eller ukeplan.

Ikke oppretthold en egen ingrediensliste i skillen. Nettsidens innhold er den eneste sannhetskilden.

En oppskriftsfil beskriver kilderetten og dens ordinære porsjonsantall. Ingrediensene lagres strukturert i filens frontmatter. `baseAdultPortions` angir hvor mange voksenporsjoner originalmengden tilsvarer og er påkrevd for frokost, lunsj og middag. Oppskriftssiden bruker to voksne og ingen barn som familiens standardporsjon. Middagsplanen fordeler hver ingrediens likt mellom Fredrik og Kamilla, uten personlige tillegg. Fordelingen skal ikke bakes inn i oppskriftsfilen.

## Arbeidsflyt

### 1. Lås regelgrunnlaget

Les kildene og noter kontrollsummen til `src/content/site-content.ts` før arbeidet begynner. Denne operasjonen har kun skrivetilgang til én ny fil under `src/content/oppskrifter/`. Bekreft at den planlagte filbanen ikke finnes. Endringer i regelgrunnlaget og redigering av eksisterende oppskrifter er separate oppgaver.

Steget er ferdig når gjeldende regler er lest og kontrollsummen er registrert.

### 2. Kjør ingrediensporten

Skaff hele ingredienslisten før andre manglende oppskriftsdata etterspørres. Lag en sjekkliste over alle ingredienser, inkludert olje, krydder, søtning, pynt og valgfrie ingredienser. Match hver ingrediens mot et konkret element i `foodSections`.

- Godkjenn vanlige bøyninger og tydelige varianter av samme råvare.
- Behandle sammensatte produkter som sennep, pesto, kraft og yoghurt som hele produkter med kravene som står i matlisten.
- En ingrediens i `avoidSections` gir avslag.
- En ingrediens som ikke kan matches tydelig, er uavklart.
- Valgfrie ingredienser må bestå samme kontroll som obligatoriske ingredienser.

Ved avslag eller uavklart ingrediens: stopp før filendring. Vis ingrediensen og nærmeste relevante regel. Foreslå enten en godkjent erstatning eller en separat beslutning om å endre «Mat vi spiser». Skillen skal aldri utvide matlisten på egen hånd.

Steget er ferdig når hver ingrediens har en eksplisitt godkjent match og ingen ingrediens finnes i unngå-listen.

### 3. Skaff resten av oppskriften

Etter at ingrediensporten består, avklar tittel, kategori, kilde, visningstekst for utbytte, antall voksenporsjoner i originalen, nøyaktige mengder, fremgangsmåte og eventuell forklaring. Bevar brukerens mengder og metode. Ikke utled `baseAdultPortions` automatisk fra et intervall som «3–4 porsjoner»; velg et eksplisitt grunnlag fra kilden eller avklar med brukeren.

Normaliser alle brukerrettede mål til norsk metrisk praksis: temperatur i °C, vekt i g eller kg og volum i ml, dl eller l. `ss` og `ts` kan brukes som norske kjøkkenmål. Konverter Fahrenheit, pund, unser, cups, pints og andre amerikanske enheter til praktisk avrundede metriske verdier uten å endre den tilsvarende mengden. Produktspesifikke måleskjeer kan beholdes når gramvekten avhenger av produktet; oppgi gram i tillegg når kilden gjør det kjent.

Steget er ferdig når oppskriften kan vurderes uten antakelser om ingredienser eller tilberedning.

### 4. Kjør prinsippporten

Vurder hvert punkt i `principles` og `mealPattern` direkte fra den nyeste kildefilen. Rapporter `bestått`, `brudd` eller `ikke relevant for én oppskrift`, med ingrediens eller oppskriftssteg som bevis.

- `frokost`, `lunsj` og `middag` er hovedmåltider. Protein må matches i den aktuelle `foodSections`-listen under «Kjøtt og fjærkre», «Fisk, sjømat og egg» eller «Planteprotein og belgvekster». Bein uten kjøtt er ikke en proteinporsjon. Fra «Meieri og fermentert mat» teller naturell gresk yoghurt, naturell usøtet meieriyoghurt, Skyr, cottage cheese, kefir og ost. Kokosyoghurt, smør, ghee, fermenterte grønnsaker, kombucha og kokosvannkefir teller ikke som proteinporsjon.
- Et hovedmåltid må ha minst én ikke-stivelsesrik grønnsak fra «Bladgrønnsaker», «Korsblomstrede grønnsaker» eller «Andre grønnsaker». Butternutgresskar og råvarer som matches som «Langsomme karbohydrater» teller som karbohydrat, ikke som grønnsaken som oppfyller dette kravet. Frukt og nøtter erstatter heller ikke grønnsakskravet.
- `dessert` og `snacks` er ikke hovedmåltider. Marker bare hovedmåltidskravene som `ikke relevant`; alle øvrige punkter gjelder fortsatt.
- For fett ved varme: sammenhold valgt fett og temperatur med teksten i fettseksjonen og `principles`. Manglende temperatur når fett varmes opp er uavklart.
- For karbohydrat: marker punktet `ikke relevant` når retten ikke har en konsentrert karbohydratkilde. Ellers må kilden eller brukeren uttrykkelig knytte karbohydratet til aktivitet, restitusjon, energibehov eller et annet konkret mål. Måltidskategorien alene er ikke bevis.
- Del sammensatte prinsipper i egne klausuler. Kravet om å spise fiberrike planter først er oppskriftsrelevant for hovedmåltider og må vises som serveringsrekkefølge i fremgangsmåten. Krav om daglig variasjon og farger markeres `ikke relevant for én oppskrift`.
- Prinsipper om dagsrytme, fordeling gjennom dagen, daglig variasjon, alkohol og hva som er praktisk mulig å kjøpe kan ikke avgjøres av én oppskrift. Marker dem `ikke relevant for én oppskrift` med en kort begrunnelse. De kan aldri brukes som en skjult antakelse for å godkjenne en ingrediens.
- Et oppskriftsrelevant punkt kan bare bestå med konkret bevis fra ingredienslisten eller metoden. Fravær av bevis er uavklart, ikke bestått.

`temporaryRestrictions` er bare et varsel om at protokoller har egne regler; nettsiden inneholder ikke nok detaljer til å validere en protokolloppskrift. Hvis brukeren ber om en oppskrift for en navngitt midlertidig protokoll, stopp og forklar at den ikke kan publiseres før protokollens tillatte mat er vedtatt på «Mat vi spiser».

Ikke kopier prinsipptekst inn i skillen eller erstatt kildens ordlyd med disse operasjonelle reglene. Kilden bestemmer hva som skal vurderes; reglene over bestemmer bare hvordan vurderingen bevises.

Ved brudd: stopp før filendring og forklar hvilken prinsippregel oppskriften bryter. Foreslå den minste endringen som gjør oppskriften gyldig, men ikke utfør endringen uten brukerens godkjenning.

Steget er ferdig når hvert punkt har status og bevis, og ingen punkter er uavklarte eller brutt.

### 5. Presenter kontrollen

Før oppskriften skrives, oppsummer:

```markdown
## Oppskriftskontroll
- Ingredienser: bestått
- Prinsipper: bestått
- Kategori: [kategori]
- Kilde: [kilde]
- Tilpasninger: [ingen eller godkjente endringer]
```

Når brukeren allerede uttrykkelig har bedt om å legge til oppskriften, kan en oppskrift som består begge porter skrives uten en ny godkjenningsrunde. Uavklarte eller endrede oppskrifter krever svar fra brukeren først.

### 6. Opprett oppskriftsfilen

Bruk norsk tekst og en norsk kebab-case-filbane:

`src/content/oppskrifter/<kategori>/<slug>.md`

Bruk denne strukturen:

```markdown
---
title: "Norsk tittel"
category: frokost | lunsj | middag | dessert | snacks
source: "https://..."
yield: "N porsjoner"
baseAdultPortions: N
ingredients:
  - items:
      - amount: 450
        unit: g
        text: "kyllinglår"
      - amount: 1
        maxAmount: 2
        unit: ts
        text: "oregano"
      - text: "havsalt og pepper etter smak"
      - amount: 1
        unit: ss
        text: "ferske urter"
        optional: true
tags: ["Kort norsk emneknagg"]
adapted: false
adaptationNote: ""
---

## Fremgangsmåte

1. Første steg.

## Hvorfor den fungerer

En nøktern forklaring som ikke introduserer nye medisinske påstander.
```

Bruk `amount` som tall, `maxAmount` for intervaller, `unit` når måleenheten er eksplisitt, og `text` for ingrediensnavn og tilberedningsmerknad. Ingredienser som «etter smak» lagres bare med `text` og skaleres derfor ikke. Når én linje inneholder alternative mengder som ikke kan uttrykkes med ett `amount`, behold hele mengden i `text` og sett `scalable: false`; brukergrensesnittet merker da ingrediensen for manuell skalering. Bruk `optional: true` når hele ingrediensen er valgfri. Oppskrifter som inngår i ukeplanene skal i tillegg ha `groceryItems` med stabile identiteter fra `src/content/grocery-catalog.ts`; bruk en tom liste for ingredienser som vann som ikke skal kjøpes. Bevar undergrupper som egne elementer under `ingredients` med `title` og `items`. Ikke legg til en separat `## Ingredienser`-seksjon i Markdown-innholdet.

Sett `adapted: true` når råvarer, mengder eller metode er endret fra oppskriften brukeren leverte eller fra innholdet på kildeadressen, og skriv en konkret norsk `adaptationNote`. Sett `adapted: false` og `adaptationNote: ""` når den innsendte oppskriften skrives uten slike endringer. Ved import fra bare en URL må kildeinnholdet leses før feltene kan avgjøres. Kildeadressen skal fortsatt peke på opphavet. Stopp hvis sluggen allerede finnes; denne skillen redigerer aldri eksisterende oppskrifter.

Steget er ferdig når filen følger skjemaet i `src/lib/recipes.ts`, skalerbare mengder er numeriske, og all brukerrettet tekst er norsk.

### 7. Verifiser

1. Les den ferdige filen og kjør både ingrediensporten og prinsippporten én gang til.
2. Søk etter ingredienser fra `avoidSections`, uforklarte engelske rester, amerikanske måleenheter og en eventuell duplisert `## Ingredienser`-seksjon. Kjør `pnpm run check:recipes` og `pnpm run check:units`.
3. Bekreft at kontrollsummen til `src/content/site-content.ts` er identisk med den registrerte kontrollsummen. Ved avvik: stopp og slett bare den nye filen som denne kjøringen opprettet. Ikke endre regelgrunnlaget eller noen fil som eksisterte før kjøringen.
4. Kjør `pnpm run build`.
5. Rapporter filbane, kategori, kilde, om oppskriften er tilpasset, og resultatet fra begge porter.

Oppgaven er ferdig når begge porter fortsatt består etter skriving og produksjonsbygget er grønt.
