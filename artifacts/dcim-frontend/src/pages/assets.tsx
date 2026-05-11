import React, { useState } from "react";
import { useListAssets, useCreateAsset, useDeleteAsset, getListAssetsQueryKey, AssetStatus, AssetType, AssetInputType, AssetInputStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Assets() {
  const { data: assets, isLoading } = useListAssets();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<AssetInputType>(AssetInputType.SERVER);
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [rackId, setRackId] = useState("");
  const [uPosition, setUPosition] = useState("1");
  const [uHeight, setUHeight] = useState("1");
  const [status, setStatus] = useState<AssetInputStatus>(AssetInputStatus.ACTIVE);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createAsset = useCreateAsset();
  const deleteAsset = useDeleteAsset();

  const filteredAssets = assets?.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAsset.mutate({ 
      data: { 
        name, 
        type, 
        manufacturer, 
        model, 
        serialNumber, 
        rackId: parseInt(rackId, 10), 
        uPosition: parseInt(uPosition, 10), 
        uHeight: parseInt(uHeight, 10), 
        status 
      } 
    }, {
      onSuccess: () => {
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
        toast({ title: "Asset Deployed", description: `Asset ${name} was created.` });
        setName(""); setManufacturer(""); setModel(""); setSerialNumber(""); setRackId("");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to deploy asset. Check rack capacity and slots.", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number, assetName: string) => {
    if (confirm(`Decommission asset ${assetName}?`)) {
      deleteAsset.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
          toast({ title: "Asset Decommissioned", description: `Asset ${assetName} was removed.` });
        }
      });
    }
  };

  const getStatusColor = (s: AssetStatus | undefined) => {
    switch(s) {
      case AssetStatus.ACTIVE: return "text-green-500 border-green-500/30 bg-green-500/10";
      case AssetStatus.MAINTENANCE: return "text-amber-500 border-amber-500/30 bg-amber-500/10";
      case AssetStatus.INACTIVE: return "text-muted-foreground border-border bg-secondary/50";
      default: return "text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
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
                  <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Asset Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="font-mono bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as AssetInputType)}>
                    <SelectTrigger className="font-mono bg-background"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {Object.values(AssetInputType).map(t => <SelectItem key={t} value={t} className="font-mono">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer" className="text-xs uppercase tracking-wider text-muted-foreground">Manufacturer</Label>
                  <Input id="manufacturer" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} className="font-mono bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-xs uppercase tracking-wider text-muted-foreground">Model</Label>
                  <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} className="font-mono bg-background" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial" className="text-xs uppercase tracking-wider text-muted-foreground">Serial Number</Label>
                <Input id="serial" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="font-mono bg-background" />
              </div>
              
              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Location & Placement</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-3">
                    <Label htmlFor="rackId" className="text-xs uppercase tracking-wider text-muted-foreground">Rack ID</Label>
                    <Input id="rackId" type="number" value={rackId} onChange={(e) => setRackId(e.target.value)} required className="font-mono bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uPos" className="text-xs uppercase tracking-wider text-muted-foreground">Start U</Label>
                    <Input id="uPos" type="number" min="1" value={uPosition} onChange={(e) => setUPosition(e.target.value)} required className="font-mono bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uHeight" className="text-xs uppercase tracking-wider text-muted-foreground">Height (U)</Label>
                    <Input id="uHeight" type="number" min="1" value={uHeight} onChange={(e) => setUHeight(e.target.value)} required className="font-mono bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as AssetInputStatus)}>
                      <SelectTrigger className="font-mono bg-background"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        {Object.values(AssetInputStatus).map(t => <SelectItem key={t} value={t} className="font-mono">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createAsset.isPending} className="font-mono uppercase tracking-wider text-xs">
                  {createAsset.isPending ? 'Deploying...' : 'Deploy Asset'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, serial, make..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 font-mono bg-card/50" 
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 border-border bg-card/50">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

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
              <TableRow><TableCell colSpan={6} className="h-24 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">Querying database...</TableCell></TableRow>
            ) : filteredAssets?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">No assets match criteria</TableCell></TableRow>
            ) : (
              filteredAssets?.map((asset) => (
                <TableRow key={asset.id} className="border-border transition-colors hover:bg-secondary/20 group">
                  <TableCell>
                    <div className="font-bold font-mono text-sm text-foreground">{asset.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1 opacity-50">{asset.assetTag || 'NO TAG'}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-mono px-2 py-1 border border-border bg-background rounded uppercase tracking-widest text-muted-foreground">
                      {asset.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs">
                      <Link href={`/racks/${asset.rackId}/view`} className="text-primary hover:underline">{asset.rackName}</Link>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">U{asset.uPosition} ({asset.uHeight}U)</div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-mono px-2 py-1 border rounded uppercase tracking-widest inline-flex items-center gap-1.5 ${getStatusColor(asset.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {asset.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <div>{asset.manufacturer || 'N/A'} {asset.model || ''}</div>
                    <div className="mt-1 opacity-50">{asset.serialNumber || 'SN UNKNOWN'}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id, asset.name)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity">
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
