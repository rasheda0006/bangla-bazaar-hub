import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";

/** ছবির URL সরাসরি লিখুন অথবা ফাইল আপলোড করুন */
export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    const path = `${Date.now()}-${file.name.replace(/[^\w.-]+/g, "-")}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (error) {
      setBusy(false);
      toast.error("আপলোড ব্যর্থ হয়েছে");
      return;
    }
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 3650);
    setBusy(false);
    if (data?.signedUrl) {
      onChange(data.signedUrl);
      toast.success("ছবি আপলোড হয়েছে");
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... অথবা আপলোড করুন"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          aria-label="আপলোড"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="relative mt-2 inline-block">
          <img
            src={value}
            alt=""
            className="h-20 w-20 rounded-xl border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground"
            aria-label="মুছুন"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
