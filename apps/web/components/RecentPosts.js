export default function RecentPosts({ posts }) {
  if (!posts.length) return null;

  return (
    <section className="card">
      <div className="card-header">
        <h2>Recent Posts</h2>
        <p>Latest posts pulled from LinkedIn.</p>
      </div>
      <ul className="list">
        {posts.map((post) => (
          <li key={post.id} className="list-item">
            <div className="list-text">{post.text || "(empty)"}</div>
            {post.created_at ? (
              <div className="list-meta">{new Date(post.created_at).toLocaleString()}</div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
