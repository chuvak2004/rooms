import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, IconButton, MenuItem, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import {
  AddRounded, DeleteOutlineRounded, EditOutlined, MeetingRoomRounded,
  DevicesOtherRounded, BookmarksRounded, EventAvailableRounded,
} from "@mui/icons-material";
import { Sidebar, SECTIONS } from "./components/Sidebar";
import { palette } from "./theme";
import "./App.css";

interface Unit {
  id: string;
  name: string;
}

interface Space {
  id: string;
  name: string;
  capacity: number;
}

interface Reservation {
  id: string;
  deviceId: string;
  auditoryId: string;
  startTime: string;
  endTime: string;
  device?: Unit;
  auditory?: Space;
}

const ENDPOINT = import.meta.env.PROD
  ? "https://is-aplication.onrender.com/api"
  : "http://localhost/api";

function App() {
  const [section, setSection] = useState("overview");
  const [units, setUnits] = useState<Unit[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [draft, setDraft] = useState({ devId: "", audId: "", end: "" });
  const [unitName, setUnitName] = useState("");
  const [spaceDraft, setSpaceDraft] = useState({ name: "", cap: 1 });

  const [unitDialog, setUnitDialog] = useState(false);
  const [unitEdit, setUnitEdit] = useState<Unit | null>(null);

  const [spaceDialog, setSpaceDialog] = useState(false);
  const [spaceEdit, setSpaceEdit] = useState<Space | null>(null);

  const [reservationDialog, setReservationDialog] = useState(false);
  const [reservationEdit, setReservationEdit] = useState<Reservation | null>(null);

  const refresh = async () => {
    try {
      const [u, s, r] = await Promise.all([
        fetch(`${ENDPOINT}/devices`).then((x) => x.json()),
        fetch(`${ENDPOINT}/auditories`).then((x) => x.json()),
        fetch(`${ENDPOINT}/bookings`).then((x) => x.json()),
      ]);
      setUnits(u);
      setSpaces(s);
      setReservations(r);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const occupancy = (spaceId: string) => {
    const live = reservations.find(
      (r) => r.auditoryId === spaceId && new Date(r.endTime) > new Date()
    );
    return live
      ? { label: `Занят до ${new Date(live.endTime).toLocaleTimeString()}`, busy: true }
      : { label: "Свободен", busy: false };
  };

  const localDatetime = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const createReservation = async () => {
    try {
      const res = await fetch(`${ENDPOINT}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: draft.devId,
          auditoryId: draft.audId,
          endTime: new Date(draft.end).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Не удалось создать резерв");
      setReservations([data, ...reservations]);
      setDraft({ devId: "", audId: "", end: "" });
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const createUnit = async () => {
    if (!unitName.trim()) return;
    await fetch(`${ENDPOINT}/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: unitName }),
    });
    setUnitName("");
    refresh();
  };

  const createSpace = async () => {
    if (!spaceDraft.name.trim()) return;
    await fetch(`${ENDPOINT}/auditories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: spaceDraft.name, capacity: Number(spaceDraft.cap) }),
    });
    setSpaceDraft({ name: "", cap: 1 });
    refresh();
  };

  const remove = async (path: string, id: string) => {
    await fetch(`${ENDPOINT}/${path}/${id}`, { method: "DELETE" });
    refresh();
  };

  const saveUnit = async () => {
    if (!unitEdit) return;
    try {
      const res = await fetch(`${ENDPOINT}/devices/${unitEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: unitEdit.name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Ошибка сохранения");
      }
      setUnitDialog(false);
      refresh();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const saveSpace = async () => {
    if (!spaceEdit) return;
    try {
      const res = await fetch(`${ENDPOINT}/auditories/${spaceEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: spaceEdit.name, capacity: spaceEdit.capacity }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Ошибка сохранения");
      }
      setSpaceDialog(false);
      refresh();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const saveReservation = async () => {
    if (!reservationEdit) return;
    try {
      const res = await fetch(`${ENDPOINT}/bookings/${reservationEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: reservationEdit.deviceId,
          auditoryId: reservationEdit.auditoryId,
          endTime: reservationEdit.endTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Ошибка сохранения");
      setReservationDialog(false);
      refresh();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const stats = useMemo(() => {
    const now = Date.now();
    const busy = spaces.filter((sp) =>
      reservations.some((r) => r.auditoryId === sp.id && new Date(r.endTime).getTime() > now)
    ).length;
    return [
      { label: "Залы", value: spaces.length, icon: MeetingRoomRounded, tint: "#3b82f6" },
      { label: "Оборудование", value: units.length, icon: DevicesOtherRounded, tint: "#8b5cf6" },
      { label: "Активные резервы", value: busy, icon: EventAvailableRounded, tint: palette.accent },
      { label: "Всего записей", value: reservations.length, icon: BookmarksRounded, tint: "#f59e0b" },
    ];
  }, [spaces, units, reservations]);

  const heading = SECTIONS.find((x) => x.id === section)?.label ?? "Обзор";

  return (
    <div className="shell">
      <Sidebar active={section} onChange={setSection} />

      <Box component="main" sx={{ p: { xs: 2, md: 4 }, maxWidth: 1180, width: "100%", mx: "auto" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4">{heading}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
            </Typography>
          </Box>
          {section === "reservations" && (
            <Button variant="contained" startIcon={<AddRounded />} onClick={() => setSection("reservations")}>
              Новый резерв
            </Button>
          )}
        </Stack>

        {section === "overview" && (
          <Stack spacing={3}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
              {stats.map((st) => {
                const Icon = st.icon;
                return (
                  <Card key={st.label} variant="outlined" sx={{ borderColor: palette.border }}>
                    <CardContent>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${st.tint}22`, color: st.tint, display: "grid", placeItems: "center", mb: 1.5 }}>
                        <Icon fontSize="small" />
                      </Box>
                      <Typography variant="h4">{st.value}</Typography>
                      <Typography color="text.secondary" variant="body2">{st.label}</Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            <Card variant="outlined" sx={{ borderColor: palette.border }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Последние резервы</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Зал</TableCell>
                      <TableCell>Оборудование</TableCell>
                      <TableCell>Окончание</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reservations.slice(0, 5).map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>{r.auditory?.name}</TableCell>
                        <TableCell>{r.device?.name}</TableCell>
                        <TableCell>{new Date(r.endTime).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {reservations.length === 0 && (
                      <TableRow><TableCell colSpan={3} sx={{ color: "text.secondary" }}>Пока нет записей</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Stack>
        )}

        {section === "halls" && (
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ borderColor: palette.border }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Добавить зал</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField fullWidth label="Название" value={spaceDraft.name} onChange={(e) => setSpaceDraft({ ...spaceDraft, name: e.target.value })} />
                  <TextField type="number" label="Вместимость" value={spaceDraft.cap} onChange={(e) => setSpaceDraft({ ...spaceDraft, cap: Number(e.target.value) })} sx={{ width: { sm: 160 } }} />
                  <Button variant="contained" startIcon={<AddRounded />} onClick={createSpace}>Добавить</Button>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderColor: palette.border }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Мест</TableCell>
                    <TableCell>Состояние</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {spaces.map((sp) => {
                    const st = occupancy(sp.id);
                    return (
                      <TableRow key={sp.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{sp.name}</TableCell>
                        <TableCell>{sp.capacity}</TableCell>
                        <TableCell>
                          <Chip size="small" label={st.label} color={st.busy ? "warning" : "success"} variant={st.busy ? "filled" : "outlined"} />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => { setSpaceEdit(sp); setSpaceDialog(true); }}><EditOutlined fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => remove("auditories", sp.id)}><DeleteOutlineRounded fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </Stack>
        )}

        {section === "equipment" && (
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ borderColor: palette.border }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Добавить оборудование</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField fullWidth label="Название" value={unitName} onChange={(e) => setUnitName(e.target.value)} />
                  <Button variant="contained" startIcon={<AddRounded />} onClick={createUnit}>Добавить</Button>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderColor: palette.border }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {units.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => { setUnitEdit(u); setUnitDialog(true); }}><EditOutlined fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => remove("devices", u.id)}><DeleteOutlineRounded fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Stack>
        )}

        {section === "reservations" && (
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ borderColor: palette.border, bgcolor: "#0b1220", color: "#fff" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>Оформить резерв</Typography>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems="stretch">
                  <TextField select fullWidth label="Оборудование" value={draft.devId} onChange={(e) => setDraft({ ...draft, devId: e.target.value })} sx={fieldOnDark}>
                    {units.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                  </TextField>
                  <TextField select fullWidth label="Зал" value={draft.audId} onChange={(e) => setDraft({ ...draft, audId: e.target.value })} sx={fieldOnDark}>
                    {spaces.map((sp) => <MenuItem key={sp.id} value={sp.id}>{sp.name}</MenuItem>)}
                  </TextField>
                  <TextField type="datetime-local" label="До" InputLabelProps={{ shrink: true }} value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} fullWidth sx={fieldOnDark} />
                  <Button variant="contained" size="large" onClick={createReservation}>Занять</Button>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderColor: palette.border }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Оборудование</TableCell>
                    <TableCell>Зал</TableCell>
                    <TableCell>Начало</TableCell>
                    <TableCell>Окончание</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.device?.name}</TableCell>
                      <TableCell>{r.auditory?.name}</TableCell>
                      <TableCell>{new Date(r.startTime).toLocaleString()}</TableCell>
                      <TableCell>{new Date(r.endTime).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => { setReservationEdit(r); setReservationDialog(true); }}><EditOutlined fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => remove("bookings", r.id)}><DeleteOutlineRounded fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Stack>
        )}
      </Box>

      <Dialog open={unitDialog} onClose={() => setUnitDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Редактировать оборудование</DialogTitle>
        <DialogContent>
          <TextField label="Название" value={unitEdit?.name || ""} onChange={(e) => setUnitEdit({ ...unitEdit!, name: e.target.value })} fullWidth sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnitDialog(false)}>Отмена</Button>
          <Button onClick={saveUnit} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={spaceDialog} onClose={() => setSpaceDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Редактировать зал</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Название" value={spaceEdit?.name || ""} onChange={(e) => setSpaceEdit({ ...spaceEdit!, name: e.target.value })} fullWidth />
          <TextField label="Вместимость" type="number" value={spaceEdit?.capacity ?? 1} onChange={(e) => setSpaceEdit({ ...spaceEdit!, capacity: Number(e.target.value) })} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpaceDialog(false)}>Отмена</Button>
          <Button onClick={saveSpace} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reservationDialog} onClose={() => setReservationDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Редактировать резерв</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Начало: {reservationEdit && new Date(reservationEdit.startTime).toLocaleString()}
          </Typography>
          <Divider />
          <TextField select label="Оборудование" value={reservationEdit?.deviceId || ""} onChange={(e) => setReservationEdit({ ...reservationEdit!, deviceId: e.target.value })} fullWidth>
            {units.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
          </TextField>
          <TextField select label="Зал" value={reservationEdit?.auditoryId || ""} onChange={(e) => setReservationEdit({ ...reservationEdit!, auditoryId: e.target.value })} fullWidth>
            {spaces.map((sp) => <MenuItem key={sp.id} value={sp.id}>{sp.name}</MenuItem>)}
          </TextField>
          <TextField type="datetime-local" label="Окончание" value={reservationEdit ? localDatetime(reservationEdit.endTime) : ""} onChange={(e) => setReservationEdit({ ...reservationEdit!, endTime: new Date(e.target.value).toISOString() })} InputLabelProps={{ shrink: true }} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReservationDialog(false)}>Отмена</Button>
          <Button onClick={saveReservation} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const fieldOnDark = {
  "& .MuiOutlinedInput-root": { background: "#15203a", color: "#fff" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiSvgIcon-root": { color: "#94a3b8" },
};

export default App;
