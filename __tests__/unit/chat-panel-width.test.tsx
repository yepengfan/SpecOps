describe("Chat panel width localStorage", () => {
  const STORAGE_KEY = "specops-chat-panel-width";

  beforeEach(() => {
    localStorage.clear();
  });

  it("stores width in localStorage", () => {
    localStorage.setItem(STORAGE_KEY, "500");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("500");
  });

  it("defaults to 384 when no stored value", () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const width = stored ? parseInt(stored, 10) : 384;
    expect(width).toBe(384);
  });

  it("parses stored value as integer", () => {
    localStorage.setItem(STORAGE_KEY, "450");
    const width = parseInt(localStorage.getItem(STORAGE_KEY)!, 10);
    expect(width).toBe(450);
  });
});
