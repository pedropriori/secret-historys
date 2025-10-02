"use client";
import { useState, KeyboardEvent, FocusEvent } from "react";

interface TagInputProps {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}

export default function TagInput({ label, placeholder, value, onChange, className = "" }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
    }
    setInputValue("");
  };

  const addMultipleTags = (tagsString: string) => {
    const tags = tagsString
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag && !value.includes(tag));

    if (tags.length > 0) {
      onChange([...value, ...tags]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Check if input contains commas for multiple tags
      if (inputValue.includes(",")) {
        addMultipleTags(inputValue);
      } else {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      removeTag(value[value.length - 1]);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    // Add tag when clicking outside if there's text
    if (inputValue.trim()) {
      if (inputValue.includes(",")) {
        addMultipleTags(inputValue);
      } else {
        addTag(inputValue);
      }
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Limpar todas
          </button>
        )}
      </div>

      {/* Input field */}
      <div className="min-h-[42px] border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Existing tags */}
          {value.map((tag, index) => {
            const colors = [
              "bg-blue-100 text-blue-800",
              "bg-green-100 text-green-800",
              "bg-purple-100 text-purple-800",
              "bg-pink-100 text-pink-800",
              "bg-yellow-100 text-yellow-800",
              "bg-indigo-100 text-indigo-800"
            ];
            const colorClass = colors[index % colors.length];

            return (
              <span
                key={index}
                className={`inline-flex items-center gap-1 ${colorClass} text-sm px-2 py-1 rounded-md`}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:opacity-70 ml-1 font-bold"
                  aria-label={`Remover ${tag}`}
                >
                  ×
                </button>
              </span>
            );
          })}

          {/* Input field */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={value.length === 0 ? placeholder : "Digite e pressione Enter..."}
            className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm"
          />
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-1">
        Digite e pressione Enter para adicionar. Use vírgulas para múltiplas tags: "tag1, tag2, tag3"
      </p>
    </div>
  );
}
