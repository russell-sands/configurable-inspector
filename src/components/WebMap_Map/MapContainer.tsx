import { useRef, useEffect, useMemo } from "react";

// ArcGIS Maps SDK for JavaScript
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
// import Collection from "@arcgis/core/core/Collection";
import { pointsToGraphics } from "../../utils/processData";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

import { Location } from "../../App";
import {
  AnalysisLayer,
  getAnalysisLayerInfo,
} from "../../utils/getAnalysisLayerInfo";

export interface MapContainerProps {
  webmapId: string;
  locations: Location[];
  // setResults: () => void;
  setAnalysisLayers: (layers: AnalysisLayer[]) => void;
}

export const MapContainer = (props: MapContainerProps) => {
  // Refs for the map div and the view
  const mapDiv = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<MapView | null>(null);

  const locationsLayer = useMemo(() => new GraphicsLayer(), []);

  useEffect(() => {
    if (mapDiv.current) {
      const map = new WebMap({
        portalItem: {
          id: props.webmapId,
        },
      });

      map.add(locationsLayer, 5);

      viewRef.current = new MapView({
        container: mapDiv.current,
        map,
      });
      viewRef.current.when(() => {
        // List all of the feature layers and cast them as a
        // feature layer - they default to the generic Layer
        const analysisLayers: AnalysisLayer[] = [];
        map.allLayers.forEach((layer, index) => {
          if (layer.type === "feature") {
            analysisLayers.push(
              getAnalysisLayerInfo(layer as FeatureLayer, index)
            );
          }
        });
        props.setAnalysisLayers(analysisLayers);
      });
    }
  }, [mapDiv]);

  // Update the locations displayed on the map
  useEffect(() => {
    if (viewRef.current && props.locations.length > 0) {
      locationsLayer.removeAll();
      const graphics = pointsToGraphics(props.locations);
      locationsLayer.addMany(graphics);
      viewRef.current.goTo(graphics);
    }
  }, [props.locations]);

  return <div className="arcgis--map" ref={mapDiv}></div>;
};
