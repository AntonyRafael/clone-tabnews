import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "model/user";
import password from "model/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            username: "test",
            email: "test@email.com",
            password: "123456",
          },
          null,
          2,
        ),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "test",
        email: "test@email.com",
        password: responseBody.password,
        updated_at: responseBody.updated_at,
        created_at: responseBody.created_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDataBase = await user.findOneByUsername("test");
      const correctPasswordMatch = await password.compare(
        "123456",
        userInDataBase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "wrongPass",
        userInDataBase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            username: "email-duplicated-1",
            email: "duplicated@email.com",
            password: "123456",
          },
          null,
          2,
        ),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            username: "email-duplicated-2",
            email: "Duplicated@email.com",
            password: "123456",
          },
          null,
          2,
        ),
      });

      expect(response2.status).toBe(400);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        action: "Utilize outro e-mail para realizar o cadastro",
        message: "O e-mail informado já esta sendo utilizado",
        name: "ValidationError",
        status_code: 400,
      });
    });

    test("With duplicated 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            username: "username-duplicated",
            email: "username1@email.com",
            password: "123456",
          },
          null,
          2,
        ),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            username: "username-duplicated",
            email: "username2@email.com",
            password: "123456",
          },
          null,
          2,
        ),
      });

      expect(response2.status).toBe(400);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        action: "Utilize outro username para realizar o cadastro",
        message: "O username informado já esta sendo utilizado",
        name: "ValidationError",
        status_code: 400,
      });
    });
  });
});
