"use client";

import { useState } from "react";

interface ExpandableDescriptionProps {
  description: string;
  maxLength?: number;
}

export function ExpandableDescription({ description, maxLength = 200 }: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = description.length > maxLength;
  const displayText = isExpanded || !shouldTruncate
    ? description
    : description.slice(0, maxLength) + "...";

  return (
    <div className="space-y-2">
      <p className="text-neutral-700 leading-relaxed">
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#CE7F78] text-sm font-medium hover:underline"
        >
          {isExpanded ? "Ver menos" : "Ver mais"}
        </button>
      )}
    </div>
  );
}
