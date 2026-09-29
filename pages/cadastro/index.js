import { useState } from "react";
import { Heading, Button, FormControl, TextInput, Stack } from "@primer/react";
import DefaultLayout from "interface/DefaultLayout";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <DefaultLayout
      metadata={{
        title: "Cadastro de Usuário",
        description: "Crie sua conta de forma gratuita.",
      }}
      contentWidth="small"
    >
      <Stack gap="spacious">
        <Heading as="h1">Cadastro</Heading>

        <RegisterForm
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
      </Stack>
    </DefaultLayout>
  );
}

function RegisterForm({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
}) {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = { username, email, password };
    const response = await fetch("/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 201) {
      location.href = "/cadastro/confirmar";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="normal">
        <FormControl>
          <FormControl.Label htmlFor="username">Nome</FormControl.Label>
          <TextInput
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            block
          />
        </FormControl>
        <FormControl>
          <FormControl.Label htmlFor="email">Email</FormControl.Label>
          <TextInput
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            block
          />
        </FormControl>
        <FormControl>
          <FormControl.Label htmlFor="password">Senha</FormControl.Label>
          <TextInput
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            block
          />
        </FormControl>

        <Stack.Item>
          <Button type="submit" variant="primary">
            Cadastrar
          </Button>
        </Stack.Item>
      </Stack>
    </form>
  );
}
