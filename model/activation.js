import user from "model/user";
import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import { ForbiddenError, NotFoundError } from "infra/errors";
import authorization from "model/authorization";

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
    from: "NyFar <contato@nyfar.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no CloneTab!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no CloneTab!

${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
CloneTab.`,
  });
}

async function finOneValidById(tokenId) {
  const activationTokenObject = await runInsertQuery(tokenId);
  return activationTokenObject;

  async function runInsertQuery(tokenId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT
          1
      ;`,
      values: [tokenId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }

    return results.rows[0];
  }
}

async function markTokenAsUsed(tokenId) {
  const usedActivationToken = await runInsertQuery(tokenId);
  return usedActivationToken;

  async function runInsertQuery(tokenId) {
    const results = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [tokenId],
    });

    return results.rows[0];
  }
}

async function activateByUserId(userId) {
  const userToActivate = await user.findOneById(userId);

  if (!authorization.can(userToActivate, "read:activation_token")) {
    throw new ForbiddenError({
      message: "Você não pode mais utilizar tokens de ativação.",
      action: "Entre em contato com o suporte.",
    });
  }

  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
    "update:user",
  ]);
  return activatedUser;
}

const activation = {
  EXPIRATION_IN_MS,
  sendEmailToUSer,
  create,
  finOneValidById,
  markTokenAsUsed,
  activateByUserId,
};

export default activation;
