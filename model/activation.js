import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";

const EXPIRATION_IN_MS = 60 * 15 * 1000; // 15min

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      ;`,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function sendEmailToUSer(user, activationToken) {
  await email.send({
    from: " FinTab <contato@fintab.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no CloneTab!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no CloneTab!

${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
CloneTab.`,
  });
}

async function finOneByUserId(userId) {
  const newToken = await runInsertQuery(userId);
  return newToken;

  async function runInsertQuery(userId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          user_id = $1
        LIMIT
          1
      ;`,
      values: [userId],
    });

    return results.rows[0];
  }
}

const activation = {
  sendEmailToUSer,
  create,
  finOneByUserId,
};

export default activation;
