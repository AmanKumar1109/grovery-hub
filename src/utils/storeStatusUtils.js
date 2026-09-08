/**
 * Utility to calculate store order acceptance status
 * Handles:
 * 1. Manual toggle (isAcceptingOrders: false)
 * 2. Scheduled pause (isScheduledPause: true with start and end datetime)
 * 3. Auto-reopen when end datetime is reached
 */

export function getStoreStatus(settings) {
  if (!settings) {
    return {
      isAccepting: true,
      isPaused: false,
      isScheduled: false,
      startDate: null,
      reopenDate: null,
      startFormatted: null,
      reopenFormatted: null,
      dateRangeFormatted: null,
      pauseMessage: ''
    };
  }

  const now = new Date();
  const defaultMsg = 'Online ordering is temporarily paused. You can still browse our products and prices!';
  const customMsg = settings.orderPauseMessage?.trim() || defaultMsg;

  // 1. Check Scheduled Pause
  if (settings.isScheduledPause && settings.pauseEndDateTime) {
    const startDate = settings.pauseStartDateTime ? new Date(settings.pauseStartDateTime) : null;
    const endDate = new Date(settings.pauseEndDateTime);

    // If endDate is valid
    if (!isNaN(endDate.getTime())) {
      const hasStarted = !startDate || isNaN(startDate.getTime()) || now >= startDate;
      const hasEnded = now >= endDate;

      if (hasStarted && !hasEnded) {
        const startFormatted = startDate && !isNaN(startDate.getTime()) ? formatReopenDate(startDate) : 'Currently';
        const reopenFormatted = formatReopenDate(endDate);
        const dateRangeFormatted = `${startFormatted} to ${reopenFormatted}`;

        return {
          isAccepting: false,
          isPaused: true,
          isScheduled: true,
          startDate,
          reopenDate: endDate,
          startFormatted,
          reopenFormatted,
          dateRangeFormatted,
          pauseMessage: customMsg
        };
      }
    }
  }

  // 2. Check Manual Master Toggle
  if (settings.isAcceptingOrders === false) {
    return {
      isAccepting: false,
      isPaused: true,
      isScheduled: false,
      startDate: null,
      reopenDate: null,
      startFormatted: null,
      reopenFormatted: null,
      dateRangeFormatted: null,
      pauseMessage: customMsg
    };
  }

  // 3. Store is Open
  return {
    isAccepting: true,
    isPaused: false,
    isScheduled: false,
    startDate: null,
    reopenDate: null,
    startFormatted: null,
    reopenFormatted: null,
    dateRangeFormatted: null,
    pauseMessage: ''
  };
}

/**
 * Friendly date formatter for reopening / start time with full date and time
 * Example: "8 Sep (Mon), 10:00 PM" or "Tomorrow (9 Sep), 08:00 AM"
 */
export function formatReopenDate(targetDate) {
  if (!targetDate || isNaN(targetDate.getTime())) return null;

  const now = new Date();
  const isToday =
    targetDate.getDate() === now.getDate() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    targetDate.getDate() === tomorrow.getDate() &&
    targetDate.getMonth() === tomorrow.getMonth() &&
    targetDate.getFullYear() === tomorrow.getFullYear();

  const timeStr = targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateNum = targetDate.getDate();
  const monthName = targetDate.toLocaleDateString([], { month: 'short' });

  if (isToday) {
    return `Today, ${timeStr}`;
  } else if (isTomorrow) {
    return `Tomorrow, ${timeStr}`;
  } else {
    return `${dateNum} ${monthName}, ${timeStr}`;
  }
}
