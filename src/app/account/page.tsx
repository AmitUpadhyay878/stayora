import { AccountPanel } from "@/components/account/account-panel";

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">Account</h1>
      <p className="mt-2 text-muted-foreground">Manage your Stayora profile and password.</p>
      <div className="mt-8">
        <AccountPanel />
      </div>
    </div>
  );
}
