"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/components/common/Loader";
import Navbar from "@/components/Navbar/page";
import Footer from "@/components/Footer/footer";
import { FaFacebookF, FaTwitter, FaWhatsapp } from "react-icons/fa";
import AdSlot from "@/components/Ads/adsSlot";

// ==================== Types ====================
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

interface Comment {
  id: number;
  content: string;
  created_at: string;
  author_id: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url?: string | null; // tambahkan field avatar_url
  };
}

// ==================== Component ====================
export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // ---------- State ----------
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);

  // ==================== Effects ====================

  // Fetch article by ID
  useEffect(() => {
    if (id) fetchArticle(id as string);
  }, [id]);

  // Get current user (if logged in)
  useEffect(() => {
    getUser();
  }, []);

  // Fetch comments for this article
  useEffect(() => {
    if (id) fetchComments(id as string);
  }, [id]);

  // ==================== Data Fetching ====================

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  };

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
    } else if (data) {
      setArticle({
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
      });
      fetchNewArticles();
    }
    setLoading(false);
  };

  // Ambil 7 berita terbaru (new news)
  const fetchNewArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
      id,
      title,
      image_path,
      created_at,
      articles_author_id_fkey ( full_name )
    `,
      )
      .order("created_at", { ascending: false })
      .limit(7);

    if (error) {
      console.error("❌ Error fetching new news:", error);
    } else {
      setRelatedArticles((data || []) as unknown as Article[]);
    }
  };

  const fetchComments = async (articleId: string) => {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
      id,
      content,
      created_at,
      author_id,
      profiles ( full_name, avatar_url )
    `,
      )
      .eq("article_id", articleId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching comments:", error);
      return;
    }

    // Transform data Supabase agar sesuai tipe Comment
    const parsedComments: Comment[] = (data || []).map((c: any) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      author_id: c.author_id,
      profiles: c.profiles || {
        full_name: "Anonim",
        avatar_url: "/images/logo/user.png",
      }, // langsung pakai object
    }));

    setComments(parsedComments);
  };

  const handleAddComment = async () => {
    if (!user) {
      alert("Silakan login untuk menulis komentar.");
      return;
    }
    if (!newComment.trim()) return;

    const { error } = await supabase.from("comments").insert({
      article_id: article?.id,
      author_id: user.id,
      content: newComment.trim(),
    });

    if (error) {
      console.error("❌ Error adding comment:", error);
    } else {
      setNewComment("");
      fetchComments(article!.id);
    }
  };

  // ==================== Sharing ====================

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

  // ==================== Render ====================

  if (loading) return <Loader />;
  if (!article)
    return (
      <div className="mx-auto max-w-3xl p-6 text-gray-500">
        Article not found.
      </div>
    );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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

        {/* ---------- Title ---------- */}
        <div className="mb-4 flex items-center">
          {/* <span className="mr-2 bg-red-600 pt-3 text-2xl text-red-600">.</span> */}
          <h1 className="flex border-l-6 border-red-600 text-5xl font-extrabold text-black-2">
            {" "}
            <span className="text-white">.</span>
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
          {/* ---------- Main Content ---------- */}
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
                <div className="flex flex-wrap gap-3">
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
              </div>

              {/* ---------- Article Body ---------- */}
              <div className="md:w-3/4">
<div className="article-body prose max-w-none leading-relaxed text-gray-800">
  {article.body.split("\n").map((paragraph, i) => (
    <div
      key={i}
      className="mb-4"
      dangerouslySetInnerHTML={{ __html: paragraph }}
    />
  ))}
</div>

                {/* ---------- Tags ---------- */}
                <div className="mt-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-700">
                    Tags:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags?.length > 0 ? (
                      article.tags.map((tag, i) => (
                        <span
                          key={i}
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

                {/* ---------- Comments Section ---------- */}
                <div className="mt-10 border-t pt-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">
                    Komentar
                  </h3>

                  {/* Form komentar */}
                  {user ? (
                    <div className="mb-6">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Tulis komentar kamu..."
                        className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={handleAddComment}
                        className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Kirim Komentar
                      </button>
                    </div>
                  ) : (
                    <div className="mb-6 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                      💬 Kamu harus{" "}
                      <span
                        onClick={() => router.push("/login")}
                        className="cursor-pointer font-semibold text-blue-600 hover:underline"
                      >
                        login
                      </span>{" "}
                      untuk menulis komentar.
                    </div>
                  )}

                  {/* Daftar komentar */}
                  {comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 shadow-sm"
                        >
                          {/* Foto profil */}
                          <img
                            src={
                              c.profiles?.avatar_url || "/images/logo/user.png"
                            } // default avatar jika null
                            alt={c.profiles?.full_name || "Anonim"}
                            className="h-10 w-10 rounded-full object-cover"
                          />

                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{c.content}</p>
                            <p className="mt-2 text-xs text-gray-500">
                              Oleh {c.profiles?.full_name || "Anonim"} •{" "}
                              {new Date(c.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Belum ada komentar.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Sidebar ---------- */}
          <div className="mt-8 md:mt-0 md:w-1/4 md:pl-6">
            <div className="mb-6 rounded-lg bg-gray-100 p-4 text-center shadow">
              <AdSlot slot="news_sidebar" />
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-gray-800">New News</h2>

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

                    <p className="line-clamp-2 text-sm font-semibold text-gray-800">
                      {rel.title}
                    </p>

                    <div className=" mt-2 flex items-center justify-end text-xs text-gray-500">
                      {/* <span>{rel.articles_author_id_fkey?.[0]?.full_name || "Anonim"}</span> */}
                      <span>{formatDate(rel.created_at)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No news found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
