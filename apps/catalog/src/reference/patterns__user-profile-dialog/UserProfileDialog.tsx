// Reference example: https://ui.tailor.tech/patterns/user-profile-dialog
import { useId, useRef, useState, type RefObject } from "react";
import { Camera, Lock, Trash2, X } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  Field,
  Input,
  Select,
} from "@mailboost/erpboost-ui";
import { Textarea } from "../shared/textarea";
import { cn } from "@/lib/utils";

export type UserProfile = {
  displayName: string;
  username: string;
  email: string;
  bio: string;
  timezone: string;
  language: string;
  // Read-only / system-managed.
  role: string;
  department: string;
  memberSince: string;
  userId: string;
};

export const defaultProfile: UserProfile = {
  displayName: "Jordan Mitchell",
  username: "jordan.m",
  email: "j.mitchell@tailor.example",
  bio: "Product engineer. Designing the business-operations side of our ERP.",
  timezone: "Asia/Tokyo",
  language: "en-US",
  role: "Admin",
  department: "Platform Experience",
  memberSince: "2024-02-14",
  userId: "usr_8f4c2a91b30e",
};

const TIMEZONES = [
  "Asia/Tokyo",
  "Asia/Singapore",
  "Asia/Seoul",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
];

const LANGUAGES: { value: string; label: string }[] = [
  { value: "ja-JP", label: "Japanese" },
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "ko-KR", label: "Korean" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
];

// Stable gradients we can swap through without an actual upload pipeline. The
// "change photo" action cycles to the next one so the avatar edit affordance
// is functional in the preview.
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#fda4af 0%,#fb7185 45%,#f43f5e 100%)",
  "linear-gradient(135deg,#a7f3d0 0%,#34d399 50%,#0ea5e9 100%)",
  "linear-gradient(135deg,#c4b5fd 0%,#8b5cf6 50%,#4c1d95 100%)",
  "linear-gradient(135deg,#fde68a 0%,#f59e0b 50%,#b45309 100%)",
  "linear-gradient(135deg,#bae6fd 0%,#38bdf8 45%,#0f172a 100%)",
];

type TabKey = "profile" | "account" | "preferences" | "sessions";

const TABS: { key: TabKey; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "account", label: "Account" },
  { key: "preferences", label: "Preferences" },
  { key: "sessions", label: "Sessions" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: UserProfile;
};

/**
 * Two-pane profile dialog. Sidebar uses tab navigation rather than separate
 * routes so unsaved edits never get blown away by an accidental click; the
 * right pane shows editable inputs / selects for mutable fields and plain
 * text for system-managed ones.
 */
