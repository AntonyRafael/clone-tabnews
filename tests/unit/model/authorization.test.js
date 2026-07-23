import authorization from "model/authorization";
import { InternalServerError } from "infra/errors";
import { password } from "pg/lib/defaults";

describe("model/authorization", () => {
  describe(".can()", () => {
    test("without `user`", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "withoutUser",
      };
      expect(() => {
        authorization.can(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with unknown `user.features`", () => {
      const createdUser = {
        username: "withFeatures",
        features: [],
      };
      expect(() => {
        authorization.can(createdUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("with valid `user` and known `feature`", () => {
      const createdUser = {
        username: "withFeatures",
        features: ["create:user"],
      };
      expect(authorization.can(createdUser, "create:user")).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    test("without `user`", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "withoutUser",
      };
      expect(() => {
        authorization.filterOutput(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with unknown `user.features`", () => {
      const createdUser = {
        username: "withFeatures",
        features: [],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("with valid`user`, know `feature` but no `resource`", () => {
      const createdUser = {
        username: "withFeatures",
        features: ["read:user"],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "read:user");
      }).toThrow(InternalServerError);
    });

    test("with valid `user`, and known `feature` and `resource`", () => {
      const createdUser = {
        username: "withFeatures",
        features: ["read:user"],
      };

      const resource = {
        id: 1,
        username: "resource",
        features: ["read:user"],
        created_at: "2026-0101T00:00:00.00Z",
        updated_at: "2026-0101T00:00:00.00Z",
        password: "1234456",
        email: "resource@email.com",
      };

      const result = authorization.filterOutput(
        createdUser,
        "read:user",
        resource,
      );

      expect(result).toEqual({
        id: 1,
        username: "resource",
        features: ["read:user"],
        created_at: "2026-0101T00:00:00.00Z",
        updated_at: "2026-0101T00:00:00.00Z",
      });
    });
  });
});
