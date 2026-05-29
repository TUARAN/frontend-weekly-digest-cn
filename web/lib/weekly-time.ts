import { getWeeklyMenu } from '@/lib/weekly';

export interface WeeklyTimeEntry {
  slug: string;
  title: string;
  dateLabel: string;
  year: number;
  startDate: string; // ISO date: YYYY-MM-DD
  endDate: string; // ISO date: YYYY-MM-DD
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

function toIsoDateUTC(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

function parseYearTitle(title: string): number | null {
  const m = title.match(/(\d{4})年/);
  if (!m) return null;
  return Number(m[1]);
}

function parseWeeklyDateLabel(
  label: string,
  fallbackYear: number
): {
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
} | null {
  const normalized = label.replace(/\s+/g, '');
  const m = normalized.match(
    /^(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日[–-](?:(\d{4})年)?(\d{1,2})月(\d{1,2})日$/
  );
  if (!m) return null;

  const explicitStartYear = m[1] ? Number(m[1]) : null;
  const startMonth = Number(m[2]);
  const startDay = Number(m[3]);
  const explicitEndYear = m[4] ? Number(m[4]) : null;
  const endMonth = Number(m[5]);
  const endDay = Number(m[6]);

  const startYear = explicitStartYear ?? fallbackYear;
  let endYear = explicitEndYear ?? startYear;

  if (!explicitEndYear) {
    const wrapsToNextYear = endMonth < startMonth || (endMonth === startMonth && endDay < startDay);
    if (wrapsToNextYear) endYear = startYear + 1;
  }

  return {
    startYear,
    startMonth,
    startDay,
    endYear,
    endMonth,
    endDay,
  };
}

export function getWeeklyTimeEntries(): WeeklyTimeEntry[] {
  const menu = getWeeklyMenu();
  const entries: WeeklyTimeEntry[] = [];

  for (const maybeYear of menu) {
    const year = parseYearTitle(maybeYear.title);
    if (!year || !maybeYear.children) continue;

    for (const issue of maybeYear.children) {
      if (!issue.slug || !issue.date) continue;
      const parsed = parseWeeklyDateLabel(issue.date, year);
      if (!parsed) continue;

      entries.push({
        slug: issue.slug,
        title: issue.title,
        dateLabel: issue.date,
        year,
        startDate: toIsoDateUTC(parsed.startYear, parsed.startMonth, parsed.startDay),
        endDate: toIsoDateUTC(parsed.endYear, parsed.endMonth, parsed.endDay),
        startMonth: parsed.startMonth,
        startDay: parsed.startDay,
        endMonth: parsed.endMonth,
        endDay: parsed.endDay,
      });
    }
  }

  return entries.sort((a, b) => Number(b.slug) - Number(a.slug));
}

