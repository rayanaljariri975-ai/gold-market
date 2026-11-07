"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPassword() {
  const supabase = createClient();
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
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => {
      location.href = "/profile";
    }, 1500);
  }

  return (
    <main className="wrap">
      <header className="nav">
        <Link className="logo" href="/">GOLD MARKET</Link>
        <Link href="/">الرئيسية</Link>
      </header>
      <section className="section" style={{ maxWidth: 520, margin: "auto" }}>
        <div className="panel">
          <h2>تعيين كلمة مرور جديدة</h2>
          {done ? (
            <p className="notice">تم تغيير كلمة المرور بنجاح. سيتم تحويلك إلى حسابك...</p>
          ) : (
            <form onSubmit={submit}>
              <div className="field">
                <label>كلمة المرور الجديدة</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 أحرف على الأقل" />
              </div>
              <div className="field">
                <label>تأكيد كلمة المرور</label>
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="أعد كتابة كلمة المرور" />
              </div>
              <button disabled={loading}>{loading ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}</button>
            </form>
          )}
          {error && <p className="notice">{error}</p>}
        </div>
      </section>
    </main>
  );
}
