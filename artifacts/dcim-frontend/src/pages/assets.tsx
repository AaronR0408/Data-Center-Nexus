import React, { useState, useMemo, useEffect } from "react";
import {
  useListAssets,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
  getListAssetsQueryKey,
  AssetStatus,
  AssetType,
  AssetInputType,
  AssetInputStatus,
  Asset,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Trash2, Search, Filter, X, ChevronDown, ChevronUp, Pencil, Save, AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── colour maps ──────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  SERVER:  "border-blue-500/40  bg-blue-500/10  text-blue-400  data-[active=true]:bg-blue-500/30  data-[active=true]:border-blue-400",
  SWITCH:  "border-green-500/40 bg-green-500/10 text-green-400 data-[active=true]:bg-green-500/30 data-[active=true]:border-green-400",
  PDU:     "border-amber-500/40 bg-amber-500/10 text-amber-400 data-[active=true]:bg-amber-500/30 data-[active=true]:border-amber-400",
  UPS:     "border-purple-500/40 bg-purple-500/10 text-purple-400 data-[active=true]:bg-purple-500/30 data-[active=true]:border-purple-400",
  STORAGE: "border-pink-500/40  bg-pink-500/10  text-pink-400  data-[active=true]:bg-pink-500/30  data-[active=true]:border-pink-400",
  OTHER:   "border-border        bg-secondary/30 text-muted-foreground data-[active=true]:bg-secondary data-[active=true]:border-foreground/30",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:      "border-green-500/40 bg-green-500/10 text-green-400 data-[active=true]:bg-green-500/30 data-[active=true]:border-green-400",
  MAINTENANCE: "border-amber-500/40 bg-amber-500/10 text-amber-400 data-[active=true]:bg-amber-500/30 data-[active=true]:border-amber-400",
  INACTIVE:    "border-border       bg-secondary/30 text-muted-foreground data-[active=true]:bg-secondary data-[active=true]:border-foreground/30",
};

function toggle<T>(set: Set<T>, v: T): Set<T> {
  const n = new Set(set);
  n.has(v) ? n.delete(v) : n.add(v);
  return n;
}

function isoDate(s: string | null | undefined) {
  if (!s) return "";
  return s.slice(0, 10); // yyyy-mm-dd
}

// ── edit form state shape ────────────────────────────────────────────────────
interface EditState {
  name: string;
  type: AssetInputType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  assetTag: string;
  rackId: string;
  uPosition: string;
  uHeight: string;
  status: AssetInputStatus;
  installDate: string;
  warrantyExpiration: string;
}

function assetToEdit(a: Asset): EditState {
  return {
    name:               a.name,
    type:               a.type as AssetInputType,
    manufacturer:       a.manufacturer ?? "",
    model:              a.model ?? "",
    serialNumber:       a.serialNumber ?? "",
    assetTag:           a.assetTag ?? "",
    rackId:             String(a.rackId),
    uPosition:          String(a.uPosition),
    uHeight:            String(a.uHeight),
    status:             (a.status as AssetInputStatus) ?? AssetInputStatus.ACTIVE,
    installDate:        isoDate(a.installDate),
    warrantyExpiration: isoDate(a.warrantyExpiration),
  };
}

