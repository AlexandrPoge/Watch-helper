# Repository Guidelines

## Project Structure & Module Organization

Watch Helper is a React/TypeScript frontend with an Express/Socket.IO backend.

- `src/app` contains app setup, routing, and global styles.
- `src/pages` contains screen-level compositions; reusable behavior belongs in `src/features`.
- `src/entities` contains domain models, while `src/shared` contains reusable UI and utilities.
- `server/catalog`, `server/rooms`, `server/media`, and `server/db` contain backend services, room logic, media routes, and PostgreSQL access.
- Tests are colocated with the code they cover, using names such as `catalogService.test.ts`.
- SQL migrations live in `server/db/migrations`; do not edit applied migrations—add a new numbered migration.

Keep modules focused on one responsibility and normally below 150 lines, as documented in `README.md`.

## Build, Test, and Development Commands

Run these from the repository root:

- `npm install` — install dependencies.
- `docker compose up -d postgres` — start the local PostgreSQL service on port 5433.
- `npm run db:migrate` — apply database migrations.
- `npm run dev` — run the Vite frontend and API together.
- `npm run dev:web` / `npm run dev:api` — run only one development process.
- `npm run lint` — run ESLint.
- `npm run build` — type-check and create the production Vite build.
- `npm test -- --run` — run the Vitest suite once.
- `RUN_DB_TESTS=1 npm test -- --run` — include database integration tests.

Copy `.env.example` to `.env` and configure `TMDB_API_KEY` before using catalog features. Never commit `.env` or credentials.

## Coding Style & Naming Conventions

Use TypeScript and functional React components. Follow the existing ESLint configuration; use two-space indentation, no semicolons, and single-quoted strings. Use PascalCase for React components, camelCase for functions/hooks, and descriptive filenames such as `useWatchlist.ts` or `RoomInvite.tsx`. Keep API and domain types close to the feature or server module that owns them.

## Core Coding Principles

- **DRY (Don't Repeat Yourself):** keep each rule or piece of knowledge in one reusable place.
- **KISS (Keep It Simple, Stupid):** prefer the clearest solution over unnecessary abstraction.
- **YAGNI (You Aren't Gonna Need It):** implement current requirements, not speculative features.
- **SoC (Separation of Concerns):** keep UI, business logic, API access, and persistence in separate modules.
- **Fail Fast:** validate inputs and detect invalid state as early as possible.

## Object-Oriented Design Principles

Apply SOLID and GRASP pragmatically to components, hooks, services, and modules:

- **Single Responsibility:** each module should have one clear reason to change.
- **Open/Closed:** extend behavior without rewriting stable logic.
- **Liskov Substitution:** interchangeable implementations must preserve their contracts.
- **Interface Segregation:** prefer small, focused interfaces over large all-purpose ones.
- **Dependency Inversion:** depend on contracts or adapters rather than concrete integrations.
- Use GRASP principles such as **Information Expert**, **Low Coupling**, and **High Cohesion** when assigning responsibilities.
- Prefer **Composition over Inheritance**. Follow the **Law of Demeter**: avoid reaching through nested objects, such as `a.getB().getC().doSomething()`.

## Architecture & Development Methodologies

- **DDD (Domain-Driven Design):** use the product domain and its language when naming models, features, and services.
- **TDD (Test-Driven Development):** where practical, write a failing test, implement the minimum behavior, then refactor.
- **BDD (Behavior-Driven Development):** describe important user flows as observable “Given / When / Then” behavior.
- **Clean/Hexagonal Architecture:** keep core business rules independent of frameworks, databases, and external providers.
- **CQRS (Command Query Responsibility Segregation):** keep read models and state-changing commands separate when that reduces complexity.

## Testing Guidelines

Vitest is the test framework. Name tests `*.test.ts` and keep them near the implementation. Cover pure logic, API/service behavior, and room state transitions; keep external integration tests opt-in with `RUN_DB_TESTS=1`. Run lint, build, and the full test suite before opening a PR.

## Commit & Pull Request Guidelines

Use concise imperative Conventional Commit-style subjects, for example `feat: add country filtering`, `fix: restore room navigation`, or `perf: reduce UI work`. Keep commits focused. PRs should explain the user-visible change, include test results, call out configuration or migration changes, and attach screenshots or a short recording for UI changes. Link the relevant issue when one exists.
