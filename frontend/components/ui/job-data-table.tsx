import * as React from "react";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import { cva, type VariantProps } from "class-variance-authority";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import { ExternalLink, Eye } from "lucide-react";

// --- TYPE DEFINITIONS ---

type StatusVariant = "applied" | "interviewing" | "offer_received" | "rejected";

export interface Job {
  job_id: number;
  title: string;
  company: string | null;
  description_text: string;
  application_status: string;
  resume_id: number | null;
  posted_at: string;
  match_score: number | null;
}

// --- PROPS INTERFACE ---

interface JobDataTableProps {
  jobs: Job[];
  visibleColumns: Set<keyof Job>;
  onJobClick: (job: Job) => void;
}

// --- STATUS BADGE VARIANTS ---

const badgeVariants = cva("capitalize text-white", {
  variants: {
    variant: {
      applied: "bg-blue-500 hover:bg-blue-600",
      interviewing: "bg-yellow-500 hover:bg-yellow-600",
      offer_received: "bg-green-500 hover:bg-green-600",
      rejected: "bg-red-500 hover:bg-red-600",
    },
  },
  defaultVariants: {
    variant: "applied",
  },
});

const getStatusVariant = (status: string): StatusVariant => {
  if (status === "applied") return "applied";
  if (status === "interviewing") return "interviewing";
  if (status === "offer_received") return "offer_received";
  if (status === "rejected") return "rejected";
  return "applied";
};

// --- MAIN COMPONENT ---

export const JobDataTable = ({ jobs, visibleColumns, onJobClick }: JobDataTableProps) => {
  // Animation variants for table rows
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeInOut",
      },
    }),
  };

  const tableHeaders: { key: keyof Job; label: string }[] = [
    { key: "title", label: "Job Title" },
    { key: "company", label: "Company" },
    { key: "application_status", label: "Status" },
    { key: "match_score", label: "Match Score" },
    { key: "posted_at", label: "Applied Date" },
    { key: "job_id", label: "Actions" },
  ];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {tableHeaders
                .filter((header) => visibleColumns.has(header.key))
                .map((header) => (
                  <TableHead key={header.key}>{header.label}</TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length > 0 ? (
              jobs.map((job, index) => (
                <motion.tr
                  key={job.job_id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={rowVariants}
                  className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => onJobClick(job)}
                >
                  {visibleColumns.has("title") && (
                    <TableCell className="font-medium">{job.title}</TableCell>
                  )}

                  {visibleColumns.has("company") && (
                    <TableCell>{job.company || "N/A"}</TableCell>
                  )}

                  {visibleColumns.has("application_status") && (
                    <TableCell>
                      <Badge
                        className={cn(
                          badgeVariants({
                            variant: getStatusVariant(job.application_status),
                          })
                        )}
                      >
                        {job.application_status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  )}

                  {visibleColumns.has("match_score") && (
                    <TableCell>
                      {job.match_score !== null ? (
                        <span
                          className={cn(
                            "font-medium",
                            job.match_score >= 80
                              ? "text-green-500"
                              : job.match_score >= 60
                              ? "text-yellow-500"
                              : "text-red-500"
                          )}
                        >
                          {job.match_score}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}

                  {visibleColumns.has("posted_at") && (
                    <TableCell>{formatDate(job.posted_at)}</TableCell>
                  )}

                  {visibleColumns.has("job_id") && (
                    <TableCell>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onJobClick(job);
                        }}
                        className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </TableCell>
                  )}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.size} className="h-24 text-center">
                  No jobs found. Click "Add Job" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

