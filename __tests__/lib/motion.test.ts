import {
  fadeSlideVariants,
  staggerContainerVariants,
  staggerItemVariants,
  pageTransition,
} from "@/lib/motion";

describe("fadeSlideVariants", () => {
  it("has initial, animate, and exit keys", () => {
    expect(fadeSlideVariants).toHaveProperty("initial");
    expect(fadeSlideVariants).toHaveProperty("animate");
    expect(fadeSlideVariants).toHaveProperty("exit");
  });

  it("initial has opacity 0 and positive y offset", () => {
    expect(fadeSlideVariants.initial).toMatchObject({ opacity: 0 });
    expect((fadeSlideVariants.initial as { y: number }).y).toBeGreaterThan(0);
  });

  it("animate has full opacity and y 0", () => {
    expect(fadeSlideVariants.animate).toMatchObject({ opacity: 1, y: 0 });
  });

  it("exit has opacity 0", () => {
    expect((fadeSlideVariants.exit as { opacity: number }).opacity).toBe(0);
  });
});

describe("staggerContainerVariants", () => {
  it("has animate.transition.staggerChildren set to 0.06", () => {
    const animate = staggerContainerVariants.animate as {
      transition: { staggerChildren: number };
    };
    expect(animate.transition.staggerChildren).toBe(0.06);
  });
});

describe("staggerItemVariants", () => {
  it("has initial and animate keys", () => {
    expect(staggerItemVariants).toHaveProperty("initial");
    expect(staggerItemVariants).toHaveProperty("animate");
  });

  it("initial has opacity 0 and positive y offset", () => {
    expect(staggerItemVariants.initial).toMatchObject({ opacity: 0 });
    expect(
      (staggerItemVariants.initial as { y: number }).y,
    ).toBeGreaterThan(0);
  });

  it("animate has full opacity and y 0 with duration 0.25", () => {
    expect(staggerItemVariants.animate).toMatchObject({ opacity: 1, y: 0 });
    const animate = staggerItemVariants.animate as {
      transition: { duration: number };
    };
    expect(animate.transition.duration).toBe(0.25);
  });
});

describe("pageTransition", () => {
  it("has duration at most 0.3s", () => {
    expect(pageTransition.duration).toBeLessThanOrEqual(0.3);
  });

  it("has ease defined", () => {
    expect(pageTransition).toHaveProperty("ease");
  });
});
