import { createRouter } from "next-connect";
import controller from "infra/controllers";
import user from "model/user";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
  const username = req.query.username;
  const userFound = await user.findOneByUsername(username);
  return res.status(200).json(userFound);
}
