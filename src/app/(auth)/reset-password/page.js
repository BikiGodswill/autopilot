import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = { title: "Set new password — SEO Autopilot" };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
