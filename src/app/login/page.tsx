"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("Email not confirmed")
          ? "يرجى تأكيد بريدك الإلكتروني أولاً من الرسالة المرسلة إليك."
          : "البريد الإلكتروني أو كلمة المرور غير صحيحة."
      );
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <main className="wrap">
      <header className="nav">
        <Link className="logo" href="/">GOLD MARKET</Link>
        <Link href="/">الرئيسية</Link>
      </header>
      <section className="section" style={{ maxWidth: 520, margin: "auto" }}>
        <div className="panel">
          <h2>تسجيل الدخول</h2>
          <p className="muted">أدخل بريدك الإلكتروني وكلمة المرور.</p>
          <form onSubmit={submit}>
            <div className="field">
              <label>البريد الإلكتروني</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" />
            </div>
            <div className="field">
              <label>كلمة المرور</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button disabled={loading}>{loading ? "جارٍ الدخول..." : "تسجيل الدخول"}</button>
          </form>
          {error && <p className="notice">{error}</p>}
          <p className="muted" style={{ marginTop: 16 }}>
            <Link href="/forgot-password">نسيت كلمة المرور؟</Link>
          </p>
          <p className="muted">
            ليس لديك حساب؟ <Link href="/signup">إنشاء حساب</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
