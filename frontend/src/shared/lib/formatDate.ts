export const formatDateForView = (date: Date) => {
  const week = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = week[date.getDay()];
  return `${month}월 ${day}일 (${dayOfWeek})`;
};

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
};

export const formatTimeView = (time: string) => {
  const hour = time.substring(8, 10);
  const min = time.substring(10, 12);
  return `${hour}` + ':' + `${min}`;
};

export const formatTime = () => {
  const date = formatTodayDate();
  const hour = date.toString().substring(8, 10);
  const min = date.toString().substring(10, 12);
  return `${hour}${min}`;
};

export const formatAM_PM = (time: string) => {
  const am_pm = time.substring(8, 10);
  return Number(am_pm);
};

export const formatTodayDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return Number(year + month + day + hours + minutes + seconds);
};

export const isToday = () => {
  const day = new Date();
  const today = formatDate(day);
  return today;
};

export const formatStartDate = (startDay: string) => {
  const year = Number(startDay.slice(0, 4));
  const month = Number(startDay.slice(4, 6)) - 1;
  const days = Number(startDay.slice(6, 8));
  return new Date(year, month, days);
};

export const formatStartTime = (startTime: string) => {
  const year = Number(startTime.slice(0, 4));
  const month = Number(startTime.slice(4, 6)) - 1;
  const days = Number(startTime.slice(6, 8));
  const hours = Number(startTime.slice(8, 10));
  const minutes = Number(startTime.slice(10, 12));
  return new Date(year, month, days, hours, minutes);
};

export const elapsedTime = (timestamp: number | null | undefined): string => {
  const requestTime = new Date(timestamp ? Number(timestamp) * 1000 : 0);
  const diff = (new Date().getTime() - requestTime.getTime()) / 1000;
  const times = [
    { name: '년', milliSeconds: 60 * 60 * 24 * 365 },
    { name: '개월', milliSeconds: 60 * 60 * 24 * 30 },
    { name: '일', milliSeconds: 60 * 60 * 24 },
    { name: '시간', milliSeconds: 60 * 60 },
    { name: '분', milliSeconds: 60 },
  ];
  for (const value of times) {
    const between = Math.floor(diff / value.milliSeconds);
    if (between > 0) return `${between}${value.name} 전`;
  }
  return '방금 전';
};

export const parseDateTime = (
  startTime: number,
  dur: number,
): { departure: Date; arrival: Date } => {
  const s = String(startTime);
  const departure = new Date(
    Number(s.substring(0, 4)),
    Number(s.substring(4, 6)) - 1,
    Number(s.substring(6, 8)),
    Number(s.substring(8, 10)),
    Number(s.substring(10, 12)),
  );
  const arrival = new Date(departure.getTime() + dur * 60 * 1000);
  return { departure, arrival };
};

export const formatMonthDay = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

export const formatReviewDate = (seconds: number): string => {
  const d = new Date(seconds * 1000);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export const formatBoardTime = (date: number) => {
  const newDate = new Date(date * 1000);
  const year = newDate.getFullYear();
  const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
  const day = newDate.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
