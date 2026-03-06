import DatePicker from 'react-datepicker';
import { Clock } from 'lucide-react';

/**
 * TimeInput – wraps react-datepicker (time-only) for a professional time picker.
 * Emits onChange({ target: { name, value } }) with value as 'HH:mm'.
 * minTime: string 'HH:mm' — if provided, disables earlier times (use when date === today).
 */
export default function TimeInput({ name, value, onChange, minTime, className }) {
  const parseTime = (t) => (t && t.length >= 4 ? new Date(`1970-01-01T${t}:00`) : null);

  const minTimeDate = minTime && minTime.length >= 4
    ? new Date(`1970-01-01T${minTime}:00`)
    : new Date(1970, 0, 1, 0, 0, 0);
  const maxTimeDate = new Date(1970, 0, 1, 23, 59, 0);

  const handleChange = (date) => {
    if (!date) return;
    const val = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    onChange({ target: { name, value: val } });
  };

  return (
    <div className="relative">
      <DatePicker
        selected={parseTime(value)}
        onChange={handleChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={30}
        timeCaption="Hora"
        dateFormat="HH:mm"
        minTime={minTimeDate}
        maxTime={maxTimeDate}
        className={className}
        autoComplete="off"
      />
      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 pointer-events-none" />
    </div>
  );
}
