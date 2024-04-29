type ButtonPrimaryProps = {
  textContent: string;
  onClick?: () => void;
};

export default function ButtonPrimary({
  textContent,
  onClick,
}: ButtonPrimaryProps) {
  return (
    <button
      className="rounded-md bg-primary-b px-2 py-1 text-white hover:bg-primary md:px-4 md:py-2"
      onClick={onClick}
    >
      {textContent}
    </button>
  );
}
