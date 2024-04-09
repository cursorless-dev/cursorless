import * as React from "react";



export const ShikiComponent: React.FC<{ data: any }> = ({ data }) => {

  return (
    <pre>
        {JSON.stringify(data, null, 2)}
    </pre>
  );
};
