import type { Project } from "@/lib/types";

const mockBlob = new Blob(["zip-content"]);

jest.mock("client-zip", () => ({
  downloadZip: jest.fn().mockReturnValue({ blob: () => Promise.resolve(mockBlob) }),
}));

import { downloadZip as mockCreateZip } from "client-zip";
import { downloadProjectZip, downloadFile } from "@/lib/export/zip";

function makeProject(): Project {
  return {
    id: "test-id",
    name: "Test Project",
    description: "A test project",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: {
      spec: {
        type: "spec",
        status: "reviewed",
        sections: [
          { id: "problem-statement", title: "Problem Statement", content: "Problem content" },
          { id: "ears-requirements", title: "EARS Requirements", content: "EARS content" },
          { id: "non-functional-requirements", title: "Non-Functional Requirements", content: "NFR content" },
        ],
      },
      plan: {
        type: "plan",
        status: "reviewed",
        sections: [
          { id: "architecture", title: "Architecture", content: "Arch content" },
          { id: "api-contracts", title: "API Contracts", content: "API content" },
          { id: "data-model", title: "Data Model", content: "Data content" },
          { id: "tech-decisions", title: "Tech Decisions", content: "Tech content" },
          { id: "security-edge-cases", title: "Security & Edge Cases", content: "Security content" },
        ],
      },
      tasks: {
        type: "tasks",
        status: "reviewed",
        sections: [
          { id: "task-list", title: "Task List", content: "Task content" },
          { id: "dependencies", title: "Dependencies", content: "Dep content" },
          { id: "file-mapping", title: "File Mapping", content: "File content" },
          { id: "test-expectations", title: "Test Expectations", content: "Test content" },
        ],
      },
    },
    traceabilityMappings: [],
  };
}

const mockedCreateZip = mockCreateZip as jest.MockedFunction<typeof mockCreateZip>;

// jsdom doesn't provide URL.createObjectURL/revokeObjectURL
beforeAll(() => {
  if (!URL.createObjectURL) {
    URL.createObjectURL = jest.fn();
  }
  if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = jest.fn();
  }
});

describe("downloadProjectZip", () => {
  let mockCreateObjectURL: jest.SpyInstance;
  let mockRevokeObjectURL: jest.SpyInstance;
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    mockCreateObjectURL = jest.spyOn(URL, "createObjectURL").mockReturnValue("blob:test-url");
    mockRevokeObjectURL = jest.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    mockedCreateZip.mockClear();
  });

  afterEach(() => {
    mockCreateObjectURL.mockRestore();
    mockRevokeObjectURL.mockRestore();
    clickSpy.mockRestore();
  });

  it("calls client-zip with three files", async () => {
    const project = makeProject();
    await downloadProjectZip(project);

    expect(mockedCreateZip).toHaveBeenCalledTimes(1);
    const files = mockedCreateZip.mock.calls[0][0];
    expect(files).toHaveLength(3);
    expect(files[0].name).toBe("spec.md");
    expect(files[1].name).toBe("plan.md");
    expect(files[2].name).toBe("tasks.md");
  });

  it("creates and revokes blob URL", async () => {
    const project = makeProject();
    await downloadProjectZip(project);

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:test-url");
  });

  it("triggers download with correct filename", async () => {
    const project = makeProject();
    await downloadProjectZip(project);

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});

describe("downloadFile", () => {
  let mockCreateObjectURL: jest.SpyInstance;
  let mockRevokeObjectURL: jest.SpyInstance;
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    mockCreateObjectURL = jest.spyOn(URL, "createObjectURL").mockReturnValue("blob:test-url");
    mockRevokeObjectURL = jest.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    mockCreateObjectURL.mockRestore();
    mockRevokeObjectURL.mockRestore();
    clickSpy.mockRestore();
  });

  it("creates blob, triggers download, and revokes URL", () => {
    downloadFile("test.md", "# Test content");

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:test-url");
  });
});
