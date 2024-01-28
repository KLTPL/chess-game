export default function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return (parts.pop() as string).split(";").shift() as string;
  }
  return "";
}
