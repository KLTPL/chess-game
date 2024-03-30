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
      className="w-fit rounded-md bg-secondary px-4 py-2 text-white hover:bg-secondary-d"
      onClick={onClick}
    >
      {textContent}
    </button>
  );
}
