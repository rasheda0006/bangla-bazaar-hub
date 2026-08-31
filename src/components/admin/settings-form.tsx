import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRefresh } from "@/lib/admin";
import { db, useSettings, type SiteSettings } from "@/lib/data";

export function useSettingsForm() {
  const { data: settings } = useSettings();
  const refresh = useRefresh();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const save = async () => {
    if (!form) return;
    setBusy(true);
    const { id: _id, ...payload } = form;
    const { error } = await db.from("site_settings").update(payload).eq("id", 1);
    setBusy(false);
    if (error) toast.error("সেভ করা যায়নি");
    else {
      toast.success("সেটিংস সেভ হয়েছে");
      refresh(["site_settings"]);
    }
  };

  return { form, set, save, busy };
}

type Setter = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;

export function TextField({
  form,
  set,
  field,
  label,
  placeholder,
  className,
}: {
  form: SiteSettings;
  set: Setter;
  field: keyof SiteSettings;
  label: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Input
        value={(form[field] as string) ?? ""}
        placeholder={placeholder ?? ""}
        onChange={(e) => set(field, e.target.value as SiteSettings[typeof field])}
      />
    </div>
  );
}

export function AreaField({
  form,
  set,
  field,
  label,
  rows = 3,
}: {
  form: SiteSettings;
  set: Setter;
  field: keyof SiteSettings;
  label: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5 sm:col-span-2">
      <Label>{label}</Label>
      <Textarea
        rows={rows}
        value={(form[field] as string) ?? ""}
        onChange={(e) => set(field, e.target.value as SiteSettings[typeof field])}
      />
    </div>
  );
}

export function ToggleField({
  form,
  set,
  field,
  label,
}: {
  form: SiteSettings;
  set: Setter;
  field: keyof SiteSettings;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 text-sm">
      <span className="min-w-0 truncate">{label}</span>
      <Switch
        checked={Boolean(form[field])}
        onCheckedChange={(v) => set(field, v as SiteSettings[typeof field])}
      />
    </label>
  );
}

export function ColorField({
  form,
  set,
  field,
  label,
  fallback = "#ffffff",
}: {
  form: SiteSettings;
  set: Setter;
  field: keyof SiteSettings;
  label: string;
  fallback?: string;
}) {
  const value = ((form[field] as string) || fallback) as string;
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <Input
          value={value}
          onChange={(e) => set(field, e.target.value as SiteSettings[typeof field])}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => set(field, e.target.value as SiteSettings[typeof field])}
          className="h-9 w-12 shrink-0 rounded-md border border-border"
        />
      </div>
    </div>
  );
}

export function NumberField({
  form,
  set,
  field,
  label,
  min,
  max,
}: {
  form: SiteSettings;
  set: Setter;
  field: keyof SiteSettings;
  label: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        min={min}
        max={max}
        value={Number(form[field] ?? 0)}
        onChange={(e) => set(field, (Number(e.target.value) || 0) as SiteSettings[typeof field])}
      />
    </div>
  );
}

export function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <div className="mt-2 text-sm font-semibold sm:col-span-2">{title}</div>
      {children}
    </>
  );
}
