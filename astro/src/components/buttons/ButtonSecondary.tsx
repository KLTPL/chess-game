type ButtonRoundedProps = {
  textContent: string;
  onClick?: () => void;
};

export default function ButtonSecondary({
  textContent,
  onClick,
}: ButtonRoundedProps) {
  return (
    <button
      className="w-fit rounded-md bg-secondary px-2 py-1 text-white hover:bg-secondary-d sm:px-4 sm:py-2"
      onClick={onClick}
    >
      {textContent}
    </button>
  );
}
