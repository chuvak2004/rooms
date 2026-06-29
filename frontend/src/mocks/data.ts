import type { RoomsResponseDto } from "@/api/roomsApi";

export const roomsPayload: RoomsResponseDto = {
  items: [
    { id: "A1", code: "A-01", name: "Атриум", capacity: 60, equipment: ["projector", "microphone", "wifi"], status: "available" },
    { id: "B2", code: "B-12", name: "Студия", capacity: 18, equipment: ["board", "wifi"], status: "booked" },
    { id: "C3", code: "C-30", name: "Лаборатория", capacity: 24, equipment: ["computers", "projector", "wifi"], status: "available" },
    { id: "D4", code: "D-04", name: "Переговорная", capacity: 8, equipment: ["wifi"], status: "maintenance" },
  ],
  page: 1,
  total: 64,
};
