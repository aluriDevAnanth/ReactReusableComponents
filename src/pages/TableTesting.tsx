import { UserSchema, type UserType } from '../schemas';
import DataTable from './components/DataTable';
import { usersData } from '../utils/data/usersData';
import type { CellContext, ColumnDef, Row, Table } from '@tanstack/react-table';
import {
  ActionIcon,
  Button,
  Fieldset,
  Menu,
  Modal,
  NumberInput,
  Select,
  TextInput,
} from '@mantine/core';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DateInput } from '@mantine/dates';
import {
  mkConfig,
  generateCsv,
  download,
  type ColumnHeader,
} from 'export-to-csv';

function AddComponent<TData>({ table }: { table: Table<TData> }) {
  const [open, setOpen] = useState(false);
  const formState = useForm<UserType>({
    resolver: zodResolver(UserSchema),
  });

  function AddFunction(values: UserType) {
    try {
      const parsedValues = UserSchema.parse(values);
      table.options.meta?.setData((prev) => [parsedValues as TData, ...prev]);

      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <ActionIcon size={'lg'} color='green' onClick={() => setOpen(true)}>
        <Icon icon='tabler:plus' className='stroke-3 size-[70%]' />
      </ActionIcon>
      <Modal
        withCloseButton={false}
        yOffset='3vh'
        size='50vw'
        transitionProps={{
          transition: 'fade',
          duration: 200,
          timingFunction: 'linear',
        }}
        opened={open}
        onClose={() => setOpen(false)}
      >
        <div className='flex justify-center items-center w-full'>
          <form
            onSubmit={formState.handleSubmit(AddFunction)}
            className='w-full'
          >
            <Fieldset
              legend={<p className='text-2xl font-semibold'>Add User</p>}
              className='mx-auto grid grid-cols-2 gap-4'
            >
              <TextInput
                {...formState.register('name')}
                data-autofocus
                withAsterisk
                error={formState.formState.errors.name?.message}
                label='Your name'
                placeholder='Your name'
              />
              <Controller
                name='age'
                control={formState.control}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    withAsterisk
                    error={formState.formState.errors.age?.message}
                    label='Age'
                    placeholder='Your age'
                  />
                )}
              />
              <Controller
                name='eyeColor'
                control={formState.control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label='Your favorite library'
                    placeholder='Pick value'
                    error={formState.formState.errors.eyeColor?.message}
                    withAsterisk
                    data={UserSchema.shape.eyeColor.options}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />
              <Controller
                name='birthDate'
                control={formState.control}
                render={({ field }) => (
                  <DateInput
                    {...field}
                    clearable
                    withAsterisk
                    error={formState.formState.errors.birthDate?.message}
                    value={field.value || null}
                    onChange={(date) => field.onChange(date)}
                    label='Birth Date'
                    placeholder='Select your birth date'
                  />
                )}
              />
              <div>
                <Button type='submit'>Submit</Button>
              </div>
            </Fieldset>
          </form>
        </div>
      </Modal>
    </>
  );
}

