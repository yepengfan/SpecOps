"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useProjectStore } from "@/lib/stores/project-store";

export function EditableProjectName() {
  const name = useProjectStore((s) => s.currentProject?.name);
  const renameProject = useProjectStore((s) => s.renameProject);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isCancellingRef = useRef(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const enterEditMode = useCallback(() => {
    if (!name) return;
    setEditValue(name);
    isCancellingRef.current = false;
    setIsEditing(true);
  }, [name]);

  const handleSave = useCallback(() => {
    if (isCancellingRef.current) return;
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== name) {
      renameProject(trimmed);
    }
    setIsEditing(false);
  }, [editValue, name, renameProject]);

  const handleCancel = useCallback(() => {
    isCancellingRef.current = true;
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  if (!name) return null;

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        aria-label="Project name"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="text-2xl font-bold bg-transparent border-b-2 border-primary outline-none w-full max-w-md"
      />
    );
  }

  return (
    <h1 className="text-2xl font-bold">
      <button
        type="button"
        onClick={enterEditMode}
        className="cursor-pointer hover:text-primary/80 transition-colors bg-transparent border-none p-0 text-inherit text-left"
      >
        {name}
      </button>
    </h1>
  );
}
