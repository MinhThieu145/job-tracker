
"use client";

import Link from "next/link"

import { useEffect, useState } from "react";
import { columns, Application } from "./dashboard/columns"
import { DataTable } from "@/components/data-table";


export default function Home() {

  const [applications, setApplications] = useState([]); // State to hold the list of applications

  useEffect(() => {
    // fetch the application
    const fetchedApplications = async () => {
      const response = await fetch("/api/applications");
      if (!response.ok) {
        console.error("Failed to fetch applications");
        return;
      }

      const applicationsData = await response.json();
      setApplications(applicationsData);
      console.log("Fetched applications:", applicationsData);
    }
    fetchedApplications();
  }, []);

  return (
    <main className="min-h-screen">
      <div className="flex flex-col max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-4xl font-bold mb-8 ">
          Welcome to Job Tracker
        </h1>

        <Link 
          href="/applications/new"
          className="bg-blue-500 self-end hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mb-6 text-center"
        >
          + Add New Application
        </Link>
        <DataTable columns={columns} data={applications} />
      </div>
    </main>
  );
}
