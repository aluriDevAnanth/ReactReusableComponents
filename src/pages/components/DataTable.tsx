import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type Table as TSTable,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
  type Column,
  type FilterFn,
  type TableState,
  type Row,
  type RowData,
} from '@tanstack/react-table';

import {
  useMemo,
  type JSX,
  type CSSProperties,
  useEffect,
  useState,
  useRef,
  Fragment,
} from 'react';

import {
  Table,
  TextInput,
  NumberInput,
  Select,
  Button,
  Menu,
  Pagination,
  Checkbox,
  MultiSelect,
  ActionIcon,
  useMantineColorScheme,
  type MantineColorScheme,
} from '@mantine/core';

import { Icon } from '@iconify/react';
import type { Dispatch, SetStateAction } from 'react';
import { DateInput } from '@mantine/dates';
import dayjs, { Dayjs } from 'dayjs';
import { useDebouncedCallback, useFullscreen } from '@mantine/hooks';

import clsx from 'clsx';
import { ReactSortable } from 'react-sortablejs';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    filterVariant?: 'text' | 'number' | 'numberRange' | 'select' | 'dateRange';
    isActionColumn?: boolean;
  }
  interface FilterFns {
    dateBetweenFilterFn: FilterFn<unknown>;
  }
  interface TableMeta<TData extends RowData> {
    setData: Dispatch<SetStateAction<TData[]>>;
  }
}

