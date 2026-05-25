"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./releases.module.css";

const RELEASES = [
  {
    id: "blue-lock",
    title: "Blue Lock",
    chapter: 346,
    type: "manga",
    day: "TUE",
    time: "20:00 IST",
    readers: 34,
    live: true,
    color: "#6366f1",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx114745-yvD3e9G3FruQ.jpg",
    genres: ["Sports", "Action"],
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    chapter: 271,
    type: "manga",
    day: "SUN",
    time: "10:00 IST",
    readers: 67,
    live: true,
    color: "#ec4899",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx101517-L2DF9rL0SkVl.jpg",
    genres: ["Action", "Supernatural"],
  },
  {
    id: "one-piece",
    title: "One Piece",
    chapter: 1183,
    type: "manga",
    day: "SUN",
    time: "10:00 IST",
    readers: 27,
    live: true,
    color: "#f59e0b",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30013-RKhL3jK5TTVM.jpg",
    genres: ["Action", "Adventure"],
  },
  {
    id: "tower-of-god",
    title: "Tower of God",
    chapter: 625,
    type: "webtoon",
    day: "SUN",
    time: "11:00 IST",
    readers: 44,
    live: true,
    color: "#34d399",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx85143-8bztHkqSSB4m.jpg",
    genres: ["Action", "Fantasy"],
  },
  {
    id: "dandadan",
    title: "Dandadan",
    chapter: 234,
    type: "manga",
    day: "MON",
    time: "10:00 IST",
    readers: 70,
    live: true,
    color: "#f97316",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx132029-mAXeRZn5V6Rg.jpg",
    genres: ["Action", "Romance"],
  },
  {
    id: "frieren",
    title: "Frieren",
    chapter: 135,
    type: "manga",
    day: "FRI",
    time: "10:00 IST",
    readers: 0,
    live: false,
    color: "#a78bfa",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx127230-flE5ik5cEMjn.jpg",
    genres: ["Fantasy", "Slice of Life"],
  },
  {
    id: "solo-leveling",
    title: "Solo Leveling: Ragnarok",
    chapter: 52,
    type: "manhwa",
    day: "WED",
    time: "13:00 IST",
    readers: 0,
    live: false,
    color: "#60a5fa",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx138494-sjDgNviTiJbE.jpg",
    genres: ["Action", "Fantasy"],
  },
  {
    id: "omniscient-reader",
    title: "Omniscient Reader",
    chapter: 306,
    type: "manhwa",
    day: "FRI",
    time: "13:00 IST",
    readers: 0,
    live: false,
    color: "#f43f5e",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx138307-pkpKAArNc9H4.jpg",
    genres: ["Action", "Fantasy"],
  },
  {
    id: "oshi-no-ko",
    title: "Oshi no Ko",
    chapter: 166,
    type: "manga",
    day: "WED",
    time: "10:00 IST",
    readers: 0,
    live: false,
    color: "#e879f9",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx127720-7PT5e7sPLsFk.jpg",
    genres: ["Drama", "Mystery"],
  },
  {
    id: "one-punch-man",
    title: "One Punch Man",
    chapter: 230,
    type: "manga",
    day: "THU",
    time: "12:00 IST",
    readers: 0,
    live: false,
    color: "#facc15",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx85216-RGk9yUKWOIbL.jpg",
    genres: ["Action", "Comedy"],
  },
];

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function ReleasesPage() {
  const [covers, setCovers] = useState<Record<string, string>>({});

  useEffect(() => {
    const titles = RELEASES.map((r) => r.title);
    Promise.all(
      titles.map(async (title) => {
        const res = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query($s:String){Page(perPage:1){media(search:$s,sort:POPULARITY_DESC){title{romaji}coverImage{extraLarge}}}}`,
            variables: { s: title },
          }),
        });
        const data = await res.json();
        const img = data.data?.Page?.media?.[0]?.coverImage?.extraLarge;
        return { title, img };
      }),
    ).then((results) => {
      const map: Record<string, string> = {};
      results.forEach(({ title, img }) => {
        if (img) map[title] = img;
      });
      setCovers(map);
    });
  }, []);
  const router = useRouter();
  const liveReleases = RELEASES.filter((r) => r.live);
  const upcoming = RELEASES.filter((r) => !r.live);

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <button className={styles.logo} onClick={() => router.push("/")}>
          <span>絆</span> kizuna
        </button>
        <div className={styles.navLinks}>
          <button onClick={() => router.push("/")}>live now</button>
          <button className={styles.navActive}>calendar</button>
          <button>how it works</button>
          <button>about</button>
        </div>
        <div className={styles.navRight}>
          {/* <span className={styles.notifBtn}>🔔 notifications</span> */}
        </div>
      </nav>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Release Calendar</h1>
          <p className={styles.headingSub}>
            20 series tracked · {liveReleases.length} dropping this week
          </p>
        </div>
        <span className={styles.tz}>Times shown in IST</span>
      </div>

      {/* Day strip */}
      <div className={styles.dayStrip}>
        {DAYS.map((day, i) => (
          <div
            key={day}
            className={`${styles.dayCell} ${day === "TUE" ? styles.dayCellActive : ""}`}
          >
            <span className={styles.dayLabel}>{day}</span>
            <span className={styles.dayNum}>{19 + i}</span>
            {RELEASES.some((r) => r.day === day) && (
              <span className={styles.dayDot} />
            )}
          </div>
        ))}
      </div>

      {/* Live now section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>DROPPING TODAY</span>
          <span className={styles.sectionRight}>
            TUESDAY · {liveReleases.length} CHAPTERS
          </span>
        </div>

        <div className={styles.liveGrid}>
          {liveReleases.map((r) => (
            <button
              key={r.id}
              className={styles.liveCard}
              onClick={() => router.push(`/chapter/${r.id}`)}
            >
              <img
                src={covers[r.title] || r.cover}
                alt={r.title}
                className={styles.liveCardImg}
              />
              <div className={styles.liveCardOverlay} />
              <div className={styles.liveCardContent}>
                <div className={styles.liveBadge}>• LIVE</div>
                <div className={styles.liveCardBottom}>
                  <div className={styles.liveCardInfo}>
                    <span className={styles.liveCardTitle}>{r.title}</span>
                    <span className={styles.liveCardMeta}>
                      Ch. {r.chapter} · {r.type}
                    </span>
                    <span className={styles.liveCardReaders}>
                      • {r.readers} in queue
                    </span>
                  </div>
                  <span className={styles.liveJoinBtn}>join →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Coming this week */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>📅 COMING THIS WEEK</span>
        </div>
        <div className={styles.upcomingList}>
          {upcoming.map((r) => (
            <div key={r.id} className={styles.upcomingRow}>
              <img
                src={covers[r.title] || r.cover}
                alt={r.title}
                className={styles.upcomingCover}
              />
              <div className={styles.upcomingInfo}>
                <span className={styles.upcomingTitle}>{r.title}</span>
                <span className={styles.upcomingMeta}>
                  Ch. {r.chapter} · {r.type}
                </span>
              </div>
              <div className={styles.upcomingRight}>
                <span className={styles.upcomingTime}>
                  {r.day} {r.time}
                </span>
                {/* <div className={styles.upcomingActions}>
                  <span className={styles.toggleOff} />
                  <span className={styles.notifIcon}>🔔</span>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
