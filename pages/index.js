import DefaultLayout from "../interface/DefaultLayout";

function Home() {
  return (
    <DefaultLayout
      metadata={{
        title: "Página Inicial",
        description: "Bem-vindo ao NyfarNews!",
      }}
    >
      <h1>Olá, mundo!</h1>
    </DefaultLayout>
  );
}

export default Home;
