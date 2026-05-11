import React from "react";
import { useGetExpiringWarranties } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Clock, Server } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function Warranty() {
  const { data: assets, isLoading } = useGetExpiringWarranties();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-3">
            <AlertTriangle className="h-8 w-8" />
            Warranty Alerts
          </h1>
          <p className="text-muted-foreground text-sm font-mono mt-1 uppercase tracking-widest">ASSETS EXPIRING WITHIN 90 DAYS</p>
        </div>
      </div>

      <div className="border border-destructive/20 rounded-md bg-destructive/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-destructive/10 border-b border-destructive/20">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase tracking-wider text-destructive">Days Left</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Asset</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Expiration Date</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">Scanning contracts...</TableCell></TableRow>
            ) : assets?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center font-mono text-xs text-green-500 uppercase tracking-widest">All systems nominal. No impending expirations.</TableCell></TableRow>
            ) : (
              assets?.map((asset) => {
                const expDate = asset.warrantyExpiration ? new Date(asset.warrantyExpiration) : new Date();
                const daysLeft = differenceInDays(expDate, new Date());
                const isCritical = daysLeft <= 30;
                
                return (
                  <TableRow key={asset.id} className="border-destructive/10 transition-colors hover:bg-destructive/10">
                    <TableCell>
                      <div className={`font-mono text-xl font-bold flex items-center gap-2 ${isCritical ? 'text-destructive' : 'text-amber-500'}`}>
                        <Clock className="h-5 w-5" />
                        {daysLeft}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold font-mono text-sm text-foreground flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        {asset.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-wider">
                        {asset.manufacturer} {asset.model} • SN: {asset.serialNumber}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {format(expDate, 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">
                        <Link href={`/racks/${asset.rackId}/view`} className="text-primary hover:underline">{asset.rackName}</Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