export default function DataTable<TData, TValue>({
  data,
  setData,
  tableTitle,
  columns,
  rowsPerPageOptions,
  rowsPerPage,
  AddComponent,
  RowExpansion,
  handleExportToCSV,
}: {
  data: TData[];
  setData: Dispatch<SetStateAction<TData[]>>;
  tableTitle: string;
  columns: ColumnDef<TData, TValue>[];
  rowsPerPageOptions: number[];
  rowsPerPage: number;
  AddComponent: <TData>({ table }: { table: TSTable<TData> }) => JSX.Element;
  RowExpansion: <TData>({ row }: { row: Row<TData> }) => JSX.Element;
  handleExportToCSV: <TData>(table: TSTable<TData>) => void;
}) {
  const [tableState, setTableState] = useState(() => {
    const saved = localStorage.getItem(tableTitle);
    return saved ? JSON.parse(saved) : {};
  });

  const dateBetweenFilterFn: FilterFn<TData> = (row, columnId, value) => {
    const cellValue = dayjs(row.getValue(columnId));
    const [start, end] = value as [Dayjs | null, Dayjs | null];

    if (!cellValue.isValid()) return false;

    if (start && !end?.isValid()) {
      return dayjs(start).isBefore(dayjs(cellValue));
    } else if (!start?.isValid() && end) {
      return dayjs(cellValue).isBefore(dayjs(end));
    } else if (start && end && start?.isValid() && end?.isValid()) {
      return (
        dayjs(start).isBefore(dayjs(cellValue)) &&
        dayjs(cellValue).isBefore(dayjs(end))
      );
    }

    return true;
  };

  const table = useReactTable({
    data,
    columns,
    enableColumnResizing: true,
    columnResizeMode: 'onEnd',
    state: tableState,
    onStateChange: (updater) => {
      setTableState((prev: TableState) =>
        typeof updater === 'function' ? updater(prev) : updater,
      );
    },
    filterFns: {
      dateBetweenFilterFn: dateBetweenFilterFn,
    },
    meta: { setData },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const ts = table.getState();

  useEffect(() => {
    localStorage.setItem(tableTitle, JSON.stringify(table.getState()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ts]);

  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getState().columnSizingInfo]);

  const { colorScheme } = useMantineColorScheme();

  const { ref, toggle, fullscreen } = useFullscreen();
  const containerRef = useRef<HTMLTableElement | null>(null);

  return (
    <div
      ref={ref}
      className={clsx(
        'p-4',
        colorScheme == 'light'
          ? fullscreen && 'bg-white'
          : fullscreen && 'bg-[#242424]',
      )}
    >
      <div className='flex justify-between items-center mb-3'>
        <div className='flex gap-3 items-center'>
          <p className='font-semibold text-2xl'>{tableTitle}</p>
          <GlobalFilter table={table} />
        </div>
        <div className='flex gap-3'>
          <AddComponent<TData> table={table} />
          <ColumnVisibilityMenu<TData> table={table} />
          <ActionIcon size='lg' onClick={toggle}>
            {fullscreen ? (
              <Icon icon='tabler:arrows-minimize' className='size-6' />
            ) : (
              <Icon icon='tabler:arrows-maximize' className='size-6' />
            )}
          </ActionIcon>
          <ActionIcon onClick={() => handleExportToCSV(table)} size='lg'>
            <Icon icon='tabler:file-type-csv' className='size-6' />
          </ActionIcon>
          <Settings<TData> table={table} />
        </div>
      </div>

      <div ref={containerRef} className='relative'>
        <Table.ScrollContainer
          scrollAreaProps={{ scrollHideDelay: 500, offsetScrollbars: true }}
          className='max-w-fit'
          minWidth={'80vw'}
          maxHeight={'80vh'}
        >
          <Table
            stickyHeader
            style={{
              ...columnSizeVars,
              width: table.getTotalSize(),
            }}
            striped
            withTableBorder
            withColumnBorders
          >
            <Table.Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Table.Th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        width: `calc(var(--header-${header?.id}-size) * 1px)`,
                        position: 'relative',
                        ...getCommonPinningStyles(header.column, colorScheme),
                      }}
                    >
                      {!header.column.columnDef.meta?.isActionColumn ? (
                        header.isPlaceholder ? null : (
                          <div
                            className={`flex items-center justify-between gap-2  ${
                              header.column.getCanSort()
                                ? 'cursor-pointer select-none'
                                : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <div className='flex gap-2 items-center'>
                              <p className='select-none'>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </p>
                              {
                                {
                                  asc: (
                                    <Icon
                                      icon='tabler:arrow-narrow-up'
                                      className='size-4'
                                    />
                                  ),
                                  desc: (
                                    <Icon
                                      icon='tabler:arrow-narrow-down'
                                      className='size-4'
                                    />
                                  ),
                                  false: (
                                    <Icon
                                      icon='tabler:arrows-down-up'
                                      className='size-4 opacity-70'
                                    />
                                  ),
                                }[header.column.getIsSorted() as string]
                              }
                            </div>

                            {!header.isPlaceholder &&
                              header.column.getCanPin() && (
                                <div className='mr-3 flex gap-2 items-center'>
                                  {header.column.getIsPinned() !== 'left' ? (
                                    <ActionIcon
                                      size='xs'
                                      className='border rounded px-2'
                                      onClick={() => {
                                        header.column.pin('left');
                                      }}
                                    >
                                      <Icon icon='tabler:chevron-left' />
                                    </ActionIcon>
                                  ) : null}
                                  {header.column.getIsPinned() ? (
                                    <ActionIcon
                                      size='xs'
                                      className='border rounded px-2'
                                      onClick={() => {
                                        header.column.pin(false);
                                      }}
                                    >
                                      <Icon icon='tabler:x' />
                                    </ActionIcon>
                                  ) : null}
                                  {header.column.getIsPinned() !== 'right' ? (
                                    <ActionIcon
                                      size='xs'
                                      className='border rounded px-2'
                                      onClick={() => {
                                        header.column.pin('right');
                                      }}
                                    >
                                      <Icon icon='tabler:chevron-right' />
                                    </ActionIcon>
                                  ) : null}
                                </div>
                              )}
                          </div>
                        )
                      ) : header.isPlaceholder ? null : (
                        <div
                          className={`flex-col items-center justify-between space-y-2 max-w-fit mx-auto ${
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className='flex gap-2 items-center max-w-fit'>
                            <p>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </p>
                            {
                              {
                                asc: (
                                  <Icon
                                    icon='tabler:arrow-narrow-up'
                                    className='size-4'
                                  />
                                ),
                                desc: (
                                  <Icon
                                    icon='tabler:arrow-narrow-down'
                                    className='size-4'
                                  />
                                ),
                                false: (
                                  <Icon
                                    icon='tabler:arrows-down-up'
                                    className='size-4 opacity-70'
                                  />
                                ),
                              }[header.column.getIsSorted() as string]
                            }
                          </div>

                          {!header.isPlaceholder &&
                            header.column.getCanPin() && (
                              <div className='flex gap-2 items-center max-w-fit'>
                                {header.column.getIsPinned() !== 'left' ? (
                                  <ActionIcon
                                    size='xs'
                                    className='border rounded px-2'
                                    onClick={() => {
                                      header.column.pin('left');
                                    }}
                                  >
                                    <Icon icon='tabler:chevron-left' />
                                  </ActionIcon>
                                ) : null}
                                {header.column.getIsPinned() ? (
                                  <ActionIcon
                                    size='xs'
                                    className='border rounded px-2'
                                    onClick={() => {
                                      header.column.pin(false);
                                    }}
                                  >
                                    <Icon icon='tabler:x' />
                                  </ActionIcon>
                                ) : null}
                                {header.column.getIsPinned() !== 'right' ? (
                                  <ActionIcon
                                    size='xs'
                                    className='border rounded px-2'
                                    onClick={() => {
                                      header.column.pin('right');
                                    }}
                                  >
                                    <Icon icon='tabler:chevron-right' />
                                  </ActionIcon>
                                ) : null}
                              </div>
                            )}
                        </div>
                      )}

                      {header.column.getCanFilter() && (
                        <div className='mt-1 mr-3'>
                          <ColumnFilter column={header.column} />
                        </div>
                      )}

                      {header.column.getCanResize() && (
                        <div
                          {...{
                            onDoubleClick: () => header.column.resetSize(),
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className: `absolute right-0 top-0 h-full w-1 cursor-col-resize select-none `,
                          }}
                        />
                      )}
                    </Table.Th>
                  ))}
                </Table.Tr>
              ))}
            </Table.Thead>

            <TableBody<TData> table={table} RowExpansion={RowExpansion} />
          </Table>
        </Table.ScrollContainer>
        {table.getState().columnSizingInfo.isResizingColumn && (
          <div
            className='absolute top-0 bg-blue-500 w-[2px] z-10 transition-all duration-75'
            style={{
              height: containerRef.current?.offsetHeight ?? 0,
              left:
                (table.getState().columnSizingInfo.startOffset ?? 0) +
                (table.getState().columnSizingInfo.deltaOffset ?? 0) -
                12,
            }}
          />
        )}
      </div>

      <div className='mt-4 flex justify-between items-center'>
        <div className='flex gap-3 items-center'>
          <p className='text-sm text-gray-700 dark:text-slate-50'>
            {`${table.getFilteredRowModel().rows.length} of ${
              table.getPrePaginationRowModel().rows.length
            } rows`}
          </p>
          <NumberInput
            className='w-20'
            value={table.getState().pagination.pageIndex + 1}
            onChange={(value) => {
              const pageIndex = value ? Number(value) - 1 : 0;
              if (pageIndex >= 0 && pageIndex < table.getPageCount()) {
                table.setPageIndex(pageIndex);
              }
            }}
          />
        </div>
        <Pagination
          className='mx-auto'
          total={table.getPageCount()}
          value={table.getState().pagination.pageIndex + 1}
          onChange={(page) => table.setPageIndex(page - 1)}
          siblings={2}
          boundaries={2}
        />
        <div>
          <Select
            data={rowsPerPageOptions.map((q) => q.toString())}
            withCheckIcon
            value={
              table.getState().pagination?.pageSize.toString() ||
              rowsPerPage.toString()
            }
            onChange={(value) =>
              table.setPageSize(
                parseInt(
                  value || table.getState().pagination?.pageSize.toString(),
                  10,
                ),
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

function TableBody<TData>({
  table,
  RowExpansion,
}: {
  table: TSTable<TData>;
  RowExpansion: <TData>({ row }: { row: Row<TData> }) => JSX.Element;
}) {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Table.Tbody>
      {table.getRowModel().rows.map((row) => (
        <Fragment key={row.id}>
          <Table.Tr>
            {row.getVisibleCells().map((cell) => (
              <Table.Td
                key={cell.id}
                style={{
                  width: cell.column.getSize(),
                  ...getCommonPinningStyles(cell.column, colorScheme),
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Td>
            ))}
          </Table.Tr>
          {row.getIsExpanded() && (
            <Table.Tr>
              <Table.Td
                colSpan={table.getAllColumns().length}
                className='border-3 dark:border-gray-500 border-gray-300  '
              >
                <RowExpansion<TData> row={row} />
              </Table.Td>
            </Table.Tr>
          )}
        </Fragment>
      ))}
    </Table.Tbody>
  );
}

function getCommonPinningStyles<TData>(
  column: Column<TData>,
  colorScheme: MantineColorScheme,
): CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right');

  return {
    boxShadow: isLastLeftPinnedColumn
      ? '-4px 0 4px -4px gray inset'
      : isFirstRightPinnedColumn
      ? '4px 0 4px -4px gray inset'
      : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: 1,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
    backgroundColor: isPinned
      ? colorScheme == 'dark'
        ? 'black'
        : 'white'
      : undefined,
  };
}

function GlobalFilter<TData>({ table }: { table: TSTable<TData> }) {
  const [value, setValue] = useState(table.getState().globalFilter);

  const debounced = useDebouncedCallback(
    (value: string) => {
      table.setGlobalFilter(value);
    },
    { delay: 300, flushOnUnmount: true },
  );

  return (
    <TextInput
      rightSection={
        table.getState().globalFilter && (
          <Icon
            onClick={() => {
              table.resetGlobalFilter();
              setValue('');
            }}
            icon='tabler:x'
            className='size-5 text-red-500 cursor-pointer'
          />
        )
      }
      placeholder='Search...'
      className='w-full'
      value={value}
      onChange={(e) => {
        const input = e.currentTarget.value;
        setValue(input);
        debounced(input);
      }}
    />
  );
}

function ColumnFilter<TData, TValue>({
  column,
}: {
  column: Column<TData, TValue>;
}) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  // === Top-level state ===
  const [textValue, setTextValue] = useState(String(columnFilterValue ?? ''));
  const [numberValue, setNumberValue] = useState<number | ''>(
    Number(columnFilterValue) || '',
  );
  const [numberMin, setNumberMin] = useState<number | ''>(
    (columnFilterValue as [number, number])?.[0] ?? '',
  );
  const [numberMax, setNumberMax] = useState<number | ''>(
    (columnFilterValue as [number, number])?.[1] ?? '',
  );
  const [dateStart, setDateStart] = useState<Dayjs | null>(
    (columnFilterValue as [Dayjs | null, Dayjs | null])?.[0] ?? null,
  );
  const [dateEnd, setDateEnd] = useState<Dayjs | null>(
    (columnFilterValue as [Dayjs | null, Dayjs | null])?.[1] ?? null,
  );

  // === Debounced callbacks ===
  const debouncedText = useDebouncedCallback(
    (val: string) => {
      column.setFilterValue(val);
    },
    { delay: 300, flushOnUnmount: true },
  );

  const debouncedNumber = useDebouncedCallback(
    (val: number | '') => {
      column.setFilterValue(val === 0 || val ? val : '');
    },
    { delay: 300, flushOnUnmount: true },
  );

  const debouncedNumberRange = useDebouncedCallback(
    (val: [number | '', number | '']) => {
      column.setFilterValue(val);
    },
    { delay: 300, flushOnUnmount: true },
  );

  const debouncedDateRange = useDebouncedCallback(
    (val: [Dayjs | null, Dayjs | null]) => {
      column.setFilterValue(val);
    },
    { delay: 300, flushOnUnmount: true },
  );

  // === Render filters ===
  if (filterVariant === 'numberRange') {
    const facetedValues = Array.from(
      column.getFacetedUniqueValues()?.keys() ?? [],
    );
    const numericValues = facetedValues.filter(
      (v) => typeof v === 'number',
    ) as number[];
    const minVal = Math.min(...numericValues);
    const maxVal = Math.max(...numericValues);

    console.log(numberMin, 111, numberMax);

    return (
      <div className='flex gap-3 items-center'>
        <NumberInput
          value={numberMin}
          onChange={(value) => {
            setNumberMin(value as number);
            debouncedNumberRange([value as number, numberMax]);
          }}
          placeholder={`Min (${minVal})`}
          thousandsGroupStyle={'lakh'}
          min={minVal}
          max={maxVal}
          className='w-full'
        />
        <NumberInput
          value={numberMax}
          onChange={(value) => {
            setNumberMax(value as number);
            debouncedNumberRange([numberMin, value as number]);
          }}
          placeholder={`Max (${maxVal})`}
          thousandsGroupStyle={'lakh'}
          min={minVal}
          max={maxVal}
          className='w-full'
        />
      </div>
    );
  }

  if (filterVariant === 'select') {
    const facetedOptions = Array.from(
      column.getFacetedUniqueValues()?.keys() ?? [],
    ).sort();

    return (
      <MultiSelect
        onChange={(val) => column.setFilterValue(val)}
        clearable
        searchable
        hidePickedOptions
        data={facetedOptions.map((option) => ({
          label: String(option),
          value: String(option),
        }))}
        value={
          columnFilterValue
            ? Array.isArray(columnFilterValue)
              ? columnFilterValue
              : [columnFilterValue]
            : []
        }
      />
    );
  }

  if (filterVariant === 'number') {
    const facetedValues = Array.from(
      column.getFacetedUniqueValues()?.keys() ?? [],
    );
    const numericValues = facetedValues.filter(
      (v) => typeof v === 'number',
    ) as number[];
    const minVal = Math.min(...numericValues);
    const maxVal = Math.max(...numericValues);

    return (
      <NumberInput
        value={numberValue}
        onChange={(value) => {
          setNumberValue(value as number);
          debouncedNumber(value as number);
        }}
        placeholder={`${minVal} - ${maxVal}`}
        className='w-full'
      />
    );
  }

  if (filterVariant === 'dateRange') {
    const startDayjs = dateStart ? dayjs(dateStart) : null;
    const endDayjs = dateEnd ? dayjs(dateEnd) : null;

    return (
      <div>
        <div className='flex space-x-2'>
          <DateInput
            value={dateStart?.toDate()}
            onChange={(value) => {
              setDateStart(value ? dayjs(value) : null);
              debouncedDateRange([value ? dayjs(value) : null, endDayjs]);
            }}
            placeholder='Start date'
            valueFormat='YYYY-MM-DD'
            className='w-full'
            clearable
          />
          <DateInput
            clearable
            value={dateEnd?.toDate()}
            onChange={(value) => {
              setDateEnd(value ? dayjs(value) : null);
              debouncedDateRange([startDayjs, value ? dayjs(value) : null]);
            }}
            placeholder='End date'
            valueFormat='YYYY-MM-DD'
            className='w-full'
          />
        </div>
        <div className='h-1' />
      </div>
    );
  }

  return (
    <TextInput
      value={textValue}
      onChange={(e) => {
        const val = e.currentTarget.value;
        setTextValue(val);
        debouncedText(val);
      }}
      placeholder='Filter'
      className='w-full'
    />
  );
}

function ColumnVisibilityMenu<TData>({ table }: { table: TSTable<TData> }) {
  type SortableItem = {
    id: string;
  };

  const initialOrder = table.getAllLeafColumns().map((col) => ({ id: col.id }));
  const [columnOrder, setColumnOrder] = useState<SortableItem[]>(initialOrder);

  const handleSort = (newOrder: SortableItem[]) => {
    setColumnOrder(newOrder);
    table.setColumnOrder(newOrder.map((item) => item.id));
  };

  return (
    <Menu trigger='hover' closeOnItemClick={false}>
      <Menu.Target>
        <Button>Columns</Button>
      </Menu.Target>

      <Menu.Dropdown>
        <ReactSortable
          list={columnOrder}
          setList={handleSort}
          animation={200}
          handle='.drag-handle'
          direction='vertical'
          ghostClass='sortable-ghost'
        >
          {columnOrder.map((item) => {
            const column = table.getColumn(item.id);
            if (!column) return null;
            return (
              <div
                key={item.id}
                className='flex items-center gap-2 px-2 py-2 group dark:hover:bg-dark-400 rounded'
              >
                <Icon
                  icon='ic:round-drag-indicator'
                  className='size-5  drag-handle'
                />
                <Checkbox
                  label={item.id}
                  checked={column.getIsVisible()}
                  onChange={() =>
                    column.toggleVisibility(!column.getIsVisible())
                  }
                />
              </div>
            );
          })}
        </ReactSortable>
      </Menu.Dropdown>
    </Menu>
  );
}

function Settings<TData>({ table }: { table: TSTable<TData> }) {
  return (
    <Menu trigger='hover' closeOnItemClick={false}>
      <Menu.Target>
        <ActionIcon color='red' size={'lg'}>
          <Icon icon='tabler:settings' className='size-5' strokeWidth={4} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<Icon icon='tabler:trash' className='size-5 stroke-3' />}
          color='red'
          onClick={() => {
            table.resetColumnFilters();
            table.resetGlobalFilter();
          }}
        >
          Reset All Filters
        </Menu.Item>
        <Menu.Item
          color='red'
          leftSection={<Icon icon='tabler:trash' className='size-5 stroke-3' />}
          onClick={() => table.resetSorting()}
        >
          Reset All Sorting
        </Menu.Item>
        <Menu.Item
          color='red'
          leftSection={<Icon icon='tabler:trash' className='size-5 stroke-3' />}
          onClick={() => table.resetColumnVisibility()}
        >
          Reset Column Visibility
        </Menu.Item>
        <Menu.Item
          color='red'
          leftSection={<Icon icon='tabler:trash' className='size-5 stroke-3' />}
          onClick={() => table.resetColumnOrder()}
        >
          Reset Column Order
        </Menu.Item>
        <Menu.Item
          color='red'
          leftSection={<Icon icon='tabler:trash' className='size-5 stroke-3' />}
          onClick={() => table.resetColumnPinning()}
        >
          Reset Column Pinning
        </Menu.Item>
        <Menu.Item
          color='red'
          leftSection={<Icon icon='tabler:trash' className='size-5 stroke-3' />}
          onClick={() => table.resetColumnSizing()}
        >
          Reset Column Sizing
        </Menu.Item>
        <Menu.Item
          color='red'
          leftSection={<Icon icon='tabler:trash' className='size-5 stroke-3' />}
          onClick={() => table.resetPagination()}
        >
          Reset Pagination
        </Menu.Item>
        <Menu.Item
          color='red'
          leftSection={<Icon icon='tabler:trash' className='size-5 stroke-3' />}
          onClick={() => table.reset()}
        >
          Reset Table State
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
