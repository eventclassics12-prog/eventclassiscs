import Link from "next/link";
import type { PostData } from "@/lib/cms";
import { mediaAlt, mediaUrl } from "@/lib/cms";
import { formatPostDate, readingTimeOf } from "@/lib/blog";
import "./HomeJournal.css";

/**
 * Hallmark · home — latest journal posts.
 *
 * Sharp-cornered square cards, 3 across on desktop and 2 on small
 * screens: the top 60% is a flush-bleed cover image (no padding, no
 * bezels — the img fills its box edge to edge), the bottom 40%
 * carries the date, reading time and title. Same paper/ink editorial
 * language as /blog.
 */
export function HomeJournal({ posts }: { posts: PostData[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="hj" aria-labelledby="hj-title">
      <div className="hj__head">
        <div className="hj__head-text">
          <p className="hj__kicker">(Journal)</p>
          <h2 id="hj-title" className="hj__title">
            Latest thinking
          </h2>
        </div>
        <Link className="hj__all" href="/blog">
          View all <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="hj__grid">
        {posts.map((post) => {
          const src = mediaUrl(post.coverImage);
          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="hj__card"
            >
              <span className="hj__media">
                {src ? (
                  <img
                    src={src}
                    alt={mediaAlt(post.coverImage, post.title)}
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </span>
              <span className="hj__body">
                <span className="hj__meta">
                  {formatPostDate(post.publishedAt)}
                  <span aria-hidden="true"> · </span>
                  {readingTimeOf(post.content)}
                </span>
                <span className="hj__card-title">{post.title}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
