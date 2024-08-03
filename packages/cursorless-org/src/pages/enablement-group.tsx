import {
  default as EnablementGroup,
  meta,
} from "../content/enablement-group.mdx";
import { Layout, bodyClasses } from "../components/Layout";
import { env } from "process";
import type { EmailAddress } from "../parseEmailAddress";
import { parseEmailAddress } from "../parseEmailAddress";

const RELATIVE_URL = "cursorless-enablement";

export async function getStaticProps() {
  return {
    props: {
      // See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
      bodyClasses,

      //! IMPORTANT: Don't return the email address unparsed, because it will
      //! be serialized as JSON and exposed to the client, so spam bots might
      //! find it. Instead, parse it and return the parsed object.
      emailAddress: parseEmailAddress(
        env["ENABLEMENT_GROUP_EMAIL"] ?? "user@example.com",
      ),
    },
  };
}

interface Props extends React.PropsWithChildren {
  emailAddress: EmailAddress;
}

export default function Page({ emailAddress }: Props) {
  return (
    <Layout
      title={meta.title}
      description={meta.description}
      relativeUrl={RELATIVE_URL}
    >
      <EnablementGroup emailAddress={emailAddress} />
    </Layout>
  );
}
