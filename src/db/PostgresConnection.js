// PostgresConnection.js
import pkg from "pg";
import dotenv from "dotenv";
import { BaseDatabase } from "./BaseDatabase.js";

dotenv.config();
const { Pool } = pkg;

/**
 * Інфраструктурний шар: клас відповідає лише за роботу з PostgreSQL.
 * OOP: Наслідування від BaseDatabase.
 * SOLID (SRP): жодної доменної логіки — лише конекшн і виконання запитів.
 */
export class PostgresConnection extends BaseDatabase {
  constructor(config = null) {
    /**
     * super() викликає конструктор батьківського класу BaseDatabase,
     * щоб ініціалізувати його внутрішній стан (_connectionStats) і зробити доступними
     * методи на кшталт _updateConnectionStats та safeExecuteQuery.
     */
    super();

    console.log("[PostgresConnection]: start");

    this._config = config || this._loadEnvConfig();
    this._pool = null;
    this._isInitialized = false;

    this._initializePool();

    console.log("[PostgresConnection]: ready");
  }

  /**
   * Завантаження та базова валідація конфігурації з .env
   * Мінімум обовʼязкових змінних: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
   */
  _loadEnvConfig() {
    const required = ["POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB"];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `[PostgresConnection] Missing env variables: ${missing.join(", ")}`
      );
    }

    const config = {
      user: String(process.env.POSTGRES_USER),
      host: String(process.env.POSTGRES_HOST || "localhost"),
      database: String(process.env.POSTGRES_DB),
      password: String(process.env.POSTGRES_PASSWORD),
      port: Number.parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    };

    console.log("[PostgresConnection]: env config loaded");
    return config;
  }

  /**
   * Створення пулу з'єднань. Окремо винесено для прозорості й тестованості.
   */
  _initializePool() {
    console.log("[PostgresConnection]: initializing pool...");
    try {
      this._pool = new Pool(this._config);
      this._isInitialized = true;

      // Діагностичний лог (пароль не логимо)
      console.log("[PostgresConnection]: pool created with config:", {
        user: this._config.user,
        host: this._config.host,
        database: this._config.database,
        port: this._config.port,
        isInitialized: this._isInitialized,
      });

      // Глобальний обробник помилок пулу (idle client errors)
      this._pool.on("error", (err) => {
        console.error("[PostgresConnection]: pool error (idle client):", err);
        this._updateConnectionStats(false);
      });

      console.log("[PostgresConnection]: pool initialized");
    } catch (err) {
      this._isInitialized = false;
      throw new Error(
        `[PostgresConnection]: failed to initialize pool: ${err.message}`
      );
    }
  }

  /**
   * Перевизначення абстрактного методу BaseDatabase.connect()
   * Повертає клієнт з пулу (не забувайте client.release() після використання в транзакціях).
   */
  async connect() {
    if (!this._isInitialized) {
      throw new Error("[PostgresConnection]: connect: pool is not initialized");
    }

    try {
      const client = await this._pool.connect();
      this._updateConnectionStats(true);
      console.log("[PostgresConnection]: connect: client acquired");
      return client;
    } catch (err) {
      this._updateConnectionStats(false);
      console.error("[PostgresConnection]: connect: failed:", err.message);
      throw err;
    }
  }

  /**
   * Перевизначення абстрактного методу BaseDatabase.disconnect()
   * Коректно завершує пул зʼєднань.
   */
  async disconnect() {
    if (!this._pool) {
      console.log("[PostgresConnection]: disconnect: already disconnected");
      return;
    }

    try {
      await this._pool.end();
      this._isInitialized = false;
      this._updateConnectionStats(false);
      console.log("[PostgresConnection]: disconnect: pool closed");
    } catch (err) {
      console.error("[PostgresConnection]: disconnect: failed:", err.message);
      throw err;
    }
  }

  /**
   * Перевизначення абстрактного методу BaseDatabase.executeQuery(sql, params)
   * Виконує параметризований SQL через пул. Для безпечного виконання з хендлінгом помилок
   * використовуйте BaseDatabase.safeExecuteQuery(sql, params).
   */
  async executeQuery(sql, params = []) {
    if (!this._isInitialized) {
      throw new Error(
        "[PostgresConnection] executeQuery: pool is not initialized"
      );
    }
    console.log("[PostgresConnection] executeQuery:", {
      preview: String(sql).slice(0, 80),
      paramsCount: Array.isArray(params) ? params.length : 0,
    });
    return this._pool.query(sql, params);
  }

  // опційно: допоміжні гетери (зручно у тестах / дебагу)
  get config() {
    return { ...this._config };
  }

  get isInitialized() {
    return this._isInitialized;
  }
}
