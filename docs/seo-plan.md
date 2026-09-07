# SCM Signpost: SEO plán a nasazení

Výchozí audit: revize `d457ba2b1c06e93606d4e37c9f18380525d6a420`. Hlavní doména potvrzená majitelem: `https://www.scmsignpost.com/`. Součástí infrastruktury je Cloudflare; konkrétní DNS, proxy a hosting nejsou z repozitáře ověřitelné. Načtení živého webu z prostředí auditu bylo blokováno. Návrh není potvrzením skutečné indexace ani funkčnosti produkčního doručování formuláře.

## Cíl

Přivádět firmy, které hledají konkrétní logistickou poradenskou službu, a dovést je k relevantní poptávce. Úspěchem není samotný růst návštěvnosti, ale více vhodných poptávek, které přecházejí na schůzky a zakázky.

## Co obsahuje tato změna

- Canonical, Open Graph a adresy v sitemapě/robots sjednocené na hlavní doménu; návrat z formuláře také směřuje na tuto doménu.
- Jedinečné titulky, popisy a H1 pro všech šest obchodních stránek.
- Jasnější hlavní sdělení a názvy služeb na homepage.
- Stručný přehled služby a jejích výstupů nad původním odborným obsahem pěti podstránek.
- Drobečková navigace a kontextové odkazy na související služby.
- JSON-LD: Organization, WebSite, WebPage; Person na homepage; Service a BreadcrumbList na podstránkách. Bez neověřených hodnocení, adres, cen a garantovaných úspor. Značení Service je popis entity, nikoli příslib speciálního výsledku v Googlu.
- Připojení GA4 dle samostatné dokumentace. Informační stránka cookies je označena `noindex,follow` a není v sitemapě.
- Původní adresy služeb zůstávají platné. Nevzniká zbytečná migrace URL.

## Mapa témat

Jde o návrh podle skutečné nabídky a vyhledávacího záměru, nikoliv o kvantitativní analýzu hledanosti. Bez Keyword Planneru nebo dat Search Console nejsou stanovené objemy hledání, obtížnost ani očekávané pořadí.

| Stránka | Hlavní téma | Doplňující dotazy | Obchodní záměr |
| --- | --- | --- | --- |
| `/` | logistické poradenství | audit logistiky, logistický konzultant | Najít odborníka a vybrat oblast pomoci |
| `/pilir-3pl-tendry.html` | 3PL tendr | výběr 3PL, audit RFQ, porovnání logistických nabídek | Připravit nebo prověřit výběr partnera |
| `/pilir-skladova-efektivita.html` | audit skladu | optimalizace skladu, skladové procesy, layout skladu | Zlepšit kapacitu, produktivitu a náklady |
| `/pilir-transport.html` | audit dopravy | optimalizace přepravních nákladů, palivové doložky | Prověřit nákladový model dopravy |
| `/pilir-technologie.html` | výběr WMS a TMS | implementace WMS, propojení ERP a WMS | Ověřit připravenost a rizika projektu |
| `/pilir-krizovy-management.html` | krizový management logistiky | stabilizace logistického provozu, interim management logistiky | Zvládnout přetížení nebo selhávání provozu |

Homepage vlastní obecné téma poradenství, každá služba svůj specifický problém. Články řeší jednotlivé otázky a odkazují na hlavní službu. Nevytvářet několik skoro shodných stránek pro synonyma nebo města bez skutečně odlišného obsahu.

## Kroky před publikací: provozovatel + správce webu

1. Ověřit, že doména skutečně zobrazuje obsah z této větve po sloučení a nasazení. Repozitář má workflow pro GitHub Pages; nelze automaticky předpokládat Cloudflare Pages.
2. Ověřit HTTPS a 200 odpověď homepage, pěti služeb, robots a sitemapy. Nepublikovat canonical na nefunkční adresu.
3. Nastavit trvalé přesměrování `http` a domény bez `www` na `https://www.scmsignpost.com/`, se zachováním cesty a parametrů. Nejdříve ověřit skutečné DNS a SSL, aby nevznikla smyčka. Zkontrolovat také vztah GitHub Pages adresy k vlastní doméně a duplicitu `/index.html` vůči `/`.
4. Ověřit, že Cloudflare nepřidává jiný canonical, noindex nebo další Google tag. Zkontrolovat cache po nasazení.
5. Ověřit pravidla přístupu pro skutečné vyhledávače v Cloudflare. Neoslabovat plošně ochranu a nepovažovat libovolný User-Agent Googlebot za důkaz identity.
6. Revidovat tvrzení v původních případových studiích: zdroj, období, výpočet, skutečná vs. plánovaná úspora a role konzultanta. Úvodní číselné karty bez kontextu byly nahrazeny tématy posouzení „Náklady“ a „Provoz“, aby homepage nepřenášela nejasnou definici SLA z jiné metriky. Žádná čísla v podrobných případových studiích tato SEO změna sama neověřuje.
7. U formuláře a chatu doplnit úplné informace o zpracování osobních údajů a ověřenou identifikaci firmy. Nová stránka cookies popisuje analytiku a nenahrazuje kompletní informační povinnost pro všechny služby webu.

