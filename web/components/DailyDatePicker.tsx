'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { zhCN } from 'react-day-picker/locale';
import type { DailyMeta } from '@/lib/ai-daily';

interface DailyDatePickerProps {
  list: DailyMeta[];
  selectedDate: string;
  onChange: (index: number) => void;
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DailyDatePicker({ list, selectedDate, onChange }: DailyDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateIndex = useMemo(
    () => new Map(list.map((item, index) => [item.date, index])),
    [list],
  );
  const availableDates = useMemo(() => list.map((item) => parseDate(item.date)), [list]);
  const selected = parseDate(selectedDate);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative ml-auto">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:text-blue-400"
      >
        <CalendarDays className="h-4 w-4" />
        选择日期
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="选择每日精选日期"
          className="daily-calendar absolute right-0 top-full z-30 mt-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-950"
        >
          <DayPicker
            mode="single"
            locale={zhCN}
            selected={selected}
            defaultMonth={selected}
            startMonth={availableDates.at(-1)}
            endMonth={availableDates[0]}
            modifiers={{ available: availableDates }}
            disabled={(date) => !dateIndex.has(formatDate(date))}
            onSelect={(date) => {
              if (!date) return;
              const index = dateIndex.get(formatDate(date));
              if (index === undefined) return;
              onChange(index);
              setOpen(false);
            }}
            footer="仅可选择有内容的日期"
          />
        </div>
      )}
    </div>
  );
}
