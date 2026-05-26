"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import styles from "../styles/landing.module.css";
import SignInButton from "@/components/SignInButton";
import SignOutButton from "@/components/SignOutButton";

import { createClient } from "@/lib/supabase/client";
import { getCovers } from "@/lib/anilistCache";
interface ChapterDrop {
  id: string;
  title: string;
  searchTitle: string;
  chapter: number;
  type: "manga" | "webtoon";
  readers: number;
  coverImage: string;
  bannerImage?: string;
  quote?: string;
  live?: boolean;
}

const avatarImages = [
  "/avatars/avatar-1.svg",
  "/avatars/avatar-2.svg",
  "/avatars/avatar-3.svg",
  "/avatars/avatar-4.svg",
  "/avatars/avatar-5.svg",
];

// const ANILIST_QUERY = `
//   query ($search: String) {
//     Page(perPage: 1) {
//       media(search: $search, type: MANGA, sort: POPULARITY_DESC) {
//         id
//         title {
//           romaji
//           english
//         }
//         coverImage {
//           extraLarge
//           large
//         }
//         bannerImage
//       }
//     }
//   }
// `;

// async function fetchAniListArtwork(drop: ChapterDrop): Promise<ChapterDrop> {
//   try {
//     const response = await fetch("https://graphql.anilist.co", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         query: ANILIST_QUERY,
//         variables: { search: drop.searchTitle },
//       }),
//     });

//     if (!response.ok) return drop;

//     const data = await response.json();
//     const media = data.data?.Page?.media?.[0];

//     return {
//       ...drop,
//       coverImage:
//         media?.coverImage?.extraLarge ||
//         media?.coverImage?.large ||
//         drop.coverImage,
//       bannerImage: media?.bannerImage || drop.bannerImage,
//     };
//   } catch {
//     return drop;
//   }
// }

const fallbackChapterDrops: ChapterDrop[] = [
  {
    id: "blue-lock",
    title: "Blue Lock",
    searchTitle: "Blue Lock",
    chapter: 347,
    type: "manga",
    readers: 61,
    live: true,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx114745-yvD3e9G3FruQ.jpg",
  },
  {
    id: "dandadan",
    title: "Dandadan",
    searchTitle: "Dandadan",
    chapter: 235,
    type: "manga",
    readers: 34,
    live: true,
    quote: "that ending was insane",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx132029-mAXeRZn5V6Rg.jpg",
  },
  {
    id: "one-piece",
    title: "One Piece",
    searchTitle: "One Piece",
    chapter: 1183,
    type: "manga",
    readers: 27,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30013-RKhL3jK5TTVM.jpg",
  },
  {
    id: "sakamoto-days",
    title: "Sakamoto Days",
    searchTitle: "Sakamoto Days",
    chapter: 260,
    type: "manga",
    readers: 22,
    quote: "bro really retired just to end up here",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx132588-TuFt2bVGCxTl.jpg",
  },
  {
    id: "kagurabachi",
    title: "Kagurabachi",
    searchTitle: "Kagurabachi",
    chapter: 122,
    type: "manga",
    readers: 19,
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx167898-U1GRpJBRbvnK.jpg",
  },
];

