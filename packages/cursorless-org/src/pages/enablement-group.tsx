import {
  default as EnablementGroup,
  meta,
} from "../content/enablement-group.mdx";
import { Layout, bodyClasses } from "../components/Layout";

const RELATIVE_URL = "cursorless-enablement";

// See https://github.com/vercel/next.js/discussions/12325#discussioncomment-1116108
export async function getStaticProps() {
  return { props: { bodyClasses } };
}

export default function Page() {
  return (
    <Layout
      title={meta.title}
      description={meta.description}
      relativeUrl={RELATIVE_URL}
    >
      <EnablementGroup />
    </Layout>
  );
}
