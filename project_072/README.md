# 072 · Brasa (lista em tempo real estilo Firebase)
TypeScript + Tailwind. `src/localfire.ts` imita a API modular do Firestore (`getFirestore`, `collection`, `doc`, `query`, `orderBy`, `where`, `addDoc`, `setDoc`, `updateDoc`, `deleteDoc`, `onSnapshot`, `serverTimestamp`). Dados em `localStorage`, sincronização entre abas por `BroadcastChannel` (e contagem de abas conectadas).

## Trocar pelo Firebase real
1. `npm i firebase`
2. Substitua o conteúdo de `src/firebase.ts` por:
```ts
import { initializeApp } from "firebase/app";
import { getFirestore as gf } from "firebase/firestore";
export * from "firebase/firestore";
const app = initializeApp({ apiKey: "…", projectId: "…" });
export const initDb = () => gf(app);
export const getFirestore = (_opts?: unknown) => gf(app);
export const onPresence = (_db: unknown, cb: (n: number) => void) => { cb(1); return () => {}; }; // use Realtime Database/presença própria
export const leave = (_db: unknown) => {};
```
O restante de `src/main.ts` usa só essas funções, então não muda.

```
npm i && npm run build && npm test
```
