import { useRef, useEffect, useMemo } from "react";

// ArcGIS Maps SDK for JavaScript
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Home from "@arcgis/core/widgets/Home.js";

import { pointsToGraphics } from "../../utils/processData";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { Location } from "../../App";
import {
  AnalysisLayer,
  getAnalysisLayerInfo,
} from "../../utils/getAnalysisLayerInfo";
import { SelectedLocationElement } from "../../shared/types";

export interface MapContainerProps {
  webmapId: string;
  locations: Location[];
  selectedLocation: SelectedLocationElement | undefined;
  setAnalysisLayers: (layers: AnalysisLayer[]) => void;
}

export const MapContainer = (props: MapContainerProps) => {
  // Refs for the map div and the view
  const mapDiv = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<MapView | null>(null);

  const locationsLayer = useMemo(() => new GraphicsLayer(), []);
  // const locationsLayer = new GraphicsLayer();

  const webmap = useMemo(
    () =>
      new WebMap({
        portalItem: {
          id: props.webmapId,
        },
      }),
    []
  );
  webmap.layers.add(locationsLayer);

  useEffect(() => {
    if (mapDiv.current) {
      viewRef.current = new MapView({
        container: mapDiv.current,
        map: webmap,
      });
    }
  }, [mapDiv]);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.when(() => {
        // List all of the feature layers and cast them as a
        // feature layer - they default to the generic Layer
        const analysisLayers: AnalysisLayer[] = [];
        webmap.allLayers.forEach((layer, index) => {
          if (layer.type === "feature") {
            analysisLayers.push(
              getAnalysisLayerInfo(layer as FeatureLayer, index)
            );
          }
        });
        const home = new Home({
          view: viewRef.current,
        });
        viewRef.current.ui.add(home, "top-right");
        console.log(analysisLayers);
        props.setAnalysisLayers(analysisLayers);
      });
      // webmap.layers.add(locationsLayer);
    }
  }, [viewRef]);

  // Update the locations displayed on the map
  useEffect(() => {
    if (viewRef.current && props.locations.length > 0) {
      locationsLayer.removeAll();
      const graphics = pointsToGraphics(props.locations);
      locationsLayer.addMany(graphics);
      viewRef.current.goTo(graphics);
    }
  }, [props.locations]);

  useEffect(() => {
    if (props.selectedLocation) {
      viewRef.current?.goTo({
        target: props.selectedLocation.zoomToLocation,
        zoom: 10,
        opts: { durration: 500 },
      });
      viewRef.current?.map.allLayers.forEach((layer) => {
        if (layer.title === props.selectedLocation?.displayLayer) {
          layer.visible = true;
        } else {
          if (layer.type === "feature") layer.visible = false;
        }
      });
    } else {
      viewRef.current?.map.allLayers.forEach((layer) => {
        if (layer.type === "feature") layer.visible = false;
      });
    }
  }, [props.selectedLocation]);

  return <div className="arcgis--map" ref={mapDiv}></div>;
};
