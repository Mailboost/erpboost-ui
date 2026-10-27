// Reference example: https://ui.tailor.tech/patterns/user-profile-dialog
import { useState } from "react";
import { Lock } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  Field,
  Input,
  Select,
} from "@mailboost/erpboost-ui";

type SmallUserProfile = {
  name: string;
  email: string;
  language: string;
  status: string;
  assignedRoles: string;
};

const defaultSmallProfile: SmallUserProfile = {
  name: "Jordan Mitchell",
  email: "j.mitchell@tailor.example",
  language: "en-US",
  status: "Active",
  assignedRoles: "Admin",
};

const LANGUAGES: { value: string; label: string }[] = [
  { value: "en-US", label: "English" },
  { value: "ja-JP", label: "Japanese" },
  { value: "en-GB", label: "English (UK)" },
  { value: "ko-KR", label: "Korean" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: SmallUserProfile;
};

export const UserProfileDialogSmall = ({
  open,
  onOpenChange,
  initial = defaultSmallProfile,
}: Props) => {
  const [profile, setProfile] = useState<SmallUserProfile>(initial);
  const [dirty, setDirty] = useState(false);

  const update = <K extends keyof SmallUserProfile>(
    key: K,
    value: SmallUserProfile[K],
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    setDirty(false);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Profile</Dialog.Title>
        </Dialog.Header>

        <div className="space-y-4 py-2">
          {/* PROFILE section */}
          <section>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field.Root name="name">
                <Field.Label>Name</Field.Label>
                <Input
                  value={profile.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Full name"
                />
              </Field.Root>
              <Field.Root name="email">
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Email address"
                />
              </Field.Root>
                            <Field.Root name="language">
                <Field.Label>Language</Field.Label>
                <Select.Parts.Root
                  value={profile.language}
                  onValueChange={(value) =>
                    update("language", (value as string) ?? profile.language)
                  }
                  itemToStringLabel={(v) =>
                    LANGUAGES.find((l) => l.value === v)?.label ?? String(v ?? "")
                  }
                >
                  <Select.Parts.Trigger className="w-full">
                    <Select.Parts.Value placeholder="Language" />
                  </Select.Parts.Trigger>
                  <Select.Parts.Content>
                    {LANGUAGES.map((lang) => (
                      <Select.Parts.Item key={lang.value} value={lang.value}>
                        {lang.label}
                      </Select.Parts.Item>
                    ))}
                  </Select.Parts.Content>
                </Select.Parts.Root>
              </Field.Root>
            </div>
          </section>

          {/* ACCESS section */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Access
              </p>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="size-3" aria-hidden />
                Managed by your administrator
              </span>
            </div>
            <div className="rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="outline-success" className="gap-1.5">
                  <span className="size-1.5 rounded-full bg-current" aria-hidden />
                  {profile.status}
                </Badge>
              </div>
              <div className="border-t" />
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">Assigned roles</span>
                <Badge variant="neutral">{profile.assignedRoles}</Badge>
              </div>
            </div>
          </section>
        </div>

        <Dialog.Footer>
          <Dialog.Close
            render={<Button variant="outline" />}
          >
            Cancel
          </Dialog.Close>
          <Button onClick={handleSave} disabled={!dirty}>
            Save changes
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export { defaultSmallProfile };
