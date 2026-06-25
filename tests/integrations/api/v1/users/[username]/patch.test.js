import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "model/user";
import password from "model/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistent",
        { method: "PATCH" },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "username1",
      });

      await orchestrator.createUser({
        username: "username2",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/username2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              username: "username1",
            },
            null,
            2,
          ),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Utilize outro username para realizar esta operação.",
        message: "O username informado já esta sendo utilizado",
        name: "ValidationError",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({ email: "duplicatedemail1@email.com" });

      const createdUser2 = await orchestrator.createUser({
        email: "duplicatedemail2@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              email: "duplicatedemail1@email.com",
            },
            null,
            2,
          ),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Utilize outro e-mail para realizar esta operação.",
        message: "O e-mail informado já esta sendo utilizado",
        name: "ValidationError",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueUser1",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              username: "uniqueUser2",
            },
            null,
            2,
          ),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        email: responseBody.email,
        password: responseBody.password,
        features: ["read:activation_token"],
        updated_at: responseBody.updated_at,
        created_at: responseBody.created_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(
        Date.parse(responseBody.updated_at) >
          Date.parse(responseBody.created_at),
      ).toBe(true);
    });

    test("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser({
        email: "uniqueEmail1@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              email: "uniqueEmail2@email.com",
            },
            null,
            2,
          ),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: "uniqueEmail2@email.com",
        password: responseBody.password,
        features: ["read:activation_token"],
        updated_at: responseBody.updated_at,
        created_at: responseBody.created_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(
        Date.parse(responseBody.updated_at) >
          Date.parse(responseBody.created_at),
      ).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "newPassword1",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              password: "newPassword2",
            },
            null,
            2,
          ),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        password: responseBody.password,
        features: ["read:activation_token"],
        updated_at: responseBody.updated_at,
        created_at: responseBody.created_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(
        Date.parse(responseBody.updated_at) >
          Date.parse(responseBody.created_at),
      ).toBe(true);

      const userInDataBase = await user.findOneByUsername(createdUser.username);
      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDataBase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "newPassword1",
        userInDataBase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
