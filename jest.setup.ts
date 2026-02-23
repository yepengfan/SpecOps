import "@testing-library/jest-dom";

if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = <T>(val: T): T =>
    JSON.parse(JSON.stringify(val));
}

// jsdom doesn't implement scrollIntoView
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView = jest.fn();
}

// framer-motion mock — avoid jsdom requestAnimationFrame issues
jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy(
      {},
      {
        get: (_target: unknown, prop: string) => {
          return React.forwardRef(
            (props: Record<string, unknown>, ref: React.Ref<unknown>) => {
              const {
                initial: _initial,
                animate: _animate,
                exit: _exit,
                variants: _variants,
                transition: _transition,
                whileHover: _whileHover,
                whileTap: _whileTap,
                onAnimationComplete: _onAnimationComplete,
                ...rest
              } = props;
              return React.createElement(prop, { ...rest, ref });
            },
          );
        },
      },
    ),
    AnimatePresence: ({
      children,
    }: {
      children: React.ReactNode;
    }) => children,
    useReducedMotion: () => false,
  };
});
