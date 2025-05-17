import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

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

  const monthName = new Date(currentYear, currentMonth).toLocaleString('fr-FR', { month: 'long' });

  // Build calendar grid
  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(day);
  }

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() && 
           currentMonth === selectedDate.getMonth() && 
           currentYear === selectedDate.getFullYear();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 w-full shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={handlePrevMonth} 
          className="p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-gray-900 capitalize">{monthName} {currentYear}</span>
        <button 
          onClick={handleNextMonth} 
          className="p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-xs text-center mb-2">
        {daysOfWeek.map((d, i) => (
          <div key={i} className="font-medium text-gray-500 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center">
        {daysArray.map((day, idx) =>
          day ? (
            <button
              key={idx}
              className={`
                relative py-1.5 rounded-lg w-9 h-9 mx-auto mb-1 transition-all
                ${isSelected(day) 
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold shadow-sm' 
                  : isToday(day)
                    ? 'bg-rose-50 text-rose-600 font-medium'
                    : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                }
                ${day < new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
                }
              `}
              onClick={() => handleDateClick(day)}
              disabled={day < new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()}
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