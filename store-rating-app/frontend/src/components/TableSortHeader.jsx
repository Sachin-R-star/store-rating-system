import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export function TableSortHeader({ label, field, currentSortBy, currentSortOrder, onSort }) {
  const isActive = currentSortBy && currentSortBy.toLowerCase() === field.toLowerCase();

  return (
    <th className="sortable" onClick={() => onSort(field)}>
      <div className="th-content">
        <span>{label}</span>
        {isActive ? (
          currentSortOrder.toUpperCase() === 'ASC' ? (
            <ArrowUp size={13} color="var(--primary)" strokeWidth={2.5} />
          ) : (
            <ArrowDown size={13} color="var(--primary)" strokeWidth={2.5} />
          )
        ) : (
          <ArrowUpDown size={13} color="var(--text-dim)" strokeWidth={1.8} />
        )}
      </div>
    </th>
  );
}
