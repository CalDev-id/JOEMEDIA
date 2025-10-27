"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer/footer";
import Navbar from "@/components/Navbar/page";
import Loader from "@/components/common/Loader";

interface Article {
  id: string;
  title: string;
  body: string;
  image_path: string | null;
  published: boolean;
  created_at: string;
  articles_author_id_fkey: {
    full_name: string | null;
  } | null;
}

export default function HomePage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFullName, setUserFullName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        setUserFullName(profile?.full_name ?? null);
      }
    };

    fetchUser();
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        id,
        title,
        body,
        image_path,
        published,
        created_at,
        articles_author_id_fkey ( full_name )
      `,
      )
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching articles:", error);
    } else {
      const normalizedData: Article[] = (data || []).map((item: any) => ({
        ...item,
        articles_author_id_fkey:
          item.articles_author_id_fkey &&
          !Array.isArray(item.articles_author_id_fkey)
            ? item.articles_author_id_fkey
            : item.articles_author_id_fkey?.[0] || { full_name: null },
      }));

      setArticles(normalizedData);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserFullName(null);
    router.refresh();
  };

  if (loading) {
    return <Loader />;
  }

  if (articles.length === 0) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-gray-500">No articles yet.</p>
      </div>
    );
  }

  // 🧠 Pisahkan artikel jadi 3 bagian
  const latestArticle = articles[0]; // section 1
  const secondSectionArticles = articles.slice(1, 5); // 3 artikel berikutnya
  const thirdSectionArticles = articles.slice(5, 8); // max 3 artikel lagi

  const moreArticles = articles[9];
  const moreArticles2 = articles.slice(10, 13);

  const terakhir = articles.slice(13, 17);

  return (
    <div>
      <Navbar active="home" />
      <div className="mx-auto bg-white p-6">
        {/* 🧩 SECTION 1: 1 berita terakhir */}
        <div className="flex flex-col gap-8 px-6 sm:px-20 md:flex-row">
          <div
            className="cursor-pointer md:w-[60%]"
            onClick={() => router.push(`/news/${latestArticle.id}`)}
          >
            {/* Bungkus gambar dan overlay agar tidak melebar */}
            <div className="relative overflow-hidden rounded-2xl">
              {/* Gambar */}
              {latestArticle.image_path && (
                <img
                  src={latestArticle.image_path}
                  alt={latestArticle.title}
                  className="h-[400px] w-full object-cover transition-transform duration-500 hover:scale-105 md:h-[600px]"
                />
              )}

              {/* Overlay gradasi */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

              {/* Konten di atas gambar */}
              <div className="absolute bottom-0 p-6 text-white md:p-8">
                <h2 className="mb-3 line-clamp-2 text-3xl font-extrabold leading-tight drop-shadow-lg md:text-4xl">
                  {latestArticle.title}
                </h2>

                {/* Body artikel singkat (desktop only) */}
                <div className="mb-4 line-clamp-3 hidden text-sm text-gray-200 md:block md:text-base">
                  <div
                    dangerouslySetInnerHTML={{ __html: latestArticle.body }}
                  />
                </div>

                {/* Author dan tanggal */}
                <p className="text-xs text-gray-300 md:text-sm">
                  By{" "}
                  <span className="font-medium text-white">
                    {latestArticle.articles_author_id_fkey?.full_name ||
                      "Unknown Author"}
                  </span>{" "}
                  •{" "}
                  {new Date(latestArticle.created_at).toLocaleDateString(
                    "id-ID",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 🧩 SECTION 2: 3 berita sebelum terakhir */}
          <div className="flex flex-col gap-6 md:w-[40%]">
            {/* Mobile version (sama seperti Section 3) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:hidden">
              {secondSectionArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => router.push(`/news/${article.id}`)}
                  className="cursor-pointer overflow-hidden rounded-xl"
                >
                  {article.image_path && (
                    <img
                      src={article.image_path}
                      alt={article.title}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-lg font-semibold">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                      <div
                        className=""
                        dangerouslySetInnerHTML={{ __html: article.body }}
                      />
                    </p>
                    <p className="mt-3 text-xs text-gray-500">
                      By{" "}
                      {article.articles_author_id_fkey?.full_name ||
                        "Unknown Author"}{" "}
                      •{" "}
                      {new Date(article.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop version (tetap seperti semula) */}
            <div className="hidden flex-col gap-4 md:flex md:gap-2">
              {secondSectionArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => router.push(`/news/${article.id}`)}
                  className="flex cursor-pointer flex-col gap-4 rounded-xl px-4 pb-4 md:flex-row"
                >
                  {article.image_path && (
                    <img
                      src={article.image_path}
                      alt={article.title}
                      className="h-48 w-full rounded-lg object-cover md:h-32 md:w-32"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="line-clamp-2 text-lg font-semibold md:text-xl">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-700 md:text-base">
                      <div
                        className=""
                        dangerouslySetInnerHTML={{ __html: article.body }}
                      />
                    </p>
                    <p className="mt-2 text-xs text-gray-500 md:text-sm">
                      By{" "}
                      {article.articles_author_id_fkey?.full_name ||
                        "Unknown Author"}{" "}
                      •{" "}
                      {new Date(article.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🧩 SECTION 3: Trending News (max 3 berita lagi) */}
        <div className="px-6 pt-5 md:px-20 md:pt-5">
          <div className="flex items-center justify-between pb-8">
            <p className="font-bold md:text-xl">Trending News</p>
            <button
              className="text-sm text-red-600 hover:underline md:text-base md:font-semibold"
              onClick={() => router.push("/news")}
            >
              See More
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {thirdSectionArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => router.push(`/news/${article.id}`)}
                className="cursor-pointer overflow-hidden rounded-xl"
              >
                {article.image_path && (
                  <img
                    src={article.image_path}
                    alt={article.title}
                    className="h-60 w-full object-cover md:h-90 rounded-lg"
                  />
                )}
                <div className="p-4">
                  <h3 className="line-clamp-2 text-lg font-semibold">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                    <div
                      className=""
                      dangerouslySetInnerHTML={{ __html: article.body }}
                    />
                  </p>
                  <p className="mt-3 text-xs text-gray-500">
                    By{" "}
                    {article.articles_author_id_fkey?.full_name ||
                      "Unknown Author"}{" "}
                    •{" "}
                    {new Date(article.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🧩 SECTION 3: Trending News (max 3 berita lagi) */}
        <div className="px-6 pt-5 md:px-20 md:pt-5">
          <div className="flex items-center justify-between pb-8">
            <p className="font-bold md:text-xl">Must Read</p>
            <button
              className="text-sm text-red-600 hover:underline md:text-base md:font-semibold"
              onClick={() => router.push("/news")}
            >
              See More
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 px-6 sm:px-20 md:flex-row">
          <div className="md:w-[60%]">
            <div
              className="cursor-pointer"
              onClick={() => router.push(`/news/${moreArticles.id}`)}
            >
              {moreArticles.image_path && (
                <img
                  src={moreArticles.image_path}
                  alt={moreArticles.title}
                  className="w-full rounded-2xl object-cover md:h-[400px]"
                />
              )}
              <div className="p-4 md:p-6">
                <h2 className="mb-3 text-2xl font-bold md:text-3xl">
                  {moreArticles.title}
                </h2>
                <p className="mb-4 line-clamp-4 hidden text-sm text-gray-700 md:text-base">
                  {moreArticles.body}
                  <div
                    className=""
                    dangerouslySetInnerHTML={{ __html: moreArticles.body }}
                  />
                </p>
                <p className="text-xs text-gray-500 md:text-sm">
                  By{" "}
                  {moreArticles.articles_author_id_fkey?.full_name ||
                    "Unknown Author"}{" "}
                  •{" "}
                  {new Date(moreArticles.created_at).toLocaleDateString(
                    "id-ID",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 🧩 SECTION 2: 3 berita sebelum terakhir */}
          <div className="flex flex-col gap-6 md:w-[40%]">
            {/* Mobile version (sama seperti Section 3) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:hidden">
              {moreArticles2.map((article) => (
                <div
                  key={article.id}
                  onClick={() => router.push(`/news/${article.id}`)}
                  className="cursor-pointer overflow-hidden rounded-xl"
                >
                  {article.image_path && (
                    <img
                      src={article.image_path}
                      alt={article.title}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-lg font-semibold">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                      <div
                        className=""
                        dangerouslySetInnerHTML={{ __html: article.body }}
                      />
                    </p>
                    <p className="mt-3 text-xs text-gray-500">
                      By{" "}
                      {article.articles_author_id_fkey?.full_name ||
                        "Unknown Author"}{" "}
                      •{" "}
                      {new Date(article.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop version (tetap seperti semula) */}
            <div className="hidden flex-col gap-6 md:flex">
              {moreArticles2.map((article) => (
                <div
                  key={article.id}
                  onClick={() => router.push(`/news/${article.id}`)}
                  className="flex cursor-pointer flex-col gap-4 rounded-xl px-4 pb-4 md:flex-row"
                >
                  {article.image_path && (
                    <img
                      src={article.image_path}
                      alt={article.title}
                      className="h-48 w-full rounded-lg object-cover md:h-32 md:w-48"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="line-clamp-2 text-lg font-semibold md:text-xl">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-700 md:text-base">
                      <div
                        className=""
                        dangerouslySetInnerHTML={{ __html: article.body }}
                      />
                    </p>
                    <p className="mt-2 text-xs text-gray-500 md:text-sm">
                      By{" "}
                      {article.articles_author_id_fkey?.full_name ||
                        "Unknown Author"}{" "}
                      •{" "}
                      {new Date(article.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pt-5 md:px-20 md:pt-5">
          <div className="flex items-center justify-between pb-8">
            <p className="font-bold md:text-xl">Trending News</p>
            <button
              className="text-sm text-red-600 hover:underline md:text-base md:font-semibold"
              onClick={() => router.push("/news")}
            >
              See More
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {terakhir.map((article) => (
              <div
                key={article.id}
                onClick={() => router.push(`/news/${article.id}`)}
                className="cursor-pointer overflow-hidden rounded-xl"
              >
                {article.image_path && (
                  <img
                    src={article.image_path}
                    alt={article.title}
                    className="h-60 w-full object-cover md:h-90 rounded-lg"
                  />
                )}
                <div className="p-4">
                  <h3 className="line-clamp-2 text-lg font-semibold">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                    <div
                      className=""
                      dangerouslySetInnerHTML={{ __html: article.body }}
                    />
                  </p>
                  <p className="mt-3 text-xs text-gray-500">
                    By{" "}
                    {article.articles_author_id_fkey?.full_name ||
                      "Unknown Author"}{" "}
                    •{" "}
                    {new Date(article.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
