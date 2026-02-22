import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { db } from "@/lib/db/database";
import { NewProjectDialog } from "@/components/ui/new-project-dialog";

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

describe("NewProjectDialog", () => {
  it("shows error when submitting with empty name", async () => {
    const user = userEvent.setup();
    render(<NewProjectDialog open={true} onOpenChange={() => {}} />);

    await user.click(screen.getByRole("button", { name: /create/i }));
    expect(screen.getByText(/project name is required/i)).toBeInTheDocument();
  });

  it("shows error when name exceeds 100 characters", async () => {
    const user = userEvent.setup();
    render(<NewProjectDialog open={true} onOpenChange={() => {}} />);

    const input = screen.getByLabelText(/project name/i);
    await user.type(input, "a".repeat(101));
    await user.click(screen.getByRole("button", { name: /create/i }));
    expect(screen.getByText(/100 characters/i)).toBeInTheDocument();
  });

  it("trims whitespace from name", async () => {
    const user = userEvent.setup();
    render(<NewProjectDialog open={true} onOpenChange={() => {}} />);

    const input = screen.getByLabelText(/project name/i);
    await user.type(input, "  My Project  ");
    await user.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(async () => {
      const projects = await db.projects.toArray();
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe("My Project");
    });
  });

  it("creates project with UUID and navigates", async () => {
    const user = userEvent.setup();
    render(<NewProjectDialog open={true} onOpenChange={() => {}} />);

    const input = screen.getByLabelText(/project name/i);
    await user.type(input, "Test Project");
    await user.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(async () => {
      const projects = await db.projects.toArray();
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/\/project\/[a-f0-9-]+\/requirements/)
    );
    });
  });
});
