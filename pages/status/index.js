import useSWR from "swr";
import DefaultLayout from "interface/DefaultLayout";
import { Banner, Heading, Stack } from "@primer/react";
import { Card } from "@primer/react/experimental";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

function StatusPage() {
  return (
    <DefaultLayout
      contentWidth="medium"
      metadata={{
        title: "Status",
      }}
    >
      <Stack gap="spacious">
        <Heading as="h1">Status</Heading>
        <UpdatedAt />
        <DatabaseStatus />
      </Stack>
    </DefaultLayout>
  );
}

function UpdatedAt() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data)
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");

  return (
    <Banner variant="info" layout="compact">
      <Banner.Title>Última atualização: {updatedAtText}</Banner.Title>
    </Banner>
  );
}

function DatabaseStatus() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading || !data) return;

  const database = data.dependencies.database;
  console.log(database);
  const openConnections = database.opened_connections;
  const maxConnections = database.max_connections;
  const version = database.version ?? "-";

  return (
    <Stack>
      <Heading as="h2" variant="medium">
        Banco de Dados
      </Heading>

      <Stack
        direction={{ narrow: "vertical", regular: "horizontal" }}
        gap="condensed"
      >
        <Stack.Item grow>
          <Card>
            <Card.Heading>Conexões abertas</Card.Heading>
            <Card.Description>{openConnections}</Card.Description>
            <Card.Metadata>Uso nesse instante</Card.Metadata>
          </Card>
        </Stack.Item>

        <Stack.Item grow>
          <Card>
            <Card.Heading>Conexões máximas</Card.Heading>
            <Card.Description>{maxConnections}</Card.Description>
            <Card.Metadata>Limite máximo</Card.Metadata>
          </Card>
        </Stack.Item>

        <Stack.Item grow>
          <Card>
            <Card.Heading>PostgreSQL</Card.Heading>
            <Card.Description>{version}</Card.Description>
            <Card.Metadata>Versão</Card.Metadata>
          </Card>
        </Stack.Item>
      </Stack>
    </Stack>
  );
}

export default StatusPage;
