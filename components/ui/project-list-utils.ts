import type { Project } from "@/lib/types";

export type SortOption =
  | "updated-desc"
  | "name-asc"
  | "name-desc"
  | "created-desc"
  | "created-asc";

export function filterProjects(
  projects: Project[],
  search: string,
  showArchived: boolean,
): Project[] {
  return projects.filter((p) => {
    if (!showArchived && p.archivedAt) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });
}

export function sortProjects(
  projects: Project[],
  sort: SortOption,
): Project[] {
  const copy = [...projects];
  switch (sort) {
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case "created-desc":
      return copy.sort((a, b) => b.createdAt - a.createdAt);
    case "created-asc":
      return copy.sort((a, b) => a.createdAt - b.createdAt);
    case "updated-desc":
    default:
      return copy.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}
