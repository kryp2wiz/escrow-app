import React from "react";

export default function EscrowListTableSkeleton() {
  return (
    <tbody>
      {[1, 2, 3, 4, 5].map((value) => (
        <tr
          key={`escrow_list_table_loading_${value}`}
          className="border-b border-black-300 last:border-0 dark:border-white-300"
        >
          <td className="py-4 pl-8">
            <div className="h-4 w-32 animate-pulse rounded bg-black-300 dark:bg-white-300" />
          </td>
          <td>
            <div className="h-4 w-32 animate-pulse rounded bg-black-300 dark:bg-white-300" />
          </td>
          <td>
            <div className="h-4 w-24 animate-pulse rounded bg-black-300 dark:bg-white-300" />
          </td>
          <td>
            <div className="h-4 w-24 animate-pulse rounded bg-black-300 dark:bg-white-300" />
          </td>
          <td>
            <div className="mr-2 h-10 w-[90px] animate-pulse rounded bg-black-300 dark:bg-white-300" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}
