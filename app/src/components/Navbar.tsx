"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "./AuthContext";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";

export default function Navbar() {
  const router = useRouter();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (!auth) return;

    if (await auth.signOut()) {
      router.push("/");
    }
  };

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
          <Link href="/legacy-csv-validator" className="text-base">
            Legacy CSV Validator
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
        {auth?.session && (
          <Button variant="link">
            <Link href="/private" className="text-base">
              Private
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center">
        {auth?.session ? (
          <Button variant="ghost" onClick={handleSignOut} className="mr-4">
            Sign out
          </Button>
        ) : (
          <Button variant="ghost" className="mr-4">
            <Link href="/login">Sign in</Link>
          </Button>
        )}
        <ModeToggle />
      </div>
    </nav>
  );
}
