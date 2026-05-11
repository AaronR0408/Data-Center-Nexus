import React, { useState, useMemo } from "react";
import {
  useListAssets,
  useCreateAsset,
  useDeleteAsset,
  getListAssetsQueryKey,
  AssetStatus,
  AssetType,
  AssetInputType,
  AssetInputStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export default function Assets() {
  const { data: assets, isLoading } = useListAssets();

  // ── filter state ──────────────────────────────────────────────
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [typeFilter, setTypeFilter]   = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [rackFilter, setRackFilter]   = useState<string>("ALL");

  // ── create-asset form state ───────────────────────────────────
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

  const queryClient = useQueryClient();
  const { toast }   = useToast();
  const createAsset = useCreateAsset();
  const deleteAsset = useDeleteAsset();

  // ── unique racks derived from asset list ──────────────────────
  const uniqueRacks = useMemo(() => {
    if (!assets) return [];
    const seen = new Map<number, string>();
    assets.forEach((a) => {
      if (!seen.has(a.rackId)) seen.set(a.rackId, a.rackName ?? `Rack ${a.rackId}`);
    });
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [assets]);

  // ── active filter count ───────────────────────────────────────
  const activeFilterCount =
    typeFilter.size +
    statusFilter.size +
    (rackFilter !== "ALL" ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0);

  const clearAll = () => {
    setSearchTerm("");
    setTypeFilter(new Set());
    setStatusFilter(new Set());
    setRackFilter("ALL");
  };

  // ── filtered assets ───────────────────────────────────────────
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

  // ── helpers ───────────────────────────────────────────────────
  const getStatusClass = (s: AssetStatus | undefined) => {
    switch (s) {
      case AssetStatus.ACTIVE:      return "text-green-500 border-green-500/30 bg-green-500/10";
      case AssetStatus.MAINTENANCE: return "text-amber-500 border-amber-500/30 bg-amber-500/10";
      default:                      return "text-muted-foreground border-border bg-secondary/50";
    }
  };

  const getTypeBadgeClass = (t: string) => {
    const base = TYPE_COLORS[t] ?? TYPE_COLORS.OTHER;
    return `text-[10px] font-mono px-2 py-1 border rounded uppercase tracking-widest ${base.replace(/data-\[active=true\]:[^ ]*/g, "").trim()}`;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAsset.mutate(
      {
        data: {
          name,
          type,
          manufacturer,
          model,
          serialNumber,
          rackId: parseInt(rackId, 10),
          uPosition: parseInt(uPosition, 10),
          uHeight: parseInt(uHeight, 10),
          status,
        },
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
          toast({ title: "Asset Deployed", description: `${name} was added to inventory.` });
          setName(""); setManufacturer(""); setModel(""); setSerialNumber(""); setRackId("");
        },
        onError: () => {
          toast({
            title: "Deploy Failed",
            description: "Check rack capacity and slot availability.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDelete = (id: number, assetName: string) => {
    if (confirm(`Decommission ${assetName}?`)) {
      deleteAsset.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
            toast({ title: "Decommissioned", description: `${assetName} removed from inventory.` });
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Global Assets</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1 uppercase tracking-widest">
            HARDWARE INVENTORY
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono uppercase tracking-wider text-xs">
              <Plus className="mr-2 h-4 w-4" /> Deploy Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase tracking-widest text-primary">
                Deploy New Asset
              </DialogTitle>
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
                    <SelectContent>
                      {Object.values(AssetInputType).map((t) => (
                        <SelectItem key={t} value={t} className="font-mono">{t}</SelectItem>
                      ))}
                    </SelectContent>
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
                      <SelectContent>
                        {Object.values(AssetInputStatus).map((s) => (
                          <SelectItem key={s} value={s} className="font-mono">{s}</SelectItem>
                        ))}
                      </SelectContent>
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

      {/* ── Search + Filter Toggle ────────────────────────────── */}
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
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
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
          {activeFilterCount > (searchTerm ? 1 : 0) > 0 || typeFilter.size || statusFilter.size || rackFilter !== "ALL" ? (
            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {typeFilter.size + statusFilter.size + (rackFilter !== "ALL" ? 1 : 0)}
            </span>
          ) : null}
          {showFilters ? <ChevronUp className="h-3.5 w-3.5 ml-0.5" /> : <ChevronDown className="h-3.5 w-3.5 ml-0.5" />}
        </Button>

        {(typeFilter.size > 0 || statusFilter.size > 0 || rackFilter !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="font-mono text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
          >
            <X className="h-3 w-3" /> Clear all
          </Button>
        )}
      </div>

      {/* ── Filter Panel ─────────────────────────────────────── */}
      {showFilters && (
        <div className="rounded-md border border-border bg-card/60 p-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
          {/* Type chips */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Asset Type
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.values(AssetType).map((t) => {
                const active = typeFilter.has(t);
                const colorClass = TYPE_COLORS[t] ?? TYPE_COLORS.OTHER;
                return (
                  <button
                    key={t}
                    data-active={active}
                    onClick={() => setTypeFilter((prev) => toggle(prev, t))}
                    className={`font-mono text-[10px] px-3 py-1 rounded border uppercase tracking-widest transition-all cursor-pointer ${colorClass}`}
                  >
                    {active && <span className="mr-1">✓</span>}
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status chips */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.values(AssetStatus).map((s) => {
                const active = statusFilter.has(s);
                const colorClass = STATUS_COLORS[s] ?? STATUS_COLORS.INACTIVE;
                return (
                  <button
                    key={s}
                    data-active={active}
                    onClick={() => setStatusFilter((prev) => toggle(prev, s))}
                    className={`font-mono text-[10px] px-3 py-1 rounded border uppercase tracking-widest transition-all cursor-pointer ${colorClass}`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {active && <span>✓</span>}
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {s}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rack dropdown */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Rack
            </p>
            <Select value={rackFilter} onValueChange={setRackFilter}>
              <SelectTrigger className="font-mono text-xs bg-background w-56 h-8">
                <SelectValue placeholder="All Racks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="font-mono text-xs">All Racks</SelectItem>
                {uniqueRacks.map(([id, name]) => (
                  <SelectItem key={id} value={String(id)} className="font-mono text-xs">
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* ── Result count ─────────────────────────────────────── */}
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

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="border border-border rounded-md bg-card/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase tracking-wider">Asset</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Type</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Location</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Hardware</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">
                  Querying database…
                </TableCell>
              </TableRow>
            ) : filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">
                  No assets match criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow
                  key={asset.id}
                  className="border-border transition-colors hover:bg-secondary/20 group"
                >
                  <TableCell>
                    <div className="font-bold font-mono text-sm text-foreground">{asset.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1 opacity-50">
                      {asset.assetTag ?? "NO TAG"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={getTypeBadgeClass(asset.type)}>{asset.type}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs">
                      <Link href={`/racks/${asset.rackId}/view`} className="text-primary hover:underline">
                        {asset.rackName}
                      </Link>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      U{asset.uPosition} ({asset.uHeight}U)
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] font-mono px-2 py-1 border rounded uppercase tracking-widest inline-flex items-center gap-1.5 ${getStatusClass(asset.status)}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {asset.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <div>{asset.manufacturer ?? "N/A"} {asset.model ?? ""}</div>
                    <div className="mt-1 opacity-50">{asset.serialNumber ?? "SN UNKNOWN"}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(asset.id, asset.name)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
