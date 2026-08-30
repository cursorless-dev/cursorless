import { createContext, useContext, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

export interface DynamicTOCItem {
  id: string;
  level: number;
  value: string;
}

export interface DynamicTOCState {
  items: DynamicTOCItem[];
  minHeadingLevel: number;
  maxHeadingLevel: number;
}

interface DynamicTOCContextValue {
  dynamicTOC: DynamicTOCState | undefined;
  setDynamicTOC: Dispatch<SetStateAction<DynamicTOCState | undefined>>;
}

const DynamicTOCContext = createContext<DynamicTOCContextValue | undefined>(
  undefined,
);

export function DynamicTOCProvider({ children }: { children: ReactNode }) {
  const [dynamicTOC, setDynamicTOC] = useState<DynamicTOCState>();
  const value = useMemo(() => ({ dynamicTOC, setDynamicTOC }), [dynamicTOC]);

  return (
    <DynamicTOCContext.Provider value={value}>
      {children}
    </DynamicTOCContext.Provider>
  );
}

export function useDynamicTOC(): DynamicTOCContextValue {
  const value = useContext(DynamicTOCContext);
  if (value == null) {
    throw new Error("useDynamicTOC must be used within DynamicTOCProvider");
  }
  return value;
}
