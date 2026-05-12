import React, { useState } from "react";
import {
  useListIncidents,
  useCreateIncident,
  useUpdateIncident,
  useDeleteIncident,
  useListAssets,
  getListIncidentsQueryKey,
  IncidentStatus,
  IncidentSeverity,
  type IncidentInput,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Pencil,
  Trash2,
  ShieldAlert,
} from "lucide-react";

const SEVERITY_STYLES: Record<string, string> = {
  LOW:      "text-blue-400 border-blue-500/30 bg-blue-500/10",
  MEDIUM:   "text-amber-400 border-amber-500/30 bg-amber-500/10",
  HIGH:     "text-orange-400 border-orange-500/30 bg-orange-500/10",
  CRITICAL: "text-red-400 border-red-500/30 bg-red-500/10",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN:        "text-red-400 border-red-500/30 bg-red-500/10",
  IN_PROGRESS: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  RESOLVED:    "text-green-400 border-green-500/30 bg-green-500/10",
};

function statusIcon(status: string) {
  if (status === "RESOLVED") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === "IN_PROGRESS") return <Clock className="h-3.5 w-3.5" />;
  return <AlertTriangle className="h-3.5 w-3.5" />;
}

const blankForm = (): IncidentInput => ({
  title: "",
  description: "",
  severity: IncidentSeverity.MEDIUM,
  status: IncidentStatus.OPEN,
  assetId: undefined,
  assignedTo: "",
});

