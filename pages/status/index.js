import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando..."

  if (!isLoading && data) updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");

  return (
    <div>
      <h3>Última atualização: {updatedAtText}</h3>
    </div>
  );
};

function DatabaseStatus() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  return (
    <div>
      <h3>Database</h3>
      {!isLoading && data && (
        <div>
          <ul>
            <li>Versão: {data.dependencies.database.version}</li>
            <li>Conexões abertas: {data.dependencies.database.open_connections}</li>
            <li>Conexões maximas: {data.dependencies.database.max_connections}</li>
          </ul>
        </div>
      )}
    </div>
  );
};


export default StatusPage;
