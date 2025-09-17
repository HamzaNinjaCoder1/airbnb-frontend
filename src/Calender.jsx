import React, { useEffect, useRef } from 'react'
import { DateRange } from "react-date-range";
import { format, differenceInDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { enUS } from "date-fns/locale";

function Calender({ data, dayCount, onChangeDates, range, focusedRange, onFocusChange, shownDate, disabledDates = [], bookingRanges = [] }) {
  const calendarRef = useRef(null);
  const tooltipRef = useRef(null);
  
  const customLocale = {
    ...enUS,
    localize: {
      ...enUS.localize,
      day: (n) => ["S", "M", "T", "W", "T", "F", "S"][n], 
    },
  };
  const rawDays = range?.[0] ? differenceInDays(range[0].endDate, range[0].startDate) : 0;
  const days = Math.max(0, rawDays - 1);

  // Log disabled dates when they change
  useEffect(() => {
    console.log('Calendar disabled dates updated:', disabledDates);
    console.log('Number of disabled dates:', disabledDates.length);
    if (disabledDates.length > 0) {
      console.log('Disabled dates list:', disabledDates.map(d => d.toISOString().split('T')[0]));
    }
  }, [disabledDates]);

  const handleChange = (item) => {
    if (onChangeDates) {
      onChangeDates(item.selection.startDate, item.selection.endDate);
    }
  };

  // Get booking info for a specific date
  const getBookingInfoForDate = (date) => {
    if (!bookingRanges || !Array.isArray(bookingRanges)) {
      return null;
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    for (const range of bookingRanges) {
      if (range.start && range.end) {
        const startDate = new Date(range.start);
        const endDate = new Date(range.end);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (targetDate >= startDate && targetDate <= endDate) {
          return {
            checkIn: range.start,
            checkOut: range.end,
            isCheckIn: targetDate.getTime() === startDate.getTime(),
            isCheckOut: targetDate.getTime() === endDate.getTime()
          };
        }
      }
    }

    return null;
  };

  // Add custom styles for disabled dates and hover effects
  useEffect(() => {
    // Add custom CSS for disabled dates
    const style = document.createElement('style');
    style.textContent = `
      .rdrDay.rdrDayDisabled {
        text-decoration: line-through !important;
        color: #9ca3af !important;
        background-color: #f3f4f6 !important;
        cursor: not-allowed !important;
        opacity: 0.6 !important;
      }
      
      .rdrDay.rdrDayDisabled .rdrDayNumber span {
        text-decoration: line-through !important;
        color: #9ca3af !important;
      }
      
      .rdrDay.rdrDayDisabled:hover {
        background-color: #f3f4f6 !important;
        text-decoration: line-through !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add hover effects for booked dates
  useEffect(() => {
    const calendarElement = calendarRef.current;
    if (!calendarElement || !disabledDates.length) return;

    console.log('Setting up hover effects for disabled dates:', disabledDates);
    console.log('Booking ranges available:', bookingRanges);

    const handleMouseOver = (e) => {
      const dayElement = e.target.closest('.rdrDay');
      if (!dayElement) return;

      const dayText = dayElement.querySelector('.rdrDayNumber span');
      if (!dayText) return;

      const dayNumber = parseInt(dayText.textContent);
      if (isNaN(dayNumber)) return;

      // Get the month and year from the calendar
      const monthElement = dayElement.closest('.rdrMonth');
      if (!monthElement) return;

      const monthHeader = monthElement.querySelector('.rdrMonthAndYearPickers');
      if (!monthHeader) return;

      const monthText = monthHeader.textContent;
      const [monthName, year] = monthText.split(' ');
      const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
      
      const date = new Date(year, monthIndex, dayNumber);
      const bookingInfo = getBookingInfoForDate(date);

      // Check if this date is in the disabled dates list
      const isDisabled = disabledDates.some(disabledDate => 
        disabledDate.getTime() === date.getTime()
      );

      if (isDisabled) {
        console.log('Hovering over disabled date:', date.toISOString().split('T')[0]);
        
        // Create or update tooltip
        let tooltip = document.querySelector('.booking-tooltip');
        if (!tooltip) {
          tooltip = document.createElement('div');
          tooltip.className = 'booking-tooltip';
          tooltip.style.cssText = `
            position: absolute;
            background: #1f2937;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            max-width: 200px;
          `;
          document.body.appendChild(tooltip);
        }

        let tooltipText = '';
        
        if (bookingInfo) {
          // If we have booking info, show detailed tooltip
          const checkInDate = format(new Date(bookingInfo.checkIn), 'MMM d, yyyy');
          const checkOutDate = format(new Date(bookingInfo.checkOut), 'MMM d, yyyy');
          
          if (bookingInfo.isCheckIn) {
            tooltipText = `Check-in: ${checkInDate}`;
          } else if (bookingInfo.isCheckOut) {
            tooltipText = `Check-out: ${checkOutDate}`;
          } else {
            tooltipText = `Booked: ${checkInDate} - ${checkOutDate}`;
          }
        } else {
          // If no booking info, show generic message
          const dateString = format(date, 'MMM d, yyyy');
          tooltipText = `Booked: ${dateString}`;
        }

        tooltip.textContent = tooltipText;
        tooltip.style.display = 'block';

        // Position tooltip
        const rect = dayElement.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
        tooltip.style.transform = 'translateX(-50%)';

        // Add visual indicator to the day
        dayElement.style.backgroundColor = '#fef3c7';
        dayElement.style.border = '1px solid #f59e0b';
      }
    };

    const handleMouseOut = (e) => {
      const dayElement = e.target.closest('.rdrDay');
      if (!dayElement) return;

      const tooltip = document.querySelector('.booking-tooltip');
      if (tooltip) {
        tooltip.style.display = 'none';
      }
      dayElement.style.backgroundColor = '';
      dayElement.style.border = '';
    };

    calendarElement.addEventListener('mouseover', handleMouseOver);
    calendarElement.addEventListener('mouseout', handleMouseOut);

    return () => {
      calendarElement.removeEventListener('mouseover', handleMouseOver);
      calendarElement.removeEventListener('mouseout', handleMouseOut);
      
      // Clean up tooltip
      const tooltip = document.querySelector('.booking-tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    };
  }, [bookingRanges, disabledDates]);
  return (
    <div className='flex flex-col w-full max-w-[700px] lg:max-w-[734px] mx-auto lg:mx-0' ref={calendarRef}>
      <h1 className='text-gray-900 text-lg sm:text-xl lg:text-[1.47rem] font-medium text-center sm:text-left'> {days} nights in {data?.city || 'this location'} </h1>
      <p className='text-gray-500 text-sm sm:text-base lg:text-[0.9rem] font-medium text-center sm:text-left break-words'>{range?.[0] ? `${format(range[0].startDate, "MMM d, yyyy")} - ${format(range[0].endDate, "MMM d, yyyy")}` : 'Select dates'}</p>
      <div className="mt-4 sm:mt-6 -ml-4 sm:-ml-6 lg:ml-0">
        <DateRange className='w-full'
          months={window.innerWidth < 640 ? 1 : 2}
          direction="horizontal"
          onChange={handleChange}
          moveRangeOnFirstSelection={false}
          ranges={range}
          focusedRange={focusedRange}
          onRangeFocusChange={onFocusChange}
          shownDate={shownDate}
          minDate={new Date(2025, 7, 1)}
          maxDate={new Date(2025, 12, 31)}
          showDateDisplay={false}
          disabledDates={disabledDates}
          monthDisplayFormat="MMMM yyyy"
          locale={customLocale}
        />
      </div>
    </div>
  )
}

export default Calender