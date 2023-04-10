import {
  DESCRIPTION,
  BASE_URL,
  VIDEO_SHARE_THUMBNAIL_URL,
  YOUTUBE_SLUG,
  TITLE,
  VIDEO_SHARE_THUMBNAIL_WIDTH,
  VIDEO_SHARE_THUMBNAIL_HEIGHT,
} from "./constants";

export default function Social() {
  return (
    <>
      <meta property="og:title" content={TITLE} key="title" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta property="og:site_name" content="Cursorless" />
      <meta property="og:url" content={BASE_URL} />
      <meta property="og:image" content={VIDEO_SHARE_THUMBNAIL_URL} />
      <meta property="og:image:width" content={VIDEO_SHARE_THUMBNAIL_WIDTH} />
      <meta property="og:image:height" content={VIDEO_SHARE_THUMBNAIL_HEIGHT} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:type" content="video" />
      <meta
        property="og:video:url"
        content={`https://www.youtube.com/embed/${YOUTUBE_SLUG}`}
      />
      <meta
        property="og:video:secure_url"
        content={`https://www.youtube.com/embed/${YOUTUBE_SLUG}`}
      />
      <meta property="og:video:type" content="text/html" />
      <meta property="og:video:width" content="1280" />
      <meta property="og:video:height" content="720" />
      <meta
        property="og:video:url"
        content={`http://www.youtube.com/v/${YOUTUBE_SLUG}?version=3&amp;autohide=1`}
      />
      <meta
        property="og:video:secure_url"
        content={`https://www.youtube.com/v/${YOUTUBE_SLUG}?version=3&amp;autohide=1`}
      />
      <meta property="og:video:type" content="application/x-shockwave-flash" />
      <meta property="og:video:width" content="1280" />
      <meta property="og:video:height" content="720" />

      <meta property="og:video:tag" content="voice coding" />
      <meta property="og:video:tag" content="speech recognition programming" />
      <meta property="og:video:tag" content="program voice" />
      <meta property="og:video:tag" content="speech to text programming" />
      <meta property="og:video:tag" content="Talon voice" />

      <meta name="twitter:card" content="player" />
      <meta name="twitter:site" content="@GoCursorless" />
      <meta name="twitter:url" content={BASE_URL} />
      <meta name="twitter:title" content="Cursorless" />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={VIDEO_SHARE_THUMBNAIL_URL} />
      <meta
        name="twitter:player"
        content={`https://www.youtube.com/embed/${YOUTUBE_SLUG}`}
      />
      <meta name="twitter:player:width" content="1280" />
      <meta name="twitter:player:height" content="720" />
      <link itemProp="url" href={BASE_URL} />
      <meta itemProp="name" content="Cursorless" />
      <meta itemProp="description" content={DESCRIPTION} />
      <meta itemProp="paid" content="false" />
      <meta itemProp="channelId" content="UCIh61mLlS6Do3R_8KnEScIQ" />
      <link itemProp="thumbnailUrl" href={VIDEO_SHARE_THUMBNAIL_URL} />
      <meta itemProp="isFamilyFriendly" content="true" />
      <meta
        itemProp="regionsAllowed"
        content="HK,HT,TC,BW,PA,FK,AW,TN,AU,GE,SL,CC,TF,PN,TZ,CL,ET,BN,AR,PH,VI,EE,MY,LB,BM,UG,LU,NZ,KR,GG,BJ,SO,HM,GT,PR,IT,AZ,ZA,MH,MF,CW,UY,MN,MQ,MW,SE,PT,MK,SR,MA,RS,GQ,NP,BD,FM,GD,KI,IL,CK,YE,ML,BF,AO,SG,CG,GS,BI,CY,LR,UM,GH,BR,GY,KP,PM,IO,EH,SK,LV,AQ,IN,RE,LY,ZW,SZ,HR,LT,KE,TT,CR,KW,ER,NF,TK,BE,JM,SA,BH,RO,BO,MM,TH,IE,TD,QA,CN,FR,SC,VU,MG,SY,JP,PS,JO,MV,MD,TL,BY,GN,TJ,DE,TO,TR,BT,FJ,TW,AE,ES,DO,BS,NO,GU,DK,KH,SD,GB,ZM,VE,SS,IQ,AD,KG,NI,PK,PL,CZ,NA,LC,PY,SV,LA,AI,YT,US,VC,IR,NL,NU,AS,AL,GR,SH,GM,LS,ME,TV,EG,CF,DZ,SX,CA,PF,KM,AF,HN,NE,CD,MX,NC,CM,CX,SJ,GW,GF,VG,TG,BA,GP,CV,BQ,MO,SN,CH,BZ,MP,PE,FI,BB,GI,IS,PG,SM,BL,BG,AX,AM,AT,AG,ID,CI,GA,MC,NG,RW,SI,BV,UA,UZ,SB,LI,CU,VN,KN,WS,LK,IM,TM,OM,KY,VA,MT,MZ,DJ,EC,DM,HU,MU,FO,JE,NR,CO,WF,KZ,MR,GL,RU,MS,PW,ST"
      />
    </>
  );
}
