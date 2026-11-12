import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/Card';

export interface DataTableColumn<Row> {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
  className?: string;
}

interface DataTableProps<Row> {
  title: string;
  description?: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowKey: (row: Row) => string | number;
  emptyMessage?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  minWidth?: string;
}

function DataTable<Row>({
  title,
  description,
  columns,
  rows,
  getRowKey,
  emptyMessage = 'Nenhum registro encontrado.',
  toolbar,
  footer,
  minWidth = '760px',
}: DataTableProps<Row>) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && (
            <CardDescription className="mt-1">{description}</CardDescription>
          )}
        </div>
        {toolbar}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ minWidth }}>
            <thead>
              <tr className="bg-muted/40 text-xs text-muted-foreground">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3.5 font-medium first:pl-5 last:pr-5 ${column.className ?? ''}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="transition-colors hover:bg-muted/30"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-4 first:pl-5 last:pr-5 ${column.className ?? ''}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {footer && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5 text-xs text-muted-foreground">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DataTable;
