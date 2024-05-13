function format(dateNum: number) {
  return ("0" + dateNum).slice(-2); // slice(-2) - take last 2 digits
}

export default function createTimestampNow() {
  const now = new Date();
  const year = now.getFullYear();
  const month = format(now.getMonth() + 1);
  const day = format(now.getDate());
  const hour = format(now.getHours());
  const min = format(now.getMinutes());
  const sec = format(now.getSeconds());
  return `${year}/${month}/${day} ${hour}:${min}:${sec}`;
}
