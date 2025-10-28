"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/components/common/Loader";
import Navbar from "@/components/Navbar/page";
import Footer from "@/components/Footer/footer";

interface Article {
  id: string;
  title: string;
  body: string;
  image_path: string;
  published: boolean;
  created_at: string;
  articles_author_id_fkey: { full_name: string | null }[];
}

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [article, setArticle] = useState<Article | null>(null);
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
        articles_author_id_fkey ( full_name )
      `,
      )
      .eq("id", articleId)
      .single();

    if (error) {
      console.error("❌ Error fetching article:", error);
    } else {
      setArticle(data);
    }

    setLoading(false);
  };

  if (loading) {
    return <Loader />;
  }

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
      <div className="mx-auto p-6 md:px-40 mt-10">
        {/* <button
          onClick={() => router.push("/")}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to News
        </button> */}

        <div className="items-cente mb-4 flex ">
          <span className="mr-2 bg-red-600 pt-3 text-2xl text-red-600">.</span>
          <h1 className="text-5xl font-extrabold text-black-2">{article.title}</h1>
        </div>
        <p className="mb-6 text-sm text-gray-500">
          {new Date(article.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}{" "}
          <br />
          By{" "}
          {article.articles_author_id_fkey?.[0]?.full_name ||
            "Unknown Author"}{" "}
          •{" "}
        </p>
        <div className="md:flex ">
          <div className="md:w-3/4">
            {article.image_path && (
              <img
                src={article.image_path}
                alt={article.title}
                className="mb-6 h-150 w-full rounded-2xl object-cover shadow-md"
              />
            )}
            <div className="md:flex">
              <div className="md:w-1/4"></div>
              <div className="md:w-3/4">
                          <div className="prose max-w-none leading-relaxed text-gray-800">
              {article.body.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  <div
                    className=""
                    dangerouslySetInnerHTML={{ __html: paragraph }}
                  />
                </p>
              ))}
            </div></div>
              
            </div>

          </div>
          <div className="md:w-1/4"></div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
