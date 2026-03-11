import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cavok/ui/components/shad/dropdown-menu";
import { Button } from "@cavok/ui/components/shad/button";
import { UserIcon } from "lucide-react";
import { ReactNode } from "react";
import { Username } from "@cavok/core/contracts/auth.contracts";

export type AccountDisplayProps = {
  username: Username
  links: {
    key: string;
    component: ReactNode;
  }[];
};

export function AccountDisplay({ username, links }: AccountDisplayProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline">
          {username.value}#{username.discriminator}
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {links.map((link) => (
          <DropdownMenuItem asChild key={link.key}>
            {link.component}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
