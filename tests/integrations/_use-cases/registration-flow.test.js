import testUtils from "react-dom/test-utils";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
  test("Create user account", async () => {
    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          username: "RegistrationFlow",
          email: "registration.flow@email.com",
          password: "RegistrationFlowPass",
        },
        null,
        2,
      ),
    });

    expect(response.status).toBe(201);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: "RegistrationFlow",
      email: "registration.flow@email.com",
      password: responseBody.password,
      features: ["read:activation_token"],
      updated_at: responseBody.updated_at,
      created_at: responseBody.created_at,
    });
  });
});
