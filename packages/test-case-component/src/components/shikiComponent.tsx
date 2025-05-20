import type { Command, CommandLatest } from "@cursorless/common";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";

export function ShikiComponent({
  data,
  debug,
}: {
  data: {
    before: { html: string; data: string[] };
    during: { html: string; data: string[] };
    after: { html: string; data: string[] };
    command: CommandLatest | Command;
  };
  debug?: boolean;
}) {
  const { spokenForm } = data.command;
  const { before, during, after } = data;
  return (
    <div className="mx-16 overflow-auto p-4 px-10">
      <div className="">
        <h2 className="dark:text-stone-100">{spokenForm}</h2>

        {debug && (
          <div className="my-4 outline">
            <Before content={before.html} />
            <div className="command">{spokenForm}</div>
            <During content={during.html} />
            <After content={after.html} />
          </div>
        )}
        <Carousel>
          <Before content={before.html} />
          <During content={during.html} />
          <After content={after.html} />
        </Carousel>
      </div>

      <details>
        <summary>JSON</summary>
        <pre className="max-w-xl overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}

const Before = ({ content }: { content: string }) => {
  return (
    <div
      className="rounded-md py-4"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

const During = ({ content }: { content: string }) => {
  if (content) {
    return (
      <div
        className="rounded-md py-4"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return <></>;
};

const After = ({ content }: { content: string }) => {
  return (
    <div
      className="rounded-md py-4"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

const STEP_DURATIONS = [1500, 500, 2000]; // milliseconds

function Carousel({ children }: { children: React.ReactNode[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % children.length);
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? children.length - 1 : prevIndex - 1,
    );
  };

  const handleIndicatorClick = (index: number) => {
    setActiveIndex(index);
  };

  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    const duration = STEP_DURATIONS[activeIndex] || 3000;

    timeoutRef.current = setTimeout(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % children.length);
    }, duration);

    return () => clearTimeout(timeoutRef.current);
  }, [activeIndex, children.length]);

  const CarouselItem = ({
    child,
    isActive,
  }: {
    child: React.ReactNode;
    isActive: boolean;
  }) => {
    return (
      <div
        className={clsx("transform transition-all duration-700 ease-in-out", {
          "block scale-100 opacity-100": isActive,
          "hidden scale-95 opacity-0": !isActive,
        })}
        data-carousel-item={isActive ? "active" : undefined}
      >
        {child}
      </div>
    );
  };

  return (
    <div
      id="default-carousel"
      className="relative w-full"
      data-carousel="slide"
    >
      {/* <!-- Carousel wrapper --> */}
      <div className="relative h-56 overflow-hidden rounded-lg bg-gray-900 md:h-96">
        <div className="absolute right-2 top-2 z-30 font-bold text-red-500">
          {activeIndex + 1}/{children.length}
        </div>
        {children.map((child, index) => (
          <CarouselItem
            key={index}
            child={child}
            isActive={index === activeIndex}
          />
        ))}
      </div>
      {/* <!-- Slider indicators --> */}
      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 space-x-3 rtl:space-x-reverse">
        {children.map((_, index) => (
          <button
            key={index}
            type="button"
            className={clsx("h-3 w-3 rounded-full", {
              "bg-blue-500": index === activeIndex,
              "bg-gray-300": index !== activeIndex,
            })}
            aria-current={index === activeIndex}
            aria-label={`Slide ${index + 1}`}
            onClick={() => handleIndicatorClick(index)}
          ></button>
        ))}
      </div>
      {/* <!-- Slider controls --> */}
      <SliderButton additionalClasses="-start-12 top-0" callback={handlePrev} />
      <SliderButton
        additionalClasses="rotate-180 -end-12 top-0"
        callback={handleNext}
      />
    </div>
  );
}

const SliderButton = ({
  additionalClasses,
  callback,
}: {
  additionalClasses?: string;
  callback: React.MouseEventHandler;
}) => {
  return (
    <button
      type="button"
      className={clsx(
        "group absolute z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none",
        additionalClasses,
      )}
      onClick={callback}
      data-carousel-next
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-base group-hover:bg-gray-100 group-focus:outline-none group-focus:ring-4 group-focus:ring-white dark:bg-gray-800 dark:text-white dark:group-hover:bg-gray-700 dark:group-focus:ring-white">
        <svg
          className="h-4 w-4 rtl:rotate-180"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 6 10"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 1 1 5l4 4"
          />
        </svg>
        <span className="sr-only">Next</span>
      </span>
    </button>
  );
};
