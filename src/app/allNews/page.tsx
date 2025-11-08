"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar/page";
import Footer from "@/components/Footer/footer";
import Loader from "@/components/common/Loader";

interface Article {
  id: string;
  title: string;
  body: string;
  image_path: string | null;
  published: boolean;
  created_at: string;
  created_by: string | null;
  category: string;
  articles_author_id_fkey: {
    full_name: string | null;
  } | null;
}

const PAGE_SIZE = 10;

export default function HomePage() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [userFullName, setUserFullName] = useState<string | null>(null);

  useEffect(() => {
    // fetch user profile (optional)
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (!error) setUserFullName(profile?.full_name ?? null);
      }
    };
    fetchUser();
  }, []);

  // fetch articles setiap kali search atau page berubah
  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  const fetchArticles = async () => {
    setLoading(true);

    try {
      // build query: published = true, order by created_at desc
      // count total rows with same filter
      // supabase select with count:
      const titleFilter = search.trim();

      // first, query for paginated rows and count
      // use select(..., { count: 'exact' }) to get count
      const selectCols = `
        id,
        title,
        body,
        image_path,
        published,
        created_at,
        created_by,
        category,
        articles_author_id_fkey ( full_name )
      `;

      let query = supabase
        .from("articles")
        .select(selectCols, { count: "exact" })
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (titleFilter.length > 0) {
        // search in title OR body (simple ilike); combine with or
        // supabase .or supports column filters like: or(title.ilike.%...%,body.ilike.%...%)
        const like = `%${titleFilter}%`;
        query = query.or(`title.ilike.${like},body.ilike.${like}`);
      }

      // compute range
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        console.error("Error fetching articles:", error);
        setArticles([]);
        setTotalRows(0);
      } else {
        const normalized: Article[] = (data || []).map((item: any) => ({
          ...item,
          articles_author_id_fkey:
            item.articles_author_id_fkey &&
            !Array.isArray(item.articles_author_id_fkey)
              ? item.articles_author_id_fkey
              : item.articles_author_id_fkey?.[0] || { full_name: null },
        }));
        setArticles(normalized);
        setTotalRows(count ?? (normalized.length > 0 ? normalized.length : 0));
      }
    } catch (err) {
      console.error(err);
      setArticles([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // reset ke halaman 1 saat search berubah
  };

  const totalPages = Math.max(1, Math.ceil((totalRows || 0) / PAGE_SIZE));

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="home" />

      <main className="mx-auto max-w-5xl px-4 py-8 min-h-screen">
        {/* Search */}
        <div className="mb-6">
          <label htmlFor="search" className="sr-only">
            Cari berita
          </label>
          <div className="flex w-full items-center gap-3">
            <input
              id="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari berita (judul atau isi)..."
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm placeholder-gray-400 focus:border-gray-400 focus:outline-none"
            />
            <div className="text-sm text-gray-600">
              {totalRows ? `${totalRows} hasil` : "0 hasil"}
            </div>
          </div>
        </div>

        {/* Artikel list (vertikal, setiap baris mirip BBC) */}
        {loading ? (
          <Loader />
        ) : (
          <section className="space-y-6">
            {articles.length === 0 ? (
              <div className="rounded-lg bg-white p-6 text-center text-gray-600 shadow">
                Tidak ada berita untuk ditampilkan.
              </div>
            ) : (
              articles.map((a) => (
                <article
                  key={a.id}
                  className="group flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg md:flex-row"
                >
                  {/* Gambar kiri (desktop) */}
                  {a.image_path ? (
                    <div
                      className="relative h-44 w-full overflow-hidden rounded-md bg-gray-200 md:h-32 md:w-48 md:flex-shrink-0"
                      onClick={() => router.push(`/news/${a.id}`)}
                    >
                      <img
                        src={a.image_path}
                        alt={a.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-44 w-full rounded-md bg-gray-200 md:h-32 md:w-48 md:flex-shrink-0"
                      onClick={() => router.push(`/news/${a.id}`)}
                    />
                  )}

                  {/* Konten */}
                  <div
                    className="flex flex-1 flex-col justify-between"
                    onClick={() => router.push(`/news/${a.id}`)}
                  >
                    <div>
                      <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">
                        {a.title}
                      </h3>

                      <div className="mb-3 text-sm text-gray-700 line-clamp-3">
                        {/* jangan render HTML panjang penuh — gunakan substring atau line-clamp */}
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              a.body && a.body.length > 300
                                ? a.body.slice(0, 300) + "..."
                                : a.body ?? "",
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <div>
                        By{" "}
                        <span className="font-medium text-gray-700">
                          {a.created_by?? "Unknown"}
                        </span>
                      </div>

                      <div>
                        {new Date(a.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Menampilkan{" "}
            <span className="font-medium">
              {Math.min((page - 1) * PAGE_SIZE + 1, totalRows || 0)}
            </span>{" "}
            -{" "}
            <span className="font-medium">
              {Math.min(page * PAGE_SIZE, totalRows || PAGE_SIZE)}
            </span>{" "}
            dari <span className="font-medium">{totalRows}</span> berita
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPage(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === 1}
              className="rounded px-3 py-1 text-sm disabled:opacity-50"
            >
              First
            </button>

            <button
              onClick={() => {
                handlePrev();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === 1}
              className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            >
              Prev
            </button>

            <span className="mx-1 text-sm">
              Hal {page} / {totalPages}
            </span>

            <button
              onClick={() => {
                handleNext();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === totalPages}
              className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>

            <button
              onClick={() => {
                setPage(totalPages);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === totalPages}
              className="rounded px-3 py-1 text-sm disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
