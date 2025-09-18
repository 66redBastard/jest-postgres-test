export class BaseDatabase {
  constructor() {
    // OOP Abstraction: забороняє створення екземплярів абстрактного класу
    if (this.constructor === BaseDatabase) {
      throw new Error("Cannot instantiate abstract class BaseDatabase");
    }
    // OOP: Encapsulation: приватні властивості з _ (умовно)
    this._connectionStats = {
      attemps: 0,
      successful: 0,
      failed: 0,
      isConnected: false,
      lastConnectionTime: null,
    };
  }
  // SOLID: interface segregation principle - абстрактні методи, які МАЮТЬ бути реалізовані в підкласах
  async connect() {
    throw new Error("Method 'connect()' must be implemented.");
  }
  async disconnect() {
    throw new Error("Method 'disconnect()' must be implemented.");
  }
  async executeQuery(sql, params) {
    throw new Error("Method 'executeQuery()' must be implemented.");
  }
  // OOP Encapsulation: гетери для доступу до приватних властивостей тобто обмеження доступу до внутрішнього стану обєкта

  get connectionStats() {
    return { ...this._connectionStats }; // повертаємо копію, щоб уникнути зовнішніх змін в обєкті _connectionStats (який тільки умовно приватний)
  }
  // Protected method - доступний тільки в підкласах
  _updateConnectionStats(success) {
    this._connectionStats.attemps++;
    if (success) {
      this._connectionStats.successful++;
      this._connectionStats.isConnected = true;
      this._connectionStats.lastConnectionTime = new Date();
    } else {
      this._connectionStats.failed++;
      this._connectionStats.isConnected = false;
    }
  }
  // SOLID: OPEN/CLOSED principle - template method pattern
  // шаблонний метод, який використовує інші методи класу
  // для виконання запиту з обробкою помилок
  async safeExecuteQuery(sql, params) {
    try {
      const result = await this.executeQuery(sql, params);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
