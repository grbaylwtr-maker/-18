---
name: Sanctuary API types
description: Correct types and field names in the Orval-generated API client for الملاذ (Sanctuary)
---

All entity IDs are `string` in the generated API (`taleId: string`, `galaxyId: string`, `pollId: string`, `expressionId: string`). Never use `number`.

Key field names that differ from intuition:
- `PollVoteInput`: has `optionId: string` (NOT `optionIndex`)
- `CommentInput`: has `content` and `spectralColor` (NOT `spectralToken`)
- `BookmarkInput`: requires `contentType`, `contentId`, `spectralToken`
- `MoodInput`: requires `mood` (integer), `spectralToken`
- `EchoMessageInput`: has `content` only (no `spectralColor`)

Hook option patterns:
- Do NOT pass `{ query: { enabled: bool } }` — causes `queryKey missing` TS error. Use conditional submission state instead.
- Do NOT pass `{ query: { refetchInterval: N } }` for the same reason. Use useEffect + refetch for polling.
- The correct options shape is `{ query?: UseQueryOptions<...>, request?: CustomFetchOptions }` — but passing partial query options causes TS errors about missing `queryKey`.

**Why:** Orval generates `UseQueryOptions` type for the `query` param which requires `queryKey`, but the helper function fills it in automatically. TypeScript sees a mismatch.

**How to apply:** For GalaxyDetail live chat, use basic `useGetGalaxyMessages(galaxyId)` without refetchInterval option.
