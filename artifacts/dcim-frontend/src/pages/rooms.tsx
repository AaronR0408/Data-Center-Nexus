import React, { useState } from "react";
import { useListRooms, useCreateRoom, useDeleteRoom, getListRoomsQueryKey, useGetSite } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Rooms() {
  const params = useParams();
  const siteId = parseInt(params.siteId || "0", 10);
  
  const { data: site } = useGetSite(siteId, { query: { enabled: !!siteId } });
  const { data: rooms, isLoading } = useListRooms(siteId, { query: { enabled: !!siteId } });
  
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createRoom = useCreateRoom();
  const deleteRoom = useDeleteRoom();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createRoom.mutate({ siteId, data: { name, floor } }, {
      onSuccess: () => {
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: getListRoomsQueryKey(siteId) });
        toast({ title: "Room Created", description: `Room ${name} was created.` });
        setName(""); setFloor("");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create room.", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number, roomName: string) => {
    if (confirm(`Delete room ${roomName}?`)) {
      deleteRoom.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRoomsQueryKey(siteId) });
          toast({ title: "Room Deleted", description: `Room ${roomName} was deleted.` });
        }
      });
    }
  };

  if (!siteId) return <div>Invalid Site ID</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
        <Link href="/sites" className="hover:text-primary transition-colors">SITES</Link>
        <span>/</span>
        <span className="text-foreground">{site?.name || '...'}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Rooms</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">FACILITY ZONES</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono uppercase tracking-wider text-xs">
              <Plus className="mr-2 h-4 w-4" /> Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase tracking-widest text-primary">Provision New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Room Identifier</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="font-mono bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor" className="text-xs uppercase tracking-wider text-muted-foreground">Floor / Level (Optional)</Label>
                <Input id="floor" value={floor} onChange={(e) => setFloor(e.target.value)} className="font-mono bg-background" />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createRoom.isPending} className="font-mono uppercase tracking-wider text-xs">
                  {createRoom.isPending ? 'Provisioning...' : 'Provision'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-md bg-card/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase tracking-wider">ID</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-primary">Room Name</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Floor</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">Loading...</TableCell></TableRow>
            ) : rooms?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">No rooms provisioned in this site</TableCell></TableRow>
            ) : (
              rooms?.map((room) => (
                <TableRow key={room.id} className="border-border transition-colors hover:bg-secondary/20">
                  <TableCell className="font-mono text-xs text-muted-foreground">{room.id}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    <Link href={`/rooms/${room.id}/racks`} className="hover:text-primary transition-colors flex items-center gap-2">
                      {room.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">
                    {room.floor || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/rooms/${room.id}/racks`} className="inline-flex items-center justify-center rounded-md text-xs font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-border bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-2">
                        Racks <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(room.id, room.name)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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
    </div>
  );
}
