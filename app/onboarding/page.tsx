'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/onboarding.module.css';

interface TitleData {
  id: string;
  name: string;
  type: string;
  badge: string;
  coverImage: string;
}

const ANILIST_QUERY = `
  query ($search: String) {
    Page(perPage: 1) {
      media(search: $search, type: MANGA, sort: POPULARITY_DESC) {
        id
        title {
          romaji
        }
        coverImage {
          large
        }
      }
    }
  }
`;

async function fetchCoverFromAniList(title: string): Promise<string> {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: ANILIST_QUERY,
        variables: { search: title },
      }),
    });
    const data = await response.json();
    const cover = data.data?.Page?.media?.[0]?.coverImage?.large;
    return cover || '';
  } catch {
    return '';
  }
}

const RAW_TITLES = [
  { name: 'Blue Lock', type: 'manga', badge: 'sports' },
  { name: 'Jujutsu Kaisen', type: 'manga', badge: 'action' },
  { name: 'One Piece', type: 'manga', badge: 'adventure' },
  { name: 'Frieren', type: 'manga', badge: 'fantasy' },
  { name: 'Tower of God', type: 'webtoon', badge: 'action' },
  { name: 'Dandadan', type: 'manga', badge: 'action' },
  { name: 'Solo Leveling', type: 'manhwa', badge: 'action' },
  { name: 'Oshi no Ko', type: 'manga', badge: 'drama' },
  { name: 'Vinland Saga', type: 'manga', badge: 'seinen' },
  { name: 'Omniscient Reader', type: 'manhwa', badge: 'fantasy' },
  { name: 'One Punch Man', type: 'manga', badge: 'comedy' },
  { name: 'Black Clover', type: 'manga', badge: 'shonen' },
];

// Fallback gradient colors per title if image fails
const FALLBACK_COLORS: Record<string, string> = {
  'Blue Lock': 'linear-gradient(135deg,#1e1040,#3d2080)',
  'Jujutsu Kaisen': 'linear-gradient(135deg,#1a0808,#3d1515)',
  'One Piece': 'linear-gradient(135deg,#0a1a0a,#0f3d15)',
  'Frieren': 'linear-gradient(135deg,#1a150a,#3d300f)',
  'Tower of God': 'linear-gradient(135deg,#0d0a1a,#1e1040)',
  'Dandadan': 'linear-gradient(135deg,#180a18,#3d1040)',
  'Solo Leveling': 'linear-gradient(135deg,#0a1218,#0f2a3d)',
  'Oshi no Ko': 'linear-gradient(135deg,#1a0a12,#3d152a)',
  'Vinland Saga': 'linear-gradient(135deg,#0f0f0a,#2a2810)',
  'Omniscient Reader': 'linear-gradient(135deg,#0a0f18,#152040)',
  'One Punch Man': 'linear-gradient(135deg,#1a1a0a,#3d3a0f)',
  'Black Clover': 'linear-gradient(135deg,#0f0a1a,#241540)',
};

const FILTERS = ['all', 'manga', 'webtoon', 'manhwa', 'anime', 'shonen', 'seinen'];

