import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

/**
 * DateInput – wraps react-datepicker for a professional calendar popup.
 * Emits onChange({ target: { name, value } }) with value as 'YYYY-MM-DD'.
 */
export default function DateInput({ name, value, onChange, onBlur, minDate, className }) {
  const selected = value ? new Date(`${value}T00:00:00`) : null;

  const handleChange = (date) => {
    const val = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : '';
    onChange({ target: { name, value: val } });
  };

  return (
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={handleChange}
        onCalendarClose={onBlur}
        minDate={minDate ?? new Date()}
        dateFormat="dd/MM/yyyy"
        placeholderText="dd/mm/aaaa"
        className={className}
        autoComplete="off"
        showMonthDropdown
        dropdownMode="select"
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 pointer-events-none" />
    </div>
  );
}
