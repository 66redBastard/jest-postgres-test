import { PostgresConnection } from "../../src/db/PostgresConnection.js";

describe("PostgresConnection integration test", () => {
  let db;

  beforeAll(() => {
    db = new PostgresConnection(); // бере конфіг з .env
  });

  afterAll(async () => {
    await db.disconnect();
  });

  test("should connect and return current time + version", async () => {
    const result = await db.safeExecuteQuery(
      "SELECT NOW() as now, version() as version"
    );

    expect(result.success).toBe(true);
    expect(result.data.rows.length).toBe(1);
    expect(result.data.rows[0]).toHaveProperty("now");
    expect(result.data.rows[0]).toHaveProperty("version");

    console.log("[Jest] Connected:", {
      now: result.data.rows[0].now,
      version: result.data.rows[0].version,
    });
  });
});
