class UsersMemoryDao {
  #users;
  #nextId;

  constructor(initialUsers = []) {
    this.#users = [...initialUsers];
    this.#updateNextId();
  }

  #updateNextId() {
    const maxId = this.#users.reduce((max, user) => Math.max(max, user.id), 0);
    this.#nextId = maxId + 1;
  }

    async getById(id) {
    const user = this.#users.find((u) => u.id === Number(id));
    if (!user) {
      return null;
    }
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
  
    async getByEmail(email) {
        const user = this.#users.find((u) => u.email === email);
        if (!user) {
        return null;
        }
        const { passwordHash, ...safeUser } = user;
        return safeUser;
     }

  async getCredentialsByEmail(email) {
    const user = this.#users.find((u) => u.email === email);
    return user ? { ...user } : null;
  }

   async save(userData) {
    const { id, ...dataWithoutId } = userData;
    const newUser = { id: this.#nextId, ...dataWithoutId };
    this.#users.push(newUser);
    this.#nextId++;
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;

  }


  async update(id, updatedData) {
    const userIndex = this.#users.findIndex((u) => u.id === Number(id));
    if (userIndex === -1) {
      return null;
    }
    const { id: ignoredId, ...changesWithoutId } = updatedData;
    const updatedUser = { ...this.#users[userIndex], ...changesWithoutId };
    this.#users[userIndex] = updatedUser;
    const { passwordHash, ...safeUser } = updatedUser;
    return safeUser;
  }

async delete(id) {
  const userIndex = this.#users.findIndex((u) => u.id === Number(id));
  if (userIndex === -1) {
    return false;
  } 
  this.#users.splice(userIndex, 1);
  return true;
}

 #filter({ role, is_active } = {}) {
    return this.#users.filter(
      (u) => (role === undefined || u.role === role) && (is_active === undefined || u.is_active === is_active)
    );
  }

async getAll({ role, is_active, page = 1, limit } = {}) {
  let users = this.#filter({ role, is_active });
  if (limit) users = users.slice((page - 1) * limit, page * limit);
  return users.map((u) => {
    const { passwordHash, ...safeUser } = u;
    return safeUser;
  });
}

 async count({ role, is_active } = {}) {
    return this.#filter({ role, is_active }).length;
  }

}
export { UsersMemoryDao };
export default UsersMemoryDao;