"use client";

import { useState, useRef } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Upload } from "lucide-react";

interface FileLinks {
  [key: string]: string;
}

export default function DJMPage() {
  const [filePR, setFilePR] = useState<File | null>(null);
  const [fileTemplate, setFileTemplate] = useState<File | null>(null);
  const [files, setFiles] = useState<FileLinks>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const filePRInputRef = useRef<HTMLInputElement | null>(null);
  const fileTemplateInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePR || !fileTemplate) return;

    const formData = new FormData();
    formData.append("pr_file", filePR);
    formData.append("template_file", fileTemplate);

    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(
        // "https://presently-welcome-alien.ngrok-free.app/webhook-test/create-djm",
        "https://snipe-hopeful-alien.ngrok-free.app/webhook-test/upload-files",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setFiles(data);
      setStatus("success");
    } catch (err) {
      console.error("Error uploading:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const Dropzone = ({
    label,
    file,
    setFile,
    fileInputRef,
    accept,
  }: {
    label: string;
    file: File | null;
    setFile: (file: File | null) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    accept: string;
  }) => (
    <div
      className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-400 bg-gray-50 p-8 text-center transition hover:bg-gray-100"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          setFile(e.dataTransfer.files[0]);
        }
      }}
    >
      <Upload className="mb-3 h-10 w-10 text-gray-400" />
      <p className="mb-2 font-semibold">{label}</p>
      {file ? (
        <p className="font-medium text-green-600">{file.name}</p>
      ) : (
        <div className="text-gray-500">
          <p className="font-medium">Drag and drop here</p>
          <p className="text-sm">or</p>
          <p className="text-blue-600 underline">browse</p>
        </div>
      )}
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="hidden"
      />
    </div>
  );

  return (
    <DefaultLayout>
      <div className="min-h-screen p-6">
        <h1 className="mb-4 text-xl font-bold">Upload File DJM</h1>

        {/* ALERT */}
        {status === "success" && (
          <div role="alert" className="alert alert-success mb-4">
            ✅ <span>Upload berhasil!</span>
          </div>
        )}
        {status === "error" && (
          <div role="alert" className="alert alert-error mb-4">
            ❌ <span>Upload gagal. Silakan coba lagi.</span>
          </div>
        )}
        <p className="mt-2 text-base mb-2 text-gray-500">
          Belum punya template?{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1u8_HUdsGB5ZQJ4IP1drr3asycF5gf0ccbIoZOVWKWAM/export?format=xlsx&id=1u8_HUdsGB5ZQJ4IP1drr3asycF5gf0ccbIoZOVWKWAM"
            className="text-blue-600 underline"
          >
            Download disini
          </a>
        </p>

        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          {/* 2 Dropzone Side by Side */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Dropzone
              label="Upload PR (PDF)"
              file={filePR}
              setFile={setFilePR}
              fileInputRef={filePRInputRef}
              accept=".pdf"
            />
            <Dropzone
              label="Upload Template DJM (Excel)"
              file={fileTemplate}
              setFile={setFileTemplate}
              fileInputRef={fileTemplateInputRef}
              accept=".xlsx,.xls"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !filePR || !fileTemplate}
            className="rounded-lg bg-greenPrimary px-6 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Processing..." : "Upload"}
          </button>
        </form>

        {/* Skeleton */}
        {loading && (
          <div className="animate-pulse">
            <div className="mb-5 h-16 w-full rounded-lg bg-slate-200"></div>
            <div className="mb-5 h-16 w-full rounded-lg bg-slate-200"></div>
            <div className="mb-5 h-16 w-full rounded-lg bg-slate-200"></div>
          </div>
        )}

        {/* Daftar file hasil */}
        {!loading && Object.keys(files).length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold">Generated Files</h2>
            <ul className="space-y-3">
              {Object.entries(files).map(([name, url]) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded-lg bg-gray-100 p-3 shadow"
                >
                  <span>{name}</span>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(url);
                        const blob = await response.blob();
                        const blobUrl = window.URL.createObjectURL(blob);

                        const a = document.createElement("a");
                        a.href = blobUrl;
                        a.download = `${name}.xlsx`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(blobUrl);
                      } catch (err) {
                        console.error("Download failed", err);
                      }
                    }}
                    className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                  >
                    Download
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
