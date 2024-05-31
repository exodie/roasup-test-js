export interface Path {
  x: number;
  y: number;
}

export type MinMaxValue = {
  min: number;
  max: number;
};

export type FromToValue = {
  from: number;
  to: number;
};

export interface MinMaxCoords {
  minMaxX: MinMaxValue;
  minMaxY: MinMaxValue;
}

export interface FinishDrawing {
  red: boolean;
  yellow: boolean;
}

export interface Box {
  x: FromToValue;
  y: FromToValue;
}
