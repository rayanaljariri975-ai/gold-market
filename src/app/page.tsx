import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
const games = ["Free Fire","PUBG Mobile","PlayStation","Xbox","Fortnite","Roblox"];
export default async function Home() {
 const supabase = await createClient();
 const {data: ads} = await supabase.from("listings").select("id,title,game,price,currency,description,created_at").eq("status","approved").order("created_at",{ascending:false}).limit(12);
 return <main className="wrap">
  <header className="nav"><Link className="logo" href="/">GOLD MARKET</Link><nav className="links"><Link href="/#games">الألعاب</Link><Link href="/add">＋ أضف إعلان</Link><Link href="/profile">حسابي</Link><Link href="/chat">المحادثات</Link><Link href="/login" className="gold">دخول / إنشاء حساب</Link></nav></header>
  <section className="hero"><div className="eyebrow">THE GAMING ACCOUNTS MARKETPLACE</div><h1>GOLD <span className="gold">MARKET</span></h1><p>وجهتك لعرض وشراء حسابات الألعاب. تصفّح الإعلانات المعتمدة، تواصل مع البائع، واتخذ قرارك بثقة ووضوح.</p><div className="actions" style={{justifyContent:"center"}}><Link className="btn" href="/add">أضف إعلانك الآن</Link><a className="btn secondary" href="#ads">تصفح الإعلانات</a></div></section>
  <section className="section" id="games"><h2>الألعاب <span className="gold">المتاحة</span></h2><div className="games">{games.map(g=><Link className="game" key={g} href={`/games/${encodeURIComponent(g)}`}>{g}</Link>)}</div></section>
  <section className="section" id="ads"><h2>أحدث <span className="gold">الإعلانات المعتمدة</span></h2>{ads?.length ? <div className="grid">{ads.map(a=><article className="card" key={a.id}><span className="tag">{a.game}</span><h3>{a.title}</h3><p className="muted">{a.description}</p><div className="price">{Number(a.price).toLocaleString()} {a.currency}</div><Link className="btn secondary" href={`/listing/${a.id}`}>عرض التفاصيل</Link></article>)}</div>:<div className="panel muted">لا توجد إعلانات منشورة حالياً. كن أول من يضيف إعلاناً بعد تسجيل الدخول.</div>}</section>
  <footer className="footer">© {new Date().getFullYear()} GOLD MARKET — سوق حسابات الألعاب</footer>
 </main>;
}