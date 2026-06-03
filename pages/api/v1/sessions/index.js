import { createRouter } from "next-connect";
import controller from "infra/controllers";
import authentication from "model/authentication";
import session from "model/session";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(req, res) {
  const userInputValues = req.body;
  let authenticatedUser;

  authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  await controller.setSessionCookie(newSession.token, res);

  return res.status(201).json(newSession);
}
