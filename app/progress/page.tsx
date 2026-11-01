"use client";

import Link from "next/link";
import ScreenFrame from "@/components/ScreenFrame";
import PlayerPanel from "@/components/PlayerPanel";
import { useGame } from "@/components/GameProvider";
import { LEVELS, type Level } from "@/lib/data/levels";
import {
  GROUP_LABEL,
  LEVEL_TOPICS,
  TOPICS,
  topicAccuracy,
  topicStatus,
  type Topic,
  type TopicGroup,
  type TopicStatus,
} from "@/lib/data/topics";
import { ui } from "@/lib/uiStyles";

const STATUS: Record<TopicStatus, { label: string; className: string }> = {
  unpracticed: { label: "NOT PRACTICED", className: "opacity-60" },
  review: { label: "NEEDS REVIEW", className: "!bg-[#f2867a]" },
  improving: { label: "IMPROVING", className: "!bg-[#ffe08a]" },
  strong: { label: "STRONG", className: "!bg-[#8fd86a]" },
};

/** Practice level for a topic: an unlocked level that covers it, weakest stars first. */
function practiceLevel(
  topic: Topic,
  isUnlocked: (tierId: Level["tierId"], index: number) => boolean,
  stars: Record<string, number>,
): Level | null {
  const candidates = LEVELS.filter(
    (l) => LEVEL_TOPICS[l.id]?.includes(topic.id) && isUnlocked(l.tierId, l.index),
  );
  candidates.sort((a, b) => (stars[a.id] ?? 0) - (stars[b.id] ?? 0));
  return candidates[0] ?? null;
}

export default function ProgressPage() {
  const { topicStats, isUnlocked, stars } = useGame();

  const practiced = TOPICS.filter((t) => topicAccuracy(topicStats[t.id]) !== null);
  const toReview = practiced
    .filter((t) => (topicAccuracy(topicStats[t.id]) ?? 100) < 80)
    .sort((a, b) => (topicAccuracy(topicStats[a.id]) ?? 0) - (topicAccuracy(topicStats[b.id]) ?? 0))
    .slice(0, 3);

  function TopicRow({ topic }: { topic: Topic }) {
    const stat = topicStats[topic.id];
    const accuracy = topicAccuracy(stat);
    const status = STATUS[topicStatus(stat)];
    const practice = practiceLevel(topic, isUnlocked, stars);
    return (
      <div className="flex flex-col gap-1 border-[3px] border-[#3b3452] bg-[#fdf9ef] p-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-black">{topic.name}</span>
          <span className={`${ui.chip} ${status.className}`}>{status.label}</span>
        </div>
        <div className={ui.progress} aria-label={`${topic.name} accuracy`}>
          <div className={ui.progressFill} style={{ width: `${accuracy ?? 0}%` }} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={ui.playerCaption}>
            {stat ? `${accuracy}% · ${stat.right} right · ${stat.wrong} wrong` : "No answers yet"}
          </span>
          <span className="flex gap-2">
            <Link href={topic.studyHref} className={`${ui.button} !px-2 !py-1 text-[10px]`}>
              {topic.studyLabel}
            </Link>
            {practice && (
              <Link href={`/level/${practice.id}`} className={`${ui.button} !px-2 !py-1 text-[10px]`}>
                PRACTICE {practice.title}
              </Link>
            )}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={ui.page}>
      <ScreenFrame title="NODEX — MY PROGRESS">
        <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            <PlayerPanel />
            <div className="flex flex-col gap-2 border-[3px] border-[#3b3452] bg-[#fdf9ef] p-3">
              <span className="text-sm font-black tracking-wider">WHAT TO REVIEW</span>
              {practiced.length === 0 ? (
                <p className={ui.hint}>
                  Play a few levels — your strong and weak topics will show up here.
                </p>
              ) : toReview.length === 0 ? (
                <p className={ui.hint}>
                  Every topic you&apos;ve practiced is at 80% or better. Nice work!
                </p>
              ) : (
                <ol className="flex flex-col gap-1 text-sm">
                  {toReview.map((t, i) => (
                    <li key={t.id}>
                      {i + 1}. <b>{t.name}</b> — {topicAccuracy(topicStats[t.id])}% correct
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <Link href="/menu" className={`${ui.button} text-xs`}>
              ◀ MAIN MENU
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {(["gates", "skills", "cabling"] as TopicGroup[]).map((group) => (
              <section key={group} className="flex flex-col gap-2">
                <h2 className="text-sm font-black tracking-widest">{GROUP_LABEL[group]}</h2>
                <div className="grid gap-2 md:grid-cols-2">
                  {TOPICS.filter((t) => t.group === group).map((t) => (
                    <TopicRow key={t.id} topic={t} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </ScreenFrame>
    </div>
  );
}
