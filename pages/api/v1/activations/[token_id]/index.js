import { createRouter } from "next-connect";
import controller from "infra/controllers";
import activation from "model/activation";

const router = createRouter();

router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(req, res) {
  const activationTokenId = req.query.token_id;

  const validActivationToken =
    await activation.finOneValidById(activationTokenId);
  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId);

  await activation.activateByUserId(validActivationToken.user_id);

  return res.status(200).json(usedActivationToken);
}
