# 🚀 Création d’une application Next.js de tracking personnel

> ⚠️ Important : Tout le code généré doit être **en anglais**, même si mes prompts sont généralement **en français**.

Je veux créer une application permettant de tracker un maximum de choses dans ma vie.  
L’utilisateur doit pouvoir créer facilement un élément à tracker (ex : dépense carburant, session wingfoil, humeur, sport, sommeil bébé, vitamines, etc.) puis enregistrer ses données à tout moment.  
Ensuite, afficher des statistiques personnalisées selon une période de temps (ex : pourcentage de nuits avec coucher avant minuit, dépenses moyennes mensuelles, etc.)

## 🎯 Stack & principes attendus

- Next.js (App Router)
- TypeScript
- TailwindCSS
- Prisma + SQLite
- Architecture propre : séparation stricte des règles métier (domain, usecases)
- Tests TDD : Vitest pour tous les usecases
- Data Persistante : Prisma Migrations
- UI simple et rapide (liste de trackers + page de stats)

## 🧱 Structure du projet

Proposer et mettre en place une structure inspirée de Clean Architecture comme :

```
src/
  domain/
    entities/
    valueObjects/
  application/
    usecases/
  infrastructure/
    prisma/
  ui/
    components/
    pages/ or app/
tests/
```

## 📌 Fonctionnalités v1

- CRUD Tracker (création d’un tracker avec type : booléen / nombre / texte / durée / monnaie)
- CRUD Entries (ajout de données liées à un tracker)
- Vue Liste des trackers
- Vue Historique d’un tracker
- Vue Statistiques simples (comptes, pourcentages, moyennes)

## 🧪 Tests exigés

- Chaque usecase doit être conçu en TDD :
  - CreateTracker
  - AddEntry
  - GetStats (simple dans la V1)

## 💡 Livrables souhaités

- Initialisation complète du projet (Next, TS, Tailwind, Prisma, Vitest config)
- Setup du schéma Prisma + migrations
- Entités / Usecases + tests Vitest
- Première version UI minimaliste fonctionnelle

👉 Commence par me proposer le schéma des entités dans le domain + le schema Prisma correspondant, puis on enchaîne sur les usecases (TDD).
