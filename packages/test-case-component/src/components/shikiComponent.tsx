import type { Command, CommandLatest } from "@cursorless/common";

export function ShikiComponent({
  data,
}: {
  data: {
    before: string;
    during: string;
    after: string;
    command: CommandLatest | Command;
  };
}) {
  const { spokenForm } = data.command;
  const { before, during, after } = data;
  return (
    <div className="max-w-xl overflow-auto p-4">
      <div className="p-8">
        <h2 className="dark:text-stone-100">{data.command}</h2>
        <div className="m-2 border">
          <Before content={data.before} />
          <div className="command">{data.command}</div>
          <During content={data.during} />
          <After content={data.after} />
        </div>
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