export default function OnboardingInterests() {
  const router = useRouter();
  const [titles, setTitles] = useState<TitleData[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchCovers = async () => {
      const results = await Promise.all(
        RAW_TITLES.map(async (t) => ({
          id: t.name.toLowerCase().replace(/\s+/g, '-'),
          name: t.name,
          type: t.type,
          badge: t.badge,
          coverImage: await fetchCoverFromAniList(t.name),
        }))
      );
      setTitles(results);
    };
    fetchCovers();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredTitles =
    activeFilter === 'all'
      ? titles
      : titles.filter((t) => t.type === activeFilter || t.badge === activeFilter);

  const canContinue = selected.size >= 3;

  const handleContinue = () => {
    if (canContinue) router.push('/onboarding/next'); // adjust route as needed
  };

  return (
    <div className="ob">
      {/* Top bar */}
      <div className="ob-top">
        <div className="ob-logo">
          <span className="ob-logo-k">絆</span>
          <span className="ob-logo-t">kizuna</span>
        </div>
        <div className="ob-step-track">
          <div className="ob-step done" />
          <div className="ob-step active" />
          <div className="ob-step" />
        </div>
      </div>

   {/* Header */}
<div className="ob-header">
  <h1>
    What are you
    <br />
    <span>following?</span>
  </h1>

  <div className="ob-context-banner">
    <div className="ob-banner-icon">👥</div>

    <div className="ob-context-banner">

  {/* left icon */}
  <div className="ob-banner-icon-wrap">
      <div className="ob-banner-orbit"></div>

      <div className="ob-banner-icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path
                d="M16 11C17.66 11 19 9.66 19 8C19 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 11 9.66 11 8C11 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.06 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
                fill="#d78aff"
              />
          </svg>
      </div>
  </div>

  {/* text */}
  <div className="ob-banner-text">
      <p className="main">
          We catch you right after a chapter or episode drops and connect you with someone who just experienced the same thing.
      </p>

      <p className="sub">
          Pick <span>at least 3</span> so we can find your people.
      </p>
  </div>

  {/* right visual */}
  <div className="ob-banner-scene">

      <div className="ob-stars">✦ ✦ ✦</div>

      <div className="ob-anime-shadow"/>

      <div className="bubble">
         THAT ENDING <br/>
         WAS INSANE...
      </div>

  </div>

</div>
  </div>
</div>

      {/* Grid */}
      <div className="ob-grid">
        {filteredTitles.map((t) => {
          const isSel = selected.has(t.id);
          return (
            <div
              key={t.id}
              className={`ob-tile${isSel ? ' sel' : ''}`}
              onClick={() => toggleSelect(t.id)}
            >
              <div
                className="ob-tile-art"
                style={
                  t.coverImage
                    ? {
                        backgroundImage: `url('${t.coverImage}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                      }
                    : { background: FALLBACK_COLORS[t.name] || 'linear-gradient(135deg,#1a1a2e,#16213e)' }
                }
              >
                <div className="ob-tile-art-overlay" />
                <div className="ob-tile-check">{isSel ? '✓' : ''}</div>
                <span className="ob-tile-badge">{t.badge}</span>
              </div>
              <div className="ob-tile-bottom">
                <div className="ob-tile-name">{t.name}</div>
                <div className="ob-tile-type">{t.type}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="ob-bottom-bar">
        <div className="ob-selection-info">
          <span className="ob-selection-count">{selected.size}</span> selected · min 3
        </div>
        <button
          className={`ob-continue${canContinue ? '' : ' dim'}`}
          onClick={handleContinue}
          disabled={!canContinue}
        >
          continue →
        </button>
      </div>

      <style jsx>{`
        .ob {
          background: #0d0d0f;
          color: #f0ece8;
          font-family: 'Inter', sans-serif;
          min-height: 860px;
          width: 100%;
        }
        .ob-top {
          padding: 20px 28px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ob-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ob-logo-k {
          font-size: 18px;
        }
        .ob-logo-t {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .ob-step-track {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ob-step {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
        }
        .ob-step.active {
          width: 22px;
          border-radius: 3px;
          background: #f0ece8;
        }
        .ob-step.done {
          background: rgba(255, 255, 255, 0.35);
        }
        .ob-header {
          padding: 36px 28px 10px;
        }

        .ob-header{
 padding:36px 28px 24px;
}

.ob-header h1{
 font-size:72px;
 font-weight:800;
 line-height:.92;
 letter-spacing:-0.06em;
 margin-bottom:28px;
 max-width:600px;
}

.ob-header h1 span{
 background:linear-gradient(
  135deg,
  #a78bfa,
  #ec4899
 );
 -webkit-background-clip:text;
 -webkit-text-fill-color:transparent;
}

.ob-context-banner{

display:flex;
align-items:center;
gap:35px;

position:relative;
overflow:hidden;

padding:38px;

border-radius:34px;

background:
radial-gradient(
circle at right,
rgba(139,92,246,.18),
transparent 45%
),
#101014;

border:1px solid rgba(255,255,255,.05);

min-height:220px;
}


/* LEFT ICON */

.ob-banner-icon-wrap{

position:relative;
width:100px;
height:100px;

display:flex;
align-items:center;
justify-content:center;
}

.ob-banner-orbit{

position:absolute;

width:90px;
height:90px;

border-radius:999px;

border:1px solid rgba(216,130,255,.15);

transform:rotate(-15deg);
}

.ob-banner-icon{

width:72px;
height:72px;

border-radius:24px;

background:
linear-gradient(
135deg,
rgba(167,139,250,.2),
rgba(236,72,153,.12)
);

display:flex;
align-items:center;
justify-content:center;

backdrop-filter:blur(20px);

box-shadow:
0 0 40px rgba(167,139,250,.15);
}


/* TEXT */

.ob-banner-text{
flex:1;
max-width:540px;
z-index:2;
}

.ob-banner-text .main{

font-size:18px;
line-height:1.7;
font-weight:600;

color:#f0ece8;
}

.ob-banner-text .sub{

margin-top:18px;

font-size:15px;

color:rgba(255,255,255,.45);
}

.ob-banner-text span{

color:#d78aff;
font-weight:700;
}


/* RIGHT SIDE */

.ob-banner-scene{

position:absolute;

right:0;
top:0;

width:38%;
height:100%;
}

.ob-anime-shadow{

position:absolute;
bottom:-10px;
right:0;

width:100%;
height:100%;

background:
linear-gradient(
to top,
rgba(120,60,255,.3),
transparent
);

mask:
url('/silhouette.png')
center/contain no-repeat;

-webkit-mask:
url('/silhouette.png')
center/contain no-repeat;

opacity:.7;
}


.ob-stars{

position:absolute;
top:25px;
right:70px;

font-size:22px;

color:#d78aff;
opacity:.6;
}

.bubble{

position:absolute;

top:35px;
right:90px;

padding:18px;

border-radius:30px;

background:
rgba(255,255,255,.03);

border:
1px solid rgba(255,255,255,.08);

transform:rotate(-8deg);

font-size:18px;

color:#d78aff;
}



        .ob-header h1 {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin-bottom: 10px;
        }
        .ob-header h1 span {
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ob-header p {
          font-size: 13px;
          color: rgba(240, 236, 232, 0.45);
          line-height: 1.6;
          max-width: 400px;
        }
        .ob-filter-row {
          display: flex;
          gap: 8px;
          padding: 20px 28px 14px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .ob-filter-row::-webkit-scrollbar {
          display: none;
        }
        .ob-filter-pill {
          flex-shrink: 0;
          padding: 7px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 0.5px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          background: transparent;
          color: rgba(240, 236, 232, 0.5);
          font-family: 'Inter', sans-serif;
          transition: all 0.15s;
        }
        .ob-filter-pill.on {
          background: #f0ece8;
          color: #0d0d0f;
          border-color: transparent;
        }
        .ob-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          padding: 0 28px;
        }
        .ob-tile {
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          transition: transform 0.15s;
        }
        .ob-tile:hover {
          transform: scale(1.02);
        }
        .ob-tile.sel {
          outline: 2px solid rgba(240, 236, 232, 0.5);
        }
        .ob-tile-art {
          height: 116px;
          display: flex;
          align-items: flex-end;
          padding: 10px;
          position: relative;
        }
        .ob-tile-art-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(13, 13, 15, 0.92) 0%, transparent 55%);
        }
        .ob-tile-check {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          z-index: 2;
        }
        .ob-tile.sel .ob-tile-check {
          background: #f0ece8;
          border-color: #f0ece8;
          color: #0d0d0f;
        }
        .ob-tile-badge {
          position: relative;
          z-index: 1;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(240, 236, 232, 0.4);
        }
        .ob-tile-bottom {
          background: #161618;
          padding: 9px 10px 10px;
        }
        .ob-tile-name {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #f0ece8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ob-tile-type {
          font-size: 10px;
          color: rgba(240, 236, 232, 0.35);
          font-weight: 500;
          margin-top: 2px;
        }
        .ob-bottom-bar {
          position: sticky;
          bottom: 0;
          background: linear-gradient(to top, #0d0d0f 80%, transparent);
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 20px;
        }
        .ob-selection-info {
          font-size: 12px;
          color: rgba(240, 236, 232, 0.4);
          font-weight: 500;
        }
        .ob-selection-count {
          font-size: 22px;
          font-weight: 800;
          color: #f0ece8;
          letter-spacing: -0.04em;
          display: inline;
        }
        .ob-continue {
          font-size: 14px;
          font-weight: 700;
          color: #0d0d0f;
          background: #f0ece8;
          border: none;
          border-radius: 24px;
          padding: 12px 28px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.02em;
          transition: opacity 0.15s;
        }
        .ob-continue.dim {
          background: rgba(240, 236, 232, 0.15);
          color: rgba(240, 236, 232, 0.3);
          cursor: default;
        }
      `}</style>
    </div>
  );
}