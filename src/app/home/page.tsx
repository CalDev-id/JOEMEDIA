"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer/footer";
import Navbar from "@/components/Navbar/page";
import Loader from "@/components/common/Loader";
import Maps from "@/components/Maps/maps";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";

interface Article {
  id: string;
  title: string;
  body: string;
  image_path: string | null;
  published: boolean;
  created_at: string;
  created_by: string | null;
  category: string | null;
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

  (async () => {
    setLoading(true);
    await Promise.all([fetchUser(), fetchArticles()]);
    setLoading(false);
  })();
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
        created_by,
        category,
        articles_author_id_fkey ( full_name )
      `,
      )
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(20);

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

  // if (loading) {
  //   return <Loader />;
  // }

  // if (articles.length === 0) {
  //   return (
  //     <div className="mx-auto max-w-4xl p-6">
  //       <p className="text-gray-500">No articles yet.</p>
  //     </div>
  //   );
  // }

  // 🧠 Pisahkan artikel jadi 3 bagian
  const latestArticle = articles[0]; // section 1
  const secondSectionArticles = articles.slice(1, 5); // 3 artikel berikutnya
  const thirdSectionArticles = articles.slice(5, 8); // max 3 artikel lagi

  const moreArticles = articles[9];
  const moreArticles2 = articles.slice(10, 13);

  const terakhir = articles.slice(13, 17);

  const autoplay = Autoplay({
    delay: 4000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: false,
    },
    [autoplay],
  );

// 🔒 Cegah klik saat sedang drag
const [isDragging, setIsDragging] = useState(false);

useEffect(() => {
  if (!emblaApi) return;

  let isPointerDown = false;
  let startX = 0;
  let startY = 0;

  const onPointerDown = (e: PointerEvent) => {
    isPointerDown = true;
    startX = e.clientX;
    startY = e.clientY;
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isPointerDown) return;
    const deltaX = Math.abs(e.clientX - startX);
    const deltaY = Math.abs(e.clientY - startY);
    if (deltaX > 5 || deltaY > 5) {
      setIsDragging(true);
    }
  };

  const onPointerUp = () => {
    isPointerDown = false;
    setTimeout(() => setIsDragging(false), 100);
  };

  emblaApi.containerNode().addEventListener("pointerdown", onPointerDown);
  emblaApi.containerNode().addEventListener("pointermove", onPointerMove);
  emblaApi.containerNode().addEventListener("pointerup", onPointerUp);

  return () => {
    const container = emblaApi.containerNode();
    container.removeEventListener("pointerdown", onPointerDown);
    container.removeEventListener("pointermove", onPointerMove);
    container.removeEventListener("pointerup", onPointerUp);
  };
}, [emblaApi]);


  useEffect(() => {
    if (!emblaApi) return;

    // Ambil instance plugin autoplay dari emblaApi
    const autoplayInstance = emblaApi.plugins()?.autoplay as
      | ReturnType<typeof Autoplay>
      | undefined;

    if (!autoplayInstance) return; // pastikan instance ada

    // Jalankan autoplay saat embla siap
    autoplayInstance.play();

    // Supaya autoplay lanjut setelah interaksi user
    const handlePointerUp = () => autoplayInstance.play();
    const handleSelect = () => autoplayInstance.play();

    emblaApi.on("pointerUp", handlePointerUp);
    emblaApi.on("select", handleSelect);

    return () => {
      emblaApi.off("pointerUp", handlePointerUp);
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi]);

  // Re-init jika ukuran berubah
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);
  return (
    <div>
      <Navbar active="home" />
      {loading ? (
        <Loader />
      ) : (
        <div className="mx-auto bg-white p-6">
          {/* 🧩 SECTION 1: 1 berita terakhir */}
          <div className="flex flex-col gap-8 px-0 sm:px-20 md:flex-row">
            {/* 🧩 SECTION 1: Semua berita bisa digeser */}
            <div className="embla w-full overflow-hidden" ref={emblaRef}>
              <div className="embla__container flex">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="embla__slide min-w-0 flex-[0_0_100%]" // 1 berita per layar
                  >
                    <div
                      className="mx-auto  cursor-pointer"
                      onClick={() => {
                        if (!isDragging) router.push(`/news/${article.id}`);
                      }}
                    >
                      {/* Bungkus gambar dan overlay */}
                      <div className="relative overflow-hidden rounded-2xl">
                        {/* Gambar */}
                        {article.image_path && (
                          <img
                            src={article.image_path}
                            alt={article.title}
                            className="h-[400px] w-full object-cover transition-transform duration-500 hover:scale-105 md:h-[600px]"
                          />
                        )}

                        {/* Overlay gradasi */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                        {/* Konten di atas gambar */}
                        <div className="absolute bottom-0 p-6 text-white md:p-8">
                          <h2 className="mb-3 line-clamp-2 text-xl font-semibold leading-tight drop-shadow-lg md:text-4xl md:font-extrabold">
                            {article.title}
                          </h2>

                          <div
                            className="mb-4 hidden text-sm text-gray-200 md:block md:text-base"
                            style={{
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 3,
                              overflow: "hidden",
                            }}
                          >
                            {article.body
                              ? article.body.replace(/<[^>]+>/g, "")
                              : ""}
                          </div>

                          <p className="text-xs text-gray-300 md:text-sm">
                            By{" "}
                            <span className="font-medium text-white">
                              {article.created_by || "Unknown Author"}
                            </span>{" "}
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
                    </div>
                  </div>
                ))}
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
                        {article.created_by ||
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
                        {article.created_by ||
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
          <div className="px-0 pt-5 md:px-20 md:pt-5">
            <div className="flex items-center justify-between pb-8">
              <p className="font-bold md:text-xl">Trending News</p>
              <button
                className="text-sm text-red-600 hover:underline md:text-base md:font-semibold"
                onClick={() => router.push("/allNews")}
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
                      className="h-60 w-full rounded-lg object-cover md:h-90"
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
                      {article.created_by ||
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

          {/* 🧩 SECTION 3: Trending News (max 3 berita lagi) */}
          <div className="px-0 pt-5 md:px-20 md:pt-5">
            <div className="flex items-center justify-between pb-8">
              <p className="font-bold md:text-xl">Must Read</p>
              <button
                className="text-sm text-red-600 hover:underline md:text-base md:font-semibold"
                onClick={() => router.push("/allNews")}
              >
                See More
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-8 px-0 sm:px-20 md:flex-row">
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
                    {moreArticles.created_by ||
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
                        {article.created_by ||
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
                        {article.created_by ||
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

          <div className="px-0 pt-5 md:px-20 md:pt-5">
            <div className="flex items-center justify-between pb-8">
              <p className="font-bold md:text-xl">Trending News</p>
              <button
                className="text-sm text-red-600 hover:underline md:text-base md:font-semibold"
                onClick={() => router.push("/allNews")}
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
                      className="h-60 w-full rounded-lg object-cover md:h-90"
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
                      {article.created_by ||
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

          {/* <Maps /> */}
        </div>
      )}
      <Footer />
    </div>
  );
}
