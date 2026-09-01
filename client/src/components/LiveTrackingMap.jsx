import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);

  return null;
}

export default function LiveTrackingMap({
  latitude,
  longitude,
}) {
  const hasLocation =
    typeof latitude === "number" &&
    typeof longitude === "number";

  if (!hasLocation) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-400">
        Waiting for mechanic location...
      </div>
    );
  }

  const position = [latitude, longitude];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        style={{
          height: "320px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap position={position} />

        <CircleMarker
          center={position}
          radius={10}
          pathOptions={{
            fillOpacity: 1,
          }}
        >
          <Popup>
            Mechanic current location
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}