"use client";

import { useEffect, useState } from "react";

function formatIsoToDayFirst(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function normalizeTyping(value) {
  const digits = String(value).replace(/\D/g, "").slice(0, 8);
  const parts = [];

  if (digits.slice(0, 2)) {
    parts.push(digits.slice(0, 2));
  }

  if (digits.slice(2, 4)) {
    parts.push(digits.slice(2, 4));
  }

  if (digits.slice(4, 8)) {
    parts.push(digits.slice(4, 8));
  }

  return parts.join("/");
}

function parseDayFirstDate(value) {
  const match = String(value).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${yearText}-${monthText}-${dayText}`;
}

export default function DayFirstDateInput({
  name,
  value,
  onChange,
  className,
  placeholder = "dd/mm/yyyy",
}) {
  const [displayValue, setDisplayValue] = useState(formatIsoToDayFirst(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatIsoToDayFirst(value));
    }
  }, [value, isFocused]);

  function emit(nextValue) {
    onChange?.({
      target: {
        name,
        value: nextValue,
      },
    });
  }

  function handleChange(event) {
    const nextDisplayValue = normalizeTyping(event.target.value);
    setDisplayValue(nextDisplayValue);

    if (!nextDisplayValue) {
      emit("");
      return;
    }

    const parsed = parseDayFirstDate(nextDisplayValue);
    if (parsed) {
      emit(parsed);
    }
  }

  function handleBlur() {
    setIsFocused(false);

    if (!displayValue) {
      emit("");
      return;
    }

    const parsed = parseDayFirstDate(displayValue);
    if (parsed) {
      setDisplayValue(formatIsoToDayFirst(parsed));
      emit(parsed);
      return;
    }

    setDisplayValue(formatIsoToDayFirst(value));
  }

  return (
    <input
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      value={displayValue}
      onFocus={() => setIsFocused(true)}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
}
