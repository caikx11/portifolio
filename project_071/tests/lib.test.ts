import { Store, luhn, validExpiry, KV, AuthError } from "../src/lib";
const mem = (): KV => { const m: Record<string, string> = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; }, removeItem: (k) => { delete m[k]; } }; };
const card = { number: "4242 4242 4242 4242", expiry: "12/40", cvc: "123" };
describe("validators", () => {
  test("luhn", () => { expect(luhn("4242 4242 4242 4242")).toBe(true); expect(luhn("4242 4242 4242 4241")).toBe(false); expect(luhn("abc")).toBe(false); });
  test("expiry", () => { const now = new Date(2026, 5, 1); expect(validExpiry("06/26", now)).toBe(true); expect(validExpiry("05/26", now)).toBe(false); expect(validExpiry("13/30", now)).toBe(false); expect(validExpiry("x", now)).toBe(false); });
});
describe("Store", () => {
  test("signUp/logIn/logOut", () => {
    const s = new Store(mem());
    const u = s.signUp("Ana", "Ana@x.com", "12345678");
    expect(u.plan).toBe("free"); expect(s.session()?.email).toBe("ana@x.com");
    s.logOut(); expect(s.session()).toBeNull();
    expect(() => s.logIn("ana@x.com", "errada123")).toThrow(AuthError);
    expect(s.logIn("ANA@x.com", "12345678").name).toBe("Ana");
  });
  test("rejeita cadastro inválido e duplicado", () => {
    const s = new Store(mem());
    expect(() => s.signUp("A", "a@b.co", "12345678")).toThrow();
    expect(() => s.signUp("Ana", "ruim", "12345678")).toThrow(/E-mail/);
    expect(() => s.signUp("Ana", "a@b.co", "123")).toThrow(/senha/);
    s.signUp("Ana", "a@b.co", "12345678");
    expect(() => s.signUp("Ana", "a@b.co", "12345678")).toThrow(/já está/);
  });
  test("checkout demo muda de plano e cria fatura", () => {
    const s = new Store(mem()); s.signUp("Ana", "a@b.co", "12345678");
    const inv = s.checkout("pro", card);
    expect(inv.amount).toBe(29); expect(inv.last4).toBe("4242");
    expect(s.session()?.plan).toBe("pro"); expect(s.invoices("a@b.co")).toHaveLength(1);
    expect(() => s.checkout("pro", card)).toThrow(/já está/);
    expect(() => s.checkout("team", { ...card, number: "4000 0000 0000 0002" })).toThrow(/recusado/);
    expect(() => s.checkout("team", { ...card, cvc: "1" })).toThrow(/CVC/);
  });
  test("limites de uso e cancelamento", () => {
    const s = new Store(mem()); s.signUp("Ana", "a@b.co", "12345678");
    s.addUsage("projects", 2);
    expect(() => s.addUsage("projects", 1)).toThrow(/Limite/);
    s.checkout("pro", card); s.addUsage("projects", 5);
    expect(s.cancel().usage.projects).toBe(3); expect(s.session()?.plan).toBe("free");
  });
});
