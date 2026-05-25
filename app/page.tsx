'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import styles from '../styles/landing.module.css';
import SignInButton from '@/components/SignInButton';
import { createClient } from '@/lib/supabase/client';

interface ChapterDrop {
  id: string;
  title: string;
  searchTitle: string;
  chapter: number;
  type: 'manga' | 'webtoon';
  readers: number;
  coverImage: string;
  bannerImage?: string;
  quote?: string;
}

const avatarImages = [
  'https://s4.anilist.co/file/anilistcdn/character/large/b73935-GG1P3VnXjrGz.png',
  'https://s4.anilist.co/file/anilistcdn/character/large/b40882-ZOC6vPpaG4D8.png',
  'https://s4.anilist.co/file/anilistcdn/character/large/b127691-gW8Ljg8RFLgc.png',
  'https://s4.anilist.co/file/anilistcdn/character/large/b40-JOxFpswA5N0r.png',
  'https://s4.anilist.co/file/anilistcdn/character/large/b146033-kV3dy7GM2rTQ.png',
];

const ANILIST_QUERY = `
  query ($search: String) {
    Page(perPage: 1) {
      media(search: $search, type: MANGA, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
          large
        }
        bannerImage
      }
    }
  }
`;

async function fetchAniListArtwork(drop: ChapterDrop): Promise<ChapterDrop> {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: ANILIST_QUERY,
        variables: { search: drop.searchTitle },
      }),
    });

    if (!response.ok) return drop;

    const data = await response.json();
    const media = data.data?.Page?.media?.[0];

    return {
      ...drop,
      coverImage: media?.coverImage?.extraLarge || media?.coverImage?.large || drop.coverImage,
      bannerImage: media?.bannerImage || drop.bannerImage,
    };
  } catch {
    return drop;
  }
}

const fallbackChapterDrops: ChapterDrop[] = [
  {
    id: 'blue-lock',
    title: 'Blue Lock',
    searchTitle: 'Blue Lock',
    chapter: 247,
    type: 'manga',
    readers: 18,
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx114745-yvD3e9G3FruQ.jpg',
  },
  {
    id: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    searchTitle: 'Jujutsu Kaisen',
    chapter: 268,
    type: 'manga',
    readers: 67,
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx101517-L2DF9rL0SkVl.jpg',
  },
  {
    id: 'one-piece',
    title: 'One Piece',
    searchTitle: 'One Piece',
    chapter: 1118,
    type: 'manga',
    readers: 27,
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30013-RKhL3jK5TTVM.jpg',
  },
  {
    id: 'tower-of-god',
    title: 'Tower of God',
    searchTitle: 'Tower of God',
    chapter: 630,
    type: 'webtoon',
    readers: 44,
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx85143-8bztHkqSSB4m.jpg',
  },
  {
    id: 'dandadan',
    title: 'Dandadan',
    searchTitle: 'Dandadan',
    chapter: 142,
    type: 'manga',
    readers: 70,
    quote: 'that ending was insane',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx132029-mAXeRZn5V6Rg.jpg',
  },
];

