"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"

import { LoginFormValues, loginSchema,
} from "@/lib/schemas/auth"

import { useLogin } from "@/hooks/use-auth"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function LoginForm() {

  const router= useRouter()
  const loginMutation= useLogin()
  const {
    register,
    handleSubmit,
    setError, 
    formState: {
      errors, 
    }, 
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, 
      {
        onSuccess: () => {
          toast.success("Welcome back", {
            description:"Your reading space is ready"
          })
          router.push("/library")
        }, 
        onError :(error) =>{
          const message = error instanceof Error ? error.message : "Unable to sign in "
          toast.error("couldn't sign you in ", 
            {
              description: message, 
            }
          )
          setError("root", {
            message
          })
        }
      }
    )
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Log in
        </h1>

        <p className="text-muted-foreground">
          Continue reading on Jharo
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email
        </Label>

        <Input
          id="email"
          type="email"
          disabled={loginMutation.isPending}
          placeholder="you@example.com"
          className="placeholder:text-sm"
          {...register("email")}
        />
         {errors.email && (
          <p className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password
        </Label>

        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          disabled={loginMutation.isPending}
          className="placeholder:text-sm"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
          {loginMutation.isPending
          ? "Signing in..."
          : "Log in"}
      </button>
    </form>
  );
}

export default LoginForm;
