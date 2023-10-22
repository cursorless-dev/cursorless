import { Modifier } from "@cursorless/common";
import { Handler } from "../Handler";

export async function modifyInteriorExterior(
    mode: Handler,
    keySequence: string
  ): Promise<void> {

    if (keySequence !== "interiorOnly" && keySequence !== "excludeInterior") {
      throw Error(`Unsupported modifier: ${keySequence}`);
    }

    const modifier = {
        type: keySequence as "interiorOnly" | "excludeInterior",
    }
    mode.addModifier(modifier);
  }


