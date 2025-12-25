"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { X } from "lucide-react"
import axios from "axios"

interface ResumeUploadModalProps {
    isOpen: boolean
    onClose: () => void
    resumesCount: number
}

export default function ResumeUploadModal({
    isOpen,
    onClose,
    resumesCount,
}: ResumeUploadModalProps) {
    const { data: session } = useSession()
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError("File size must be less than 5MB")
                return
            }
            if (
                !selectedFile.type.includes("pdf") &&
                !selectedFile.name.endsWith(".docx")
            ) {
                setError("Please upload a PDF or DOCX file")
                return
            }
            setFile(selectedFile)
            setError(null)
        }
    }

    const handleUpload = async () => {
        if (!file || !session) return

        if (resumesCount >= 5) {
            setError("Maximum 5 resumes allowed. Please delete an existing resume first.")
            return
        }

        setUploading(true)
        setError(null)

        try {
            const tokenResponse = await fetch("/api/auth/token")
            if (!tokenResponse.ok) return

            const tokenData = await tokenResponse.json()
            const token = tokenData.token || session?.accessToken || (session?.user as any)?.id || ""

            const formData = new FormData()
            formData.append("resume", file)

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/resume/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            )

            setFile(null)
            onClose()
        } catch (err: any) {
            setError(err.response?.data?.detail || err.response?.data?.error || "Failed to upload resume")
        } finally {
            setUploading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="glass-dark rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between p-8 border-b border-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Upload Resume</h2>
                        <p className="text-slate-400 text-sm">
                            Add a resume to your profile ({resumesCount}/5)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 p-8 space-y-6">
                    <div className="space-y-4">
                        <label htmlFor="resume-file" className="text-sm font-semibold text-slate-300">
                            Resume File (PDF or DOCX)
                        </label>
                        <div className="relative group">
                            <input
                                id="resume-file"
                                type="file"
                                accept=".pdf,.docx"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-orange-500/10 file:text-orange-400
                  hover:file:bg-orange-500/20
                  cursor-pointer bg-white/5 rounded-2xl border border-white/10 p-4 transition-all
                  group-hover:border-white/20"
                            />
                        </div>
                        {file && (
                            <p className="text-xs text-orange-400 font-medium">
                                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-2xl">
                            <p className="text-sm text-red-500 font-medium text-center">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold border border-white/10 text-slate-400 hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading || resumesCount >= 5}
                            className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold bg-white text-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all shadow-xl"
                        >
                            {uploading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
