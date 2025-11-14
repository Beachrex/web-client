# Localized URL Structure

This document describes the SEO-friendly, localized URL structure for BeachRex.

## Supported Languages (14)

- **en** - English
- **si** - Slovenščina (Slovenian)
- **de** - Deutsch (German)
- **hr** - Hrvatski (Croatian)
- **fr** - Français (French)
- **es** - Español (Spanish)
- **it** - Italiano (Italian)
- **ua** - Українська (Ukrainian)
- **ru** - Русский (Russian)
- **pl** - Polski (Polish)
- **cs** - Čeština (Czech)
- **hu** - Magyar (Hungarian)
- **bg** - Български (Bulgarian)
- **sk** - Slovenčina (Slovak)

## URL Examples by Language

### Beaches Listing

| Language | URL |
|----------|-----|
| English | `/en/beaches` |
| Slovenian | `/si/plaze` |
| German | `/de/strande` |
| Croatian | `/hr/plaze` |
| French | `/fr/plages` |
| Spanish | `/es/playas` |
| Italian | `/it/spiagge` |
| Ukrainian | `/ua/plyazhi` |
| Russian | `/ru/plyazhi` |
| Polish | `/pl/plaze` |
| Czech | `/cs/plaze` |
| Hungarian | `/hu/strandok` |
| Bulgarian | `/bg/plyazhove` |
| Slovak | `/sk/plaze` |

### Continent Pages (Europe Example)

| Language | URL |
|----------|-----|
| English | `/en/beaches/europe` |
| Slovenian | `/si/plaze/evropa` |
| German | `/de/strande/europa` |
| Croatian | `/hr/plaze/europa` |
| French | `/fr/plages/europe` |
| Spanish | `/es/playas/europa` |
| Italian | `/it/spiagge/europa` |
| Ukrainian | `/ua/plyazhi/yevropa` |
| Russian | `/ru/plyazhi/yevropa` |
| Polish | `/pl/plaze/europa` |
| Czech | `/cs/plaze/evropa` |
| Hungarian | `/hu/strandok/europa` |
| Bulgarian | `/bg/plyazhove/evropa` |
| Slovak | `/sk/plaze/europa` |

### All Continents Translations

#### Europe
- en: `europe`
- si: `evropa`
- de: `europa`
- hr: `europa`
- fr: `europe`
- es: `europa`
- it: `europa`
- ua: `yevropa`
- ru: `yevropa`
- pl: `europa`
- cs: `evropa`
- hu: `europa`
- bg: `evropa`
- sk: `europa`

#### Asia
- en: `asia`
- si: `azija`
- de: `asien`
- hr: `azija`
- fr: `asie`
- es: `asia`
- it: `asia`
- ua: `aziya`
- ru: `aziya`
- pl: `azja`
- cs: `asie`
- hu: `azsia`
- bg: `aziya`
- sk: `azia`

#### Africa
- en: `africa`
- si: `afrika`
- de: `afrika`
- hr: `afrika`
- fr: `afrique`
- es: `africa`
- it: `africa`
- ua: `afryka`
- ru: `afrika`
- pl: `afryka`
- cs: `afrika`
- hu: `afrika`
- bg: `afrika`
- sk: `afrika`

#### North America
- en: `north-america`
- si: `severna-amerika`
- de: `nordamerika`
- hr: `sjeverna-amerika`
- fr: `amerique-du-nord`
- es: `america-del-norte`
- it: `america-del-nord`
- ua: `pivnichna-ameryka`
- ru: `severnaya-amerika`
- pl: `ameryka-polnocna`
- cs: `severni-amerika`
- hu: `eszak-amerika`
- bg: `severna-amerika`
- sk: `severna-amerika`

#### South America
- en: `south-america`
- si: `juzna-amerika`
- de: `sudamerika`
- hr: `juzna-amerika`
- fr: `amerique-du-sud`
- es: `america-del-sur`
- it: `america-del-sud`
- ua: `pivdenna-ameryka`
- ru: `yuzhnaya-amerika`
- pl: `ameryka-poludniowa`
- cs: `jizni-amerika`
- hu: `del-amerika`
- bg: `yuzhna-amerika`
- sk: `juzna-amerika`

#### Oceania
- en: `oceania`
- si: `oceanija`
- de: `ozeanien`
- hr: `oceanija`
- fr: `oceanie`
- es: `oceania`
- it: `oceania`
- ua: `okeaniya`
- ru: `okeaniya`
- pl: `oceania`
- cs: `oceanie`
- hu: `oceania`
- bg: `okeaniya`
- sk: `oceania`

#### Antarctica
- en: `antarctica`
- si: `antarktika`
- de: `antarktis`
- hr: `antarktika`
- fr: `antarctique`
- es: `antartida`
- it: `antartide`
- ua: `antarktyka`
- ru: `antarktida`
- pl: `antarktyka`
- cs: `antarktida`
- hu: `antarktisz`
- bg: `antarktida`
- sk: `antarktida`

## Other Localized Routes

### Beach Map
- en: `/beach-map`
- si: `/zemljevid-plaz`
- de: `/strand-karte`
- hr: `/karta-plaza`
- fr: `/carte-des-plages`
- es: `/mapa-de-playas`
- it: `/mappa-spiagge`
- ua: `/karta-plyazhiv`
- ru: `/karta-plyazhey`
- pl: `/mapa-plaz`
- cs: `/mapa-plazi`
- hu: `/strand-terkep`
- bg: `/karta-na-plyazhovete`
- sk: `/mapa-plazi`

### About
- en: `/about`
- si: `/o-nas`
- de: `/uber-uns`
- hr: `/o-nama`
- fr: `/a-propos`
- es: `/acerca-de`
- it: `/chi-siamo`
- ua: `/pro-nas`
- ru: `/o-nas`
- pl: `/o-nas`
- cs: `/o-nas`
- hu: `/rolunk`
- bg: `/za-nas`
- sk: `/o-nas`

## SEO Benefits

1. **Full Words**: Using complete words like "europe" instead of "eu" improves keyword matching
2. **Localized**: Each language has native translations for better local SEO
3. **Readable**: URLs are human-readable and trustworthy
4. **Shareable**: Professional appearance when shared on social media
5. **Accessible**: Better for screen readers and assistive technologies

## Implementation Files

- **Locales Config**: `src/app/config/locales.ts`
- **Continent Translations**: `src/app/config/continents.ts`
- **Routing Config**: `src/i18n/routing.ts`
