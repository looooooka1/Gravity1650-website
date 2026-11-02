# Gravity 1650 : contexte

- Site statique : sources `src/site/`, `python3 build.py` puis copier `site/` à la racine (publiée par Vercel).
- Domaine cible : https://www.gravity1650.fr (GoDaddy, DNS domaincontrol.com). Apex à rediriger vers www dans Vercel.
- Sécurité : `vercel.json` (CSP sans script inline, HSTS, cache), `.vercelignore` (sources non publiées).
- 2026-11-02 : commits locaux ee9cc6f non poussés (jeton GitHub invalide).
- Reste côté Luka : push GitHub, domaines Vercel, DNS GoDaddy, 6 champs des mentions légales, Search Console, fiche Google Business.
