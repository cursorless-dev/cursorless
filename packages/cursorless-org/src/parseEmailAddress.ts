export interface EmailAddress {
  username: string;
  domain: string;
}
export function parseEmailAddress(email: string): EmailAddress {
  const [username, domain] = email.split("@");
  return { username, domain };
}
