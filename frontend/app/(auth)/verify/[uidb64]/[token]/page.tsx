import VerifyEmail from "@/components/auth/verify-email";

interface VerifyPageProps {
  params: Promise<{
    uidb64: string;
    token: string;
  }>;
}

export default async function VerifyPage({
  params,
}: VerifyPageProps) {
  const { uidb64, token } = await params;

  return (
    <main className="login-page">
      <header className="login-header">
        <div className="login-logo">
          jharo
        </div>
      </header>

      <div className="login-content">
        <div className="login-intro">
          <span className="eyebrow">
            YOUR READING SPACE
          </span>

          <h1 className="font-reading">
            One last
            <br />
            <em>step.</em>
          </h1>

          <p>
            We are confirming your email
            so you can start reading.
          </p>
        </div>

        <VerifyEmail
          uid={uidb64}
          token={token}
        />
      </div>
    </main>
  );
}