export default function Assets() {
  const { data: assets, isLoading } = useListAssets();
  const queryClient = useQueryClient();
  const { toast }   = useToast();

  // ── filter state ─────────────────────────────────────────────
  const [showFilters, setShowFilters]   = useState(false);
  const [searchTerm, setSearchTerm]     = useState("");
  const [typeFilter, setTypeFilter]     = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [rackFilter, setRackFilter]     = useState("ALL");

  // ── edit sheet state ──────────────────────────────────────────
  const [editAsset, setEditAsset]   = useState<Asset | null>(null);
  const [editState, setEditState]   = useState<EditState | null>(null);
  const [sheetOpen, setSheetOpen]   = useState(false);

  // sync form when asset selection changes
  useEffect(() => {
    if (editAsset) setEditState(assetToEdit(editAsset));
  }, [editAsset]);

  const openEdit = (a: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditAsset(a);
    setSheetOpen(true);
  };

  const set = (field: keyof EditState) => (val: string) =>
    setEditState((prev) => prev ? { ...prev, [field]: val } : prev);

  // ── create form state ─────────────────────────────────────────
  const [isOpen, setIsOpen]               = useState(false);
  const [name, setName]                   = useState("");
  const [type, setType]                   = useState<AssetInputType>(AssetInputType.SERVER);
  const [manufacturer, setManufacturer]   = useState("");
  const [model, setModel]                 = useState("");
  const [serialNumber, setSerialNumber]   = useState("");
  const [rackId, setRackId]               = useState("");
  const [uPosition, setUPosition]         = useState("1");
  const [uHeight, setUHeight]             = useState("1");
  const [status, setStatus]               = useState<AssetInputStatus>(AssetInputStatus.ACTIVE);

  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  // ── derived data ──────────────────────────────────────────────
  const uniqueRacks = useMemo(() => {
    if (!assets) return [];
    const seen = new Map<number, string>();
    assets.forEach((a) => {
      if (!seen.has(a.rackId)) seen.set(a.rackId, a.rackName ?? `Rack ${a.rackId}`);
    });
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [assets]);

  const activeFilterCount =
    typeFilter.size + statusFilter.size + (rackFilter !== "ALL" ? 1 : 0);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    const q = searchTerm.trim().toLowerCase();
    return assets.filter((a) => {
      if (q) {
        const hit =
          a.name.toLowerCase().includes(q) ||
          (a.serialNumber ?? "").toLowerCase().includes(q) ||
          (a.manufacturer ?? "").toLowerCase().includes(q) ||
          (a.model ?? "").toLowerCase().includes(q) ||
          (a.assetTag ?? "").toLowerCase().includes(q) ||
          (a.rackName ?? "").toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (typeFilter.size && !typeFilter.has(a.type)) return false;
      if (statusFilter.size && a.status && !statusFilter.has(a.status)) return false;
      if (rackFilter !== "ALL" && a.rackId !== parseInt(rackFilter, 10)) return false;
      return true;
    });
  }, [assets, searchTerm, typeFilter, statusFilter, rackFilter]);

  const clearAll = () => {
    setSearchTerm(""); setTypeFilter(new Set()); setStatusFilter(new Set()); setRackFilter("ALL");
  };

  // ── helpers ───────────────────────────────────────────────────
  const getStatusClass = (s?: AssetStatus) => {
    switch (s) {
      case AssetStatus.ACTIVE:      return "text-green-500 border-green-500/30 bg-green-500/10";
      case AssetStatus.MAINTENANCE: return "text-amber-500 border-amber-500/30 bg-amber-500/10";
      default:                      return "text-muted-foreground border-border bg-secondary/50";
    }
  };

  const getTypeBadge = (t: string) => {
    const c = (TYPE_COLORS[t] ?? TYPE_COLORS.OTHER)
      .replace(/data-\[active=true\]:[^ ]*/g, "").trim();
    return `text-[10px] font-mono px-2 py-1 border rounded uppercase tracking-widest ${c}`;
  };

  // warranty badge
  const warrantyBadge = (exp?: string | null) => {
    if (!exp) return null;
    const days = Math.ceil((new Date(exp).getTime() - Date.now()) / 86_400_000);
    if (days < 0)   return <span className="text-[10px] font-mono text-red-400 border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 rounded uppercase">EXPIRED</span>;
    if (days <= 90) return <span className="text-[10px] font-mono text-amber-400 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">{days}d left</span>;
    return null;
  };

  // ── handlers ──────────────────────────────────────────────────
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAsset.mutate(
      { data: { name, type, manufacturer, model, serialNumber, rackId: +rackId, uPosition: +uPosition, uHeight: +uHeight, status } },
      {
        onSuccess: () => {
          setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
          toast({ title: "Asset Deployed", description: `${name} added to inventory.` });
          setName(""); setManufacturer(""); setModel(""); setSerialNumber(""); setRackId("");
        },
        onError: () => toast({ title: "Deploy Failed", description: "Check rack capacity and slot availability.", variant: "destructive" }),
      }
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAsset || !editState) return;
    updateAsset.mutate(
      {
        id: editAsset.id,
        data: {
          name:               editState.name,
          type:               editState.type,
          manufacturer:       editState.manufacturer || undefined,
          model:              editState.model || undefined,
          serialNumber:       editState.serialNumber || undefined,
          assetTag:           editState.assetTag || undefined,
          rackId:             parseInt(editState.rackId, 10),
          uPosition:          parseInt(editState.uPosition, 10),
          uHeight:            parseInt(editState.uHeight, 10),
          status:             editState.status,
          installDate:        editState.installDate || undefined,
          warrantyExpiration: editState.warrantyExpiration || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
          toast({ title: "Asset Updated", description: `${editState.name} saved successfully.` });
          setSheetOpen(false);
        },
        onError: () => toast({ title: "Update Failed", description: "Could not save changes.", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number, assetName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm(`Decommission ${assetName}?`)) {
      deleteAsset.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
          toast({ title: "Decommissioned", description: `${assetName} removed from inventory.` });
          if (editAsset?.id === id) setSheetOpen(false);
        },
      });
    }
  };

  // ── render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Global Assets</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1 uppercase tracking-widest">HARDWARE INVENTORY</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono uppercase tracking-wider text-xs">
              <Plus className="mr-2 h-4 w-4" /> Deploy Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase tracking-widest text-primary">Deploy New Asset</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Asset Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required className="font-mono bg-background" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as AssetInputType)}>
                    <SelectTrigger className="font-mono bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.values(AssetInputType).map((t) => <SelectItem key={t} value={t} className="font-mono">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Manufacturer</Label>
                  <Input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} className="font-mono bg-background" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Model</Label>
                  <Input value={model} onChange={(e) => setModel(e.target.value)} className="font-mono bg-background" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Serial Number</Label>
                <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="font-mono bg-background" />
              </div>
              <div className="border-t border-border pt-4">
                <h4 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Location & Placement</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Rack ID</Label>
                    <Input type="number" value={rackId} onChange={(e) => setRackId(e.target.value)} required className="font-mono bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Start U</Label>
                    <Input type="number" min="1" value={uPosition} onChange={(e) => setUPosition(e.target.value)} required className="font-mono bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Height (U)</Label>
                    <Input type="number" min="1" value={uHeight} onChange={(e) => setUHeight(e.target.value)} required className="font-mono bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as AssetInputStatus)}>
                      <SelectTrigger className="font-mono bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.values(AssetInputStatus).map((s) => <SelectItem key={s} value={s} className="font-mono">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={createAsset.isPending} className="font-mono uppercase tracking-wider text-xs">
                  {createAsset.isPending ? "Deploying…" : "Deploy Asset"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, serial, make, model, tag, rack…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 font-mono bg-card/50"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters((p) => !p)}
          className={`font-mono text-xs uppercase tracking-wider gap-2 border-border bg-card/50 hover:bg-secondary/50 ${showFilters ? "border-primary/50 text-primary" : ""}`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
          {showFilters ? <ChevronUp className="h-3.5 w-3.5 ml-0.5" /> : <ChevronDown className="h-3.5 w-3.5 ml-0.5" />}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="font-mono text-xs text-muted-foreground hover:text-foreground gap-1 px-2">
            <X className="h-3 w-3" /> Clear all
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-md border border-border bg-card/60 p-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Asset Type</p>
            <div className="flex flex-wrap gap-2">
              {Object.values(AssetType).map((t) => {
                const active = typeFilter.has(t);
                return (
                  <button key={t} data-active={active}
                    onClick={() => setTypeFilter((p) => toggle(p, t))}
                    className={`font-mono text-[10px] px-3 py-1 rounded border uppercase tracking-widest transition-all cursor-pointer ${TYPE_COLORS[t] ?? TYPE_COLORS.OTHER}`}>
                    {active && <span className="mr-1">✓</span>}{t}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {Object.values(AssetStatus).map((s) => {
                const active = statusFilter.has(s);
                return (
                  <button key={s} data-active={active}
                    onClick={() => setStatusFilter((p) => toggle(p, s))}
                    className={`font-mono text-[10px] px-3 py-1 rounded border uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-1.5 ${STATUS_COLORS[s] ?? STATUS_COLORS.INACTIVE}`}>
                    {active && <span>✓</span>}<span className="w-1.5 h-1.5 rounded-full bg-current" />{s}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Rack</p>
            <Select value={rackFilter} onValueChange={setRackFilter}>
              <SelectTrigger className="font-mono text-xs bg-background w-56 h-8"><SelectValue placeholder="All Racks" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="font-mono text-xs">All Racks</SelectItem>
                {uniqueRacks.map(([id, rname]) => (
                  <SelectItem key={id} value={String(id)} className="font-mono text-xs">{rname}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Result count */}
      {!isLoading && (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {filteredAssets.length === assets?.length
              ? `${assets.length} assets`
              : `${filteredAssets.length} of ${assets?.length ?? 0} assets`}
          </span>
          {activeFilterCount > 0 && filteredAssets.length === 0 && (
            <span className="font-mono text-xs text-amber-400">— no matches, try loosening filters</span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-md bg-card/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase tracking-wider">Asset</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Type</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Location</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Hardware</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Warranty</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">Querying database…</TableCell></TableRow>
            ) : filteredAssets.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">No assets match criteria</TableCell></TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow
                  key={asset.id}
                  onClick={(e) => openEdit(asset, e)}
                  className="border-border transition-colors hover:bg-secondary/20 group cursor-pointer"
                >
                  <TableCell>
                    <div className="font-bold font-mono text-sm text-foreground">{asset.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1 opacity-50">{asset.assetTag ?? "NO TAG"}</div>
                  </TableCell>
                  <TableCell>
                    <span className={getTypeBadge(asset.type)}>{asset.type}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs">
                      <Link href={`/racks/${asset.rackId}/view`} onClick={(e) => e.stopPropagation()} className="text-primary hover:underline">
                        {asset.rackName}
                      </Link>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">U{asset.uPosition} ({asset.uHeight}U)</div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-mono px-2 py-1 border rounded uppercase tracking-widest inline-flex items-center gap-1.5 ${getStatusClass(asset.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />{asset.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <div>{asset.manufacturer ?? "N/A"} {asset.model ?? ""}</div>
                    <div className="mt-1 opacity-50">{asset.serialNumber ?? "SN UNKNOWN"}</div>
                  </TableCell>
                  <TableCell>
                    {warrantyBadge(asset.warrantyExpiration)}
                    {!asset.warrantyExpiration && <span className="text-[10px] font-mono text-muted-foreground opacity-40">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={(e) => openEdit(asset, e)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => handleDelete(asset.id, asset.name, e)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Edit Sheet ───────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[420px] sm:w-[480px] bg-card border-border overflow-y-auto flex flex-col gap-0 p-0">
          {editAsset && editState && (
            <form onSubmit={handleSave} className="flex flex-col h-full">
              {/* Sheet header */}
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <SheetTitle className="font-mono uppercase tracking-widest text-primary text-base">
                      Edit Asset
                    </SheetTitle>
                    <SheetDescription className="font-mono text-xs mt-1 text-muted-foreground">
                      #{editAsset.id} · {editAsset.assetTag ?? "NO TAG"}
                    </SheetDescription>
                  </div>
                  <span className={getTypeBadge(editAsset.type)}>{editAsset.type}</span>
                </div>
              </SheetHeader>

              {/* Form body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Identity */}
                <section className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Identity</p>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
                    <Input value={editState.name} onChange={(e) => set("name")(e.target.value)} required className="font-mono bg-background text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
                      <Select value={editState.type} onValueChange={set("type")}>
                        <SelectTrigger className="font-mono bg-background text-xs h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.values(AssetInputType).map((t) => <SelectItem key={t} value={t} className="font-mono text-xs">{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
                      <Select value={editState.status} onValueChange={set("status")}>
                        <SelectTrigger className="font-mono bg-background text-xs h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.values(AssetInputStatus).map((s) => <SelectItem key={s} value={s} className="font-mono text-xs">{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Asset Tag</Label>
                      <Input value={editState.assetTag} onChange={(e) => set("assetTag")(e.target.value)} className="font-mono bg-background text-xs h-9" placeholder="TAG-xxx" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Serial No.</Label>
                      <Input value={editState.serialNumber} onChange={(e) => set("serialNumber")(e.target.value)} className="font-mono bg-background text-xs h-9" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Manufacturer</Label>
                      <Input value={editState.manufacturer} onChange={(e) => set("manufacturer")(e.target.value)} className="font-mono bg-background text-xs h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Model</Label>
                      <Input value={editState.model} onChange={(e) => set("model")(e.target.value)} className="font-mono bg-background text-xs h-9" />
                    </div>
                  </div>
                </section>

                <Separator className="bg-border" />

                {/* Location */}
                <section className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Location & Placement</p>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Rack ID</Label>
                    <Input type="number" value={editState.rackId} onChange={(e) => set("rackId")(e.target.value)} required className="font-mono bg-background text-xs h-9" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Start U</Label>
                      <Input type="number" min="1" value={editState.uPosition} onChange={(e) => set("uPosition")(e.target.value)} required className="font-mono bg-background text-xs h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Height (U)</Label>
                      <Input type="number" min="1" value={editState.uHeight} onChange={(e) => set("uHeight")(e.target.value)} required className="font-mono bg-background text-xs h-9" />
                    </div>
                  </div>
                </section>

                <Separator className="bg-border" />

                {/* Lifecycle */}
                <section className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Lifecycle</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Install Date</Label>
                      <Input type="date" value={editState.installDate} onChange={(e) => set("installDate")(e.target.value)} className="font-mono bg-background text-xs h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Warranty Exp.</Label>
                      <Input type="date" value={editState.warrantyExpiration} onChange={(e) => set("warrantyExpiration")(e.target.value)} className="font-mono bg-background text-xs h-9" />
                    </div>
                  </div>
                  {editState.warrantyExpiration && (() => {
                    const days = Math.ceil((new Date(editState.warrantyExpiration).getTime() - Date.now()) / 86_400_000);
                    if (days <= 90) return (
                      <div className={`flex items-center gap-2 text-xs font-mono px-3 py-2 rounded border ${days < 0 ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-amber-400 border-amber-500/30 bg-amber-500/10"}`}>
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {days < 0 ? "Warranty EXPIRED" : `Warranty expires in ${days} day${days !== 1 ? "s" : ""}`}
                      </div>
                    );
                    return null;
                  })()}
                </section>
              </div>

              {/* Footer actions */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
                <Button
                  type="button" variant="ghost" size="sm"
                  onClick={(e) => handleDelete(editAsset.id, editAsset.name, e)}
                  className="font-mono text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Decommission
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setSheetOpen(false)}
                    className="font-mono text-xs uppercase tracking-wider border-border">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={updateAsset.isPending}
                    className="font-mono text-xs uppercase tracking-wider gap-1.5">
                    <Save className="h-3.5 w-3.5" />
                    {updateAsset.isPending ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
