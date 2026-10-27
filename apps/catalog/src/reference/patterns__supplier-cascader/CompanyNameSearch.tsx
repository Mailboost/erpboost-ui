// Reference example: https://ui.tailor.tech/patterns/supplier-cascader
import { Button, Input } from "@mailboost/erpboost-ui";
import { X } from "lucide-react";

interface CompanyNameSearchProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CompanyNameSearch({
  value,
  onChange,
  disabled,
}: CompanyNameSearchProps) {
  return (
    <div className="relative flex w-52 items-center">
      <Input
        placeholder="Search by company name"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-8 pr-8"
      />
      {value && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
