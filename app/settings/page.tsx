export default function SettingsPage() {
  const configured = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Anthropic API Key</h2>

        <p>
          Status:{" "}
          {configured ? (
            <span className="font-medium text-green-600">Configured</span>
          ) : (
            <span className="font-medium text-amber-600">Not configured</span>
          )}
        </p>

        {!configured && (
          <div className="rounded-md border p-4 text-sm text-muted-foreground space-y-2">
            <p>To enable AI generation features:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Create a <code className="text-foreground">.env.local</code>{" "}
                file in the project root
              </li>
              <li>
                Add your key:{" "}
                <code className="text-foreground">
                  ANTHROPIC_API_KEY=sk-ant-...
                </code>
              </li>
              <li>Restart the dev server</li>
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}
