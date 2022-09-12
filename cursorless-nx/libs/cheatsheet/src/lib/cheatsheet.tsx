import * as React from 'react';
import CheatsheetListComponent from './components/CheatsheetListComponent';
import CheatsheetLegendComponent from './components/CheatsheetLegendComponent';
import cheatsheetLegend from './cheatsheetLegend';
import Helmet from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import CheatsheetNotesComponent from './components/CheatsheetNotesComponent';
import SmartLink from './components/SmartLink';
import { CheatsheetInfo } from './CheatsheetInfo';

type CheatsheetPageProps = {
  cheatsheetInfo: CheatsheetInfo;
};

// markup
export const CheatsheetPage: React.FC<CheatsheetPageProps> = ({
  cheatsheetInfo,
}) => {
  return (
    <main className="dark:text-stone-100">
      <Helmet
        bodyAttributes={{
          class: 'bg-stone-50 dark:bg-stone-800',
        }}
      />
      <h1 className="text-2xl md:text-3xl text-center mt-2 mb-1 xl:mt-4">
        Cursorless Cheatsheet{' '}
        <span className="text-sm inline-block align-middle">
          <SmartLink to="#legend">
            <FontAwesomeIcon icon={faCircleQuestion} />
          </SmartLink>
        </span>
        <small className="text-sm block">
          See the{' '}
          <SmartLink to={'https://www.cursorless.org/docs/'}>
            full documentation
          </SmartLink>{' '}
          to learn more.
        </small>
      </h1>
      <Cheatsheet cheatsheetInfo={cheatsheetInfo} />
    </main>
  );
};

type CheatsheetProps = {
  cheatsheetInfo: CheatsheetInfo;
};

const Cheatsheet: React.FC<CheatsheetProps> = ({ cheatsheetInfo }) => (
  <div className="p-2 gap-2 md:p-3 md:gap-3 xl:p-4 xl:gap-4 columns-1 md:columns-2 xl:columns-3 xl:max-w-[1600px] xl:mx-auto">
    {cheatsheetInfo.sections
      .filter((section) => section.items.length > 0)
      .map((section) => (
        <CheatsheetSection key={section.id}>
          <CheatsheetListComponent section={section} />
        </CheatsheetSection>
      ))}
    <CheatsheetSection>
      <CheatsheetLegendComponent data={cheatsheetLegend} />
    </CheatsheetSection>
    <CheatsheetSection>
      <CheatsheetNotesComponent />
    </CheatsheetSection>
  </div>
);

type CheatsheetSectionProps = {
  children?: React.ReactNode;
};

const CheatsheetSection: React.FC<CheatsheetSectionProps> = ({ children }) => (
  <section className=" break-inside-avoid mb-5 md:mb-3 xl:mb-4 last:mb-0">
    {children}
  </section>
);
