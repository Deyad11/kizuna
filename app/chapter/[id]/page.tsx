"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useQueue } from "@/lib/useQueue";
import styles from "./chapter.module.css";
import { getCovers } from "@/lib/anilistCache";
const avatarImages = [
  "/avatars/avatar-1.svg",
  "/avatars/avatar-2.svg",
  "/avatars/avatar-3.svg",
  "/avatars/avatar-4.svg",
  "/avatars/avatar-5.svg",
];

const CHAPTER_DATA: Record<
  string,
  {
    title: string;
    chapter: number;
    type: string;
    genres: string[];
    droppedMinutesAgo: number;
    coverImage: string;
    bannerImage: string;
    peakMinutesLeft: number;
    avgWait: string;
    readers: number;
    readerNames: string[];
    activityLevel: "high" | "medium" | "low";
    searchTitle: string;
    sceneImage?: string;
  }
> = {
  "blue-lock": {
    title: "Blue Lock",
    chapter: 346,
    type: "Manga",
    genres: ["Sports", "Action"],
    droppedMinutesAgo: 28,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx114745-yvD3e9G3FruQ.jpg",
    bannerImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/banner/114745-wFwqwBFNMekX.jpg",
    peakMinutesLeft: 12,
    avgWait: "< 60s",
    readers: 34,
    readerNames: ["Ryuu", "Akira", "Syo"],
    activityLevel: "high",
    searchTitle: "Blue Lock",
  },
  "jujutsu-kaisen": {
    title: "Jujutsu Kaisen",
    chapter: 271,
    type: "Manga",
    genres: ["Action", "Supernatural"],
    droppedMinutesAgo: 45,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx101517-L2DF9rL0SkVl.jpg",
    bannerImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/banner/101517-YBIBHNxOFX26.jpg",
    peakMinutesLeft: 8,
    avgWait: "< 30s",
    readers: 67,
    readerNames: ["Hana", "Kei", "Masa"],
    activityLevel: "high",
    searchTitle: "Jujutsu Kaisen",
  },
  "one-piece": {
    title: "One Piece",
    chapter: 1183,
    type: "Manga",
    genres: ["Action", "Adventure"],
    droppedMinutesAgo: 62,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30013-RKhL3jK5TTVM.jpg",
    bannerImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/banner/30013-fXITbMH5YzMN.jpg",
    peakMinutesLeft: 3,
    avgWait: "< 45s",
    readers: 27,
    readerNames: ["Zoro", "Nami", "Robin"],
    activityLevel: "medium",
    searchTitle: "One Piece",
  },
  "tower-of-god": {
    title: "Tower of God",
    chapter: 625,
    type: "Webtoon",
    genres: ["Action", "Fantasy"],
    droppedMinutesAgo: 15,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx85143-8bztHkqSSB4m.jpg",
    bannerImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/banner/85143-aW1JJQCMrQeO.jpg",
    peakMinutesLeft: 20,
    avgWait: "< 90s",
    readers: 44,
    readerNames: ["Bam", "Rachel", "Khun"],
    activityLevel: "high",
    searchTitle: "Tower of God",
  },
  dandadan: {
    title: "Dandadan",
    chapter: 234,
    type: "Manga",
    genres: ["Action", "Romance"],
    droppedMinutesAgo: 35,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx132029-mAXeRZn5V6Rg.jpg",
    bannerImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/banner/132029-UVT5SCMKWJXO.jpg",
    peakMinutesLeft: 16,
    avgWait: "< 60s",
    readers: 70,
    readerNames: ["Momo", "Okarun", "Jiji"],
    activityLevel: "high",
    searchTitle: "Dandadan",
  },
  eleceed: {
    title: "Eleceed",
    chapter: 400,
    type: "Manhwa",
    genres: ["Action", "Fantasy"],
    droppedMinutesAgo: 20,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx107759-iHCDkRC6RgzB.jpg",
    bannerImage: "",
    peakMinutesLeft: 25,
    avgWait: "< 60s",
    readers: 28,
    readerNames: ["Jiwoo", "Kayden", "Inhyuk"],
    activityLevel: "medium",
    searchTitle: "Eleceed",
  },
  "sakamoto-days": {
    title: "Sakamoto Days",
    chapter: 260,
    type: "Manga",
    genres: ["Action", "Comedy"],
    droppedMinutesAgo: 18,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx132588-TuFt2bVGCxTl.jpg",
    bannerImage: "",
    peakMinutesLeft: 30,
    avgWait: "< 45s",
    readers: 22,
    readerNames: ["Taro", "Shin", "Nagumo"],
    activityLevel: "medium",
    searchTitle: "Sakamoto Days",
  },
  kagurabachi: {
    title: "Kagurabachi",
    chapter: 122,
    type: "Manga",
    genres: ["Action", "Fantasy"],
    droppedMinutesAgo: 25,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx167898-U1GRpJBRbvnK.jpg",
    bannerImage: "",
    peakMinutesLeft: 20,
    avgWait: "< 60s",
    readers: 19,
    readerNames: ["Chihiro", "Hakuri", "Char"],
    activityLevel: "medium",
    searchTitle: "Kagurabachi",
  },
  lookism: {
    title: "Lookism",
    chapter: 600,
    type: "Manhwa",
    genres: ["Slice of Life", "Action"],
    droppedMinutesAgo: 40,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx86635-UxakUQWobvOd.jpg",
    bannerImage: "",
    peakMinutesLeft: 15,
    avgWait: "< 90s",
    readers: 31,
    readerNames: ["Daniel", "Vasco", "Jay"],
    activityLevel: "medium",
    searchTitle: "Lookism",
  },
  "kaiju-no-8": {
    title: "Kaiju No. 8",
    chapter: 157,
    type: "Manga",
    genres: ["Action", "Sci-Fi"],
    droppedMinutesAgo: 55,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx132196-0GBqFsUCv0Bm.jpg",
    bannerImage: "",
    peakMinutesLeft: 10,
    avgWait: "< 75s",
    readers: 24,
    readerNames: ["Kafka", "Mina", "Reno"],
    activityLevel: "low",
    searchTitle: "Kafka on the Shore",
  },
  frieren: {
    title: "Frieren",
    chapter: 145,
    type: "Manga",
    genres: ["Fantasy", "Slice of Life"],
    droppedMinutesAgo: 30,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx127230-flE5ik5cEMjn.jpg",
    bannerImage: "",
    peakMinutesLeft: 18,
    avgWait: "< 60s",
    readers: 38,
    readerNames: ["Frieren", "Fern", "Stark"],
    activityLevel: "medium",
    searchTitle: "Frieren: Beyond Journey's End",
  },
  "omniscient-reader": {
    title: "Omniscient Reader",
    chapter: 310,
    type: "Manhwa",
    genres: ["Action", "Fantasy"],
    droppedMinutesAgo: 22,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx138307-pkpKAArNc9H4.jpg",
    bannerImage: "",
    peakMinutesLeft: 22,
    avgWait: "< 50s",
    readers: 45,
    readerNames: ["Dokja", "Joonghyuk", "Yoosung"],
    activityLevel: "high",
    searchTitle: "Omniscient Reader's Viewpoint",
  },
};

