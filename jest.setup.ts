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
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ReactForMock = require("react");

const FRAMER_PROPS = new Set([
  "initial",
  "animate",
  "exit",
  "variants",
  "transition",
  "whileHover",
  "whileTap",
  "whileFocus",
  "whileDrag",
  "onAnimationComplete",
  "onAnimationStart",
  "layout",
  "layoutId",
]);

jest.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const MotionComponent = ReactForMock.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<unknown>) => {
            const filtered: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(props)) {
              if (!FRAMER_PROPS.has(k)) filtered[k] = v;
            }
            return ReactForMock.createElement(prop, { ...filtered, ref });
          },
        );
        MotionComponent.displayName = `motion.${prop}`;
        return MotionComponent;
      },
    },
  ),
  AnimatePresence: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
  useReducedMotion: jest.fn(() => false),
}));
