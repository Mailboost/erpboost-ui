import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox, ErpHeader } from "@mailboost/erpboost-ui";

function Example({ onSelect }: { onSelect: (value: string | null) => void }) {
  const [value, setValue] = useState<string | null>("Mailboost");
  return (
    <ErpHeader
      aria-label="ERPboost"
      brand="ERP"
      organization={
        <Combobox.Parts.Root
          items={["Mailboost", "サンプル組織"]}
          value={value}
          onValueChange={(next) => {
            setValue(next);
            onSelect(next);
          }}
        >
          <Combobox.Parts.Trigger
            aria-label="組織を切り替え"
            render={<ErpHeader.Trigger />}
          >
            {value}
          </Combobox.Parts.Trigger>
          <Combobox.Parts.Content>
            <Combobox.Parts.Input aria-label="組織を検索" />
            <Combobox.Parts.List>
              {["Mailboost", "サンプル組織"].map((name) => (
                <Combobox.Parts.Item key={name} value={name}>
                  {name}
                </Combobox.Parts.Item>
              ))}
            </Combobox.Parts.List>
          </Combobox.Parts.Content>
        </Combobox.Parts.Root>
      }
      connection={<ErpHeader.Trigger disabled>ERP接続</ErpHeader.Trigger>}
    />
  );
}

describe("ErpHeader", () => {
  it("composes the existing controlled Combobox without AppShell or an auth provider", async () => {
    const select = vi.fn();
    render(<Example onSelect={select} />);
    fireEvent.click(screen.getByRole("combobox", { name: "組織を切り替え" }));
    fireEvent.click(
      await screen.findByRole("option", { name: "サンプル組織" }),
    );
    expect(select).toHaveBeenCalledWith("サンプル組織");
    expect(
      screen.getByRole("combobox", { name: "組織を切り替え" }).textContent,
    ).toContain("サンプル組織");
    expect(
      (screen.getByRole("button", { name: "ERP接続" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
  it("forwards the trigger ref and preserves the button's disabled behavior", () => {
    const ref = { current: null as HTMLButtonElement | null };
    const click = vi.fn();
    render(
      <ErpHeader.Trigger ref={ref} disabled onClick={click}>
        ERP接続
      </ErpHeader.Trigger>,
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "ERP接続" }));
    fireEvent.click(ref.current!);
    expect(click).not.toHaveBeenCalled();
  });
  it("labels both loading regions and keeps decorative placeholders out of the accessibility tree", () => {
    render(
      <ErpHeader
        brand="ERP"
        organization={<ErpHeader.Loading label="組織を読み込んでいます" />}
        connection={<ErpHeader.Loading label="ERP接続を読み込んでいます" />}
      />,
    );
    expect(
      screen
        .getByRole("status", { name: "組織を読み込んでいます" })
        .querySelector('[aria-hidden="true"]'),
    ).toBeTruthy();
    expect(
      screen.getByRole("status", { name: "ERP接続を読み込んでいます" }),
    ).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
