import { db } from "@/lib/db/database";
import {
  addChatMessage,
  getChatMessages,
  clearChatMessages,
  updateChatMessage,
} from "@/lib/db/chat-messages";
import { createProject, deleteProject } from "@/lib/db/projects";

beforeEach(async () => {
  await db.chatMessages.clear();
  await db.projects.clear();
});

afterAll(() => {
  db.close();
});

describe("Chat message persistence", () => {
  it("adds messages then queries by projectId in chronological order", async () => {
    const project = await createProject("Chat Test");

    const id1 = await addChatMessage({
      projectId: project.id,
      role: "user",
      content: "Hello, assistant!",
      timestamp: 1000,
    });

    const id2 = await addChatMessage({
      projectId: project.id,
      role: "assistant",
      content: "Hi there! How can I help?",
      timestamp: 2000,
    });

    const id3 = await addChatMessage({
      projectId: project.id,
      role: "user",
      content: "Please update the spec.",
      timestamp: 3000,
    });

    // IDs are auto-incremented positive numbers
    expect(id1).toBeGreaterThan(0);
    expect(id2).toBeGreaterThan(id1);
    expect(id3).toBeGreaterThan(id2);

    const messages = await getChatMessages(project.id);
    expect(messages).toHaveLength(3);

    // Verify chronological order
    expect(messages[0].timestamp).toBe(1000);
    expect(messages[1].timestamp).toBe(2000);
    expect(messages[2].timestamp).toBe(3000);

    // Verify content and roles
    expect(messages[0]).toMatchObject({
      projectId: project.id,
      role: "user",
      content: "Hello, assistant!",
    });
    expect(messages[1]).toMatchObject({
      projectId: project.id,
      role: "assistant",
      content: "Hi there! How can I help?",
    });
    expect(messages[2]).toMatchObject({
      projectId: project.id,
      role: "user",
      content: "Please update the spec.",
    });
  });

  it("clearChatMessages removes all messages for a projectId", async () => {
    const project = await createProject("Clear Test");

    await addChatMessage({
      projectId: project.id,
      role: "user",
      content: "Message 1",
      timestamp: 1000,
    });
    await addChatMessage({
      projectId: project.id,
      role: "assistant",
      content: "Message 2",
      timestamp: 2000,
    });

    // Verify messages exist
    let messages = await getChatMessages(project.id);
    expect(messages).toHaveLength(2);

    // Clear and verify empty
    await clearChatMessages(project.id);
    messages = await getChatMessages(project.id);
    expect(messages).toHaveLength(0);
  });

  it("deleteProject cascade-deletes associated chat messages", async () => {
    const project = await createProject("Cascade Test");

    await addChatMessage({
      projectId: project.id,
      role: "user",
      content: "First message",
      timestamp: 1000,
    });
    await addChatMessage({
      projectId: project.id,
      role: "assistant",
      content: "Second message",
      timestamp: 2000,
    });

    // Verify messages exist before deletion
    let messages = await getChatMessages(project.id);
    expect(messages).toHaveLength(2);

    // Delete the project
    await deleteProject(project.id);

    // Chat messages should be gone
    messages = await getChatMessages(project.id);
    expect(messages).toHaveLength(0);
  });

  it("messages for different projects are independent", async () => {
    const projectA = await createProject("Project A");
    const projectB = await createProject("Project B");

    await addChatMessage({
      projectId: projectA.id,
      role: "user",
      content: "Message for A",
      timestamp: 1000,
    });
    await addChatMessage({
      projectId: projectA.id,
      role: "assistant",
      content: "Reply for A",
      timestamp: 2000,
    });

    await addChatMessage({
      projectId: projectB.id,
      role: "user",
      content: "Message for B",
      timestamp: 1500,
    });

    // Each project sees only its own messages
    const messagesA = await getChatMessages(projectA.id);
    const messagesB = await getChatMessages(projectB.id);

    expect(messagesA).toHaveLength(2);
    expect(messagesB).toHaveLength(1);

    expect(messagesA.every((m) => m.projectId === projectA.id)).toBe(true);
    expect(messagesB.every((m) => m.projectId === projectB.id)).toBe(true);

    expect(messagesB[0].content).toBe("Message for B");

    // Clearing one project does not affect the other
    await clearChatMessages(projectA.id);
    const afterClearA = await getChatMessages(projectA.id);
    const afterClearB = await getChatMessages(projectB.id);

    expect(afterClearA).toHaveLength(0);
    expect(afterClearB).toHaveLength(1);
  });

  it("updateChatMessage updates specific fields without affecting others", async () => {
    const project = await createProject("Update Test");

    const msgId = await addChatMessage({
      projectId: project.id,
      role: "assistant",
      content: "Original content",
      timestamp: 1000,
      suggestedEdit: {
        sectionId: "problem-statement",
        phaseType: "spec",
        proposedContent: "New problem statement",
        status: "pending",
      },
    });

    // Update only the content field
    await updateChatMessage(msgId, { content: "Updated content" });

    let messages = await getChatMessages(project.id);
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe("Updated content");
    // Other fields remain unchanged
    expect(messages[0].role).toBe("assistant");
    expect(messages[0].timestamp).toBe(1000);
    expect(messages[0].suggestedEdit).toMatchObject({
      sectionId: "problem-statement",
      phaseType: "spec",
      proposedContent: "New problem statement",
      status: "pending",
    });

    // Update suggestedEdit status
    await updateChatMessage(msgId, {
      suggestedEdit: {
        sectionId: "problem-statement",
        phaseType: "spec",
        proposedContent: "New problem statement",
        status: "applied",
      },
    });

    messages = await getChatMessages(project.id);
    expect(messages[0].suggestedEdit!.status).toBe("applied");
    // Content should still be the previously updated value
    expect(messages[0].content).toBe("Updated content");
  });
});
