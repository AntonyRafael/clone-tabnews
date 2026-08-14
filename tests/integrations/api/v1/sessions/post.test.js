import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator.js";
import session from "model/session";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({
        password: "correct-password",
      });

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            email: "incorrect-email@email.com",
            password: "correct-password",
          },
          null,
          2,
        ),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Verifique se os dados enviados estão corretos.",
        message: "Dados de autenticação não conferem.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("With correct `email` but incorrect `password`", async () => {
      await orchestrator.createUser({
        email: "correctEmailSession@email.com",
      });

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            email: "correctEmailSession@email.com",
            password: "incorrect-password",
          },
          null,
          2,
        ),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Verifique se os dados enviados estão corretos.",
        message: "Dados de autenticação não conferem.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("With incorrect `email` and incorrect `password`", async () => {
      await orchestrator.createUser();

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            email: "incorrectEmailSession@email.com",
            password: "incorrect-password",
          },
          null,
          2,
        ),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Verifique se os dados enviados estão corretos.",
        message: "Dados de autenticação não conferem.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("With correct `email` and correct `password`", async () => {
      const createdUser = await orchestrator.createUser({
        email: "correct-email@email.com",
        password: "correct-pass",
      });

      await orchestrator.activateUser(createdUser);

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            email: "correct-email@email.com",
            password: "correct-pass",
          },
          null,
          2,
        ),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        created_at: responseBody.created_at,
        expires_at: responseBody.expires_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);

      expect(expiresAt >= createdAt).toBe(true);

      const actualLifetimeInMilliseconds = expiresAt - createdAt;
      const lifetimeDifferenceInMilliseconds =
        session.EXPIRATION_IN_MS - actualLifetimeInMilliseconds;

      expect(lifetimeDifferenceInMilliseconds).toBeLessThanOrEqual(5000);

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: responseBody.token,
        maxAge: session.EXPIRATION_IN_MS / 1000,
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      });
    });
  });
});
