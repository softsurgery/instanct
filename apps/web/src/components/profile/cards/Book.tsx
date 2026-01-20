interface BookProps {
  className?: string;
}

export const Book = ({ className }: BookProps) => {
  return (
    <div className={className}>
      <h1>Book</h1>
    </div>
  );
};
