import WeeklyCreationCalendar from '@/components/WeeklyCreationCalendar';
import { getWeeklyTimeEntries } from '@/lib/weekly-time';

export const metadata = {
  title: '创作日历',
  description: '按时间维度观察周刊创作节奏，支持热力图与时间检索。',
};

export default function WeeklyCalendarPage() {
  const entries = getWeeklyTimeEntries();
  return <WeeklyCreationCalendar entries={entries} />;
}

