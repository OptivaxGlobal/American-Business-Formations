import { Info } from 'lucide-react'

// Renders a post's structured `content` block array (see
// src/data/blog/index.js for the schema) as real semantic HTML H2/H3,
// paragraphs, ordered/unordered lists, tables, quotes, and callout notes.
// Kept intentionally simple (no markdown parser, no dangerouslySetInnerHTML)
// so every article's markup is predictable and safe by construction.
export default function BlogContent({ blocks }) {
  return (
    <>
      {(blocks || []).map((block, i) => {
        switch (block.type) {
          case 'heading':
            return block.level === 3
              ? <h3 key={i}>{block.text}</h3>
              : <h2 key={i}>{block.text}</h2>
          case 'list':
            return block.ordered
              ? <ol key={i}>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ol>
              : <ul key={i}>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
          case 'table':
            return (
              <div className="table-scroll" key={i}>
                <table className="blog-table">
                  <thead><tr>{block.headers.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
                  <tbody>{block.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
            )
          case 'quote':
            return <blockquote key={i} className="blog-quote">{block.text}</blockquote>
          case 'note':
            return <div className="article-callout" key={i}><Info size={18} aria-hidden="true" /><p>{block.text}</p></div>
          case 'paragraph':
          default:
            return <p key={i}>{block.text}</p>
        }
      })}
    </>
  )
}
