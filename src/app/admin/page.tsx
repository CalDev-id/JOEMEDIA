"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaEye } from "react-icons/fa";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { supabase } from "@/lib/supabaseClient";
import TextEditor from "@/components/Editor/TextEditor";

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [userChecked, setUserChecked] = useState(false); // ✅ tambahkan state ini
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const itemsPerPage = 10;

  const [form, setForm] = useState({
    title: "",
    body: "",
    created_by: "", // ✅ ganti dari creator
    category: "",
    tags: "",
    image_path: "",
    published: true,
  });

  // ✅ Proteksi halaman (cek user login + role admin, tanpa flicker)
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.replace("/");
        return;
      }

      setUser(user);
      setUserChecked(true); // ✅ hanya render setelah lolos verifikasi
      fetchArticles();
    };

    checkUser();
  }, [search]);

  const fetchArticles = async () => {
    setLoading(true);
    let query = supabase
      .from("articles")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });

    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error } = await query;
    if (!error && data) setArticles(data);
    setLoading(false);
  };

  const handleOpenCreate = () => {
    setForm({
      title: "",
      body: "",
      created_by: "",
      category: "",
      tags: "",
      image_path: "",
      published: true,
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleOpenEdit = (article: any) => {
    setForm({
      title: article.title,
      body: article.body,
      created_by: article.created_by,
      category: article.category,
      tags: article.tags,
      image_path: article.image_path,
      published: true,
    });
    setSelectedArticle(article);
    setEditMode(true);
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      alert("User belum terautentikasi.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${user.id}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { data, error } = await supabase.storage
      .from("news-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("❌ Upload gagal:", error.message);
      alert("Upload gagal: " + error.message);
      return;
    }

    // Dapatkan URL publik
    const { data: publicUrlData } = supabase.storage
      .from("news-images")
      .getPublicUrl(filePath);

    setForm((prev) => ({ ...prev, image_path: publicUrlData.publicUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("User belum login.");
      return;
    }

    const articleData = {
      title: form.title,
      body: form.body,
      created_by: form.created_by, // ✅ gunakan kolom sesuai schema
      category: form.category,
      image_path: form.image_path,
      published: form.published,
      author_id: user.id,
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim()) // ✅ kirim array biasa, Supabase otomatis ubah jadi jsonb[]
        : [],
    };

    if (editMode && selectedArticle) {
      await supabase
        .from("articles")
        .update(articleData)
        .eq("id", selectedArticle.id);
    } else {
      const { error } = await supabase.from("articles").insert([articleData]);
      if (error) console.error("❌ Insert error:", error.message);
    }

    setShowModal(false);
    fetchArticles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;
    await supabase.from("articles").delete().eq("id", id);
    fetchArticles();
  };

  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const paginatedArticles = articles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 🚫 Jangan render apapun sampai verifikasi user selesai
  if (!userChecked) return null;

  return (
    <DefaultLayout>
      <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header */}
        <div className="mb-6 flex justify-between px-7.5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Artikel
          </h4>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
          >
            <FaPlus size={14} />
            Tambah Artikel
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 px-7.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchArticles();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Cari berdasarkan judul..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded border px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 dark:bg-meta-4">
                <th className="px-4 py-4 pl-10 text-left text-sm font-medium text-black dark:text-white">
                  No
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-black dark:text-white">
                  Judul
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-black dark:text-white">
                  Penulis
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-black dark:text-white">
                  Tanggal
                </th>
                <th className="px-4 py-4 text-center text-sm font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedArticles.length > 0 ? (
                paginatedArticles.map((article, index) => (
                  <tr
                    key={article.id}
                    className="border-b border-stroke dark:border-strokedark"
                  >
                    <td className="px-4 py-4 pl-10 text-sm text-black dark:text-white">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-4 text-sm text-black dark:text-white">
                      {article.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-black dark:text-white">
                      {article.created_by || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-black dark:text-white">
                      {formatDate(article.created_at)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => router.push(`/news/${article.id}`)}
                        >
                          <FaEye className="cursor-pointer text-blue-500 hover:text-blue-700" />
                        </button>
                        <button onClick={() => handleOpenEdit(article)}>
                          <FaEdit className="cursor-pointer text-yellow-500 hover:text-yellow-700" />
                        </button>
                        <button onClick={() => handleDelete(article.id)}>
                          <FaTrash className="cursor-pointer text-red-500 hover:text-red-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    Tidak ada artikel ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-7.5 py-4">
            <div className="text-sm text-gray-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, articles.length)} dari{" "}
              {articles.length} data
            </div>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`rounded px-3 py-1 ${
                    currentPage === i + 1
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div className="w-full max-w-5xl rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
    {/* Header */}
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-black dark:text-white">
        {editMode ? "Edit Artikel" : "Tambah Artikel"}
      </h3>
      <button onClick={() => setShowModal(false)}>
        <FaTimes className="text-gray-500 hover:text-gray-700" />
      </button>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Judul
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          {/* Penulis */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Penulis
            </label>
            <input
              type="text"
              value={form.created_by}
              onChange={(e) => setForm({ ...form, created_by: e.target.value })}
              className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Kategori
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Pilih kategori</option>
              <option value="Nasional">Nasional</option>
              <option value="Internasional">Internasional</option>
              <option value="Politik">Politik</option>
              <option value="Ekonomi">Ekonomi</option>
              <option value="Hiburan-Lifestyle">Hiburan & Lifestyle</option>
              <option value="Olahraga">Olahraga</option>
              <option value="Teknologi-Otomotif">Teknologi & Otomotif</option>
              <option value="Opini">Opini</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags (pisahkan dengan koma)
            </label>
            <input
              type="text"
              placeholder="contoh: AI, Machine Learning, Berita"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 space-y-4">
          {/* Body */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Konten
            </label>
            <TextEditor
              value={form.body}
              onChange={(value: string) => setForm({ ...form, body: value })}
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-sm text-gray-700 dark:text-gray-300"
            />
            {form.image_path && (
              <img
                src={form.image_path}
                alt="cover"
                className="mt-2 h-32 w-auto rounded border"
              />
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
        >
          Batal
        </button>
        <button
          type="submit"
          className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
        >
          {editMode ? "Simpan Perubahan" : "Simpan"}
        </button>
      </div>
    </form>
  </div>
</div>

      )}
    </DefaultLayout>
  );
}
