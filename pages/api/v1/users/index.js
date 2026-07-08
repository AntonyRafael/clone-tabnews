import { createRouter } from "next-connect";
import controller from "infra/controllers";
import user from "model/user";
import activation from "model/activation";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(req, res) {
  const userInputValues = req.body;
  const newUser = await user.create(userInputValues);

  const activationToken = await activation.create(newUser.id);
  await activation.sendEmailToUSer(newUser, activationToken);

  return res.status(201).json(newUser);
}
