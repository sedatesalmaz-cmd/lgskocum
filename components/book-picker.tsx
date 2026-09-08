'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { bookItemsForSubject, type BookItem } from '@/lib/book-catalog';
export function BookPicker({
  subjectId,
  value,
  onChange,
  placeholder = 'Kitap seçin',
}: {
  subjectId: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const books = bookItemsForSubject(subjectId);
  const selected = books.find((item) => item.name === value);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div className="book-picker" ref={root}>
      <button
        type="button"
        className="book-picker-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        {selected ? (
          <BookMark book={selected} />
        ) : (
          <span className="book-empty">K</span>
        )}
        <span className={selected ? '' : 'placeholder'}>
          {selected?.name ?? placeholder}
        </span>
        <ChevronDown />
      </button>
      {open && (
        <div className="book-picker-menu" role="listbox">
          {books.map((item) => (
            <button
              type="button"
              role="option"
              aria-selected={item.name === value}
              key={`${item.category ?? ''}-${item.name}`}
              onClick={() => {
                onChange(item.name);
                setOpen(false);
              }}
            >
              <BookMark book={item} />
              <span>
                <b>{item.name}</b>
                {item.category && <small>{item.category}</small>}
              </span>
              {item.name === value && <Check className="book-selected" />}
            </button>
          ))}
          {books.length === 0 && <p>Bu ders için kitap bulunamadı.</p>}
        </div>
      )}
    </div>
  );
}
function BookMark({ book }: { book: BookItem }) {
  return (
    <span
      className="book-mark"
      style={{ '--book-color': book.color } as React.CSSProperties}
    >
      {book.image ? <img src={book.image} alt="" /> : <b>{book.short}</b>}
    </span>
  );
}
