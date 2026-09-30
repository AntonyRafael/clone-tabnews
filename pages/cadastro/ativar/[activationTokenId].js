import DefaultLayout from "interface/DefaultLayout";
import { Banner } from "@primer/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ActivateUserPage() {
  const router = useRouter();
  const { activationTokenId } = router.query;
  const [activationStatus, setActivationStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!activationTokenId) return;

    sendActivationRequest(activationTokenId);

    async function sendActivationRequest(tokenId) {
      try {
        const response = await fetch(`/api/v1/activations/${tokenId}`, {
          method: "PATCH",
        });
        const activationResponseBody = await response.json();

        if (response.status === 200) {
          setActivationStatus("success");
          return;
        }

        setErrorMessage(
          `${activationResponseBody.message} ${activationResponseBody.action || ""}`,
        );
        setActivationStatus("failure");
      } catch {
        setErrorMessage(
          "Houve uma falha na conexão com servidor. Por favor, tente novamente mais tarde.",
        );
        setActivationStatus("failure");
      }
    }
  }, [activationTokenId]);

  return (
    <DefaultLayout
      metadata={{
        title: "Ativar Conta",
        description: "Ative sua conta para começar a usar o serviço.",
      }}
      contentWidth="small"
    >
      {activationStatus === "loading" && (
        <Banner variant="info">
          <Banner.Title>Verificando token...</Banner.Title>
        </Banner>
      )}

      {activationStatus === "success" && (
        <Banner variant="success">
          <Banner.Title>Cadastro ativado com sucesso!</Banner.Title>
          <Banner.Description>
            Sua contaesta ativa e você já pode <a href="/login">fazer login</a>.
          </Banner.Description>
        </Banner>
      )}

      {activationStatus === "failure" && (
        <Banner variant="critical">
          <Banner.Title>Falha ao ativar a seu cadastro</Banner.Title>
          <Banner.Description>{errorMessage}</Banner.Description>
        </Banner>
      )}
    </DefaultLayout>
  );
}
