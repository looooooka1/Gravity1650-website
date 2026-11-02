# Gravity 1650 : contexte

- Site statique : sources `src/site/`, `python3 build.py` puis copier `site/` à la racine (publiée par Vercel).
- Domaine cible : https://www.gravity1650.fr (GoDaddy, DNS domaincontrol.com). EN LIGNE le 2026-11-02 : apex 308 vers www, HTTPS, headers OK, sources en 404.
- Sécurité : `vercel.json` (CSP sans script inline, HSTS, cache), `.vercelignore` (sources non publiées).
- 2026-11-02 : commits locaux ee9cc6f non poussés (jeton GitHub invalide).
- Vercel : compte client montotomatis@gmail.com, team Gravity1650 (Hobby, passer Pro car usage commercial), projet gravity1650, repo looooooka1/Gravity1650-website (main).
- DNS GoDaddy : A @ 216.198.79.1, CNAME www 41ff96fee3b5c8d9.vercel-dns-017.com, garder _dmarc et _domainconnect.
- Reste : 6 champs des mentions légales, Search Console (sitemap.xml), fiche Google Business, option hstspreload.org, supprimer l'ancien projet Vercel gravity1650-website.
