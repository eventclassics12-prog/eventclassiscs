export function ContactIntro({ text, email }: { text: string; email: string }) {
  // Preserve existing CMS copy while allowing the contact address to change.
  const resolvedText = email ? text.replaceAll("{email}", email).replaceAll("info@eventclassics.in", email) : text;
  const parts = email ? resolvedText.split(email) : [resolvedText];
  return <>{parts.map((part, i) => <span key={i}>{i > 0 && <a href={`mailto:${email}`}>{email}</a>}{part}</span>)}</>;
}
