import { useState } from "react";
import { Button, Input, Badge } from "@mailboost/erpboost-ui";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import { Bold, Italic, List, Plus, Trash2, Undo } from "lucide-react";

export function FullPageForm() {
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="demo-form"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
      onChange={() => setSaved(false)}
    >
      <div className="demo-heading">
        <div>
          <h2>Create purchase order</h2>
          <p className="muted">
            Enter order information and delivery preferences.
          </p>
        </div>
        <Badge variant={saved ? "success" : "neutral"}>
          {saved ? "Saved in preview" : "Draft"}
        </Badge>
      </div>
      <div className="demo-card">
        <h3>Basic information</h3>
        <div className="form-grid">
          <label className="form-field">
            Supplier
            <Input name="supplier" required placeholder="Supplier name" />
          </label>
          <label className="form-field">
            Reference
            <Input name="reference" placeholder="e.g. RFQ-441" />
          </label>
          <label className="form-field">
            Order date
            <Input name="date" type="date" defaultValue="2026-10-27" required />
          </label>
          <label className="form-field">
            Currency
            <select name="currency">
              <option>JPY</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </label>
        </div>
      </div>
      <div className="demo-card">
        <h3>Delivery information</h3>
        <div className="form-grid">
          <label className="form-field">
            Requested delivery
            <Input type="date" name="delivery" />
          </label>
          <label className="form-field">
            Shipping method
            <select name="shipping">
              <option>Standard</option>
              <option>Express</option>
              <option>Collect</option>
            </select>
          </label>
          <label className="form-field full">
            Delivery address
            <Input name="address" placeholder="Street, city, postal code" />
          </label>
          <label className="form-field full">
            Notes
            <textarea name="notes" placeholder="Additional instructions..." />
          </label>
        </div>
      </div>
      <div className="form-footer">
        <Button variant="outline" type="reset" onClick={() => setSaved(false)}>
          Reset
        </Button>
        <Button type="submit">Save order</Button>
      </div>
    </form>
  );
}
export function FormBuilder() {
  const [fields, setFields] = useState([
      { id: 1, label: "Company name", type: "text", required: true },
      { id: 2, label: "Email", type: "email", required: true },
    ]),
    [saved, setSaved] = useState(false);
  return (
    <div className="builder-layout">
      <div className="demo-card stack">
        <h3>Fields</h3>
        {fields.map((field) => (
          <div className="builder-field" key={field.id}>
            <Input
              aria-label={`Label ${field.id}`}
              value={field.label}
              onChange={(e) =>
                setFields((fs) =>
                  fs.map((f) =>
                    f.id === field.id ? { ...f, label: e.target.value } : f,
                  ),
                )
              }
            />
            <select
              aria-label={`Type ${field.id}`}
              value={field.type}
              onChange={(e) =>
                setFields((fs) =>
                  fs.map((f) =>
                    f.id === field.id ? { ...f, type: e.target.value } : f,
                  ),
                )
              }
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
            </select>
            <label className="row small">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) =>
                  setFields((fs) =>
                    fs.map((f) =>
                      f.id === field.id
                        ? { ...f, required: e.target.checked }
                        : f,
                    ),
                  )
                }
              />
              Required
            </label>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove field ${field.id}`}
              onClick={() =>
                setFields((fs) => fs.filter((f) => f.id !== field.id))
              }
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() =>
            setFields((fs) => [
              ...fs,
              {
                id: Date.now(),
                label: `Field ${fs.length + 1}`,
                type: "text",
                required: false,
              },
            ])
          }
        >
          <Plus size={15} />
          Add field
        </Button>
      </div>
      <form
        className="demo-card stack"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
        onChange={() => setSaved(false)}
      >
        <h3>Live preview</h3>
        {fields.map((f) => (
          <label className="form-field" key={f.id}>
            {f.label}
            {f.required ? " *" : ""}
            <Input type={f.type} required={f.required} name={String(f.id)} />
          </label>
        ))}
        <Button type="submit">Submit</Button>
        <p className="small muted" role="status">
          {saved ? "Form submitted in this preview." : ""}
        </p>
      </form>
    </div>
  );
}
const initialNotes =
  "<h2>Order notes</h2><p>Thank you for your purchase. Please <strong>confirm the delivery date</strong> before submitting this order.</p><ul><li>Check quantities and unit prices</li><li>Attach the supplier quotation</li></ul>";
export function RichTextEditor({
  initialContent = initialNotes,
  onContentChange,
}: {
  initialContent?: string;
  onContentChange?: (html: string) => void;
}) {
  const [saved, setSaved] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit, TableKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      setSaved(false);
      onContentChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });
  return (
    <div className="demo-card rich-editor">
      <div className="editor-toolbar">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Undo"
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo size={16} />
        </Button>
      </div>
      <EditorContent editor={editor} />
      <div className="row between">
        <span className="small muted" role="status">
          {saved ? "Saved in this preview" : "Powered by Tiptap"}
        </span>
        <Button variant="outline" onClick={() => setSaved(true)}>
          Save document
        </Button>
      </div>
    </div>
  );
}
export function DocumentPage() {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(`<p>ERPBOOST SUPPLY CO.</p>
    <h1>Purchase order</h1><p>PO-2026-1001 · October 27, 2026</p><hr>
    <h3>Supplier</h3><p>Aoba Precision<br>Tokyo, Japan</p>
    <table><thead><tr><th>Description</th><th>Qty</th><th>Amount</th></tr></thead>
    <tbody><tr><td>Precision bearing</td><td>100</td><td>¥120,000</td></tr>
    <tr><td>Steel bracket</td><td>50</td><td>¥36,000</td></tr></tbody></table>
    <p><strong>Total: ¥156,000</strong></p><p>Please confirm the delivery date before dispatch.</p>`);
  return (
    <div className="stack">
      <div className="demo-heading">
        <div>
          <p className="small muted">Documents / Purchase orders</p>
          <h2>Purchase order · PO-2026-1001</h2>
        </div>
        <Button variant="outline" onClick={() => setEditing((e) => !e)}>
          {editing ? "Preview" : "Edit document"}
        </Button>
      </div>
      {editing ? (
        <RichTextEditor initialContent={content} onContentChange={setContent} />
      ) : (
        <article
          className="document-paper"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}