## Google Search Console: nezbytný krok pro SEO

1. V https://search.google.com/search-console/ vytvořit službu typu **Doména** pro `scmsignpost.com`.
2. Google vygeneruje jedinečný TXT záznam. V DNS Cloudflare jej přidat pro kořen domény (`@`). Neměnit existující MX, SPF, DKIM ani jiné TXT záznamy. Konkrétní hodnotu neposkytuje tento repozitář: musí ji vydat účet majitele v Search Console.
3. Po ověření ponechat TXT záznam aktivní a odeslat sitemapu `https://www.scmsignpost.com/sitemap.xml`.
4. Pro homepage a pět služeb spustit Kontrolu URL, živý test a podle potřeby požádat o indexování.
5. Zkontrolovat Googlem zvolenou canonical adresu, případné `noindex`, chyby přístupu a důvody nezařazení do indexu. `site:` dotaz nepovažovat za úplnou kontrolu indexace.
6. Propojení s GA4 je volitelné pro společný reporting; GA4 není podmínkou indexace ani nastavení Search Console.

Indexování, přepsání titulku i zobrazení rozšířeného výsledku určuje Google; sitemap a strukturovaná data je negarantují.

## Obsahový plán na 90 dní

| Období | Výstup | Obsahový brief | Cílová služba |
| --- | --- | --- | --- |
| Týdny 1–2 | Technické nasazení a Search Console | Kontroly výše, výchozí data, ověření čísel a autorství | Všech šest stránek |
| Týdny 3–4 | Jak porovnat nabídky 3PL | Stejný rozsah, minimální fakturace, handling, VAS, integrace, scénář objemů; anonymizovaný příklad výpočtu s jasně označenými předpoklady | 3PL tendry |
| Týdny 5–6 | Co připravit před auditem skladu | Objednávky, SKU, obrátka, layout, směny, náklady, chybovost; praktický checklist | Audit skladu |
| Týdny 7–8 | Je sklad připravený na WMS? | Master data, procesní výjimky, integrace, testování, vlastníci rozhodnutí | WMS/TMS |
| Týdny 9–10 | Proč přepravní faktura neodpovídá ceníku | Struktura příplatků, smluvní indexy, balení a konsolidace; vyhnout se neověřeným obecným procentům | Audit dopravy |
| Týdny 11–12 | Signály provozní krize v logistice | Backlog, ruční opravy, chybějící odpovědnosti, priority stabilizace | Krizový management |

Každý text musí přidat vlastní zkušenost, uvést autora a věcně související odkazy. Délku volit podle potřeby otázky. LinkedIn používat k distribuci obsahu a získávání relevantní pozornosti. Skutečné reference a odborné odkazy získávat z profesních vztahů, rozhovorů a spoluprací; nekupovat balíčky odkazů. Firemní profil Google řešit pouze při splnění podmínek způsobilosti a reálném osobním kontaktu se zákazníky.

Před publikací článků vyřešit jejich umístění v nasazovacím workflow: nyní nekopíruje nové podsložky kromě assets. Anglickou verzi vytvořit pouze jako skutečný překlad s vlastní URL a vzájemným hreflang; samotný příslib práce v angličtině nestačí.

## Vyhodnocení

Týdně kontrolovat technické chyby a nové dotazy. Měsíčně srovnávat stejně dlouhá období v Search Console; při malém objemu i delší intervaly. Oddělit značkové dotazy obsahující SCM Signpost/Jakub Blažek od obecných dotazů na služby.

- Organická zobrazení a kliknutí podle cílové stránky a dotazu.
- CTR vyhodnocovat společně s pozicí, dotazem a zařízením; průměrná pozice sama není obchodní KPI.
- Potvrzené formuláře z měřených organických návštěv v GA4, s jasnou informací o omezení souhlasem a blokováním.
- V obchodní evidenci počet relevantních příležitostí, schůzek, nabídek a zakázek z organického vyhledávání; data GA4 a Search Console nemají stejnou jednotku ani pokrytí.

Konkrétní cíle počtu poptávek stanovit až podle výchozích dat a kapacity konzultanta. Výchozí hledanost a konverze nejsou známy; tento návrh neslibuje konkrétní pořadí ani termín dosažení výsledků.

## Zdroje

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Canonical a přesměrování: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Search Console: https://developers.google.com/search/docs/monitor-debug/search-console-start
- Organization: https://developers.google.com/search/docs/appearance/structured-data/organization

Technické kontroly repozitáře nenahrazují živou kontrolu odpovědí serveru, Search Console a doručení testovací poptávky po nasazení.
