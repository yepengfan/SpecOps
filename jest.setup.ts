import "@testing-library/jest-dom";

if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = <T>(val: T): T =>
    JSON.parse(JSON.stringify(val));
}

// jsdom doesn't implement scrollIntoView
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView = jest.fn();
}
