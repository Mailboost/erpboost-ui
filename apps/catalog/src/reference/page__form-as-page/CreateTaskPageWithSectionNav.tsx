// Reference example: https://ui.tailor.tech/page/form-as-page
import { useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import {
  Button,
  Card,
  Field,
  Fieldset,
  Form,
  Input,
  Layout,
  Select,
} from "@mailboost/erpboost-ui";
import { Textarea } from "../shared/textarea";
import { useSectionScrollSpy } from "../shared/use-section-scroll-spy";

const owners = ["Tanaka", "Sato", "Suzuki", "Yamada"];
const priorities = ["Low", "Normal", "High", "Urgent"];
const projectCodes = ["ALPHA", "BETA", "OPS-42", "NONE"];

type Section = {
  id: string;
  title: string;
  description: string;
};

type StepNavItem = {
  id: string;
  title: string;
};

const sections: Section[] = [
  {
    id: "basic",
    title: "Basic info",
    description: "What the task is about.",
  },
  {
    id: "assignment",
    title: "Assignment",
    description: "Who owns it and when it is due.",
  },
  {
    id: "timeline",
    title: "Timeline",
    description: "Schedule and effort for planning.",
  },
  {
    id: "followUp",
    title: "Follow-up",
    description: "Handoff, links, and closing notes.",
  },
];

const anchorIdFor = (id: string) => `section-${id}`;

const StringsSelectField = ({
  items,
  value,
  onValueChange,
  placeholder,
}: {
  items: readonly string[];
  value: string | null;
  onValueChange: (next: string | null) => void;
  placeholder: string;
}) => (
  <Select.Parts.Root
    value={value}
    onValueChange={onValueChange}
    itemToStringLabel={(v) => String(v ?? "")}
  >
    <Select.Parts.Trigger>
      <Select.Parts.Value placeholder={placeholder} />
    </Select.Parts.Trigger>
    <Select.Parts.Content>
      {items.map((item) => (
        <Select.Parts.Item key={item} value={item}>
          {item}
        </Select.Parts.Item>
      ))}
    </Select.Parts.Content>
  </Select.Parts.Root>
);

const StepNav = ({
  items,
  activeId,
  onSelect,
}: {
  items: StepNavItem[];
  activeId: string;
  onSelect: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
}) => (
  <nav className="sticky top-4 w-full max-w-40 space-y-0.5">
    {items.map((item) => {
      const isActive = item.id === activeId;
      return (
        <a
          key={item.id}
          href={`#${anchorIdFor(item.id)}`}
          onClick={(event) => onSelect(event, item.id)}
          className={
            "block border-l-2 px-3 py-2 text-sm transition-colors " +
            (isActive
              ? "border-primary font-medium text-foreground"
              : "border-transparent text-muted-foreground hover:border-border hover:text-foreground")
          }
        >
          {item.title}
        </a>
      );
    })}
  </nav>
);

type SectionFieldsProps = {
  sectionId: string;
  owner: string | null;
  setOwner: (v: string | null) => void;
  priority: string | null;
  setPriority: (v: string | null) => void;
  projectCode: string | null;
  setProjectCode: (v: string | null) => void;
};

const SectionFields = ({
  sectionId,
  owner,
  setOwner,
  priority,
  setPriority,
  projectCode,
  setProjectCode,
}: SectionFieldsProps): ReactNode => {
  switch (sectionId) {
    case "basic":
      return (
        <div className="space-y-4">
          <Field.Root name="title">
            <Field.Label>Title</Field.Label>
            <Field.Control required placeholder="Review supplier docs" />
            <Field.Error />
          </Field.Root>
          <Field.Root name="description">
            <Field.Label>Description</Field.Label>
            <Textarea
              name="description"
              rows={4}
              className="min-h-24"
              placeholder="What outcome are you looking for?"
            />
          </Field.Root>
        </div>
      );
    case "assignment":
      return (
        <Fieldset.Root className="grid gap-4 md:grid-cols-2">
          <Field.Root name="owner">
            <Field.Label>Owner</Field.Label>
            <StringsSelectField
              items={owners}
              value={owner}
              onValueChange={setOwner}
              placeholder="Assign owner"
            />
          </Field.Root>
          <Field.Root name="priority">
            <Field.Label>Priority</Field.Label>
            <StringsSelectField
              items={priorities}
              value={priority}
              onValueChange={setPriority}
              placeholder="Choose priority"
            />
          </Field.Root>
          <Field.Root name="dueDate">
            <Field.Label>Due date</Field.Label>
            <Input type="date" />
          </Field.Root>
          <Field.Root name="project">
            <Field.Label>Project</Field.Label>
            <StringsSelectField
              items={projectCodes}
              value={projectCode}
              onValueChange={setProjectCode}
              placeholder="Link to project"
            />
          </Field.Root>
        </Fieldset.Root>
      );
    case "timeline":
      return (
        <Fieldset.Root className="grid gap-4 md:grid-cols-2">
          <Field.Root name="startDate">
            <Field.Label>Start date</Field.Label>
            <Input type="date" />
          </Field.Root>
          <Field.Root name="estimateHrs">
            <Field.Label>Estimate (hours)</Field.Label>
            <Input type="number" min={0} step={0.5} placeholder="8" />
          </Field.Root>
          <Field.Root name="milestone" className="md:col-span-2">
            <Field.Label>Milestone</Field.Label>
            <Field.Control placeholder="e.g. Design sign-off" />
          </Field.Root>
        </Fieldset.Root>
      );
    case "followUp":
      return (
        <div className="space-y-4">
          <Field.Root name="blockedBy">
            <Field.Label>Blocked by</Field.Label>
            <Field.Control placeholder="Task ID or dependency" />
          </Field.Root>
          <Field.Root name="referenceUrl">
            <Field.Label>Reference URL</Field.Label>
            <Input type="url" placeholder="https://…" />
          </Field.Root>
          <Field.Root name="handoffNotes">
            <Field.Label>Handoff notes</Field.Label>
            <Textarea name="handoffNotes" rows={3} className="min-h-20" placeholder="For the next owner…" />
          </Field.Root>
        </div>
      );
    default:
      return null;
  }
};

const SECTION_IDS = sections.map((s) => s.id);

export const CreateTaskPageWithSectionNav = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [owner, setOwner] = useState<string | null>("Tanaka");
  const [priority, setPriority] = useState<string | null>("Normal");
  const [projectCode, setProjectCode] = useState<string | null>("ALPHA");

  const { active, selectActive, scrollToSection } = useSectionScrollSpy({
    rootRef,
    sectionIds: SECTION_IDS,
    anchorId: anchorIdFor,
    offsetPx: 96,
  });

  const navItems = useMemo(
    () => sections.map(({ id, title }) => ({ id, title })),
    [],
  );

  const handleNavSelect = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    selectActive(id);
    scrollToSection(id);
  };

  return (
    <div ref={rootRef}>
      <Layout className="catalogue-section-nav-layout-cols">
        <Layout.Header title="Create task" />
        <Layout.Column area="left">
          <StepNav items={navItems} activeId={active} onSelect={handleNavSelect} />
        </Layout.Column>
        <Layout.Column area="main">
          <Form className="space-y-6">
            {sections.map((section) => (
              <Card.Root key={section.id} id={anchorIdFor(section.id)} className="scroll-mt-24">
                <Card.Header title={section.title} description={section.description} />
                <Card.Content>
                  <SectionFields
                    sectionId={section.id}
                    owner={owner}
                    setOwner={setOwner}
                    priority={priority}
                    setPriority={setPriority}
                    projectCode={projectCode}
                    setProjectCode={setProjectCode}
                  />
                </Card.Content>
              </Card.Root>
            ))}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button">
                Cancel
              </Button>
              <Button variant="secondary" type="button">
                Save as draft
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </Form>
        </Layout.Column>
      </Layout>
    </div>
  );
};
