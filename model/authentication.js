import user from "model/user";
import password from "model/password";
import { NotFoundError, UnauthorizedError } from "infra/errors";

async function getUser(providedEmail, providedPassword) {
  try {
    let storedUser;

    try {
      storedUser = await user.findOneByEmail(providedEmail);
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email não confere.",
          action: "Verifique se este dado está correto.",
        });
      }

      throw e;
    }

    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedUser.password,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se este dado está correto.",
      });
    }

    return storedUser;
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      });
    }

    console.log(e);
    throw e;
  }
}

const authentication = {
  getUser,
};

export default authentication;