// const ANILIST_QUERY = `query ($search: String) {
//   Page(perPage: 1) {
//     media(search: $search, type: MANGA, sort: POPULARITY_DESC) {
//       bannerImage coverImage { extraLarge large }
//     }
//   }
// }`;

export default function ChapterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const chapter = CHAPTER_DATA[id];

  const [bannerImage, setBannerImage] = useState(
    chapter?.bannerImage || chapter?.coverImage || "",
  );
  const [readers, setReaders] = useState(chapter?.readers ?? 0);
  const [mounted, setMounted] = useState(false);

  const [userId, setUserId] = useState("");
  const [titleIds, setTitleIds] = useState<number[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [queueEnabled, setQueueEnabled] = useState(false);

  const [revealCountdown, setRevealCountdown] = useState(5);
  const [chatUnlocked, setChatUnlocked] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessionTodayCount, setSessionTodayCount] = useState<number | null>(
    null,
  );
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    status,
    match,
    messages,
    queueDepth,
    endReason,
    mySocketId,
    sendMessage,
    skip,
    leaveQueue,
    resetQueue, // ← ADD
  } = useQueue({
    userId,
    chapterId: id,
    titleIds,
    enabled: queueEnabled && authReady,
  });

  // ── AUTH + INTERESTS ──
  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (user) {
        setUserId(user.id);
        const { data: interests } = await supabase
          .from("user_interests")
          .select("title_id")
          .eq("user_id", user.id);
        setTitleIds(interests?.map((i: any) => i.title_id) ?? []);
      } else {
        setUserId(`anon_${Math.random().toString(36).slice(2, 10)}`);
      }
      setAuthReady(true);
    });
  }, []);

  // ── FAKE READER COUNT ──
  useEffect(() => {
    if (!chapter) return;
    if (queueDepth > 0) {
      setReaders(queueDepth);
      return;
    }
    const interval = setInterval(() => {
      setReaders((r) => Math.max(1, r + Math.floor(Math.random() * 3) - 1));
    }, 3500);
    return () => clearInterval(interval);
  }, [chapter, queueDepth]);

  // ── ANILIST ARTWORK ──
  // useEffect(() => {
  //   if (!chapter) return;
  //   fetch("https://graphql.anilist.co", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       query: ANILIST_QUERY,
  //       variables: { search: chapter.searchTitle },
  //     }),
  //   })
  //     .then((r) => r.json())
  //     .then((data) => {
  //       const media = data.data?.Page?.media?.[0];
  //       if (media?.bannerImage) setBannerImage(media.bannerImage);
  //       else if (media?.coverImage?.extraLarge)
  //         setBannerImage(media.coverImage.extraLarge);
  //     })
  //     .catch(() => {});
  // }, [chapter]);
  useEffect(() => {
    if (!chapter) return;

    getCovers([chapter.searchTitle]).then((covers) => {
      const url = covers[chapter.searchTitle];
      if (url) {
        setBannerImage(url);
      }
    });
  }, [chapter]);
  // ── SCENE REVEAL COUNTDOWN ──
  useEffect(() => {
    if (status !== "matched") return;
    setRevealCountdown(5);
    setChatUnlocked(false);
    countdownRef.current = setInterval(() => {
      setRevealCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setChatUnlocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [status]);

  // ── AUTO SCROLL CHAT ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── WRITE TASTE PROFILE ON SESSION END ──
  // useEffect(() => {
  //   if (status !== "ended") return;
  //   if (!userId || userId.startsWith("anon_")) return;
  //   if (!chapter) return;

  //   const supabase = createClient();
  //   const sessionDuration = match
  //     ? Math.floor((Date.now() - (match.matchedAt || Date.now())) / 1000)
  //     : 0;
  //   const isGoodSession = sessionDuration > 60;

  //   const updateProfile = async () => {
  //     const { data: profile } = await supabase
  //       .from("profiles")
  //       .select("taste_weights, favorite_titles")
  //       .eq("id", userId)
  //       .single();

  //     const existingWeights: Record<string, number> =
  //       (profile?.taste_weights as Record<string, number>) ?? {};
  //     const existingTitles: string[] =
  //       (profile?.favorite_titles as string[]) ?? [];

  //     const newWeights = { ...existingWeights };
  //     chapter.genres.forEach((genre) => {
  //       newWeights[genre] = (newWeights[genre] ?? 0) + (isGoodSession ? 12 : 4);
  //     });

  //     const newTitles = existingTitles.includes(chapter.title)
  //       ? existingTitles
  //       : [...existingTitles, chapter.title];

  //     await supabase
  //       .from("profiles")
  //       .update({ taste_weights: newWeights, favorite_titles: newTitles })
  //       .eq("id", userId);
  //   };

  //   updateProfile();
  // }, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  // ── WRITE TASTE PROFILE + SESSION ON SESSION END ──
  useEffect(() => {
    if (status !== "ended") return;
    if (!userId || userId.startsWith("anon_")) return;
    if (!chapter) return;

    const supabase = createClient();
    const sessionDuration = match
      ? Math.floor((Date.now() - (match.matchedAt || Date.now())) / 1000)
      : 0;
    const isGoodSession = sessionDuration > 60;
    const outcome = endReason === "partner_skipped" ? "skip" : "complete";

    const updateProfile = async () => {
      // 1. taste weights
      const { data: profile } = await supabase
        .from("profiles")
        .select("taste_weights, favorite_titles")
        .eq("id", userId)
        .single();

      const existingWeights: Record<string, number> =
        (profile?.taste_weights as Record<string, number>) ?? {};
      const existingTitles: string[] =
        (profile?.favorite_titles as string[]) ?? [];

      const newWeights = { ...existingWeights };

      chapter.genres.forEach((genre) => {
        newWeights[genre] = (newWeights[genre] ?? 0) + (isGoodSession ? 12 : 4);
      });

      const newTitles = existingTitles.includes(chapter.title)
        ? existingTitles
        : [...existingTitles, chapter.title];

      await supabase
        .from("profiles")
        .update({
          taste_weights: newWeights,
          favorite_titles: newTitles,
        })
        .eq("id", userId);

      // 2. insert session row
      await supabase.from("sessions").insert({
        user_a: userId,
        user_b: match?.partnerUserId ?? null,
        chapter_id: id,
        match_score: (match?.similarity ?? 0) / 100,
        outcome,
        duration_seconds: sessionDuration,
        ended_at: new Date().toISOString(),
      });

      // 3. today's session count
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_a", userId)
        .gte("created_at", todayStart.toISOString());

      setSessionTodayCount(count ?? 1);
    };

    updateProfile();
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  const handleJoinQueue = () => {
    if (!authReady) return;
    setQueueEnabled(true);
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !chatUnlocked) return;
    sendMessage(text);
    setInputText("");
  };

  // const handleSkip = () => {
  //   skip();
  //   setQueueEnabled(false);
  //   setChatUnlocked(false);
  // };
  const handleSkip = () => {
    skip();
    // Don't setQueueEnabled(false) here — socket must stay alive
    // to receive the chat:ended event that transitions status → "ended"
    setChatUnlocked(false);
  };
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (!mounted) return null;

  if (!chapter) {
    return (
      <div className={styles.notFound}>
        <p>Chapter not found.</p>
        <button onClick={() => router.push("/")}>← back to home</button>
      </div>
    );
  }

  const activityWidth =
    chapter.activityLevel === "high"
      ? "82%"
      : chapter.activityLevel === "medium"
        ? "55%"
        : "30%";

  // ── RENDER: CHAT SCREEN ──────────────────
  if (status === "matched") {
    return (
      <div className={styles.chatPage}>
        {!chatUnlocked && (
          <div className={styles.sceneReveal}>
            <div
              className={styles.sceneRevealBg}
              style={{ backgroundImage: `url(${bannerImage})` }}
            />
            <div className={styles.sceneRevealOverlay} />
            <div className={styles.sceneRevealContent}>
              <div className={styles.sceneRevealBadge}>
                {chapter.title} · ch.{chapter.chapter}
              </div>
              <p className={styles.sceneRevealLabel}>
                You both just read this.
              </p>
              <div className={styles.sceneCountdown}>{revealCountdown}</div>
              <p className={styles.sceneRevealSub}>
                Chat opens in {revealCountdown}s
              </p>
            </div>
          </div>
        )}

        <div
          className={`${styles.chatWrap} ${chatUnlocked ? styles.chatVisible : styles.chatHidden}`}
        >
          <div className={styles.chatHeader}>
            <button
              className={styles.chatBack}
              onClick={() => router.push("/")}
            >
              ←
            </button>
            <div className={styles.chatHeaderInfo}>
              <span className={styles.chatTitle}>
                {chapter.title} ch.{chapter.chapter}
              </span>
              <span className={styles.chatSub}>
                {match && `${match.similarity}% taste match`}
              </span>
            </div>
            <button className={styles.skipBtn} onClick={handleSkip}>
              skip →
            </button>
          </div>

          <div className={styles.messagesFeed}>
            {messages.length === 0 && chatUnlocked && (
              <div className={styles.chatOpener}>
                <div
                  className={styles.chatOpenerImg}
                  style={{ backgroundImage: `url(${bannerImage})` }}
                />
                <p>
                  You're matched. No intro needed — you just read the same
                  chapter.
                </p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.from === mySocketId;
              return (
                <div
                  key={i}
                  className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}
                >
                  {msg.text}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatInputRow}>
            <input
              className={styles.chatInput}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder={
                chatUnlocked
                  ? "say something..."
                  : `chat opens in ${revealCountdown}s`
              }
              disabled={!chatUnlocked}
              autoFocus={chatUnlocked}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!chatUnlocked || !inputText.trim()}
            >
              →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER: SESSION ENDED ────────────────
  if (status === "ended") {
    const sessionDuration = match
      ? Math.floor((Date.now() - (match.matchedAt || Date.now())) / 1000)
      : 0;
    const minutes = Math.floor(sessionDuration / 60);
    const seconds = sessionDuration % 60;
    const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    const isGoodSession = sessionDuration > 60;

    const tasteUpdates = [
      {
        title: chapter.title,
        tag: chapter.genres[0],
        delta: `+${isGoodSession ? 12 : 4} pts`,
        up: true,
      },
      ...(chapter.genres[1]
        ? [
            {
              title: chapter.genres[1],
              tag: "genre",
              delta: `+${isGoodSession ? 8 : 3} pts`,
              up: true,
            },
          ]
        : []),
    ];

    return (
      <div className={styles.postPage}>
        <div className={styles.postCard}>
          <div className={styles.postHeader}>
            <div className={styles.postHeaderBadge}>SESSION COMPLETE</div>
            <h1 className={styles.postHeadline}>
              {endReason === "partner_skipped"
                ? "They moved on."
                : "Good conversation."}
            </h1>
            <p className={styles.postSub}>
              Your taste profile has been updated based on this match.
            </p>
          </div>

          <div className={styles.postSessionPill}>
            <span className={styles.postLiveDot} />
            {minutes > 0 ? durationStr : "quick match"} · {chapter.title} Ch.
            {chapter.chapter}
          </div>

          <div className={styles.postStatsRow}>
            <div className={styles.postStat}>
              <span className={styles.postStatValue}>
                {minutes > 0 ? durationStr : "< 1m"}
              </span>
              <span className={styles.postStatLabel}>DURATION</span>
            </div>
            <div className={styles.postStatDivider} />
            <div className={styles.postStat}>
              <span className={styles.postStatValue}>
                {match?.similarity ?? 0}%
              </span>
              <span className={styles.postStatLabel}>TASTE MATCH</span>
            </div>
            <div className={styles.postStatDivider} />
            <div className={styles.postStat}>
              <span className={styles.postStatValue}>
                {sessionTodayCount === null
                  ? "—"
                  : sessionTodayCount === 1
                    ? "1st"
                    : sessionTodayCount === 2
                      ? "2nd"
                      : sessionTodayCount === 3
                        ? "3rd"
                        : `${sessionTodayCount}th`}
              </span>
              <span className={styles.postStatLabel}>SESSION TODAY</span>
            </div>
          </div>

          <div className={styles.postProfileSection}>
            <div className={styles.postProfileHeader}>
              <span className={styles.postProfileLabel}>
                YOUR TASTE PROFILE · UPDATED
              </span>
            </div>
            <div className={styles.postProfileList}>
              {tasteUpdates.map((item, i) => (
                <div key={i} className={styles.postProfileRow}>
                  <div className={styles.postProfileLeft}>
                    <div
                      className={styles.postProfileDot}
                      style={{ background: i === 0 ? "#6366f1" : "#ec4899" }}
                    />
                    <div>
                      <div className={styles.postProfileTitle}>
                        {item.title}
                      </div>
                      <div className={styles.postProfileTag}>{item.tag}</div>
                    </div>
                  </div>
                  <div
                    className={`${styles.postProfileDelta} ${styles.deltaUp}`}
                  >
                    ↑ {item.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.postCtas}>
            {/* <button
              className={styles.postCtaPrimary}
              onClick={() => {
                setQueueEnabled(false);
                setTimeout(() => setQueueEnabled(true), 100);
              }}
            >
              read another →
            </button> */}
            <button
              className={styles.postCtaPrimary}
              onClick={() => {
                resetQueue();
                setQueueEnabled(false);
              }}
            >
              read another →
            </button>
            <button
              className={styles.postCtaGhost}
              onClick={() => router.push("/")}
            >
              back to home
            </button>
          </div>
        </div>
      </div>
    );
  }
  // ── RENDER: QUEUE SCREEN ──────────────────
  if (status === "joining" || status === "queued") {
    return (
      <div className={styles.queuePage}>
        <nav className={styles.queueNav}>
          <div className={styles.kzLogo}>
            <span>絆</span> kizuna
          </div>
          <button
            className={styles.leaveQueue}
            onClick={() => {
              leaveQueue();
              setQueueEnabled(false);
            }}
          >
            leave queue
          </button>
        </nav>

        <div className={styles.queueScreenBody}>
          <div className={styles.queueRing}>
            <svg viewBox="0 0 160 160" width="160" height="160">
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="6"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="url(#queueGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="320"
                strokeDashoffset="80"
                className={styles.queueArc}
              />
              <defs>
                <linearGradient
                  id="queueGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className={styles.queueRingInner}>
              <span className={styles.queueRingCount}>{queueDepth || "—"}</span>
              <span className={styles.queueRingLabel}>IN QUEUE</span>
            </div>
          </div>

          <div className={styles.queueChapterPill}>
            {chapter.title} · Ch. {chapter.chapter}
          </div>

          <h2 className={styles.queueFindingText}>finding your match...</h2>
          <p className={styles.queueFindingSub}>
            Someone with overlapping taste is being located. Usually under 60
            seconds.
          </p>

          <div className={styles.queueMatchRow}>
            <div className={styles.queueMatchUser}>
              <div
                className={`${styles.queueMatchAvatar} ${styles.queueMatchAvatarYou}`}
              >
                you
              </div>
              <span className={styles.queueMatchAvatarLabel}>you</span>
            </div>
            <div className={styles.queueMatchDots}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.queueMatchUser}>
              <div
                className={`${styles.queueMatchAvatar} ${styles.queueMatchAvatarThem}`}
              >
                ···
              </div>
              <span className={styles.queueMatchAvatarLabel}>matching</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ── RENDER: CHAPTER LANDING PAGE ────────
  return (
    <main className={styles.page}>
      <div className={styles.banner}>
        <div
          className={styles.bannerImg}
          style={{ backgroundImage: `url(${bannerImage})` }}
        />
        <div className={styles.bannerOverlay} />
        <nav className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => router.push("/")}>
            ← back
          </button>
          <div className={styles.kzLogo}>
            <span>絆</span> kizuna
          </div>
        </nav>
        <div className={styles.bannerContent}>
          <div className={styles.tagRow}>
            <span className={styles.tag}>
              {chapter.type} · {chapter.genres[0]}
            </span>
            <span className={styles.droppedPill}>
              <span className={styles.liveDot} />
              DROPPED {chapter.droppedMinutesAgo} MIN AGO
            </span>
          </div>
          <h1 className={styles.title}>{chapter.title}</h1>
          <p className={styles.chapterMeta}>
            Chapter {chapter.chapter} · {dateStr}
          </p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <div>
            <span className={styles.statLabel}>IN QUEUE</span>
            <span className={styles.statValue}>{readers}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div>
            <span className={styles.statLabel}>AVG WAIT</span>
            <span className={styles.statValue}>{chapter.avgWait}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          <div>
            <span className={styles.statLabel}>PEAK WINDOW</span>
            <span className={styles.statValue}>
              {chapter.peakMinutesLeft} min left
            </span>
          </div>
        </div>
      </div>

      <div className={styles.queuePanel}>
        <div className={styles.queueTop}>
          <span className={styles.queueLabel}>READERS IN QUEUE</span>
          <span className={styles.queueCount}>{readers}</span>
          <span className={styles.queueSub}>
            people waiting to talk about this chapter
          </span>
        </div>

        <div className={styles.queueAvatarRow}>
          <div className={styles.queueAvatars}>
            {avatarImages.slice(0, 3).map((src, i) => (
              <span
                key={i}
                className={styles.queueAvatar}
                style={{ backgroundImage: `url(${src})` }}
              />
            ))}
            <span className={styles.queueAvatarMore}>
              +{Math.max(0, readers - 3)}
            </span>
          </div>
          <span className={styles.queueNames}>
            {chapter.readerNames.join(", ")} and{" "}
            {Math.max(0, readers - chapter.readerNames.length)} others
            <br />
            <span>are waiting for a match right now</span>
          </span>
        </div>

        <div className={styles.activityRow}>
          <span className={styles.activityLabel}>QUEUE ACTIVITY</span>
          <span className={styles.activityLevel}>
            {chapter.activityLevel} right now
          </span>
        </div>
        <div className={styles.activityBar}>
          <div
            className={styles.activityFill}
            style={{ width: activityWidth }}
          />
        </div>

        <div className={styles.ctaStack}>
          {status === "idle" && (
            <>
              <button
                className={styles.ctaPrimary}
                onClick={handleJoinQueue}
                disabled={!authReady}
              >
                <span>✦</span> I just read it — find my match
              </button>
              <button className={styles.ctaSecondary}>
                <span>◎</span> I haven't read it yet (spoiler-free view)
              </button>
            </>
          )}

          {/* {(status === "joining" || status === "queued") && (
            <div className={styles.inQueueState}>
              <div className={styles.queueSpinner} />
              <div>
                <strong>Finding your match...</strong>
                <span>Matched by chapter timing and taste overlap</span>
              </div>
              <button
                className={styles.leaveQueue}
                onClick={() => {
                  leaveQueue();
                  setQueueEnabled(false);
                }}
              >
                leave queue
              </button>
            </div>
          )} */}
        </div>
      </div>
    </main>
  );
}
