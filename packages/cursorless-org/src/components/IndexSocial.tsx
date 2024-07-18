import BaseSocial from "./BaseSocial";
import { DESCRIPTION, TITLE, VIDEO_SHARE_THUMBNAIL_URL } from "./constants";

export default function IndexSocial() {
  return (
    <BaseSocial
      title={TITLE}
      description={DESCRIPTION}
      youtubeSlug={VIDEO_SHARE_THUMBNAIL_URL}
      relativeUrl=""
    />
  );
}
