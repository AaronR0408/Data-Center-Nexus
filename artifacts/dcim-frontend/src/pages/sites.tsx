import React, { useState } from "react";
import { useListSites, useCreateSite, useDeleteSite, getListSitesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Sites() {
  const { data: sites, isLoading } = useListSites();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createSite = useCreateSite();
  const deleteSite = useDeleteSite();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createSite.mutate({ data: { name, address, city, country } }, {
      onSuccess: () => {
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: getListSitesQueryKey() });
        toast({ title: "Site Created", description: `Site ${name} was created.` });
        setName(""); setAddress(""); setCity(""); setCountry("");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create site.", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number, siteName: string) => {
    if (confirm(`Delete site ${siteName}?`)) {
      deleteSite.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSitesQueryKey() });
          toast({ title: "Site Deleted", description: `Site ${siteName} was deleted.` });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Sites</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">GLOBAL FACILITIES OVERVIEW</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono uppercase tracking-wider text-xs">
              <Plus className="mr-2 h-4 w-4" /> Add Site
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase tracking-widest text-primary">Provision New Site</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Site Identifier</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="font-mono bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs uppercase tracking-wider text-muted-foreground">Address (Optional)</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="font-mono bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs uppercase tracking-wider text-muted-foreground">City</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="font-mono bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-xs uppercase tracking-wider text-muted-foreground">Country</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required className="font-mono bg-background" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createSite.isPending} className="font-mono uppercase tracking-wider text-xs">
                  {createSite.isPending ? 'Provisioning...' : 'Provision'}
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
              <TableHead className="font-mono text-xs uppercase tracking-wider text-primary">Site Name</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Location</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">Loading...</TableCell></TableRow>
            ) : sites?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">No sites provisioned</TableCell></TableRow>
            ) : (
              sites?.map((site) => (
                <TableRow key={site.id} className="border-border transition-colors hover:bg-secondary/20">
                  <TableCell className="font-mono text-xs text-muted-foreground">{site.id}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    <Link href={`/sites/${site.id}/rooms`} className="hover:text-primary transition-colors flex items-center gap-2 group">
                      {site.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {site.city}, {site.country}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/sites/${site.id}/rooms`} className="inline-flex items-center justify-center rounded-md text-xs font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-border bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-2">
                        Rooms <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(site.id, site.name)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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