export default function Home() {
  const router = useRouter();
  const [chapterDrops, setChapterDrops] = useState(fallbackChapterDrops);
  const [liveIndex, setLiveIndex] = useState(fallbackChapterDrops.length - 1);
  const [user, setUser] = useState<User | null>(null);
  const liveDrop = chapterDrops[liveIndex] || chapterDrops[0];
  const previewDrops = [chapterDrops[4] || chapterDrops[0], chapterDrops[1] || chapterDrops[0], chapterDrops[0]];

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

  useEffect(() => {
    let mounted = true;

    const loadArtwork = async () => {
      const dropsWithArtwork = await Promise.all(fallbackChapterDrops.map(fetchAniListArtwork));
      if (mounted) setChapterDrops(dropsWithArtwork);
    };

    loadArtwork();

    return () => {
      mounted = false;
    };
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

  const profileImage = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const profileName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Profile';
  const profileInitial = profileName.charAt(0).toUpperCase();

  return (
    <main className={styles.kz}>
      <nav className={styles.kzNav} aria-label="Main navigation">
        <button className={styles.kzLogo} onClick={() => router.push('/')} aria-label="Kizuna home">
          <span className={styles.kzLogoMark}>絆</span>
          <span className={styles.kzLogoText}>kizuna</span>
        </button>

        <div className={styles.kzNavMid}>
          <button className={styles.kzNavActive}>live now</button>
          <button onClick={() => router.push('/releases')}>calendar</button>
          <button>how it works</button>
          <button>about</button>
        </div>

        <div className={styles.kzNavRight}>
          {user ? (
            <>
              <button className={styles.kzBtnSolid} onClick={() => openChapter(liveDrop.id)}>
                jump into a chapter <span aria-hidden></span>
              </button>
              <button className={styles.kzProfileButton} aria-label={`Open ${profileName} profile`}>
                {profileImage ? (
                  <span style={{ backgroundImage: `url(${profileImage})` }} />
                ) : (
                  <span>{profileInitial}</span>
                )}
              </button>
            </>
          ) : (
            <>
              <SignInButton className={styles.kzBtnGhost} text="log in" />
              <SignInButton className={styles.kzBtnSolid} text="jump into a chapter" />
            </>
          )}
        </div>
      </nav>

      <section className={styles.kzHeroWrap}>
        <div className={styles.kzHeroLeft}>
          <button className={styles.kzLivePill} onClick={() => openChapter(liveDrop.id)}>
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
            Right after a chapter drops, Kizuna finds someone who just experienced the same thing.
          </p>

          <div className={styles.kzHeroActions}>
            <button className={styles.kzBtnPrimary} onClick={() => openChapter(liveDrop.id)}>
              jump into a chapter <span aria-hidden></span>
            </button>
            <button className={styles.kzBtnText} onClick={() => router.push('/releases')}>
              see what&apos;s dropping today <span aria-hidden></span>
            </button>
          </div>
        </div>

        <article className={styles.kzMomentPanel}>
          <div
            className={styles.kzMomentBg}
            style={{ backgroundImage: `url(${liveDrop.bannerImage || liveDrop.coverImage})` }}
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

            <p className={styles.kzMomentQuote}>&ldquo;{liveDrop.quote || 'nah that panel was wild'}&rdquo;</p>

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
            <h2>Dropping today</h2>
            <p>Catch the chapters everyone&apos;s reacting to.</p>
          </div>
          <button className={styles.kzSeeAll} onClick={() => router.push('/releases')}>
            see full calendar <span aria-hidden></span>
          </button>
        </div>

        <div className={styles.kzScrollRow}>
          {chapterDrops.map((drop, index) => (
            <button key={drop.id} className={styles.kzCard} onClick={() => openChapter(drop.id)}>
              <span className={styles.kzCardArt} style={{ backgroundImage: `url(${drop.coverImage})` }}>
                <span className={styles.kzCardArtOverlay} />
                <span className={styles.kzCardArtBadge}>{drop.type}</span>
                <span className={styles.kzCardName}>{drop.title}</span>
                <span className={styles.kzCardChapLabel}>ch.{drop.chapter}</span>
              </span>
              <span className={styles.kzCardMeta}>
                <span>
                  <span className={styles.kzRdot} aria-hidden />
                  {drop.readers} reading now
                </span>
                <span className={styles.kzCardAvatars} aria-hidden>
                  {avatarImages.slice(index % 2, index % 2 + 3).map((avatar) => (
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

          <button className={styles.kzMoreCard} onClick={() => router.push('/releases')}>
            <strong>+12</strong>
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
          <button className={styles.kzHowCta} onClick={() => openChapter(liveDrop.id)}>
            try it live <span aria-hidden>→</span>
          </button>
        </div>

        <div className={styles.kzProcessBoard}>
          <div className={styles.kzProcessSteps}>
            {[
              ['01', 'Pick a live drop', 'Choose the chapter everyone is reacting to right now.'],
              ['02', 'Get matched fast', 'We pair you with someone who just read the same drop.'],
              ['03', 'Land on the moment', 'Both of you see the scene that sparked the reaction.'],
              ['04', 'Chat with context', 'No awkward opener. The chapter already started the conversation.'],
            ].map(([num, title, copy]) => (
              <article key={num} className={styles.kzProcessStep}>
                <span>{num}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>

          <article className={styles.kzProcessDemo}>
            <div className={styles.kzDemoDrops}>
              <div className={styles.kzMiniTabs}>
                <span>Manga</span>
                <span>Anime</span>
                <span>Webtoon</span>
              </div>
              {previewDrops.map((drop) => (
                <button key={`mini-${drop.id}`} className={styles.kzMiniDrop} onClick={() => openChapter(drop.id)}>
                  <span style={{ backgroundImage: `url(${drop.coverImage})` }} />
                  <strong>{drop.title}</strong>
                  <small>Chapter {drop.chapter}</small>
                  <em>
                    <b /> {drop.readers} reading now
                  </em>
                </button>
              ))}
            </div>

            <div className={styles.kzDemoMatch} aria-hidden>
              <span style={{ backgroundImage: `url(${avatarImages[0]})` }} />
              <b>↔</b>
              <span style={{ backgroundImage: `url(${avatarImages[1]})` }} />
            </div>

            <div
              className={styles.kzDemoScene}
              style={{ backgroundImage: `url(${liveDrop.bannerImage || liveDrop.coverImage})` }}
            >
              <span>NAH THAT CURVE SHOT...</span>
            </div>

            <div className={styles.kzDemoChat}>
              <span className={styles.kzChatBubblePrimary}>NAH THAT CURVE SHOT WAS INSANE</span>
              <span className={styles.kzChatBubbleSecondary}>I LOST IT BROOO WHAT WAS THAT ANGLE</span>
            </div>
          </article>

          <div className={styles.kzBondRow}>
            <button>
              <span>⊕</span>
              <strong>Add as Kizuna</strong>
              <small>Stay connected after the drop</small>
            </button>
            <button>
              <span>▣</span>
              <strong>Keep chatting</strong>
              <small>Continue the conversation</small>
            </button>
            <button>
              <span>↻</span>
              <strong>Next drop</strong>
              <small>Find a new match instantly</small>
            </button>
          </div>
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
        <button className={styles.kzFinalButton} onClick={() => openChapter(liveDrop.id)} aria-label="Jump into a chapter">
          <span aria-hidden>→</span>
        </button>
      </footer>
    </main>
  );
}
