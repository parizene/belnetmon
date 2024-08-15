"use client";

import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <nav className="flex justify-between border-b border-border bg-background p-4">
      <div>
        <Button variant="link">
          <Link href="/" className="text-base">
            Home
          </Link>
        </Button>
      </div>

      <div className="flex items-center">
        <ModeToggle />
      </div>
    </nav>
  );
}
