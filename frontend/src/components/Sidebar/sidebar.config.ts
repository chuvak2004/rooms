import { GridViewRounded, MeetingRoomRounded, DevicesOtherRounded, BookmarksRounded } from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";

export interface SectionItem {
  id: string;
  label: string;
  icon: SvgIconComponent;
}

export const SECTIONS: SectionItem[] = [
  { id: "overview", label: "Обзор", icon: GridViewRounded },
  { id: "halls", label: "Залы", icon: MeetingRoomRounded },
  { id: "equipment", label: "Оборудование", icon: DevicesOtherRounded },
  { id: "reservations", label: "Резервы", icon: BookmarksRounded },
];