export default function Incidents() {
  const { isAdmin, canWrite: canWriteAssets, canViewIncidents } = useAuth();
  const canWrite = isAdmin || (!canWriteAssets && canViewIncidents); // ADMIN or ENGINEER
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<IncidentInput>(blankForm());

  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<IncidentInput>(blankForm());
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: incidents = [], isLoading } = useListIncidents(
    statusFilter !== "ALL" ? { status: statusFilter as IncidentStatus } : undefined
  );
  const { data: assets = [] } = useListAssets();

  const createIncident = useCreateIncident();
  const updateIncident = useUpdateIncident();
  const deleteIncident = useDeleteIncident();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListIncidentsQueryKey() });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createIncident.mutate(
      { data: { ...form, assetId: form.assetId ?? undefined, assignedTo: form.assignedTo || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Incident Created" });
          setIsCreateOpen(false);
          setForm(blankForm());
          invalidate();
        },
        onError: () => toast({ title: "Failed to create incident", variant: "destructive" }),
      }
    );
  };

  const openEdit = (id: number, current: IncidentInput) => {
    setEditId(id);
    setEditForm(current);
    setSheetOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    updateIncident.mutate(
      { id: editId, data: { ...editForm, assetId: editForm.assetId ?? undefined, assignedTo: editForm.assignedTo || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Incident Updated" });
          setSheetOpen(false);
          invalidate();
        },
        onError: () => toast({ title: "Update Failed", variant: "destructive" }),
      }
    );
  };

  const handleResolve = (id: number, current: IncidentInput) => {
    updateIncident.mutate(
      { id, data: { ...current, status: IncidentStatus.RESOLVED, assetId: current.assetId ?? undefined, assignedTo: current.assignedTo || undefined } },
      {
        onSuccess: () => { toast({ title: "Incident Resolved" }); invalidate(); },
        onError: () => toast({ title: "Failed to resolve", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Delete incident "${title}"? This cannot be undone.`)) return;
    deleteIncident.mutate({ id }, {
      onSuccess: () => { toast({ title: "Incident Deleted" }); invalidate(); },
    });
  };

  const openCount = incidents.filter(i => i.status === "OPEN").length;
  const inProgressCount = incidents.filter(i => i.status === "IN_PROGRESS").length;
  const resolvedCount = incidents.filter(i => i.status === "RESOLVED").length;

  const IncidentForm = ({ f, setF }: { f: IncidentInput; setF: (v: IncidentInput) => void }) => (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
        <Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required className="font-mono bg-background" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
        <Textarea value={f.description ?? ""} onChange={e => setF({ ...f, description: e.target.value })} rows={3} className="font-mono bg-background text-xs resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Severity</Label>
          <Select value={f.severity ?? IncidentSeverity.MEDIUM} onValueChange={v => setF({ ...f, severity: v as IncidentSeverity })}>
            <SelectTrigger className="font-mono bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.values(IncidentSeverity).map(s => (
                <SelectItem key={s} value={s} className="font-mono">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
          <Select value={f.status ?? IncidentStatus.OPEN} onValueChange={v => setF({ ...f, status: v as IncidentStatus })}>
            <SelectTrigger className="font-mono bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.values(IncidentStatus).map(s => (
                <SelectItem key={s} value={s} className="font-mono">{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Linked Asset (optional)</Label>
        <Select value={f.assetId ? String(f.assetId) : "NONE"} onValueChange={v => setF({ ...f, assetId: v === "NONE" ? undefined : Number(v) })}>
          <SelectTrigger className="font-mono bg-background text-xs"><SelectValue placeholder="No asset linked" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE" className="font-mono text-xs text-muted-foreground">— None —</SelectItem>
            {assets.map(a => (
              <SelectItem key={a.id} value={String(a.id)} className="font-mono text-xs">{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Assigned To</Label>
        <Input value={f.assignedTo ?? ""} onChange={e => setF({ ...f, assignedTo: e.target.value })} placeholder="username" className="font-mono bg-background text-xs" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Incidents</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1 uppercase tracking-widest">OPERATIONAL EVENTS</p>
        </div>
        {canWrite && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="font-mono uppercase tracking-wider text-xs">
                <Plus className="mr-2 h-4 w-4" /> New Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[540px] bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-mono uppercase tracking-widest text-primary">New Incident</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <IncidentForm f={form} setF={setForm} />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createIncident.isPending} className="font-mono uppercase tracking-wider text-xs">
                    {createIncident.isPending ? "Creating…" : "Create Incident"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Open", count: openCount, style: "text-red-400", icon: <AlertTriangle className="h-4 w-4 text-red-400/60" /> },
          { label: "In Progress", count: inProgressCount, style: "text-amber-400", icon: <Clock className="h-4 w-4 text-amber-400/60" /> },
          { label: "Resolved", count: resolvedCount, style: "text-green-400", icon: <CheckCircle2 className="h-4 w-4 text-green-400/60" /> },
        ].map(k => (
          <div key={k.label} className="rounded-md border border-border bg-card/50 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k.label}</p>
              <p className={`text-2xl font-bold font-mono mt-1 ${k.style}`}>{k.count}</p>
            </div>
            {k.icon}
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border transition-all ${
              statusFilter === s
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-card/50 text-muted-foreground hover:text-foreground hover:border-border/80"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Incident list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground font-mono text-xs uppercase tracking-widest">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading incidents…
        </div>
      ) : incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
          <ShieldAlert className="h-10 w-10 text-muted-foreground/30" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">No incidents found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map(incident => {
            const currentInput: IncidentInput = {
              title: incident.title,
              description: incident.description ?? "",
              severity: incident.severity,
              status: incident.status,
              assetId: incident.assetId ?? undefined,
              assignedTo: incident.assignedTo ?? "",
            };
            return (
              <div
                key={incident.id}
                onClick={() => canWrite && openEdit(incident.id, currentInput)}
                className={`rounded-md border border-border bg-card/50 p-4 transition-colors ${canWrite ? "cursor-pointer hover:bg-secondary/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 border rounded uppercase tracking-widest ${STATUS_STYLES[incident.status]}`}>
                        {statusIcon(incident.status)}{incident.status.replace("_", " ")}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 border rounded uppercase tracking-widest ${SEVERITY_STYLES[incident.severity]}`}>
                        {incident.severity}
                      </span>
                      {incident.assetName && (
                        <span className="text-[10px] font-mono text-muted-foreground border border-border/50 px-2 py-0.5 rounded">
                          {incident.assetName}
                        </span>
                      )}
                    </div>
                    <p className="font-mono font-semibold text-sm mt-2">{incident.title}</p>
                    {incident.description && (
                      <p className="text-xs text-muted-foreground font-mono mt-1 line-clamp-2">{incident.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {incident.assignedTo && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Assigned: <span className="text-foreground/70">{incident.assignedTo}</span>
                        </span>
                      )}
                      {incident.createdAt && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {incident.createdBy && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          by <span className="text-foreground/70">{incident.createdBy}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {canWrite && (
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      {incident.status !== "RESOLVED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResolve(incident.id, currentInput)}
                          disabled={updateIncident.isPending}
                          className="font-mono text-[10px] uppercase tracking-wider h-7 px-2 text-green-400/70 hover:text-green-400 hover:bg-green-500/10 gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Resolve
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(incident.id, currentInput)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {isAdmin && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(incident.id, incident.title)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[420px] sm:w-[480px] bg-card border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-mono uppercase tracking-widest text-primary">Edit Incident</SheetTitle>
            <SheetDescription className="font-mono text-xs text-muted-foreground">#{editId}</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleUpdate}>
            <IncidentForm f={editForm} setF={setEditForm} />
            <div className="pt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSheetOpen(false)} className="font-mono text-xs uppercase tracking-wider">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={updateIncident.isPending} className="font-mono text-xs uppercase tracking-wider">
                {updateIncident.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
