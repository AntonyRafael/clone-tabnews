import database from "infra/database";
import { ValidationError } from "infra/errors";

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validateUniqueEmail(email) {
    const result = await database.query({
      text: `
        SELECT 
          email
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
      values: [email],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "O e-mail informado já esta sendo utilizado",
        action: "Utilize outro e-mail para realizar o cadastro",
      });
    }

    return result.rows[0];
  }

  async function validateUniqueUsername(username) {
    const result = await database.query({
      text: `
        SELECT 
          username
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        ;`,
      values: [username],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "O username informado já esta sendo utilizado",
        action: "Utilize outro username para realizar o cadastro",
      });
    }

    return result.rows[0];
  }

  async function runInsertQuery(userInputValues) {
    const { username, email, password } = userInputValues;

    const result = await database.query({
      text: `
        INSERT INTO
          users (username, email, password)
        VALUES 
          ($1, $2, $3)
        RETURNING
          *
        `,
      values: [username, email, password],
    });

    return result.rows[0];
  }
}

const user = {
  create,
};

export default user;
