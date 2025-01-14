import type { EmailAddress } from "../parseEmailAddress";

interface Props extends React.PropsWithChildren {
  address: EmailAddress;
  subject?: string;
  body?: string;
}

/**
 * Encodes a string for use in a URL, but unlike encodeURIComponent, it encodes
 * every character, including regular ASCII characters [a-zA-Z] etc. For example:
 *
 *     encodeURIComponent("user@example.com") === "%75%73%65%72%40%65%78%61%6D%70%6C%65%2E%63%6F%6D"
 *
 * @param str The string to encode
 * @returns A URL-encoded version of the string, where every character is encoded
 */
function strictEncodeURIComponent(str: string) {
  const components: string[] = [];
  for (let i = 0; i < str.length; i++) {
    components.push("%" + str.charCodeAt(i).toString(16).toUpperCase());
  }
  return components.join("");
}

/**
 * A link to an email address, attempting to prevent spam bots from finding it.
 * Encodes the URI for the href using very aggressive uri encoding, and for the
 * displayed email text, injects dummy text in a hidden span so that bots will
 * see it but humans won't.
 *
 * Tricks taken from https://spencermortensen.com/articles/email-obfuscation/
 *
 * @param param0 The email address to use
 * @returns A link to the email address, attempting to prevent spam bots from
 *         finding it
 */
export function SpamProofEmailLink({
  address: { username, domain },
  subject,
  body,
  children,
}: Props) {
  // URL encode every character of the email address, including the mailto: prefix
  const rawEmailHref = `${username}@${domain}`;
  let href = `mailto:${strictEncodeURIComponent(rawEmailHref)}`;

  if (subject != null) {
    const subjectEncoded = encodeURIComponent(subject).replace(/\+/g, "%20");
    href += `?subject=${subjectEncoded}`;
  }

  if (body != null) {
    const bodyEncoded = encodeURIComponent(body).replace(/\+/g, "%20");
    href += (href.includes("?") ? "&" : "?") + `body=${bodyEncoded}`;
  }

  return (
    <a
      href={href}
      className="text-teal-600 underline underline-offset-4 hover:text-teal-500 dark:text-teal-500 hover:dark:text-teal-300"
    >
      {children ?? (
        <span className="text-[18px]">
          {`${username}@`}
          <span className="hidden">Die spam!</span>
          {domain}
        </span>
      )}
    </a>
  );
}
