import { getSession } from "@/lib/session";
import { Header } from "@/components/layout/header";
import { SessionHydrator } from "@/components/layout/session-hydrator";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <>
      <SessionHydrator session={session} />
      <Header initialUser={session?.user ? { name: session.user.name, email: session.user.email } : null} />
    </>
  );
}
