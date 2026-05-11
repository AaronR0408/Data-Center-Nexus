import React, { useState } from "react";
import { useListRacks, useCreateRack, useDeleteRack, getListRacksQueryKey, useGetRoom } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowRight, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Racks() {
  const params = useParams();
  const roomId = parseInt(params.roomId || "0", 10);
  
  const { data: room } = useGetRoom(roomId, { query: { enabled: !!roomId } });
  const { data: racks, isLoading } = useListRacks(roomId, { query: { enabled: !!roomId } });
  
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [totalU, setTotalU] = useState("42");
  const [description, setDescription] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createRack = useCreateRack();
  const deleteRack = useDeleteRack();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createRack.mutate({ roomId, data: { name, totalU: parseInt(totalU, 10), description } }, {
      onSuccess: () => {
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: getListRacksQueryKey(roomId) });
        toast({ title: "Rack Created", description: `Rack ${name} was created.` });
        setName(""); setTotalU("42"); setDescription("");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create rack.", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number, rackName: string) => {
    if (confirm(`Delete rack ${rackName}?`)) {
      deleteRack.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRacksQueryKey(roomId) });
          toast({ title: "Rack Deleted", description: `Rack ${rackName} was deleted.` });
        }
      });
    }
  };

  if (!roomId) return <div>Invalid Room ID</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
        <Link href="/sites" className="hover:text-primary transition-colors">SITES</Link>
        <span>/</span>
        <Link href={`/sites/${room?.siteId}/rooms`} className="hover:text-primary transition-colors">{room?.siteName || 'SITE'}</Link>
        <span>/</span>
        <span className="text-foreground">{room?.name || '...'}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Racks</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">EQUIPMENT ENCLOSURES</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono uppercase tracking-wider text-xs">
              <Plus className="mr-2 h-4 w-4" /> Add Rack
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase tracking-widest text-primary">Provision New Rack</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2 col-span-3">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Rack Identifier</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="font-mono bg-background" placeholder="e.g. R01-A" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalU" className="text-xs uppercase tracking-wider text-muted-foreground">Height (U)</Label>
                  <Input id="totalU" type="number" min="1" max="52" value={totalU} onChange={(e) => setTotalU(e.target.value)} required className="font-mono bg-background" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">Description / Notes</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="font-mono bg-background resize-none" rows={3} />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createRack.isPending} className="font-mono uppercase tracking-wider text-xs">
                  {createRack.isPending ? 'Provisioning...' : 'Provision'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full h-24 flex items-center justify-center font-mono text-xs text-muted-foreground uppercase tracking-widest">Loading...</div>
        ) : racks?.length === 0 ? (
          <div className="col-span-full h-24 flex items-center justify-center font-mono text-xs text-muted-foreground uppercase tracking-widest border border-border border-dashed rounded-md">No racks provisioned in this room</div>
        ) : (
          racks?.map((rack) => {
            const utilization = ((rack.usedU || 0) / rack.totalU) * 100;
            return (
              <div key={rack.id} className="border border-border rounded-md bg-card/50 overflow-hidden flex flex-col group hover:border-primary/50 transition-colors">
                <div className="p-4 border-b border-border flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      {rack.name}
                    </h3>
                    {rack.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{rack.description}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(rack.id, rack.name)} className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="p-4 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Utilization</span>
                    <span className="text-sm font-mono font-bold">{rack.usedU || 0} / {rack.totalU} U</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${utilization > 80 ? 'bg-destructive' : utilization > 60 ? 'bg-amber-500' : 'bg-primary'}`} 
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-secondary/30 border-t border-border mt-auto">
                  <Link href={`/racks/${rack.id}/view`} className="w-full flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest text-primary hover:text-primary-foreground hover:bg-primary py-2 rounded transition-colors">
                    View Elevation <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
