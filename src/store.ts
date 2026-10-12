export interface User { id: number; email: string; name: string; passwordHash: string; createdAt: string }

/** Armazenamento em memória (troque por SQLite/Postgres em produção). */
export class UserStore {
  private users: User[] = [];
  private seq = 1;
  findByEmail(email: string) { return this.users.find((u) => u.email === email.toLowerCase()); }
  findById(id: number) { return this.users.find((u) => u.id === id); }
  create(data: Omit<User, 'id' | 'createdAt'>): User {
    const user = { ...data, email: data.email.toLowerCase(), id: this.seq++, createdAt: new Date().toISOString() };
    this.users.push(user);
    return user;
  }
}
