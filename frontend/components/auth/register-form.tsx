"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  RegisterFormValues,
  registerSchema,
} from "@/lib/schemas/auth";

import { useRegister } from "@/hooks/use-auth";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    // Don't send confirmPassword to Django
    registerMutation.mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (response) => {
          toast.success("Check your inbox", {
            description:
              response.message ||
              "We've sent you a verification link.",
          });

          router.push("/login");
        },

        onError: (error) => {
          toast.error("Couldn't create your account", {
            description:
              error instanceof Error
                ? error.message
                : "Something went wrong.",
          });
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="auth-form-card w-full max-w-md space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Create an account
        </h1>

        <p className="text-muted-foreground">
          Create an account to upload and read PDF books.
        </p>
      </div>

      {/* Email */}

      <div className="space-y-2">
        <Label htmlFor="email">
          Email
        </Label>

        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="placeholder:text-sm"
          disabled={registerMutation.isPending}
          {...register("email")}
        />

        {errors.email && (
          <p className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}

      <div className="space-y-2">
        <Label htmlFor="password">
          Password
        </Label>

        <Input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          className="placeholder:text-sm"
          disabled={registerMutation.isPending}
          {...register("password")}
        />

        {errors.password && (
          <p className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm password */}

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirm password
        </Label>

        <Input
          id="confirmPassword"
          type="password"
          placeholder="Enter your password again"
          className="placeholder:text-sm"
          disabled={registerMutation.isPending}
          {...register("confirmPassword")}
        />

        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="auth-submit w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending
          ? "Creating account..."
          : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
