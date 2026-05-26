"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./releases.module.css";
import { getCovers } from "@/lib/anilistCache";
import CoverImage from "@/components/CoverImage";
const RELEASES = [
  {
    id: "dandadan",
    title: "Dandadan",
    chapter: 235,
    type: "manga",
    day: "MON",
    time: "11:00 IST",
    readers: 34,
    live: true,
    color: "#f97316",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx132029-mAXeRZn5V6Rg.jpg",
    genres: ["Action", "Romance"],
  },
  {
    id: "eleceed",
    title: "Eleceed",
    chapter: 400,
    type: "manhwa",
    day: "TUE",
    time: "12:00 IST",
    readers: 28,
    live: true,
    color: "#60a5fa",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx107759-iHCDkRC6RgzB.jpg",

    genres: ["Action", "Fantasy"],
  },
  {
    id: "blue-lock",
    title: "Blue Lock",
    chapter: 347,
    type: "manga",
    day: "TUE",
    time: "20:30 IST",
    readers: 61,
    live: true,
    color: "#6366f1",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx114745-yvD3e9G3FruQ.jpg",
    genres: ["Sports", "Action"],
  },
  {
    id: "frieren",
    title: "Frieren",
    chapter: 145,
    type: "manga",
    day: "WED",
    time: "10:00 IST",
    readers: 0,
    live: false,
    color: "#a78bfa",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx127230-flE5ik5cEMjn.jpg",
    genres: ["Fantasy", "Slice of Life"],
  },
  {
    id: "omniscient-reader",
    title: "Omniscient Reader",
    chapter: 310,
    type: "manhwa",
    day: "WED",
    time: "13:00 IST",
    readers: 0,
    live: false,
    color: "#f43f5e",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx138307-pkpKAArNc9H4.jpg",
    genres: ["Action", "Fantasy"],
  },
  {
    id: "lookism",
    title: "Lookism",
    chapter: 600,
    type: "manhwa",
    day: "THU",
    time: "12:00 IST",
    readers: 0,
    live: false,
    color: "#34d399",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx85222-RkpEqBpGAZvk.jpg",
    genres: ["Slice of Life", "Action"],
  },
  {
    id: "kaiju-no-8",
    title: "Kaiju No. 8",
    chapter: 157,
    type: "manga",
    day: "THU",
    time: "10:00 IST",
    readers: 0,
    live: false,
    color: "#ec4899",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx86635-UxakUQWobvOd.jpg",

    genres: ["Action", "Sci-Fi"],
  },
  {
    id: "one-piece",
    title: "One Piece",
    chapter: 1183,
    type: "manga",
    day: "SUN",
    time: "10:30 IST",
    readers: 0,
    live: false,
    color: "#f59e0b",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30013-RKhL3jK5TTVM.jpg",
    genres: ["Action", "Adventure"],
  },
  {
    id: "sakamoto-days",
    title: "Sakamoto Days",
    chapter: 260,
    type: "manga",
    day: "SUN",
    time: "10:30 IST",
    readers: 0,
    live: false,
    color: "#facc15",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx132588-TuFt2bVGCxTl.jpg",
    genres: ["Action", "Comedy"],
  },
  {
    id: "kagurabachi",
    title: "Kagurabachi",
    chapter: 122,
    type: "manga",
    day: "SUN",
    time: "10:30 IST",
    readers: 0,
    live: false,
    color: "#fb7185",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx167898-U1GRpJBRbvnK.jpg",
    genres: ["Action", "Fantasy"],
  },
];

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function ReleasesPage() {
  const [covers, setCovers] = useState<Record<string, string>>({});

  //   useEffect(() => {
  //     const titles = RELEASES.map((r) => r.title);
  //     Promise.all(
  //       titles.map(async (title) => {
  //         const res = await fetch("https://graphql.anilist.co", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             query: `query($s:String){Page(perPage:1){media(search:$s,sort:POPULARITY_DESC){title{romaji}coverImage{extraLarge}}}}`,
  //             variables: { s: title },
  //           }),
  //         });
  //         const data = await res.json();
  //         const img = data.data?.Page?.media?.[0]?.coverImage?.extraLarge;
  //         return { title, img };
  //       }),
  //     ).then((results) => {
  //       const map: Record<string, string> = {};
  //       results.forEach(({ title, img }) => {
  //         if (img) map[title] = img;
  //       });
  //       setCovers(map);
  //     });
  //   }, []);
  const router = useRouter();
  const liveReleases = RELEASES.filter((r) => r.live);
  const upcoming = RELEASES.filter((r) => !r.live);
  useEffect(() => {
    getCovers(RELEASES.map((r) => r.title)).then(setCovers);
  }, []);
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
          <button onClick={() => router.push("/how-it-works")}>
            how it works
          </button>
          <button onClick={() => router.push("/about")}>about</button>
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
            {RELEASES.length} series tracked · {liveReleases.length} dropping
            today
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
            <span className={styles.dayNum}>{24 + i}</span>
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
              {/* <img
                src={covers[r.title] || r.cover}
                alt={r.title}
                className={styles.liveCardImg}
              /> */}
              <CoverImage
                src={covers[r.title]}
                title={r.title}
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
              {/* <img
                src={covers[r.title] || r.cover}
                alt={r.title}
                className={styles.upcomingCover}
              /> */}
              <CoverImage
                src={covers[r.title]}
                title={r.title}
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
