export interface Point {
  latitude: number;
  longitude: number;
  speed: {
    min: number;
    max: number;
  };
  isStation: boolean;
  stationId?: number;
  isFixed: boolean;
  isAlert: boolean;
  alert?: {
    message: string;
    type: Alert["type"];
  };
}

export interface MetroStation {
  id: number; // Unique numeric ID for each station on a line
  name: string; // Station name
  line: string; // Metro line color hex value
  latitude: number;
  longitude: number;
  speeds?: {
    min: number;
    max: number;
  };
}

export interface MetroLine {
  name: string;
  id: number; // Unique ID for this line
  color: string; // Metro line color hex value
  start: MetroStation; // Starting station node
  end: MetroStation; // Ending station node
  stations: MetroStation[]; // Ordered array of stations
  polyline?: Point[];
}

export const metroLinesColor = {
  Red: "#F44336",
  Blue: "#2196F3",
  Yellow: "#FFEB3B",
  Violet: "#9C27B0",
  Green: "#4CAF50",
  Magenta: "#FF00FF",
  Pink: "#FF4081",
  Orange: "#FF9800",
  Gray: "#9E9E9E",
};

export interface Alert {
  type: "info" | "warning" | "danger" | "none";
  message: string;
  at?: Date;
  speed?: boolean;
}
