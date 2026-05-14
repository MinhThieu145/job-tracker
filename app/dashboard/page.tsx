"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DataTable } from "@/components/data-table";
import { columns, type Application } from "./applicationColumns";

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const fetchedApplications = async () => {
      const response = await fetch("/api/applications");
      if (!response.ok) {
        console.error("Failed to fetch applications");
        return;
      }

      const applicationsData = (await response.json()) as Application[];
      setApplications(applicationsData);
      console.log("Fetched applications:", applicationsData);
    };

    fetchedApplications();
  }, []);

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-10">
        <h1 className="mb-8 text-4xl font-bold">Welcome to Job Tracker</h1>

        <Link
          href="/applications/new"
          className="mb-6 self-end rounded-lg bg-primary px-4 py-2 text-center text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Add New Application
        </Link>
        <DataTable columns={columns} data={applications} />
      </div>
    </main>
  );
}
