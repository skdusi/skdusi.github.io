
export interface Player {
  id: string;
  name: string;
  sessions: number;
}

export interface CalculationState {
  courtCost: number;
  shuttleBoxCost: number;
  players: Player[];
}
