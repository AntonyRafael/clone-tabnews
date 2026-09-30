import DefaultLayout from "interface/DefaultLayout";
import { Banner } from "@primer/react";

export default function ConfirmRegisterPage() {
  return (
    <DefaultLayout
      metadata={{
        title: "Confirmar Conta",
      }}
      contentWidth="small"
    >
      <Banner
        variant="warning"
        title="Falta só mais uma etapa!"
        description="Verifique o e-mail enviado e confirme seu e-mail."
      />
    </DefaultLayout>
  );
}
