import LoginForm from "@/components/login-form";
import Header from "@/components/header";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">
          Log in to MagnetDemon
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
