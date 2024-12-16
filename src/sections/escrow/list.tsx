"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, truncateAddress } from "@/lib/utils";
import { Escrow, EscrowActionType } from "@/types";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletConnectButton from "@/components/WalletConnectButton";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const calculateActionType = (
  publicKey: string | null | undefined,
  escrow: Escrow
): EscrowActionType => {
  if (!publicKey) {
    return EscrowActionType.NOT_CONNECTED;
  }

  if (publicKey === escrow.initializer) {
    return EscrowActionType.CLOSE;
  }

  return EscrowActionType.ACCEPT;
};

const columns: ColumnDef<Escrow>[] = [
  {
    id: "address",
    header: "Escrow",
    cell: ({ row }) => <div>{truncateAddress(row.original.address, 8)}</div>,
  },
  {
    id: "initializer",
    header: "Initializer",
    cell: ({ row }) => <div>{truncateAddress(row.original.initializer, 8)}</div>,
  },
  {
    id: "initializer_amount",
    header: "Initial Amount",
    cell: ({ row }) => <div>{row.original.initializerAmount}</div>,
  },
  {
    id: "taker_amount",
    header: "Taker Amount",
    cell: ({ row }) => <div>{row.original.takerAmount}</div>,
  },
  {
    id: "action",
    enableHiding: true,
    //@ts-ignore
    cell: ({ row, actionType, onAction }) => {
      switch (actionType) {
        case EscrowActionType.NOT_CONNECTED:
          return <WalletConnectButton />;

        case EscrowActionType.CLOSE:
        case EscrowActionType.ACCEPT:
          return (
            <AlertDialog>
              <AlertDialogTrigger>
                <Button className="!m-0">
                  {actionType === EscrowActionType.CLOSE ? "Close" : "Accept"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {actionType === EscrowActionType.CLOSE
                      ? "Closing will cancel the escrow. Any funds or tokens associated with this escrow will remain in your account. This action cannot be undone."
                      : "Accepting will finalize the escrow. Your specified tokens or funds will be transferred, and the transaction will be irreversible. "}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onAction(actionType, row.original)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
      }
    },
  },
];

const EscrowList = ({
  loading,
  data,
  onAction,
}: {
  loading: boolean;
  data?: Escrow[];
  onAction: (type: EscrowActionType, escrow: Escrow) => void;
}) => {
  const { publicKey } = useWallet();

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
  });

  return (
    <div className="flex flex-1">
      <Table className="w-full min-w-[700px] table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="pl-4"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      header.column.getCanSort() ? "select-none" : ""
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        {data ? (
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="cursor-pointer">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-4">
                      {flexRender(cell.column.columnDef.cell, {
                        ...cell.getContext(),
                        actionType: calculateActionType(publicKey?.toBase58(), row.original),
                        onAction,
                        loading,
                      })}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-52 text-center">
                  <span>No Escrows available</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        ) : (
          // <PoolsListTableSkeleton />
          <div>Loading...</div>
        )}
      </Table>
    </div>
  );
};

export default EscrowList;