export default function Home() {
  const router = useRouter();
  // const [chapterDrops, setChapterDrops] = useState(fallbackChapterDrops);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const chapterDrops = fallbackChapterDrops.map((d) => ({
    ...d,
    coverImage: covers[d.searchTitle] ?? d.coverImage,
  }));
  const [liveIndex, setLiveIndex] = useState(fallbackChapterDrops.length - 1);
  const [user, setUser] = useState<User | null>(null);
  const liveDrop = chapterDrops[liveIndex] || chapterDrops[0];
  const blueLockDrop =
    chapterDrops.find((drop) => drop.id === "blue-lock") || chapterDrops[0];
  const previewDrops = [
    chapterDrops[4] || chapterDrops[0],
    chapterDrops[1] || chapterDrops[0],
    chapterDrops[0],
  ];

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   let mounted = true;

  //   const loadArtwork = async () => {
  //     const dropsWithArtwork = await Promise.all(
  //       fallbackChapterDrops.map(fetchAniListArtwork),
  //     );
  //     if (mounted) setChapterDrops(dropsWithArtwork);
  //   };

  //   loadArtwork();

  //   return () => {
  //     mounted = false;
  //   };
  // }, []);
  useEffect(() => {
    getCovers(fallbackChapterDrops.map((d) => d.searchTitle)).then(setCovers);
  }, []);
  useEffect(() => {
    if (chapterDrops.length === 0) return;

    const interval = window.setInterval(() => {
      setLiveIndex((current) => (current + 1) % chapterDrops.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [chapterDrops.length]);

  const openChapter = (id: string) => {
    router.push(`/chapter/${id}`);
  };

  const profileImage =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const profileName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Profile";
  const profileInitial = profileName.charAt(0).toUpperCase();

  return (
    <main className={styles.kz}>
      <nav className={styles.kzNav} aria-label="Main navigation">
        <button
          className={styles.kzLogo}
          onClick={() => router.push("/")}
          aria-label="Kizuna home"
        >
          <span className={styles.kzLogoMark}>絆</span>
          <span className={styles.kzLogoText}>kizuna</span>
        </button>

        <div className={styles.kzNavMid}>
          <button className={styles.kzNavActive}>live now</button>
          <button onClick={() => router.push("/releases")}>calendar</button>
          <button onClick={() => router.push("/how-it-works")}>
            how it works
          </button>
          <button onClick={() => router.push("/about")}>about</button>
        </div>

        <div className={styles.kzNavRight}>
          {user ? (
            <>
              <button
                className={styles.kzBtnSolid}
                onClick={() => openChapter(liveDrop.id)}
              >
                Get Started
              </button>
              <SignOutButton className={styles.kzBtnGhost} text="sign out" />
              <button
                className={styles.kzProfileButton}
                aria-label={`Open ${profileName} profile`}
              >
                {profileImage ? (
                  <span style={{ backgroundImage: `url(${profileImage})` }} />
                ) : (
                  <span>{profileInitial}</span>
                )}
              </button>
            </>
          ) : (
            <>
              <SignInButton className={styles.kzBtnGhost} text="Log in" />
              <SignInButton
                className={styles.kzBtnSolid}
                text="Get Started"
              />
            </>
          )}
        </div>
      </nav>

      <section className={styles.kzHeroWrap}>
        <div className={styles.kzHeroLeft}>
          <button
            className={styles.kzLivePill}
            onClick={() => openChapter(liveDrop.id)}
          >
            <span className={styles.kzLiveDotPulse} aria-hidden />
            <span>LIVE NOW</span>
            <span aria-hidden>·</span>
            <span>{liveDrop.readers} people in queue</span>
            <span className={styles.kzMiniAvatars} aria-hidden>
              {avatarImages.slice(0, 3).map((avatar) => (
                <span
                  key={avatar}
                  className={styles.kzMiniAvatar}
                  style={{ backgroundImage: `url(${avatar})` }}
                />
              ))}
              <span className={styles.kzAvatarMore}>+67</span>
            </span>
          </button>

          <h1 className={styles.kzHeroH1}>
            <span className={styles.kzHeroLine}>You just finished it.</span>
            <span className={styles.kzHeroLine}>Someone else is still</span>
            <span className={styles.kzHeroLine}>
              sitting with <span className={styles.accent}>that feeling.</span>
            </span>
          </h1>

          <p className={styles.kzHeroSub}>
            Right after a chapter drops, Kizuna finds someone who just
            experienced the same thing.
          </p>

          <div className={styles.kzHeroActions}>
            <button
              className={styles.kzBtnPrimary}
              onClick={() => openChapter(liveDrop.id)}
            >
              Jump into a chapter <span aria-hidden></span>
            </button>
            <button
              className={styles.kzBtnText}
              onClick={() => router.push("/releases")}
            >
              see what&apos;s dropping today <span aria-hidden></span>
            </button>
          </div>
        </div>

        <article className={styles.kzMomentPanel}>
          <div
            className={styles.kzMomentBg}
            style={{
              backgroundImage: `url(${liveDrop.bannerImage || liveDrop.coverImage})`,
            }}
          />
          <div className={styles.kzMomentOverlay} />
          <div className={styles.kzMomentContent}>
            <div className={styles.kzMomentBadge}>
              <span className={styles.kzLiveDotPulse} aria-hidden />
              LIVE RIGHT NOW
            </div>

            <h2>
              {liveDrop.title}
              <span>ch.{liveDrop.chapter}</span>
            </h2>

            <div className={styles.kzMomentReaders}>
              <span className={styles.kzQueueAvatars} aria-hidden>
                {avatarImages.slice(0, 5).map((avatar) => (
                  <span
                    key={avatar}
                    className={styles.kzQueueAvatar}
                    style={{ backgroundImage: `url(${avatar})` }}
                  />
                ))}
              </span>
              {liveDrop.readers} people just read it
            </div>

            <p className={styles.kzMomentQuote}>
              &ldquo;{liveDrop.quote || "nah that panel was wild"}&rdquo;
            </p>

            <button
              className={styles.kzMomentBtn}
              onClick={() => openChapter(liveDrop.id)}
              aria-label={`Join the ${liveDrop.title} queue`}
            >
              <span aria-hidden>→</span>
            </button>
          </div>
        </article>
      </section>

      <section className={styles.kzDrops}>
        <div className={styles.kzSectionHeader}>
          <div className={styles.kzSectionTitle}>
            <span aria-hidden>♦</span>
            <h2>Dropping this week</h2>{" "}
            <p>Catch the chapters everyone&apos;s reacting to.</p>
          </div>
          {/* <button
            className={styles.kzSeeAll}
            onClick={() => router.push("/releases")}
          >
            see full calendar <span aria-hidden></span>
          </button> */}
        </div>

        <div className={styles.kzScrollRow}>
          {chapterDrops.map((drop, index) => (
            <button
              key={drop.id}
              className={`${styles.kzCard} ${!drop.live ? styles.kzCardDimmed : ""}`}
              onClick={() => (drop.live ? openChapter(drop.id) : null)}
              style={{ cursor: drop.live ? "pointer" : "default" }}
            >
              <span
                className={styles.kzCardArt}
                style={{ backgroundImage: `url(${drop.coverImage})` }}
              >
                <span className={styles.kzCardArtOverlay} />
                {drop.live && (
                  <span className={styles.kzLiveBadge}>• live</span>
                )}
                <span className={styles.kzCardArtBadge}>{drop.type}</span>
                <span className={styles.kzCardName}>{drop.title}</span>
                <span className={styles.kzCardChapLabel}>
                  ch.{drop.chapter}
                </span>
              </span>
              <span className={styles.kzCardMeta}>
                <span>
                  {drop.live ? (
                    <>
                      <span className={styles.kzRdot} aria-hidden />
                      {drop.readers} reading now
                    </>
                  ) : (
                    <>drops this week</>
                  )}
                </span>
                <span className={styles.kzCardAvatars} aria-hidden>
                  {avatarImages
                    .slice(index % 2, (index % 2) + 3)
                    .map((avatar) => (
                      <span
                        key={`${drop.id}-${avatar}`}
                        className={styles.kzCardAvatar}
                        style={{ backgroundImage: `url(${avatar})` }}
                      />
                    ))}
                </span>
              </span>
            </button>
          ))}

          <button
            className={styles.kzMoreCard}
            onClick={() => router.push("/releases")}
          >
            <strong>+{Math.max(0, 10 - fallbackChapterDrops.length)}</strong>
            <span>more chapters</span>
            <small>see calendar →</small>
          </button>
        </div>
      </section>

      <section className={styles.kzHow}>
        <div className={styles.kzHowHeader}>
          <div>
            <h2>How Kizuna works</h2>
            <p>Real-time reactions, matched around the exact chapter moment.</p>
          </div>

          <button className={styles.kzHowCta}>TRY IT LIVE</button>
        </div>

        <div className={styles.kzWorksGrid}>
          {/* CARD 1 */}

          <article className={styles.kzWorkCard}>
            <div className={styles.kzWorkNum}>01</div>

            <h3>Pick a live drop</h3>

            <p>Choose a chapter that just dropped or is trending right now.</p>

            <div className={styles.kzMiniDropPanel}>
              {previewDrops.map((drop) => (
                <div key={drop.id} className={styles.kzMiniDrop}>
                  <span
                    style={{
                      backgroundImage: `url(${drop.coverImage})`,
                    }}
                  />

                  <div>
                    <strong>{drop.title}</strong>

                    <small>{drop.readers} reading now</small>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* CARD 2 */}

          <article className={styles.kzWorkCard}>
            <div className={styles.kzWorkNum}>02</div>

            <h3>We find your match</h3>

            <p>We match you with someone reading the same chapter.</p>

            <div className={styles.kzWorkMatch}>
              <span style={{ backgroundImage: "url('/bluelock.png')" }} />

              <i>⇄</i>

              <span style={{ backgroundImage: "url('/denji.png')" }} />
            </div>

            <div className={styles.kzFindingCard}>
              <strong>Finding someone...</strong>

              <small>Matched by chapter timing and taste overlap</small>
            </div>
          </article>

          {/* CARD 3 */}

          <article className={styles.kzWorkCard}>
            <div className={styles.kzWorkNum}>03</div>

            <h3>Land on the same scene</h3>

            <p>You both land on the exact moment that sparked the reaction.</p>

            <div
              className={styles.kzWorkScene}
              style={{
                backgroundImage: `url(${blueLockDrop.bannerImage || blueLockDrop.coverImage})`,
              }}
            >
              <span>{/* NAH THAT CURVE SHOT... */}</span>
            </div>
          </article>

          {/* CARD 4 */}

          <article className={styles.kzWorkCard}>
            <div className={styles.kzWorkNum}>04</div>

            <h3>Chat with real reactions</h3>

            <p>No awkward intros. Just real reactions.</p>

            <div className={styles.kzWorkChat}>
              <div className={styles.kzWorkBubblePrimary}>
                NAH THAT CURVE SHOT WAS INSANE
              </div>

              <div className={styles.kzWorkBubbleSecondary}>
                I LOST IT BROOO
              </div>

              <div className={styles.kzWorkBubblePrimary}>
                WAIT DID YOU CATCH THAT?
              </div>
            </div>
          </article>
        </div>
      </section>
      <footer className={styles.kzFinal}>
        <div>
          <span className={styles.kzFinalEyebrow}>live after every drop</span>
          <h2>Finish the chapter. Keep the feeling warm.</h2>
        </div>
        <div className={styles.kzStats}>
          <span>
            <b>•</b> 1,248 matched today
          </span>
          <span>
            <b>♥</b> 3,473 conversations
          </span>
          <span>
            <b>↯</b> queues open in 15 minutes
          </span>
        </div>
        <button
          className={styles.kzFinalButton}
          onClick={() => openChapter(liveDrop.id)}
          aria-label="Jump into a chapter"
        >
          <span aria-hidden>→</span>
        </button>
      </footer>
    </main>
  );
}
