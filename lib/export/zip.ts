import { downloadZip as createZip } from "client-zip";
import type { Project } from "@/lib/types";
import { generateMarkdown } from "@/lib/export/markdown";

export function downloadFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadProjectZip(project: Project): Promise<void> {
  const md = generateMarkdown(project);

  const blob = await createZip([
    { name: "spec.md", input: md.spec },
    { name: "plan.md", input: md.plan },
    { name: "tasks.md", input: md.tasks },
  ]).blob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
