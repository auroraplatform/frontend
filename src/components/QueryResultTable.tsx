import React from 'react'
import { Table, ChevronRight, Database } from 'lucide-react'

type DynamicRow = (string | number | boolean | null | undefined)[]

interface QueryResultTableProps {
  execution: {
    success: boolean
    data: DynamicRow[]
    columns: string[]
  }
  maxHeight?: string
}

export function QueryResultTable({ execution, maxHeight = "max-h-96" }: QueryResultTableProps) {
  if (!execution.success || !execution.data || execution.data.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50/60 dark:bg-slate-800/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
        <Database className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-slate-600 dark:text-slate-400">No data returned</p>
      </div>
    )
  }

  const { columns, data } = execution

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Table className="w-4 h-4 text-white" />
        </div>
        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
          Query Results ({data.length} rows)
        </h4>
      </div>

      <div className="overflow-hidden bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
        {/* Table container with horizontal and vertical scroll */}
        <div className={`overflow-x-auto ${maxHeight} overflow-y-auto`}>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-700/80 border-b border-slate-200/50 dark:border-slate-600/50">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap sticky top-0 bg-slate-100/90 dark:bg-slate-700/90 backdrop-blur-sm z-10"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-600/50">
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors duration-150"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap"
                    >
                      {cell === 'N/A' ? (
                        <span className="text-slate-400 dark:text-slate-500 italic">
                          N/A
                        </span>
                      ) : (
                        <span className="break-words">{cell}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Show row count and scroll hint if table is wide */}
        {columns.length > 6 && (
          <div className="px-6 py-3 bg-slate-50/60 dark:bg-slate-800/60 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            {/* <span>{data.length} rows returned</span> */}
            <div className="flex items-center space-x-1">
              <span>Scroll horizontally to see more columns</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
