import { Fragment } from 'react';
import {
  DESCRIPTION,
  BASE_URL,
  LOGO_URL,
  YOUTUBE_SLUG,
  TITLE,
} from './constants';

export default function Social() {
  return (
    <Fragment>
      <meta property="og:title" content={TITLE} key="title" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <meta property="og:site_name" content="Cursorless" />
      <meta property="og:url" content={BASE_URL} />
      <meta property="og:image" content={LOGO_URL} />
      <meta property="og:image:width" content="900" />
      <meta property="og:image:height" content="900" />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:type" content="website" />
      <meta
        property="og:video"
        content={`https://www.youtube.com/v/${YOUTUBE_SLUG}`}
      />
      <meta property="og:video:tag" content="voice coding" />
      <meta property="og:video:tag" content="speech recognition programming" />
      <meta property="og:video:tag" content="program voice" />
      <meta property="og:video:tag" content="speech to text programming" />
      <meta property="og:video:tag" content="Talon voice" />
      <meta name="twitter:card" content={DESCRIPTION} />
      <meta name="twitter:site" content="@GoCursorless" />
      <meta name="twitter:url" content={BASE_URL} />
      <meta name="twitter:title" content="Cursorless" />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={LOGO_URL} />
      <link itemProp="url" href={BASE_URL} />
      <meta itemProp="name" content="Cursorless" />
      <meta itemProp="description" content={DESCRIPTION} />
      <meta itemProp="paid" content="false" />
      <meta itemProp="channelId" content="UCIh61mLlS6Do3R_8KnEScIQ" />
      <span itemProp="author" itemScope itemType="http://schema.org/Person">
        <link
          itemProp="url"
          href="https://www.youtube.com/channel/UCIh61mLlS6Do3R_8KnEScIQ"
        />
        <meta itemProp="name" content="Cursorless" />
      </span>
      <link itemProp="thumbnailUrl" href={LOGO_URL} />
      <span
        itemProp="thumbnail"
        itemScope
        itemType="http://schema.org/ImageObject"
      >
        <link itemProp="url" href={LOGO_URL} />
        <meta itemProp="width" content="900" />
        <meta itemProp="height" content="900" />
      </span>
      <meta itemProp="isFamilyFriendly" content="true" />
      <meta
        itemProp="regionsAllowed"
        content="HK,HT,TC,BW,PA,FK,AW,TN,AU,GE,SL,CC,TF,PN,TZ,CL,ET,BN,AR,PH,VI,EE,MY,LB,BM,UG,LU,NZ,KR,GG,BJ,SO,HM,GT,PR,IT,AZ,ZA,MH,MF,CW,UY,MN,MQ,MW,SE,PT,MK,SR,MA,RS,GQ,NP,BD,FM,GD,KI,IL,CK,YE,ML,BF,AO,SG,CG,GS,BI,CY,LR,UM,GH,BR,GY,KP,PM,IO,EH,SK,LV,AQ,IN,RE,LY,ZW,SZ,HR,LT,KE,TT,CR,KW,ER,NF,TK,BE,JM,SA,BH,RO,BO,MM,TH,IE,TD,QA,CN,FR,SC,VU,MG,SY,JP,PS,JO,MV,MD,TL,BY,GN,TJ,DE,TO,TR,BT,FJ,TW,AE,ES,DO,BS,NO,GU,DK,KH,SD,GB,ZM,VE,SS,IQ,AD,KG,NI,PK,PL,CZ,NA,LC,PY,SV,LA,AI,YT,US,VC,IR,NL,NU,AS,AL,GR,SH,GM,LS,ME,TV,EG,CF,DZ,SX,CA,PF,KM,AF,HN,NE,CD,MX,NC,CM,CX,SJ,GW,GF,VG,TG,BA,GP,CV,BQ,MO,SN,CH,BZ,MP,PE,FI,BB,GI,IS,PG,SM,BL,BG,AX,AM,AT,AG,ID,CI,GA,MC,NG,RW,SI,BV,UA,UZ,SB,LI,CU,VN,KN,WS,LK,IM,TM,OM,KY,VA,MT,MZ,DJ,EC,DM,HU,MU,FO,JE,NR,CO,WF,KZ,MR,GL,RU,MS,PW,ST"
      />
    </Fragment>
  );
}
