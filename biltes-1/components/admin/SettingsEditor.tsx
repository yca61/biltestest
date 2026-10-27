"use client";
import { EditorShell } from "./FormKit";
import { saveSettings } from "@/app/actions/admin";
import { SETTINGS_FIELDS } from "@/lib/settingsFields";
export function SettingsEditor({ initial }: { initial: Record<string, unknown> }) {
  return <EditorShell initial={initial} fields={SETTINGS_FIELDS} media={{}} rel={{ campus: [], category: [], page: [] }} onSave={(v) => saveSettings(v)} />;
}
