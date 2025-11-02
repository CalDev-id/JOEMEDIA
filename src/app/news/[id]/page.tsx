"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/components/common/Loader";
import Navbar from "@/components/Navbar/page";
import Footer from "@/components/Footer/footer";
import { FaFacebookF, FaTwitter, FaWhatsapp } from "react-icons/fa";

interface Article {
  id: string;
  title: string;
  body: string;
  image_path: string;
  published: boolean;
  created_at: string;
  created_by: string | null;
  category: string;
  tags: string[];
  articles_author_id_fkey: { full_name: string | null }[];
}

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArticle(id as string);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
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
        tags,
        articles_author_id_fkey ( full_name )
      `,
      )
      .eq("id", articleId)
      .single();

    if (error) {
      console.error("❌ Error fetching article:", error);
    } else {
      // ✅ pastikan tags dari jsonb selalu array
      setArticle({
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
      });

      if (data?.category) {
        fetchRelatedArticles(data.category, articleId);
      }
    }

    setLoading(false);
  };

  const fetchRelatedArticles = async (category: string, excludeId: string) => {
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, image_path")
      .eq("category", category)
      .neq("id", excludeId)
      .limit(3);

    if (error) {
      console.error("❌ Error fetching related news:", error);
    } else {
      setRelatedArticles((data || []) as Article[]);
    }
  };

  const shareArticle = (platform: string) => {
    const url = window.location.href;
    const text = `Baca berita menarik: ${article?.title}`;
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text,
      )}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url,
      )}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        text + " " + url,
      )}`,
    };
    window.open(shareUrls[platform], "_blank");
  };

  if (loading) return <Loader />;

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-gray-500">
        Article not found.
      </div>
    );
  }

  return (
    <div>
      <Navbar active="page" />
      <div className="mx-auto mt-14 min-h-screen p-6 md:px-40">
        {/* ---------- Category ---------- */}
        <div className="my-6">
          <span className="text-sm font-semibold text-gray-600">
            Category:{" "}
          </span>
          <span className="rounded-md bg-purple-100 px-3 py-1 text-sm text-purple-800">
            {article.category || "Uncategorized"}
          </span>
        </div>
        <div className="items-cente mb-4 flex">
          <span className="mr-2 bg-red-600 pt-3 text-2xl text-red-600">.</span>
          <h1 className="text-5xl font-extrabold text-black-2">
            {article.title}
          </h1>
        </div>

        <p className="mb-6 text-sm text-gray-500">
          {new Date(article.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}{" "}
          <br />
          By {article.created_by || "Unknown Author"} •
        </p>

        <div className="md:flex">
          {/* ---------- Left Main Content ---------- */}
          <div className="md:w-3/4">
            {article.image_path && (
              <img
                src={article.image_path}
                alt={article.title}
                className="mb-6 h-150 w-full rounded-2xl object-cover shadow-md"
              />
            )}

            <div className="md:flex">
              {/* ---------- Share Buttons ---------- */}
              <div className="flex flex-col items-start gap-4 md:w-1/4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Share:
                </h3>

                <button
                  onClick={() => shareArticle("facebook")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white transition hover:bg-[#0d65d9]"
                  title="Share to Facebook"
                >
                  <FaFacebookF size={18} />
                </button>

                <button
                  onClick={() => shareArticle("twitter")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DA1F2] text-white transition hover:bg-[#0d8bd6]"
                  title="Share to Twitter"
                >
                  <FaTwitter size={18} />
                </button>

                <button
                  onClick={() => shareArticle("whatsapp")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:bg-[#1eb75b]"
                  title="Share to WhatsApp"
                >
                  <FaWhatsapp size={18} />
                </button>
              </div>

              {/* ---------- Article Body ---------- */}
              <div className="md:w-3/4">
                <div className="prose max-w-none leading-relaxed text-gray-800">
                  {article.body.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      <div dangerouslySetInnerHTML={{ __html: paragraph }} />
                    </p>
                  ))}
                </div>

                {/* ---------- Tags ---------- */}
                <div>
                  <h3 className="mt-5 mb-4 text-lg font-semibold text-gray-700">
                    Tags:
                  </h3>
                                  <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags?.length > 0 ? (
                    article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      No tags available
                    </span>
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Sidebar (Ads + Related News) ---------- */}
          <div className="mt-8 md:mt-0 md:w-1/4 md:pl-6">
            <div className="mb-6 rounded-lg bg-gray-100 p-4 text-center shadow">
              <p className="text-sm text-gray-500">Iklan</p>
              <p className="mt-2 font-semibold text-gray-700">
                Pasang iklan kamu di sini
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-gray-800">
                Related News
              </h2>
              {relatedArticles.length > 0 ? (
                relatedArticles.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => router.push(`/news/${rel.id}`)}
                    className="mb-3 cursor-pointer rounded-lg border p-3 transition hover:bg-gray-50"
                  >
                    {rel.image_path && (
                      <img
                        src={rel.image_path}
                        alt={rel.title}
                        className="mb-2 h-28 w-full rounded-md object-cover"
                      />
                    )}
                    <p className="line-clamp-2 text-sm font-semibold text-gray-700">
                      {rel.title}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No related articles found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
