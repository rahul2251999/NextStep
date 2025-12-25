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

import { ExternalLink, Eye, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

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
  onStatusChange?: (jobId: number, newStatus: string) => void;
}

// --- STATUS BADGE VARIANTS ---

const badgeVariants = cva("capitalize text-xs font-bold px-3 py-1 rounded-full", {
  variants: {
    variant: {
      applied: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      interviewing: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      offer_received: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      rejected: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    },
  },
  defaultVariants: {
    variant: "applied",
  },
});

const getStatusVariant = (status: string): StatusVariant => {
  const s = status.toLowerCase();
  if (s.includes("applied")) return "applied";
  if (s.includes("interviewing")) return "interviewing";
  if (s.includes("offer") || s.includes("received")) return "offer_received";
  if (s.includes("rejected")) return "rejected";
  return "applied";
};

// --- MAIN COMPONENT ---

export const JobDataTable = ({ jobs, visibleColumns, onJobClick, onStatusChange }: JobDataTableProps) => {
  const statusOptions = [
    { value: "applied", label: "Applied" },
    { value: "interviewing", label: "Interviewing" },
    { value: "offer_received", label: "Offer Received" },
    { value: "rejected", label: "Rejected" },
  ]

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>, jobId: number) => {
    e.stopPropagation()
    if (onStatusChange) {
      onStatusChange(jobId, e.target.value)
    }
  }
  // Animation variants for table rows
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.2,
        ease: "easeOut" as any,
      },
    }),
  };

  const tableHeaders: { key: keyof Job; label: string }[] = [
    { key: "title", label: "Role" },
    { key: "company", label: "Company" },
    { key: "application_status", label: "Status" },
    { key: "match_score", label: "Match" },
    { key: "posted_at", label: "Applied" },
    { key: "job_id", label: "" },
  ];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="relative w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent px-4">
              {tableHeaders
                .filter((header) => visibleColumns.has(header.key))
                .map((header) => (
                  <TableHead key={header.key} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 py-6">
                    {header.label}
                  </TableHead>
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
                  className="group border-b border-white/5 transition-all hover:bg-white/[0.03] cursor-pointer"
                  onClick={() => onJobClick(job)}
                >
                  {visibleColumns.has("title") && (
                    <TableCell className="py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-orange-400 transition-colors">{job.title}</span>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.has("company") && (
                    <TableCell className="text-slate-400 font-medium">
                      {job.company || "Unknown"}
                    </TableCell>
                  )}

                  {visibleColumns.has("application_status") && (
                    <TableCell>
                      {onStatusChange ? (
                        <div className="relative">
                          <select
                            value={job.application_status}
                            onChange={(e) => handleStatusChange(e, job.job_id)}
                            onClick={(e) => e.stopPropagation()}
                            className="appearance-none bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 pr-7 text-xs font-medium text-white hover:border-white/30 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                            style={{
                              color: getStatusVariant(job.application_status) === "applied" ? "#60a5fa" :
                                     getStatusVariant(job.application_status) === "interviewing" ? "#fbbf24" :
                                     getStatusVariant(job.application_status) === "offer_received" ? "#34d399" :
                                     "#f87171"
                            }}
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value} className="bg-black text-white">
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                        </div>
                      ) : (
                        <Badge
                          className={cn(
                            badgeVariants({
                              variant: getStatusVariant(job.application_status),
                            })
                          )}
                        >
                          {job.application_status.replace("_", " ")}
                        </Badge>
                      )}
                    </TableCell>
                  )}

                  {visibleColumns.has("match_score") && (
                    <TableCell>
                      {job.match_score !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                job.match_score >= 80 ? "bg-emerald-500" : job.match_score >= 60 ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${job.match_score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-300">{job.match_score}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </TableCell>
                  )}

                  {visibleColumns.has("posted_at") && (
                    <TableCell className="text-slate-500 text-sm">
                      {formatDate(job.posted_at)}
                    </TableCell>
                  )}

                  {visibleColumns.has("job_id") && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl bg-white/0 text-slate-500 group-hover:bg-white/5 group-hover:text-white transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.size} className="h-40 text-center text-slate-500 italic">
                  No applications found. Time to drop some files.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

