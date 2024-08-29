"use client";

import { useAuth } from "@/components/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

type LoginType = "signin" | "signup";

export default function LoginPage() {
  const [loginType, setLoginType] = useState<LoginType>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSignInToggleClick = (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
  ) => {
    setLoginType("signin");
    setPassword("");
  };

  const handleSignUpToggleClick = (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
  ) => {
    setLoginType("signup");
    setPassword("");
  };

  const handleSubmit = async () => {
    if (!auth) return;

    if (loginType === "signin") {
      if (await auth.signIn(email, password)) {
        router.push("/");
      }
    } else {
      if (await auth.signUp(email, password)) {
        setShowAlert(true);
      }
    }
  };

  return showAlert ? (
    <div className="mt-8 flex justify-center">
      <Alert className="w-[350px]">
        <Mail className="h-4 w-4" />
        {email && <AlertTitle>{email}</AlertTitle>}
        <AlertDescription>
          In order to start using your account, you need to confirm your email
          address
        </AlertDescription>
      </Alert>
    </div>
  ) : (
    <div className="mt-8 flex justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>
            {loginType === "signin" ? "Sign in" : "Sign up"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div>
            <Button onClick={handleSubmit}>
              {loginType === "signin" ? "Sign in" : "Sign up"}
            </Button>
            {loginType === "signin" ? (
              <div className="mt-4 text-sm">
                Don't have an account yet?{" "}
                <span
                  className="cursor-pointer underline"
                  onClick={handleSignUpToggleClick}
                >
                  Sign up
                </span>
              </div>
            ) : (
              <div className="mt-4 text-sm">
                Already have an account?{" "}
                <span
                  className="cursor-pointer underline"
                  onClick={handleSignInToggleClick}
                >
                  Sign in
                </span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
