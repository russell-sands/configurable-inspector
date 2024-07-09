# Configurable Inspector

## Deployment

1. Download the application
1. Open your command prompt and navigate to the folder containing the app
1. Run `npm install`
1. Update `./src/config.json` (see below)
1. Update `homepage` in `package.json` if needed
1. Run ``npm run dev` and confirm that the app behaves as expected
1. Run `npm run build` and deploy the results from `./dist`

## Modifying `config.json`

Before building the application, it is important to update the settings found in `./src/config.json`. This file defines the default title, subtitle, and icon; the information required to authenticate your users; and the default web map to use.

```json
{
  "oAuth": {
    "portalUrl": "Specify an ArcGIS Online or Enterprise portal URL e.g. https://my-portal.maps.arcgis.com/",
    "appId": "App ID valid for your portal"
  },
  "application": {
    "heading": "Default title for the application",
    "description": "Default subtitle for the application",
    "icon": "Default calcite icon to use"
  },
  "analysis": {
    "webmapId": "Default webmap, set the item ID for a webmap in your portal."
  }
}
```

For more information see:

- **appId**: Refer to the documentation for adding and registering an app in [ArcGIS Online](https://doc.arcgis.com/en/arcgis-online/manage-data/add-app-url.htm) or [ArcGIS Enterprise](https://enterprise.arcgis.com/en/portal/latest/use/add-app-url.htm)
- **icon**: Set a valid [calcite icon id](https://developers.arcgis.com/calcite-design-system/icons/).

## Configuring Location Level and Layer Level results

When the application loads, it inspects its webmap to determine what data to analyze at the location and layer level. It does this by inspecting the layers that were added to the map, the renderer applied to those layers, and any charts created from those layers. Based on how the map was created, this application will determine what data to request at the location level, what data to summarize at the layer level, and what comparison charts (optional) to show.

**Add an attribute to the results**
To add an attribute to the results:

1. Add the Feature Layer that contains the attribute you want to analyze to your web map.
1. Open the styles editor and select the field you want to display in the results
1. Define symbology as you see fit.
1. Save the web map and refresh the app.

The symbology defined on the layer will determine what information shows up at the location level and the kind of chart used at the layer level:

| Symbol Type      | Location Level Result\*                   | Layer Level Chart Type\*       |
| ---------------- | ----------------------------------------- | ------------------------------ |
| Single symbol    | "Inside boundary" or "Outside Boundary    | Pie chart (record count)       |
| Unique values    | Legend label (not raw value)              | Pie Chart (record count)       |
| Class breaks     | Class break label for overlapping feature | Bar chart, bars = class breaks |
| Unclassed values | Value at overlapping feature              | Histogram                      |
| Pie chart        | Raw value & % of total per pie attribute  | Pie Chart (sum of values)      |
| Relationship     | Relationship label (e.g. "High-High")     | Pie Chart (record count)       |

\* _Normalized values and Expression based values will be applied at the location and layer level_

**Remove an attribute from the results**
To remove an attribute from the results:

1. Remove the layer which corresponds to that attribute from the web map
1. Save the web map.

**Supported layers**:

- Feature Layers
  - All feature layer renderer types
  - Arcade expression based renderers
  - Field-based normalizaton of class-breaks or unclassed data

**Unsupported Layers**:

- All layers other than Feature Layers (i.e KML Layers, Raster Layers)
- Group layers: Feature Layers contained in groups must be ungrouped.

**Other things to be aware of / keep in mind**:

- **Each layer must have a unique name**, layer names in your web map must not repeat.
- If you have feature layers with multiple attributes to analyze, you must create a copy of the layer and define the layers symbology based on that attribute.
- You must refresh the app for any changes in the web map to be reflected in your results

### Add and configure charts (Optional)

You may optionally configure charts on your layers. At load time, the application checks each layer for defined charts. If charts are found, an additional result section for "Comparison Charts" will appear. For every chart defined in your web map, "Comparison Charts" will display:

1. The chart _exactly_ as you defined it, reflecting all records in the whole map
1. A copy of the chart, containing data summarized from the _location level_ results.

These charts then allow for comparing the overall distribution of values in your map to the distribution of values at locations you upload. Charts may include any attributes, including attributes that are not symbolized on the map.

**Other things to be aware of / keep in mind**:

- Each chart must have a unique name, chart names in your web map must not repeat.
- ArcGIS Charts are realtively heavy. Adding many charts to your map may negatively impact initial draw performance.

## Using the Application

### Uploading Data

When the applicaiton loads, you must first select a CSV file to upload. This CSV file should define the locations you wish to analyze. These locations must have either:

- Single-line addresses
- Latitude and Longitude values (WGS1984)

After mapping fields and clicking "submit", locations are immediately analyzed.

### Result Information

After loading your file, you will initially see:

- Location level results from each layer on your map, with results based on your symbol definitions
- A web map showing the locations.
  - All layers will be turned off by default.
  - Clicking on a location-level result will zoom to that location and turn on the corresponding layer.

Depending on your web map, you will also see chips to toggle between:

- Summary results at the layer level
- Comparision charts to compare your results to the overall distribution in the map

## On-the-fly customization with URL Parameters

You may alter the UI and web map using query parameters. The following parameters are supported

- **webmap** set the Item ID of the webmap you would like to analyze. If not specified, the default from config.json will be used.
- **title** set the title of the app. If not specified, the default from config.json will be used.
- **subtitle** set the subtitle of the app. If not specified, the default from config.json will be used.
- **title** specify a calcite icon to use. See the [calcite icon documentation](https://developers.arcgis.com/calcite-design-system/icons/) for supported icon IDs. If not specified, the default from config.json will be used.
