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
import { Escrow, EscrowActionType, TokenMeta } from "@/types";
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
import EscrowListTableSkeleton from "./skeleton";
import TokenLogo from "@/components/TokenLogo";

const calculateActionType = (
  publicKey: string | null | undefined,
  escrow: Escrow
): EscrowActionType => {
  if (!publicKey) {
    return EscrowActionType.NOT_CONNECTED;
  }
  return publicKey === escrow.initializer ? EscrowActionType.CLOSE : EscrowActionType.ACCEPT;
};

const EscrowList = ({
  loading,
  metadata,
  data,
  onAction,
}: {
  loading: boolean;
  metadata: Map<string, TokenMeta>;
  data?: Escrow[];
  onAction: (type: EscrowActionType, escrow: Escrow) => void;
}) => {
  const { publicKey } = useWallet();

  const columns: ColumnDef<Escrow>[] = React.useMemo(
    () => [
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
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <TokenLogo
              url={metadata?.get(row.original.mintA)?.image}
              alt={metadata?.get(row.original.mintA)?.symbol}
            />
            <div>{row.original.initializerAmount}</div>
          </div>
        ),
      },
      {
        id: "taker_amount",
        header: "Taker Amount",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <TokenLogo
              url={metadata?.get(row.original.mintB)?.image}
              alt={metadata?.get(row.original.mintB)?.symbol}
            />
            <div>{row.original.takerAmount}</div>
          </div>
        ),
      },
      {
        id: "action",
        enableHiding: true,
        cell: ({ row }) => {
          const actionType = calculateActionType(publicKey?.toBase58(), row.original);

          switch (actionType) {
            case EscrowActionType.NOT_CONNECTED:
              return <WalletConnectButton />;
            case EscrowActionType.CLOSE:
            case EscrowActionType.ACCEPT:
              return (
                <AlertDialog>
                  <AlertDialogTrigger disabled={loading}>
                    <Button className="!m-0" disabled={loading}>
                      {actionType === EscrowActionType.CLOSE ? "Close" : "Accept"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {actionType === EscrowActionType.CLOSE
                          ? "Are you sure you want to close this escrow?"
                          : "Are you sure you want to accept this escrow?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {actionType === EscrowActionType.CLOSE
                          ? "Closing this escrow will cancel the transaction. Any funds or tokens associated with this escrow will remain in your account. This action cannot be undone."
                          : "Accepting this escrow will finalize the transaction. Your specified tokens or funds will be transferred, and this action cannot be undone."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onAction(actionType, row.original)}
                        disabled={loading}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              );
            default:
              return null;
          }
        },
      },
    ],
    [publicKey, metadata, loading, onAction]
  );

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
  });

  return (
    <div className="flex flex-1">
      <Table className="w-full min-w-[700px] table-fixed md:text-lg">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="pl-4"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      header.column.getCanSort() ? "cursor-pointer select-none" : ""
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
        {data === undefined ? (
          <EscrowListTableSkeleton />
        ) : data.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} className="h-52 text-center">
                <span>No escrows available</span>
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className={cn({ "opacity-70": loading })}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
};

export default EscrowList;
