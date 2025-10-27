import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ServerErrorResponse } from "@/types";
import { signIn } from "next-auth/react";
import { PasswordField } from "../shared/form-builder/PasswordField";
import Image from "next/image";

export const Authentication = () => {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{
    usernameOrEmail?: string;
    password?: string;
  }>({});

  const { mutate: signInMutator, isPending: isSignInPending } = useMutation({
    mutationFn: async (data: {
      method: "credentials" | "github" | "google";
      usernameOrEmail?: string;
      password?: string;
    }) => {
      const result = await signIn(data.method, {
        redirect: false,
        callbackUrl: "/",
        ...(data.method === "credentials" && {
          usernameOrEmail: data.usernameOrEmail,
          password: data.password,
        }),
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      router.push("/");
      toast.success("Welcome back!");
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(error.message);
    },
  });

  const validate = () => {
    const newErrors: { usernameOrEmail?: string; password?: string } = {};
    if (!usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = "Email or username is required";
    } else if (
      usernameOrEmail.includes("@") &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(usernameOrEmail)
    ) {
      newErrors.usernameOrEmail = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = () => {
    if (!validate()) return;
    signInMutator({ method: "credentials", usernameOrEmail, password });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSignInPending) {
      handleSignIn();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInPending) {
      handleSignIn();
    }
  };

  return (
    <div className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 px-4">
      <Card className="mx-auto w-[400px]">
        <CardHeader>
          <div className="my-5 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Instanct Logo"
              width={100}
              height={100}
            />
          </div>
          <CardTitle className="text-2xl text-center">Authentication</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleFormSubmit} noValidate>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                required
                className={errors.usernameOrEmail ? "border-red-500" : ""}
              />
              {errors.usernameOrEmail && (
                <p className="text-sm text-red-500">{errors.usernameOrEmail}</p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <PasswordField
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSignInPending}>
              Login
            </Button>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
