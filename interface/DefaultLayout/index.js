import Head from "next/head";
import { PageLayout, Header, Text } from "@primer/react";
import styles from "./index.module.css";

const contentWidthClasses =  {
  small: styles.smallContent,
};

export default function DefaultLayout({ children, metadata = {}, contentWidth = "large" }) {
  const extraContentClassName = contentWidthClasses[contentWidth] || "";
  
  return (
    <>
      <Head>
        <title>{metadata.title ? `${metadata.title} · NyfarNews` : "NyfarNews"}</title>
        {metadata.description && (
          <meta name="description" value={metadata.description} />
        )}
      </Head>

      <Header>
        <Header.Item full>
          <Header.Link href="/">NyfarNews</Header.Link>
        </Header.Item>
        <Header.Item>
          <Header.Link href="/login">Login</Header.Link>
        </Header.Item>
        <Header.Item>
          <Header.Link href="/cadastro">Cadastrar</Header.Link>
        </Header.Item>
      </Header>

      <PageLayout>
        <PageLayout.Content width={contentWidth} className={extraContentClassName}>
          {children}
        </PageLayout.Content>
        <PageLayout.Footer divider="line">
          <Text size="small">&copy; {new Date().getFullYear()} NyfarNews. All rights reserved.</Text>
        </PageLayout.Footer>
      </PageLayout>
    </>
  );
}
