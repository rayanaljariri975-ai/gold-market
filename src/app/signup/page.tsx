"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Signup() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${location.origin}/auth/callback?next=/profile`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      location.href = "/profile";
    } else {
      setDone(true);
    }
  }

  return (
    <main className="wrap">
      <header className="nav">
        <Link className="logo" href="/">GOLD MARKET</Link>
        <Link href="/">الرئيسية</Link>
      </header>
      <section className="section" style={{ maxWidth: 520, margin: "auto" }}>
        <div className="panel">
          <h2>إنشاء حساب</h2>
          {done ? (
            <p className="notice">
              تم إنشاء حسابك. أرسلنا رابط تأكيد إلى بريدك الإلكتروني، اضغط عليه لتفعيل الحساب ثم سجّل الدخول.
            </p>
          ) : (
            <form onSubmit={submit}>
              <div className="field">
                <label>الاسم</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك الكامل" />
              </div>
              <div className="field">
                <label>البريد الإلكتروني</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" />
              </div>
              <div className="field">
                <label>كلمة المرور</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 أحرف على الأقل" />
              </div>
              <div className="field">
                <label>تأكيد كلمة المرور</label>
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="أعد كتابة كلمة المرور" />
              </div>
              <button disabled={loading}>{loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}</button>
            </form>
          )}
          {error && <p className="notice">{error}</p>}
          <p className="muted" style={{ marginTop: 16 }}>
            لديك حساب؟ <Link href="/login">تسجيل الدخول</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