export const UserProfileDialog = ({
  open,
  onOpenChange,
  initial = defaultProfile,
}: Props) => {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [profile, setProfile] = useState<UserProfile>(initial);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [dirty, setDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = profile.displayName
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleCancel = () => {
    setProfile(initial);
    setAvatarIndex(0);
    setDirty(false);
    onOpenChange(false);
  };

  const handleSave = () => {
    setDirty(false);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        // app-shell の Dialog.Content が出力する `sm:max-w-lg` に
        // className 経由では CSS 順で勝てないため inline style で上書きする。
        style={{
          maxWidth: 860,
          height: "min(840px, calc(100vh - 2rem))",
          minHeight: "min(560px, calc(100vh - 2rem))",
          padding: 0,
          overflow: "hidden",
        }}
        className={cn(
          "w-full gap-0 overflow-x-hidden sm:rounded-2xl",
          // Dialog.Content appends its own close button after children; hide it
          // because this layout renders a custom one inside the right-pane header.
          "[&>button:last-child]:hidden",
        )}
      >
        {/* visually-hidden title/description for a11y; the visible heading is rendered inside the right pane */}
        <Dialog.Header className="sr-only">
          <Dialog.Title>User settings</Dialog.Title>
          <Dialog.Description>
            View and edit your profile information.
          </Dialog.Description>
        </Dialog.Header>

        <div className="grid h-full min-h-0 grid-cols-[220px_1fr] grid-rows-[minmax(0,1fr)]">
          {/* ── Left rail: tabs ── */}
          <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto border-r p-5">
            <nav className="-mx-1 flex flex-col gap-0.5">
              {TABS.map((tab) => {
                const active = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                      active
                        ? "bg-background font-medium text-foreground"
                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── Right pane ── */}
          <div className="flex min-h-0 flex-col">
            <header className="flex items-center justify-between gap-3 border-b px-6 py-3">
              <div>
                <h2 className="text-base font-semibold">
                  {TABS.find((t) => t.key === activeTab)?.label}
                </h2>
              </div>
              <Dialog.Close
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Close"
                  />
                }
              >
                <X className="size-4" aria-hidden />
              </Dialog.Close>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {activeTab === "profile" ? (
                <ProfileForm
                  profile={profile}
                  avatarBackground={AVATAR_GRADIENTS[avatarIndex]}
                  initials={initials}
                  onChange={update}
                  onRemoveAvatar={() => setAvatarIndex(0)}
                  fileInputRef={fileInputRef}
                />
              ) : (
                <Placeholder tab={activeTab} />
              )}
            </div>

            <footer className="flex items-center justify-between border-t px-6 py-3">
              <p className="text-xs text-muted-foreground">
                {dirty ? "You have unsaved changes" : "No changes"}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave} disabled={!dirty}>
                  Save
                </Button>
              </div>
            </footer>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

type ProfileFormProps = {
  profile: UserProfile;
  avatarBackground: string;
  initials: string;
  onChange: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void;
  onRemoveAvatar: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
};

const ProfileForm = ({
  profile,
  avatarBackground,
  initials,
  onChange,
  onRemoveAvatar,
  fileInputRef,
}: ProfileFormProps) => {
  const bioId = useId();

  return (
    <div className="space-y-6">
      {/* Avatar uploader */}
      <section className="flex items-center gap-4">
        <Avatar.Root
          className="shrink-0 ring-1 ring-border"
          style={{ width: 96, height: 96, borderRadius: "50%" }}
        >
          <Avatar.Image src="" alt="" />
          <Avatar.Fallback
            className="text-3xl font-semibold text-white"
            style={{ background: avatarBackground }}
          >
            {initials}
          </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {profile.displayName}
            </p>
            <div className="flex items-center gap-2">
              <p className="truncate text-xs text-muted-foreground">
                @{profile.username}
              </p>
              <Badge variant="outline-neutral">{profile.role}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="mr-1.5 size-3.5" aria-hidden />
              Upload photo
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemoveAvatar}
              className="text-muted-foreground"
            >
              <Trash2 className="mr-1.5 size-3.5" aria-hidden />
              Remove
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            PNG or JPG, 1MB or smaller recommended.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
          />
        </div>
      </section>

      {/* Editable identity fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field.Root name="displayName">
          <Field.Label>Display name</Field.Label>
          <Input
            value={profile.displayName}
            onChange={(e) => onChange("displayName", e.target.value)}
            placeholder="Display name"
          />
        </Field.Root>
        <Field.Root name="username">
          <Field.Label>Username</Field.Label>
          <Input
            value={profile.username}
            onChange={(e) => onChange("username", e.target.value)}
            placeholder="Username"
          />
          <Field.Description>
            Used for @mentions.
          </Field.Description>
        </Field.Root>
        <Field.Root name="email">
          <Field.Label>Email address</Field.Label>
          <Input
            type="email"
            value={profile.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </Field.Root>
      </div>

      <Field.Root name="bio">
        <div className="flex w-full items-baseline justify-between">
          <Field.Label htmlFor={bioId}>Bio</Field.Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {profile.bio.length}/160
          </span>
        </div>
        <Textarea
          id={bioId}
          value={profile.bio}
          rows={3}
          maxLength={160}
          onChange={(e) => onChange("bio", e.target.value)}
          placeholder="Introduce yourself in a sentence"
        />
      </Field.Root>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field.Root name="timezone">
          <Field.Label>Timezone</Field.Label>
          <Select.Parts.Root
            value={profile.timezone}
            onValueChange={(value) =>
              onChange("timezone", (value as string) ?? profile.timezone)
            }
            itemToStringLabel={(v) => String(v ?? "")}
          >
            <Select.Parts.Trigger>
              <Select.Parts.Value placeholder="Timezone" />
            </Select.Parts.Trigger>
            <Select.Parts.Content>
              {TIMEZONES.map((tz) => (
                <Select.Parts.Item key={tz} value={tz}>
                  {tz}
                </Select.Parts.Item>
              ))}
            </Select.Parts.Content>
          </Select.Parts.Root>
        </Field.Root>

        <Field.Root name="language">
          <Field.Label>Language</Field.Label>
          <Select.Parts.Root
            value={profile.language}
            onValueChange={(value) =>
              onChange("language", (value as string) ?? profile.language)
            }
            itemToStringLabel={(v) =>
              LANGUAGES.find((l) => l.value === v)?.label ?? String(v ?? "")
            }
          >
            <Select.Parts.Trigger>
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

      {/* Read-only / system managed */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Organization
          </p>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3" aria-hidden />
            Managed by admin
          </span>
        </div>
        <div className="rounded-lg border bg-muted/30">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Department</span>
            <span className="text-sm text-muted-foreground">{profile.department}</span>
          </div>
          <div className="border-t" />
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Role</span>
            <Badge variant="neutral">{profile.role}</Badge>
          </div>
          <div className="border-t" />
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Member since</span>
            <span className="text-sm text-muted-foreground">
              {new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(profile.memberSince))}
            </span>
          </div>
          <div className="border-t" />
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">User ID</span>
            <span className="font-mono text-xs text-muted-foreground">{profile.userId}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

const Placeholder = ({ tab }: { tab: Exclude<TabKey, "profile"> }) => (
  <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 text-center text-sm text-muted-foreground">
    <p className="font-medium text-foreground">
      {TABS.find((t) => t.key === tab)?.label} is covered in a separate sample
    </p>
    <p className="mt-1 text-xs">This pattern implements the Profile tab as its example.</p>
  </div>
);
