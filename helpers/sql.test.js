const { sqlForPartialUpdate } = require('./sql')

describe("test sqlForPartialUpdate", function () {
    test("update", function () {
      const result = sqlForPartialUpdate(
          { test: "test" },
          { test: "test1", test2: "test2" });
      expect(result).toEqual({
        setCols: "\"test1\"=$1",
        values: ["test"],
      });
    });
  
    test("update with two items", function () {
      const result = sqlForPartialUpdate(
          { test: "test", test2: "test2" },
          { test3: "test3" });
      expect(result).toEqual({
        setCols: "\"test\"=$1, \"test3\"=$2",
        values: ["test", "test2"],
      });
    });
  });
  