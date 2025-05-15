import React from 'react';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = React.useState(selectedDate.getFullYear());

  React.useEffect(() => {
    setCurrentMonth(selectedDate.getMonth());
    setCurrentYear(selectedDate.getFullYear());
  }, [selectedDate]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    onDateChange(new Date(currentYear, currentMonth, day));
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  // Build calendar grid
  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(day);
  }

  return (
    <div className="bg-white rounded border border-gray-300 p-4 w-full">
      <div className="flex items-center justify-between mb-2">
        <button onClick={handlePrevMonth} className="px-2 py-1 text-gray-500 hover:text-black">&#60;</button>
        <span className="font-semibold text-gray-800">{monthName} {currentYear}</span>
        <button onClick={handleNextMonth} className="px-2 py-1 text-gray-500 hover:text-black">&#62;</button>
      </div>
      <div className="grid grid-cols-7 text-xs text-center mb-1">
        {daysOfWeek.map((d, i) => (
          <div key={i} className="font-semibold text-gray-600 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center">
        {daysArray.map((day, idx) =>
          day ? (
            <button
              key={idx}
              className={`py-1 rounded-full w-8 h-8 mx-auto mb-1 transition-colors
                ${selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear
                  ? 'bg-blue-600 text-white font-bold'
                  : 'hover:bg-blue-100 text-gray-800'}
              `}
              onClick={() => handleDateClick(day)}
            >
              {day}
            </button>
          ) : (
            <div key={idx} />
          )
        )}
      </div>
    </div>
  );
};

export default Calendar; 