function UserOpsCell({
  row,
  setData,
}: {
  row: Row<UserType>;
  setData: React.Dispatch<React.SetStateAction<UserType[]>>;
}) {
  const [open, setOpen] = useState(false);
  const formState = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: row.original,
  });

  function editFunction(values: UserType) {
    try {
      const parsedValues = UserSchema.parse(values);
      setData((prev) =>
        prev.map((p) => (p.name == parsedValues.name ? parsedValues : p)),
      );
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className='flex justify-center gap-2'>
      <Modal
        withCloseButton={false}
        yOffset='3vh'
        size='50vw'
        transitionProps={{
          transition: 'fade',
          duration: 200,
          timingFunction: 'linear',
        }}
        opened={open}
        onClose={() => setOpen(false)}
      >
        <form
          onSubmit={formState.handleSubmit(editFunction)}
          className='w-full'
        >
          <Fieldset
            legend={<p className='text-xl font-semibold'>Edit User</p>}
            className='mx-auto grid grid-cols-2 gap-4'
          >
            <TextInput
              {...formState.register('name')}
              data-autofocus
              withAsterisk
              error={formState.formState.errors.name?.message}
              label='Your name'
              placeholder='Your name'
            />
            <Controller
              name='age'
              control={formState.control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  withAsterisk
                  error={formState.formState.errors.age?.message}
                  label='Age'
                  placeholder='Your age'
                />
              )}
            />
            <Controller
              name='eyeColor'
              control={formState.control}
              render={({ field }) => (
                <Select
                  {...field}
                  label='Eye Color'
                  placeholder='Pick value'
                  error={formState.formState.errors.eyeColor?.message}
                  withAsterisk
                  data={UserSchema.shape.eyeColor.options}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
            <Controller
              name='birthDate'
              control={formState.control}
              render={({ field }) => (
                <DateInput
                  {...field}
                  clearable
                  withAsterisk
                  error={formState.formState.errors.birthDate?.message}
                  value={field.value || null}
                  onChange={(date) => field.onChange(date)}
                  label='Birth Date'
                  placeholder='Select your birth date'
                />
              )}
            />
            <div>
              <Button type='submit'>Submit</Button>
            </div>
          </Fieldset>
        </form>
      </Modal>

      <Menu>
        <Menu.Target>
          <ActionIcon size='sm'>
            <Icon icon='tabler:dots-vertical' className='size-4' />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            onClick={() => setOpen(true)}
            leftSection={<Icon icon='tabler:pencil' className='size-4' />}
          >
            Edit User
          </Menu.Item>
          <Menu.Item
            color='red'
            leftSection={<Icon icon='tabler:trash' className='size-4' />}
          >
            Delete User
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <ActionIcon onClick={() => row.toggleExpanded()} size='sm'>
        {!row.getIsExpanded() ? (
          <Icon icon='tabler:chevron-down' className='size-4' />
        ) : (
          <Icon icon='tabler:chevron-right' className='size-4' />
        )}
      </ActionIcon>
    </div>
  );
}

function RowExpansion<TData>({ row }: { row: Row<TData> }) {
  return (
    <>
      <div className='grid p-2'>
        <h2 className=' font-bold'>More Details</h2>
        <pre>{JSON.stringify(row.original, null, 2)}</pre>
      </div>
    </>
  );
}

function handleExportToCSV<TData>(table: Table<TData>) {
  const columns = table
    .getVisibleLeafColumns()
    .map((col) => col.id != 'Ops' && col.id)
    .filter(Boolean);

  const rows = table
    .getSortedRowModel()
    .rows.map((r) =>
      Object.fromEntries(
        Object.entries(r.original as Record<string, unknown>).map(([k, v]) => [
          k,
          v instanceof Date
            ? v.toISOString().split('T')[0]
            : (v as string | number | boolean | null | undefined),
        ]),
      ),
    );

  const csvConfig = mkConfig({
    fieldSeparator: ',',
    columnHeaders: columns.map((col) => ({
      key: col,
      displayLabel: col,
    })) as ColumnHeader[],
    filename: `UsersTableData`,
    decimalSeparator: '.',
  });

  const csv = generateCsv(csvConfig)(rows);
  download(csvConfig)(csv);
}

export default function TableTesting() {
  const [data, setData] = useState(UserSchema.array().parse(usersData));

  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: 'Ops',
      header: 'Ops',
      enableColumnFilter: false,
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => <UserOpsCell row={row} setData={setData} />,
      size: 100,
      footer: (props) => props.column.id,
      meta: {
        isActionColumn: true,
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { filterVariant: 'text' },
      footer: (props) => props.column.id,
    },
    {
      accessorKey: 'age',
      header: 'Age',
      meta: { filterVariant: 'numberRange' },
      footer: (props) => props.column.id,
    },
    {
      accessorKey: 'eyeColor',
      header: 'Eye Color',
      filterFn: 'arrIncludesSome',
      meta: { filterVariant: 'select' },
      footer: (props) => props.column.id,
    },
    {
      accessorKey: 'birthDate',
      header: 'Birth Date',
      meta: { filterVariant: 'dateRange' },
      filterFn: 'dateBetweenFilterFn',
      footer: (props) => props.column.id,
      cell: (cellContext: CellContext<UserType, unknown>) => {
        const value = cellContext.getValue();
        return value instanceof Date
          ? value.toISOString().split('T')[0]
          : String(value);
      },
    },
  ];

  return (
    <DataTable<UserType, unknown>
      data={data}
      setData={setData}
      tableTitle='UsersTable'
      columns={columns}
      rowsPerPageOptions={[10, 20, 50, 100]}
      rowsPerPage={10}
      AddComponent={AddComponent}
      RowExpansion={RowExpansion}
      handleExportToCSV={handleExportToCSV}
    />
  );
}
