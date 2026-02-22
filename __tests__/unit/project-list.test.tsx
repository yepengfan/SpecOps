import { render, screen } from "@testing-library/react";
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

  it('shows "Requirements" status for new project', async () => {
    await createProject("My Project");

    render(<ProjectList />);
    const card = await screen.findByRole("article");
    expect(card).toHaveTextContent("Requirements");
  });

  it('shows "Complete" status when all phases reviewed', async () => {
    const project = await createProject("Done Project");
    project.phases.requirements.status = "reviewed";
    project.phases.design.status = "reviewed";
    project.phases.tasks.status = "reviewed";
    await db.projects.put(project);

    render(<ProjectList />);
    const card = await screen.findByRole("article");
    expect(card).toHaveTextContent("Complete");
  });
});
