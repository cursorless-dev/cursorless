import {
  default as EnablementGroup,
  meta,
} from "../content/enablement-group.mdx";
import { Layout, bodyClasses } from "../components/Layout";
import { env } from "process";
import { parseEmailAddress, EmailAddress } from "./parseEmailAddress";

const RELATIVE_URL = "cursorless-enablement";

// See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
export async function getStaticProps() {
  return {
    props: {
      bodyClasses,
      //! IMPORTANT: Don't return the email address unparsed, because it will
      //! be serialized as JSON and exposed to the client, so spam bots might
      //! find it. Instead, parse it and return the parsed object.
      enablementGroupEmail: parseEmailAddress(
        env["ENABLEMENT_GROUP_EMAIL"] ?? "user@example.com",
      ),
    },
  };
}

interface Props extends React.PropsWithChildren {
  enablementGroupEmail: EmailAddress;
}

export default function Page({ enablementGroupEmail }: Props) {
  return (
    <Layout
      title={meta.title}
      description={meta.description}
      relativeUrl={RELATIVE_URL}
    >
      <EnablementGroup enablementGroupEmail={enablementGroupEmail} />
    </Layout>
  );
}
