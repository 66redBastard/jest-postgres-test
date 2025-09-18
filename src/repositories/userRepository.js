/**
 * Репозиторій інкапсулює SQL для конкретної доменної області (users).
 * Ніякої інфраструктурної логіки тут немає — лише запити й валідація вхідних даних.
 *
 * Конструктор приймає будь-який об'єкт, який реалізує інтерфейс BaseDatabase:
 * - safeExecuteQuery(sql, params)
 * - executeQuery(sql, params)
 * Це дозволяє підміняти PostgresConnection на іншу БД або мок у тестах.
 */
export class UserRepository {
  constructor(db) {
    if (!db || typeof db.safeExecuteQuery !== "function") {
      throw new Error(
        "[UserRepository] invalid db dependency: BaseDatabase-compatible instance is required"
      );
    }
    this.db = db;
    console.log("[UserRepository] ctor: ready");
  }

  async getAll() {
    console.log("[UserRepository] getAll");
    return this.db.safeExecuteQuery("SELECT * FROM users ORDER BY id");
  }

  async getById(id) {
    console.log("[UserRepository] getById:", { id });

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: "Invalid user id (must be positive integer)",
      };
    }

    return this.db.safeExecuteQuery("SELECT * FROM users WHERE id = $1", [id]);
  }

  async create({ name, email }) {
    console.log("[UserRepository] create:", { name, email });

    if (typeof name !== "string" || name.trim().length < 2) {
      return { success: false, error: "Invalid name (min 2 chars)" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return { success: false, error: "Invalid email format" };
    }

    return this.db.safeExecuteQuery(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name.trim(), email.toLowerCase()]
    );
  }

  /**
   * Приклад запиту, який вже ближчий до бізнес-логіки, але все ще належить репозиторію,
   * бо це робота з даними конкретного агрегата (users + orders).
   * Якщо хочеш повністю відсунути це з репозиторію — винеси в OrderRepository.
   */
  async getWithOrderStats() {
    console.log("[UserRepository] getWithOrderStats");

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(o.id) AS order_count,
        COALESCE(SUM(o.amount), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.name, u.email
      ORDER BY u.id
    `;

    return this.db.safeExecuteQuery(sql);
  }
}
