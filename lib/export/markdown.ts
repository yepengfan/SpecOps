import type { Project } from "@/lib/types";

export function generateMarkdown(project: Project): {
  spec: string;
  plan: string;
  tasks: string;
} {
  const header = `# ${project.name}\n\n`;

  const spec =
    header +
    project.phases.spec.sections
      .map((s) => `## ${s.title}\n\n${s.content}\n`)
      .join("\n");

  const plan =
    header +
    project.phases.plan.sections
      .map((s) => `## ${s.title}\n\n${s.content}\n`)
      .join("\n");

  const tasks =
    header +
    project.phases.tasks.sections
      .map((s) => `## ${s.title}\n\n${s.content}\n`)
      .join("\n");

  return { spec, plan, tasks };
}
