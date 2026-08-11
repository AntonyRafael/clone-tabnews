import { createRouter } from "next-connect";
import controller from "infra/controllers";
import activation from "model/activation";
import authorization from "model/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(req, res) {
  const activationTokenId = req.query.token_id;
  const userTryingToPatch = req.context.user;

  const validActivationToken =
    await activation.finOneValidById(activationTokenId);

  await activation.activateByUserId(validActivationToken.user_id);

  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:activation_token",
    usedActivationToken,
  );

  return res.status(200).json(secureOutputValues);
}
