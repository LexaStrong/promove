import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-muted/40 min-h-screen flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm initialMode="sign-in" />
      </div>
    </div>
  );
}
