import email from "infra/email";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Test <test@example.com>",
      to: "contato@test.com",
      subject: "Test",
      text: "Test of body",
    });

    await email.send({
      from: "Test <test@example.com>",
      to: "contato@test.com",
      subject: "Test last email",
      text: "Test of last email body",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<test@example.com>");
    expect(lastEmail.recipients[0]).toBe("<contato@test.com>");
    expect(lastEmail.subject).toBe("Test last email");
    expect(lastEmail.text).toBe("Test of last email body\n");
  });
});
