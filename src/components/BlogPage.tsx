import type { PostData } from "@/lib/cms";
import { JournalGrid } from "@/components/JournalGrid";
import "./BlogPage.css";

/**
 * Hallmark · /blog — the Journal index.
 *
 * Same editorial language as the rest of the site: paper canvas, ink
 * type, a hairline label strip, one oversized wordmark-style heading,
 * then the journal card grid. Minimal by design.
 */

interface BlogPageProps {
  /** Published posts, newest first. Only posts with a slug are rendered. */
  posts: PostData[];
}

export function BlogPage({ posts }: BlogPageProps) {
  const count = posts.length;

  return (
    <main className="blog">
      {/* Label strip — clears the fixed header, like .wk__strip */}
      <div className="blog__strip">
        <span className="blog__strip-label">Journal</span>
        <span
          className="blog__strip-count"
          aria-label={`${count} ${count === 1 ? "post" : "posts"}`}
        >
          ({String(count).padStart(2, "0")})
        </span>
      </div>

      <header className="blog__hero">
        <h1 className="blog__title">Journal</h1>
        <p className="blog__lede">
          Notes on building brands people remember — from the studio floor.
        </p>
      </header>

      {count > 0 ? (
        <div className="blog__grid-wrap">
          <JournalGrid posts={posts} />
        </div>
      ) : (
        <p className="blog__empty">
          No posts yet — check back soon.
        </p>
      )}
    </main>
  );
}
