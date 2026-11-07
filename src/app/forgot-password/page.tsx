"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPassword() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="wrap">
      <header className="nav">
        <Link className="logo" href="/">GOLD MARKET</Link>
        <Link href="/">الرئيسية</Link>
      </header>
      <section className="section" style={{ maxWidth: 520, margin: "auto" }}>
        <div className="panel">
          <h2>نسيت كلمة المرور</h2>
          <p className="muted">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.</p>
          {sent ? (
            <p className="notice">تم إرسال الرابط. افحص بريدك الإلكتروني.</p>
          ) : (
            <form onSubmit={submit}>
              <div className="field">
                <label>البريد الإلكتروني</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" />
              </div>
              <button disabled={loading}>{loading ? "جارٍ الإرسال..." : "إرسال الرابط"}</button>
            </form>
          )}
          {error && <p className="notice">{error}</p>}
          <p className="muted" style={{ marginTop: 16 }}>
            <Link href="/login">العودة لتسجيل الدخول</Link>
          </p>
        </div>
      </section>
    </main>
  );
} 
