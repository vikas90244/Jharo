"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { localDateString } from "@/lib/feature/activity";
import {
  useLearningActivity,
  useLearningActivityDay,
} from "@/hooks/use-learning-activity";
import styles from "./learning-activity.module.scss";

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function activityLevel(pagesRead: number, wordsLearned: number) {
  if (pagesRead === 0) return wordsLearned > 0 ? 1 : 0;
  if (pagesRead < 2) return 1;
  if (pagesRead < 4) return 2;
  if (pagesRead < 7) return 3;
  return 4;
}

export function LearningActivity() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const monthSlider = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError } = useLearningActivity(year);
  const { data: selectedDay } = useLearningActivityDay(selectedDate);

  const dailyActivity = useMemo(
    () => new Map((data?.days ?? []).map((day) => [day.date, day])),
    [data?.days],
  );
  const today = localDateString();
  const todayActivity = dailyActivity.get(today);
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, month) => month),
    [],
  );

  const scrollMonths = (direction: -1 | 1) => {
    monthSlider.current?.scrollBy({
      left: direction * 300,
      behavior: "smooth",
    });
  };

  return (
    <section className={styles.activity} aria-label="Reading activity">
      <div className={styles.streakBar}>
        <div className={styles.streakSummary}>
          <span className={styles.streakIcon}>
            <Flame size={19} />
          </span>
          <div>
            <strong>{data?.streak ?? 0} day streak</strong>
            <span>Keep your reading going</span>
          </div>
        </div>
        <div
          className={styles.streakTrack}
          aria-label={`${data?.streak ?? 0} consecutive reading days`}
        >
          <span
            style={{ width: `${Math.min((data?.streak ?? 0) / 7, 1) * 100}%` }}
          />
        </div>
        <div className={styles.todaySummary}>
          <span>
            <strong>{todayActivity?.pages_read ?? 0}</strong> pages today
          </span>
          <span>
            <strong>{todayActivity?.words_learned ?? 0}</strong> words today
          </span>
        </div>
      </div>

      <div className={styles.heading}>
        <div>
          <h2 className={styles.title}>Reading activity</h2>
          <p className={styles.description}>
            Page reads build your streak. A page counts after 90 seconds of
            reading.
          </p>
        </div>
        <div className={styles.yearControl} aria-label="Choose activity year">
          <button
            type="button"
            onClick={() => {
              setYear((value) => value - 1);
              setSelectedDate(null);
            }}
            aria-label="Previous year"
          >
            <ChevronLeft size={17} />
          </button>
          <span>{year}</span>
          <button
            type="button"
            disabled={year >= new Date().getFullYear()}
            onClick={() => {
              setYear((value) => value + 1);
              setSelectedDate(null);
            }}
            aria-label="Next year"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className={styles.sliderControls}>
        <button
          type="button"
          onClick={() => scrollMonths(-1)}
          aria-label="Scroll to earlier months"
        >
          <ChevronLeft size={17} />
        </button>
        <button
          type="button"
          onClick={() => scrollMonths(1)}
          aria-label="Scroll to later months"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      <div className={styles.monthSlider} ref={monthSlider}>
        {months.map((month) => {
          const firstWeekday = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          return (
            <article className={styles.month} key={`${year}-${month}`}>
              <h3>
                {new Intl.DateTimeFormat("en", { month: "long" }).format(
                  new Date(year, month, 1),
                )}
              </h3>
              <div className={styles.monthGrid}>
                {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
                  <span className={styles.weekday} key={`${label}-${index}`}>
                    {label}
                  </span>
                ))}
                {Array.from({ length: firstWeekday }, (_, index) => (
                  <span key={`blank-${index}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const dayNumber = index + 1;
                  const key = dateKey(year, month, dayNumber);
                  const activity = dailyActivity.get(key);
                  const pagesRead = activity?.pages_read ?? 0;
                  const wordsLearned = activity?.words_learned ?? 0;
                  const level = activityLevel(pagesRead, wordsLearned);
                  const isFuture = key > today;
                  return (
                    <button
                      type="button"
                      key={key}
                      className={styles.day}
                      data-level={level}
                      data-pages-only={pagesRead > 0 && wordsLearned === 0}
                      data-selected={selectedDate === key}
                      disabled={isFuture}
                      title={`${key}: ${pagesRead} ${pagesRead === 1 ? "page" : "pages"} read, ${wordsLearned} ${wordsLearned === 1 ? "word" : "words"} learned`}
                      aria-label={`Show activity for ${key}: ${pagesRead} pages read, ${wordsLearned} words learned`}
                      onClick={() =>
                        setSelectedDate((current) =>
                          current === key ? null : key,
                        )
                      }
                    >
                      {dayNumber}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
        {isLoading && <p className={styles.status}>Loading activity…</p>}
        {isError && (
          <p className={styles.status} role="alert">
            Activity could not be loaded.
          </p>
        )}
      </div>

      <div className={styles.legend}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <i key={level} data-level={level} />
        ))}
        <span>More pages read</span>
        <i className={styles.wordOnlyKey} />
        <span>Words only</span>
      </div>

      {selectedDate && (
        <section className={styles.dayDetail} aria-live="polite">
          <div className={styles.detailHeading}>
            <h3>
              {new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(
                new Date(`${selectedDate}T12:00:00`),
              )}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              aria-label="Close day details"
            >
              ×
            </button>
          </div>
          {!selectedDay ? (
            <p className={styles.status}>Loading day…</p>
          ) : (
            <>
              <p className={styles.detailCounts}>
                <strong>{selectedDay.pages_read}</strong> pages read{" "}
                <span>·</span> <strong>{selectedDay.words_learned}</strong>{" "}
                words learned
              </p>
              {selectedDay.pages.length > 0 && (
                <ul>
                  {selectedDay.pages.map((page, index) => (
                    <li key={`${page.title}-${page.page_number}-${index}`}>
                      {page.title} <span>page {page.page_number}</span>
                    </li>
                  ))}
                </ul>
              )}
              {selectedDay.words.length > 0 && (
                <p className={styles.words}>{selectedDay.words.join(", ")}</p>
              )}
              {selectedDay.pages.length === 0 &&
                selectedDay.words.length === 0 && (
                  <p className={styles.status}>No activity recorded.</p>
                )}
            </>
          )}
        </section>
      )}
    </section>
  );
}
