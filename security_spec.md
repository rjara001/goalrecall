# GoalRecall Firestore Security Architecture Specification (Phase 0)

## 1. Data Invariants

1. **Verified Google Identity Gate**:
   - Every write operation across all collections requires `request.auth != null && request.auth.token.email_verified == true`. Anonymous (`signInAnonymously`) or unverified accounts are rejected at the Firestore layer.
2. **Strict Ownership & PII Isolation**:
   - Private user profile (`/users/{userId}` with `email`) and all 9 private subcollections (`cv`, `logs`, `experiences`, `products`, `certifications`, `careerGoals`, `offers`, `inbox`, `quotas`) are readable and writable **only** when `request.auth.uid == userId` AND the document's `userId` (or `id` on `/users/{userId}`) strictly equals `request.auth.uid`.
   - `allow list` on `/users/{userId}` and `/publicShowcases/{username}` and `/proWaitlist/{entryId}` is permanently `false` to prevent enumeration and scraping.
   - `allow list` on `/users/{userId}/<subcollection>` explicitly validates `resource.data.userId == request.auth.uid` on every queried document.
3. **Master Gate & Atomicity (`exists` / `existsAfter`)**:
   - Every subcollection under `/users/{userId}` validates on `create` that the parent user root document exists or is being created atomically in the same batch (`exists(...) || existsAfter(...)`).
   - On `get`, `update`, and `delete`, the parent document `/users/{userId}` must exist (`exists(...)`).
4. **Public Showcase PII Isolation & Handle Uniqueness**:
   - `/publicShowcases/{username}` allows single-document `get` (only for valid handles `^[a-z0-9_-]{3,30}$`) for visitors viewing `/u/:username` or availability checking.
   - `/publicShowcases/{username}` NEVER stores `email`, `phone`, or private CV fields (`isValidPublicUserProfile` explicitly allowlists safe keys only).
   - Claiming a handle (`create`) atomically fails if `/publicShowcases/{username}` already exists under a different owner; updates and deletes enforce `existing().ownerId == request.auth.uid` and immutable `ownerId` + `username` + `createdAt`.
5. **Privilege Escalation Prevention (`plan`)**:
   - Users creating `/users/{userId}` can only set `plan == "free"`. Client updates cannot mutate `plan`, `id`, `authProvider`, or `createdAt` (only server-side Stripe webhook/Admin SDK upgrades `plan` to `"pro"`).
6. **Temporal Integrity & Bounded Payloads**:
   - All `createdAt` fields must equal `request.time` on `create` and remain immutable on `update`.
   - All `updatedAt` fields must equal `request.time` on both `create` and `update`.
   - Every string checks `.size() <= maxLength`; every array checks `.size() <= MAX` and validates element shape where non-empty; every ID checks `isValidId()` (`^[a-zA-Z0-9_-]{1,128}$`).

---

## 2. The "Dirty Dozen" Attack Payloads (Must All Return `PERMISSION_DENIED`)

1. **Cross-Tenant Write Spoof (`/users/victimUid/logs/log-1`)**:
   - Attacker (`uid: "attacker"`, `email_verified: true`) writes `{ id: "log-1", userId: "victimUid", ... }` into another user's subcollection.
2. **Unverified Email Bypass (`/users/attacker/logs/log-1`)**:
   - Signed-in user with `email_verified: false` (or anonymous auth) attempts to create a log under their own UID.
3. **Privilege Escalation (`plan: "pro"` on `/users/attacker`)**:
   - Attacker creates or updates `/users/attacker` with `plan: "pro"` to bypass AI extraction quotas.
4. **Shadow / Ghost Field Injection (`isAdmin: true`)**:
   - Authenticated owner creates `/users/attacker/experiences/exp-1` including all valid required fields plus `isAdmin: true` (rejected by `keys().hasOnly(...)`).
5. **Value Poisoning / Type Mismatch (`isPublic: "yes"`)**:
   - Authenticated owner updates `/users/attacker/logs/log-1` setting `isPublic` to a string `"yes"` instead of boolean or setting `title` to a 50,000-character string (exceeds `maxLength: 2000`).
6. **Immutable Field Tampering (`userId` / `createdAt` overwrite on update)**:
   - Authenticated owner sends an update changing `createdAt` or `userId` on an existing log or changing `ownerId` on `/publicShowcases/myhandle`.
7. **ID Poisoning (Oversized or Invalid Document ID)**:
   - Authenticated user attempts to create `/users/attacker/logs/${"a".repeat(200)}` or `/users/attacker/logs/bad$id`.
8. **Timestamp Forgery (`createdAt` / `updatedAt` client clock spoofing)**:
   - Authenticated owner sends a literal client timestamp (`new Date(2000, 0, 1)`) instead of `serverTimestamp()` (`request.time`).
9. **PII Leak via Public Showcase (`/publicShowcases/myhandle`)**:
   - Authenticated owner attempts to write `userProfile.email: "secret@company.com"` inside `/publicShowcases/myhandle` (rejected by strict allowlist inside `isValidPublicShowcase`).
10. **Handle Hijack (`/publicShowcases/takenhandle`)**:
    - Attacker attempts to overwrite or delete `/publicShowcases/takenhandle` owned by `victimUid`.
11. **Collection Enumeration / Scraping (`list` on `/users`, `/publicShowcases`, `/proWaitlist`)**:
    - Any authenticated user attempts a collection query on `/users`, `/publicShowcases`, or `/proWaitlist`.
12. **Terminal State Violation (`proWaitlist` read/delete or `CareerGoal` invalid enum `status: "hacked"`)**:
    - Authenticated user tries to read `/proWaitlist` entries OR creates a `/careerGoals/goal-1` with invalid status `"hacked"` / invalid category `"unknown"`.
