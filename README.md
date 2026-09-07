# SCM Signpost

Statický web logistického poradenství. Hlavní veřejná adresa: https://www.scmsignpost.com/.

## SEO a měření

- [SEO plán, cílová témata a postup nasazení](docs/seo-plan.md)
- [Nastavení GA4, souhlasů a ověřovací scénáře](docs/analytics-setup.md)
- `docs/seo-keywords.json` obsahuje titulky, popisy a obsahové zaměření šesti obchodních stránek. Jde o podklad pro editaci, nikoliv runtime generátor; změny je nutné promítnout také do HTML.

Web se nasazuje workflow `.github/workflows/deploy-static.yml` při změně větve `main`. Workflow publikuje kořenové HTML s výjimkou `_template.html`, složku `assets`, `robots.txt` a `sitemap.xml`. Dokumentace v `docs` se tímto workflow nepublikuje. Skutečné propojení Cloudflare s produkčním hostingem je nutné ověřit v účtu provozovatele.

Před přidáním stránky aktualizujte jedinečný title, description, H1, canonical, Open Graph, strukturovaná data, interní odkazy a případně sitemap. `_template.html` obsahuje zástupné hodnoty, které je nutné nahradit.
