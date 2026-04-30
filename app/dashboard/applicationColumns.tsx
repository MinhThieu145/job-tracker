"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type Application = {
    id: string;
    roleTitle: string;
    appliedDate: string;
    status: string;
    company: { name: string };
    resume: { label: string };
}

export const columns: ColumnDef<Application>[] = [
    {
        // Accessing nested data
        accessorKey: "company.name",
        header: "Company",
        cell: ({ row }) => {
            const companyName = row.original.company.name;
            return (
                <div className="flex flex-row gap-2 items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-gray-200 font-bold">
                        {companyName[0].toUpperCase()}
                    </div>

                    <span>{companyName}</span>
                </div>
            )
        }
    },

    {
        accessorKey: "roleTitle",
        header: "Role Title",
    },

    {
        accessorKey: "resume.label",
        header: "Resume Used",
    },

    {
        accessorKey: "appliedDate",
        header: "Applied Date",
        cell: ({ row }) => {
            const appliedDate = new Date(row.original.appliedDate).toLocaleDateString();
            return <span>{appliedDate}</span>
        }
    },

    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
            <Badge variant={status === "APPLIED" ? "secondary" : "outline"}>
                {status}
            </Badge>
        )}
    },

    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return (
                <div> ... </div>
            )
        }
    }
]