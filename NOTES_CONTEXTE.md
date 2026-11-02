# Gravity 1650 : contexte

- Site statique : sources `src/site/`, `python3 build.py` puis copier `site/` à la racine (publiée par Vercel).
- Domaine cible : https://www.gravity1650.fr (GoDaddy, DNS domaincontrol.com). EN LIGNE le 2026-11-02 : apex 308 vers www, HTTPS, headers OK, sources en 404.
- Sécurité : `vercel.json` (CSP sans script inline, HSTS, cache), `.vercelignore` (sources non publiées).
- 2026-11-02 : commits locaux ee9cc6f non poussés (jeton GitHub invalide).
- Vercel : compte client montotomatis@gmail.com, team Gravity1650 (Hobby, passer Pro car usage commercial), projet gravity1650, repo looooooka1/Gravity1650-website (main).
- DNS GoDaddy : A @ 216.198.79.1, CNAME www 41ff96fee3b5c8d9.vercel-dns-017.com, garder _dmarc et _domainconnect.
- Reste : 6 champs des mentions légales, Search Console (sitemap.xml), fiche Google Business, option hstspreload.org, supprimer l'ancien projet Vercel gravity1650-website.

## 2026-11-02 · Page test immersive
- /test-immersif.html (noindex, non liée) : concept « Une journée au 1650 ». Source src/site/pages/test-immersif.html + assets/css/immersif.css + assets/js/immersif.js, par-dessus main.js.
- Intro altitude 0→1650 m, neige canvas, rail horaire 7h30→22h, couleurs par chapitre (html[data-tod]), carte en ardoises défilement horizontal épinglé (≥900px), cadran 24h des horaires.
- Heures du cadran recopiées dans data-open/data-close des saisons : à synchroniser avec SEASONS (main.js).
