import Graphic from "@arcgis/core/Graphic";
import * as arcade from "@arcgis/core/arcade.js";

export const evaluateVisualizationArcade = async (
  script: string,
  feature: Graphic
) => {
  const profile = arcade.createArcadeProfile("visualization");
  const executor = await arcade.createArcadeExecutor(script, profile);
  const result = executor.execute({
    $feature: feature,
  });
  return result;
};
