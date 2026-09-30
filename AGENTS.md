# MediResQ AI — architecture rules

- Demo data lives in `src/lib/mock-data.ts` and is the only data source; swap this module for a hosted database without touching pages.
- All shared app state (session, inventory, transfers, alerts, emergency mode) goes through `src/lib/store.tsx`; pages never hold their own copy of domain data.
- Risk scoring lives only in `src/lib/risk-engine.ts` so a real ML service can replace it in one place.
- Forecasting and assistant replies go through `src/lib/ai-service.ts`; its return shapes are the contract for a future FastAPI + scikit-learn backend.
- Every page renders inside `src/components/AppShell.tsx`, which owns navigation, the auth redirect and the demo-mode indicator.
- Colors, shadows and gradients are tokens in `src/styles.css`; components never hardcode color utilities.
