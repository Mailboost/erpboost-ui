import { Avatar } from "@mailboost/erpboost-ui";

export function BasicUsage() {
  return (
    <Avatar.Root>
      <Avatar.Image src="/user.png" alt="Jane Doe" />
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar.Root>
  );
}
