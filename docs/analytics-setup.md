# GA4 a kontaktní formulář

ID dodané majitelem: `G-S618X2BG1H`. Měření se načítá přes `assets/analytics.js` pouze na `scmsignpost.com` nebo `www.scmsignpost.com` a až po analytickém souhlasu. Staging, localhost a GitHub Pages doména do této služby měření neposílají. Bez JavaScriptu zůstává původní nativní POST formuláře; nemá falešnou JS konverzi.

## Události

| Událost | Podmínka | Parametry |
| --- | --- | --- |
| page_view | Jednou po načtení stránky a povolení měření | page_title, service; vyčištěné page_location a page_referrer v config |
| service_view | Zobrazení jedné z pěti služeb po souhlasu | service |
| cta_click | Kliknutí na interní kontakt | service, cta_location |
| email_click / phone_click | Kliknutí na mailto/tel, nikoli potvrzený kontakt | service |
| form_start | První skutečná editace formuláře po souhlasu | form_id, service |
| form_error | Neplatný formulář nebo nepotvrzené přijetí | form_id, error_type, service |
| generate_lead | Úspěšná HTTP odpověď FormSubmit s success=true nebo "true" | form_id, lead_channel, service |

`generate_lead` znamená potvrzení přijetí externí službou, nikoli jistotu doručení do schránky, kvalifikovaný lead nebo uzavřenou zakázku. Nepřiřazuje se mu vymyšlená peněžní hodnota. Přijetí bez analytického souhlasu funguje, ale do GA4 se neodesílá. Chování před souhlasem se zpětně nenahrává.

Formulář nepoužívá `?sent=1` jako důkaz. AJAX zůstává na webu. Tlačítko je během zpracování vypnuté a po úspěchu zůstane vypnuté; opakované kliknutí v této stránce nevytvoří další událost. Po chybě zůstanou data ve formuláři. Automatický retry se neposílá, protože při timeoutu už mohla služba poptávku přijmout. Deduplikace napříč zařízeními a samostatnými pozdějšími poptávkami patří do CRM a není součástí tohoto frontendového měření.

## Nutné nastavení v účtu GA4 před nasazením

1. Ověřit, že ID patří webovému streamu SCM Signpost a adresa je `https://www.scmsignpost.com`.
2. Nastavit časové pásmo Praha a CZK podle firemního reportingu.
3. V nastavení Rozšířeného měření vypnout automatické **interakce s formuláři** kvůli duplicitním `form_start` a neověřeným submit událostem. Doporučeno vypnout i ostatní rozšířené automatické události, které nejsou v tomto měřicím plánu, a ověřit, že stránka posílá právě jeden page_view.
4. Označit `generate_lead` jako klíčovou událost. Samotná instalace JavaScriptu toto nastavení administrace neprovede.
5. Přidat vlastní dimenze s rozsahem události: `service`, `cta_location`, `form_id`, `lead_channel`, `error_type`, pokud se mají zobrazovat v běžných vlastních přehledech.
6. Zvolit a zdokumentovat skutečnou dobu uchování dat v GA4; informační stránku cookies doplnit podle ní a ověřených firemních údajů. Odvolání souhlasu blokuje další měření, nevymaže samo dříve odeslaná data z Google.
7. Zkontrolovat, že Cloudflare/Zaraz/GTM nevkládá druhý tag pro tutéž službu. Souhlas v tomto skriptu neřídí nezávisle přidané měřicí nástroje.
8. Interní návštěvy případně filtrovat nejprve v testovacím režimu. Nevyloučit omylem zákazníky sdílející síť.

V kódu je basic opt-in. Google knihovna se nestahuje při nevyjádřeném nebo odmítnutém souhlasu. Při odvolání se odesílá změna consent state, dostupné GA cookies se mažou a stránka se obnoví. Další načtení již knihovnu nespustí. Nepropagují se reklamní souhlasy. Volba na zařízení i analytické cookies jsou nastavené na 180 dní.

Vlastní události nemají jména, e-maily, telefonní čísla, obsah formuláře ani chatu. URL měření nezahrnuje hash ani libovolné query parametry; povoleny jsou jen standardní UTM s omezenou sadou znaků. Do UTM nevkládat osobní údaje. Pro page_referrer se používá pouze původní doména. Přesnost atribučního detailu je tím záměrně omezená.

## Ověření po nasazení

- V anonymním okně před souhlasem a po odmítnutí nesmí vznikat požadavky této implementace na Google Analytics/Tag Manager; formulář musí zůstat použitelný.
- Po povolení ověřit Realtime nebo Tag Assistant/DebugView, právě jeden page_view a odpovídající service_view.
- Obnovení stránky se zapamatovaným souhlasem, odvolání a změna ve druhé kartě.
- Kliknutí na CTA a editace formuláře; osobní údaje nesmí být v payloadu GA.
- Kontrolovaná testovací poptávka musí projít až do schránky. FormSubmit může vyžadovat aktivaci příjemce. V auditu nebyl odeslán skutečný e-mail ani ověřena aktivace účtu.
- HTTP chyba, success=false, timeout, neplatné pole a dvojklik nesmějí vytvořit falešný generate_lead.
- Přímé otevření `/?sent=1` nesmí zobrazit potvrzení ani vygenerovat lead.
- Souhlas odmítnutý + potvrzený formulář: úspěch pro návštěvníka, žádný GA lead.

Ověření logiky bylo provedeno v Node VM s náhradami DOM a simulovanými odpověďmi FormSubmit: souhlas/odmítnutí, jeden page_view, odstranění citlivých parametrů URL, dvojí submit, úspěch, HTTP chyba, odmítnutí poskytovatelem, chybějící potvrzení, neplatné pole, honeypot a odvolání souhlasu. Neodesílaly se reálné poptávky ani GA události. Statická kontrola prošla pro unikátní metadata/H1/canonical, JSON-LD, interní odkazy, skripty a šest URL v sitemapě. Vizuální a skutečný browserový test se nepodařilo dokončit: místní Chromium nebylo dostupné a cloudový prohlížeč blokoval místní náhled. Mobilní zobrazení, skutečný účet GA4, produkční odpovědi a e-mailové doručení je třeba ověřit před/po nasazení podle povahy kontroly.

## Zdroje

- https://support.google.com/analytics/answer/9304153
- https://developers.google.com/tag-platform/security/guides/consent
- https://formsubmit.co/ajax-documentation
