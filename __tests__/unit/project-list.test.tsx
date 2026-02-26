import { act, render, screen } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";
import { db } from "@/lib/db/database";
import { createProject } from "@/lib/db/projects";
import { ProjectList } from "@/components/ui/project-list";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

beforeEach(async () => {
  await db.projects.clear();
  mockPush.mockClear();
});

afterAll(() => {
  db.close();
});

describe("ProjectList", () => {
  it('shows "No projects yet" and "New Project" button when empty', async () => {
    render(<ProjectList />);
    expect(await screen.findByText("No projects yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new project/i })).toBeInTheDocument();
  });

  it("sorts projects by updatedAt descending", async () => {
    await createProject("First");
    await new Promise((r) => setTimeout(r, 10));
    await createProject("Second");

    render(<ProjectList />);
    const cards = await screen.findAllByRole("article");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Second");
    expect(cards[1]).toHaveTextContent("First");
  });

  it('shows "Spec" status for new project', async () => {
    await createProject("My Project");

    render(<ProjectList />);
    const card = await screen.findByRole("article");
    expect(card).toHaveTextContent("Spec");
  });

  it("shows skeleton elements during loading state", () => {
    const { container } = render(<ProjectList />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows "Complete" status when all phases reviewed', async () => {
    const project = await createProject("Done Project");
    project.phases.spec.status = "reviewed";
    project.phases.plan.status = "reviewed";
    project.phases.tasks.status = "reviewed";
    await db.projects.put(project);

    render(<ProjectList />);
    const card = await screen.findByRole("article");
    expect(card).toHaveTextContent("Complete");
  });

  it("wraps each project card in an individual motion wrapper for stagger", async () => {
    await createProject("Project A");
    await createProject("Project B");

    render(<ProjectList />);
    const cards = await screen.findAllByRole("article");
    expect(cards).toHaveLength(2);

    // Each article (ProjectCard) should have an intermediate wrapper div
    // between it and the grid container (motion.div → motion.div → ProjectCard)
    for (const card of cards) {
      const wrapper = card.parentElement;
      const grid = wrapper?.parentElement;
      expect(wrapper?.tagName).toBe("DIV");
      expect(grid?.classList.contains("grid")).toBe(true);
    }
  });

  it("renders cards without animation when reduced motion is preferred", async () => {
    (useReducedMotion as jest.Mock).mockReturnValueOnce(true);

    await createProject("Accessible Project");

    render(<ProjectList />);
    const card = await screen.findByRole("article");
    expect(card).toBeInTheDocument();
  });

  it("shows only 4 projects initially when more exist", async () => {
    for (let i = 1; i <= 6; i++) {
      await createProject(`Project ${i}`);
      await new Promise((r) => setTimeout(r, 10));
    }

    render(<ProjectList />);
    const cards = await screen.findAllByRole("article");
    expect(cards).toHaveLength(4);
  });

  it('shows "View All" button when more than 4 projects exist', async () => {
    for (let i = 1; i <= 6; i++) {
      await createProject(`Project ${i}`);
    }

    render(<ProjectList />);
    await screen.findAllByRole("article");
    expect(screen.getByRole("button", { name: /view all/i })).toBeInTheDocument();
  });

  it('hides "View All" button when fewer than 4 projects exist', async () => {
    for (let i = 1; i <= 3; i++) {
      await createProject(`Project ${i}`);
    }

    render(<ProjectList />);
    await screen.findAllByRole("article");
    expect(screen.queryByRole("button", { name: /view all/i })).not.toBeInTheDocument();
  });

  it('hides "View All" button when exactly 4 projects exist', async () => {
    for (let i = 1; i <= 4; i++) {
      await createProject(`Project ${i}`);
    }

    render(<ProjectList />);
    const cards = await screen.findAllByRole("article");
    expect(cards).toHaveLength(4);
    expect(screen.queryByRole("button", { name: /view all/i })).not.toBeInTheDocument();
  });

  it('clicking "View All" shows all projects and hides button', async () => {
    for (let i = 1; i <= 6; i++) {
      await createProject(`Project ${i}`);
      await new Promise((r) => setTimeout(r, 10));
    }

    render(<ProjectList />);
    await screen.findAllByRole("article");

    const viewAllButton = screen.getByRole("button", { name: /view all/i });
    act(() => {
      viewAllButton.click();
    });

    const cards = await screen.findAllByRole("article");
    expect(cards).toHaveLength(6);
    expect(screen.queryByRole("button", { name: /view all/i })).not.toBeInTheDocument();
  });
});
