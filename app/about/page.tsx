"use client";
import { useRouter } from "next/navigation";
import styles from "./about.module.css";

export default function AboutPage() {
  const router = useRouter();
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <button className={styles.logo} onClick={() => router.push("/")}>
          <span>絆</span> kizuna
        </button>
        <button className={styles.back} onClick={() => router.push("/")}>
          ← back
        </button>
      </nav>

      <div className={styles.hero}>
        <p className={styles.eyebrow}>ABOUT</p>
        <h1 className={styles.heading}>絆</h1>
        <p className={styles.kanji}>kizuna · /kɪˈzuːnə/ · noun</p>
        <p className={styles.def}>
          Japanese. <em>Bond. Connection. The tie between people.</em>
        </p>
      </div>

      <div className={styles.body}>
        <p>
          Kizuna started as a personal frustration. You finish a chapter that
          hits hard — and there's no one to talk to about it right now. Reddit
          exists, but it's a comment section. Discord exists, but it's a crowd.
          Neither of them are built for the moment.
        </p>
        <p>
          We built Kizuna for that moment. The 15 minutes after the chapter
          ends. The feeling that doesn't have anywhere to go.
        </p>
        <p>
          The platform matches you with one person — not a community, not a feed
          — who just finished the same chapter. The conversation starts
          mid-scene. No introduction needed.
        </p>

        <div className={styles.divider} />

        <h2>Built by</h2>
        <div className={styles.team}>
          <div className={styles.member}>
            <div className={styles.memberName}>Hardik Sati</div>
            <div className={styles.memberRole}>
              22CSU370 · The NorthCap University
            </div>
          </div>
          <div className={styles.member}>
            <div className={styles.memberName}>Deepanshu Yadav</div>
            <div className={styles.memberRole}>
              22CSU372 · The NorthCap University
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <h2>Stack</h2>
        <div className={styles.stack}>
          {[
            "Next.js 14",
            "Socket.io",
            "Supabase",
            "PostgreSQL",
            "AniList API",
            "Tailwind CSS",
          ].map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.cta}>
        <button
          className={styles.ctaBtn}
          onClick={() => router.push("/releases")}
        >
          see what's dropping →
        </button>
      </div>
    </div>
  );
}
