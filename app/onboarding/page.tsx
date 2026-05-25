"use client";

import { useEffect, useState } from "react";
import styles from "./oboarding.module.css";
import { getTrendingTitles } from "@/lib/anilist";
import { createClient } from "@/lib/supabase/client"; // ✅ SSR browser client


export default function Onboarding() {
    const supabase = createClient();
  const [titles, setTitles] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const data = await getTrendingTitles();
      setTitles(data);
    }

    load();
  }, []);

  function toggleSelect(id: number) {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
      return;
    }

    if (selected.length < 8) {
      setSelected([...selected, id]);
    }
  }

  const filteredTitles =
    activeFilter === "all"
      ? titles
      : titles.filter((x) => x.type === activeFilter);

  const canContinue = selected.length >= 3;

  const handleContinue = async () => {
    console.log("STARTED HANDLE");

    try {
     const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

    if (userError || !user) {
  console.log("NO USER FOUND", userError);
  return;
}

      console.log("USER:", user);

      const interests = selected.map((titleId) => ({
        user_id: user.id,
        title_id: titleId,
      }));

      console.log("INTERESTS TO INSERT:", interests);

      const {
        data: insertedData,
        error: interestError,
      } = await supabase
        .from("user_interests")
        .insert(interests)
        .select();

      console.log("INSERTED:", insertedData);
      console.log("INTEREST ERROR:", interestError);

      if (interestError) return;

     const { error: profileError } = await supabase
  .from("profiles")
  .upsert({
    id: user.id,
    onboarding_complete: true,
  });
        

      console.log("PROFILE ERROR:", profileError);

      if (profileError) return;

      console.log("REDIRECTING");

      window.location.href = "/";
    } catch (err) {
      console.log("UNEXPECTED:", err);
    }
  };

  return (
    <div className={styles.obContainer}>
      <div className={styles.obHeader}>
        <div className={styles.obLogo}>絆 kizuna</div>

        <h1>
          What are you <span>following?</span>
        </h1>
      </div>

      <div className={styles.obCategories}>
        {["all", "manga", "anime"].map((cat) => (
          <button
            key={cat}
            className={activeFilter === cat ? styles.active : ""}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.obGrid}>
        {filteredTitles.map((item) => {
          const isSelected = selected.includes(item.id);

          return (
            <div
              key={item.id}
              className={`${styles.obTile} ${
                isSelected ? styles.selected : ""
              }`}
              onClick={() => toggleSelect(item.id)}
            >
              <div
                className={styles.obTileArt}
                style={{
                  backgroundImage: `url(${item.coverImage})`,
                }}
              >
                <div className={styles.obTileOverlay} />

                <span className={styles.obBadge}>
                  {item.badge}
                </span>

                {isSelected && (
                  <div className={styles.obCheck}>
                    ✓
                  </div>
                )}
              </div>

              <div className={styles.obTileBottom}>
                <div className={styles.obTitle}>
                  {item.name}
                </div>

                <div className={styles.obType}>
                  {item.type}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.obBottomBar}>
        <div>
          <span>{selected.length}</span> selected · min 3
        </div>

        <button
          className={styles.continueBtn}
          disabled={!canContinue}
          onClick={() => {
            console.log("BUTTON CLICKED");
            handleContinue();
          }}
        >
          continue →
        </button>
      </div>
    </div>
  );
}