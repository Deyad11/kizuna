"use client";
import { useRouter } from "next/navigation";
import styles from "./how.module.css";

const STEPS = [
  {
    num: "01",
    title: "A chapter drops.",
    body: "Kizuna tracks release schedules across manga, manhwa, and webtoon. The moment a chapter goes live, a queue opens.",
    accent: "#6366f1",
  },
  {
    num: "02",
    title: "You click one button.",
    body: '"I just read it." That\'s the entire entry mechanic. No profile to fill, no community to join. One tap.',
    accent: "#ec4899",
  },
  {
    num: "03",
    title: "We find your match.",
    body: "Our matching engine scores users by Jaccard similarity across their title selections. You're paired with someone who reads the same way you do — not just the same genre.",
    accent: "#f59e0b",
  },
  {
    num: "04",
    title: "You land on the same scene.",
    body: "Before the chat opens, you both see the same panel from the chapter. The conversation already has a starting point. No awkward opener needed.",
    accent: "#34d399",
  },
  {
    num: "05",
    title: "Real reactions, real time.",
    body: "Live 1-on-1 chat. If it's not clicking, skip and find another match. If it is, save the contact.",
    accent: "#f97316",
  },
];

export default function HowItWorksPage() {
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
        <p className={styles.eyebrow}>HOW IT WORKS</p>
        <h1 className={styles.heading}>
          Built around
          <br />
          one moment.
        </h1>
        <p className={styles.sub}>
          The 15 minutes after you finish a chapter are the most emotionally
          charged of your week. Kizuna is designed for exactly that window.
        </p>
      </div>

      <div className={styles.steps}>
        {STEPS.map((step) => (
          <div key={step.num} className={styles.step}>
            <div className={styles.stepNum} style={{ color: step.accent }}>
              {step.num}
            </div>
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>{step.title}</h2>
              <p className={styles.stepBody}>{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.cta}>
        <h2>The chapter already dropped.</h2>
        <button
          className={styles.ctaBtn}
          onClick={() => router.push("/releases")}
        >
          see what's live now →
        </button>
      </div>
    </div>
  );
}
