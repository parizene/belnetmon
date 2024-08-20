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
        <Button variant="link">
          <Link href="/clf-generator" className="text-base">
            CLF Generator
          </Link>
        </Button>
        <Button variant="link">
          <Link
            className="text-base"
            href="https://forum.esmasoft.com/viewforum.php?f=19"
            rel="noopener noreferrer"
            target="_blank"
          >
            Forum
          </Link>
        </Button>
      </div>

      <div className="flex items-center">
        <ModeToggle />
      </div>
    </nav>
  );
}
