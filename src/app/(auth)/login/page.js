import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Log in — SEO Autopilot" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
