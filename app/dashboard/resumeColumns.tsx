"use client";

import { PencilIcon, TrashIcon, ViewIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button";


export type ResumeVersion = {
    id: string;
    label: string;
    fileName: string;
    fileUrl: string;
    createdAt: Date;
}

type ResumeColumnActions = {
    onDelete: (id: string) => void
    onEdit: (id: string) => void
    onViewPdf: (fileUrl: string) => void
}


export const createColumns = (actions: ResumeColumnActions): ColumnDef<ResumeVersion>[] => [
    {
        accessorKey: "label",
        header: "Label",
    },

    {
        accessorKey: "fileName",
        header: "File Name"
    },

    {
        accessorKey: "dateAdded",
        header: "Date Added",
        cell: ({ row }) => {
            const currentDate = new Date(row.original.createdAt).toLocaleDateString();
            return (
                <div>
                    {currentDate}
                </div>
            )
        }
    },

    {
        id: "action",
        header: "Actions",
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Actions</Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                        <DropdownMenuGroup>

                            <DropdownMenuItem onClick={() => actions.onEdit(row.original.id)} >
                                <PencilIcon />
                                Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={ () => actions.onViewPdf(row.original.fileUrl) } >
                                <ViewIcon />
                                View PDF
                            </DropdownMenuItem>

                        </DropdownMenuGroup>
                        
                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem variant="destructive" onClick={ () => actions.onDelete(row.original.id) } >
                                <TrashIcon />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                    </DropdownMenuContent>

                </DropdownMenu>
            )
        }
    }
]
