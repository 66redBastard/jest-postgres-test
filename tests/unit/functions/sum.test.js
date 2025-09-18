import sum from "../../../src/functions/sum";

describe("sum functions", () => {
  // Test Case 1: sum of two positives numbers
  test("adds 1 + 1 to equal 2", () => {
    expect(sum(1, 1)).toBe(2);
  });
  // Test Case 2: Adds a positive and negative number
  test("adds -1 +1 to equal 0", () => {
    expect(sum(-1, 1)).toBe(0);
  });
  // Test Case 3: Adds two negative numbers
  test("adds -1 + -1 to equal -2", () => {
    expect(sum(-1, -1)).toBe(-2);
  });
  // Test Case 4: Adds zero
  test("adds 0 + 0 to equal 0", () => {
    expect(sum(0, 0)).toBe(0);
  });
  // Test Case 5: Adds decimal numbers
  test("adds 0.1 + 0.2 to equal 0.3", () => {
    expect(sum(0.1, 0.2)).toBeCloseTo(0.3);
  });
  // Test Case 6: Adds large numbers
  test("adds 1000000 + 2000000 to equal 3000000", () => {
    expect(sum(1000000, 2000000)).toBe(3000000);
  });
  // Test Case 7: Adds very small numbers
  test("adds 0.000001 + 0.000002 to equal 0.000003", () => {
    expect(sum(0.000001, 0.000002)).toBeCloseTo(0.000003);
  });
  // Test Case 8: Adds negative and positive decimal numbers
  test("adds -0.1 + 0.2 to equal 0.1", () => {
    expect(sum(-0.1, 0.2)).toBeCloseTo(0.1);
  });
});
