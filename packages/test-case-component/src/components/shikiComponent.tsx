import * as React from "react";

export const ShikiComponent: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="max-w-xl overflow-auto p-4">
      <div className="p-8">
        <h2 className="dark:text-stone-100">{data.command}</h2>
        <div className="m-2 border">
          {data.before && (
            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: data.before }}
            />
          )}
          {(data.during) && (
            <>
              <div
                className="p-4"
                dangerouslySetInnerHTML={{ __html: data.during || data.before }}
              />
            </>
          )}
          <div className="command">{data.command}</div>
          {data.after && (
            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: data.after }}
            />
          )}
        </div>
      </div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

const Before = ({ content }: { content: string }) => {
  return <div className="p-4" dangerouslySetInnerHTML={{ __html: content }} />;
};

const During = ({ content }: { content: string }) => {
  if (content) {
    console.log("🧄", content);

    return (
      <div className="p-4" dangerouslySetInnerHTML={{ __html: content }} />
    );
  }
  return <></>;
};

const After = ({ content }: { content: string }) => {
  return (
    <div
      className="flex flex-col gap-y-4 p-4"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
