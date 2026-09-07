# Night Ecosystem (night.pi)

Night is a phased ecosystem designed as a bridge between users and the Pi Network, gradually expanding into a suite of products: a utility token, a decentralized social layer with permanent storage, market intelligence tools, and AI agents for online/offline payments.

> **Core brands**
> - **Night Protocol (NTP)**: the ecosystem utility token
> - **NightGrid**: decentralized social & permanent text registry
> - **NightCap**: market data + supply/unlock/mint/burn analytics
> - **NightAgent**: AI agents, including offline payment mechanisms (NFC / cards)

---

## Vision

Build a global, censorship-resistant and user-friendly ecosystem where:
- value transfer is simple (via Pi / NTP),
- messages and important texts can be stored **permanently**,
- ideas can be publicly registered with proof of time and authorship,
- users get intelligent tools to monitor token supply dynamics and exchange flows,
- offline payments become possible through secure “access code” mechanisms.

---

## Ecosystem Phases

### Phase 1 — Night Protocol (NTP)
NTP is the utility token used across the Night ecosystem.

**Initial utilities**
1. Exchange fees on **Picex.pi**
2. dApp registration fee on **PiExplorer.pi**
3. Base currency for registering polls/votes and creating polls
4. Daily payments **online and offline** (via NightAgent / NAA)

> Note: Pi Network capabilities and SDK limitations may require using **Pi** as the payment asset in early stages, while NTP is used as internal credit/utility until token payments are supported.

---

### Phase 2 — NightGrid (Decentralized Blockchain Social)
NightGrid is a decentralized social layer focused on long-term value: permanent messaging, long-lived text records, and idea registration.

**Key capabilities**
- **Permanent message storage** with a small user-paid fee  
  Users pay via Pi/NTP; the system writes the final content to **Arweave** (using AR paid by the project backend).
- **Government/enterprise usage**: immutable long-term text contracts and memorandums.
- **Idea marketplace & proof-of-authorship**:
  - users publicly register ideas and sign them,
  - visibility/support makes ideas trend,
  - trending ideas can be rewarded with NTP,
  - third parties can purchase rights directly inside the app to reduce future disputes.

**Storage architecture**
- User pays fee (Pi or NTP)
- Backend verifies payment
- Backend writes text to **Arweave**
- Backend indexes `user ↔ arweave_tx_id` for fast retrieval/search

---

### Phase 3 — NightCap (Market Intelligence)
NightCap starts by indexing tokens created in the Pi ecosystem and can expand to cover the entire crypto market.

**Planned features**
- Market pages for tokens/coins (price + metadata)
- **Supply dynamics charts**:
  - mint / burn trends
  - unlock/vesting visualization where possible
  - comparison of supply change speed across time windows (day/week/month/year)
- Exchange analytics:
  - standard exchange info
  - **inflow/outflow charts** (net flows) to evaluate exchange strength and market pressure

---

### Phase 4 — NightAgent (AI Agents)
NightAgent introduces agents that connect to NTP and enable secure offline-to-online circulation.

**Agent 1: Offline Access Codes**
- Convert token value into **multi-digit offline codes**
- Codes represent **access rights**, not “stored balance”
- After a purchase:
  - buyer’s code becomes invalid (burned/expired)
  - a new code is created for the seller (same value or updated remaining rights)
- Offline usage:
  1. **NFC tags**
  2. **Physical cards**
- Operates in encrypted mode and syncs when the device becomes online

---

## Repository Structure (recommended)

This ecosystem is best managed as a **monorepo**.

```text
/night
  /apps
    /nightgrid        # frontend/backend for NightGrid
    /nightcap         # frontend/backend for NightCap
  /packages
    /protocol         # token / protocol logic / integrations
    /agent            # offline/online agent logic
    /shared           # shared types, utils
  Tech Overview
Payments
Pi SDK for authentication and Pi payments (where supported)
NTP can be used as:
utility token on-chain (when possible),
or internal credits (off-chain) for better UX in early stages.
Permanent Storage
Arweave is the primary permanent storage layer for text content.
Indexing / Search
A traditional database (e.g., PostgreSQL) is used as an index:
avoids scanning Arweave for user history,
enables fast profile/history lookups.
Security Notes (Important)
Never trust front-end payment claims; always verify via backend.
Keep blockchain keys (Pi/Arweave) in secure server environments (Vault/Env vars).
For credit-based models:
use atomic operations (reserve/commit/rollback),
maintain a transparent ledger of user credit events.
Roadmap (High-Level)
 Phase 1: NTP token + utility integration (fees, dApp registration, polls)
 Phase 2: NightGrid MVP (pay → write to Arweave → index → display)
 Phase 3: NightCap MVP (top assets + supply velocity charts)
 Phase 4: NightAgent prototype (offline codes + NFC/card experiments)
Contributing
Contributions are welcome once the repository is public and the initial architecture is finalized.

Disclaimer
Night is an evolving ecosystem. Some components depend on third-party capabilities (e.g., Pi SDK features, token transfer support, and network availability). Specifications may change as the underlying platforms evolve.

