import * as React from "react";

export const ShikiComponent: React.FC<{ data: any }> = ({ data }) => {

  return (
    <div className="px-4">
      <div className="p-8">
        <h2 className="dark:text-stone-100">{data.command}</h2>
        <div key={data.before}>
          {data.before && (
            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: data.before }}
            />
          )}
          {data.during && (
            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: data.during }}
            />
          )}
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
