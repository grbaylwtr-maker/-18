---
name: Sanctuary project structure
description: Architecture and feature map for الملاذ (Sanctuary) anonymous cosmic social platform
---

**Stack:** React+Vite (artifacts/sanctuary), Express 5 API (artifacts/api-server), PostgreSQL+Drizzle, OpenAPI codegen (Orval)

**Identity system:** Anonymous "طيف" (spectrum). User picks a color on first visit → stored in localStorage as `spectralColor`. Bookmarks/moods use `spectralToken` (UUID in localStorage).

**Pages (all in artifacts/sanctuary/src/pages/):**
- Atrium (/) — home/dashboard
- Galaxy, GalaxyDetail — live anonymous chat rooms + polls tab
- Tales — stories with pulse/comments/bookmark
- Expression — free art gallery (visual/poetry/motion) with real API data
- Echo — AI echo companion
- Mystery — anonymous secret sharing
- Search (/search) — cross-dimension search
- MoodJournal (/mood) — mood tracking with history visualization
- MyCosmos (/cosmos) — saved bookmarks by content type
- Plus: Mirrors, Music, Freedom, Kindred, Simplicity, Complexity, Sanctuary

**DB tables:** galaxies, galaxy_messages, tales, tale_comments, secrets, reels, expressions, moods, bookmarks, polls + sanctuary-specific support tables

**Seeded data:** 5 galaxies, 5 tales, 6 reels, 5 secrets, 6 expressions

**API routes:** /api/galaxies, /api/tales, /api/expressions, /api/secrets, /api/echo, /api/polls, /api/moods, /api/bookmarks, /api/search

**Why:** Galaxy IDs start at "1" in DB but the GALAXY_COLORS map in GalaxyDetail.tsx uses string keys ("1", "2", etc) — this matches because all IDs are string type.
