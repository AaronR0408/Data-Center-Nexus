import React from "react";
import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Grid, SquareTerminal, AlertTriangle, Layers } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Link } from "wouter";

const ASSET_COLORS: Record<string, string> = {
  SERVER: "hsl(200 90% 50%)",
  SWITCH: "hsl(152 70% 45%)",
  PDU: "hsl(40 95% 50%)",
  UPS: "hsl(0 85% 60%)",
  STORAGE: "hsl(260 70% 60%)",
  OTHER: "hsl(240 5% 60%)",
};

export default function Dashboard() {
  const { data: summary, isLoading, isError } = useGetDashboard();

  if (isLoading) return <div className="p-8 text-muted-foreground animate-pulse font-mono text-sm uppercase tracking-widest">Loading Telemetry...</div>;
  if (isError || !summary) return <div className="p-8 text-destructive font-mono text-sm uppercase tracking-widest">Error fetching dashboard telemetry.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">System Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Sites</CardTitle>
            <Grid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalSites}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.totalRooms || 0} Rooms Active</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Racks</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalRacks}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Assets</CardTitle>
            <Server className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{summary.totalAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">{summary.activeAssets || 0} Active</span>
              {" • "}
              <span className="text-amber-500">{summary.assetsInMaintenance || 0} Maintenance</span>
            </p>
          </CardContent>
        </Card>

        <Card className={summary.expiringWarrantiesCount ? "border-destructive bg-destructive/10" : "bg-card/50 border-border"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Warranty Alerts</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${summary.expiringWarrantiesCount ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${summary.expiringWarrantiesCount ? 'text-destructive' : ''}`}>{summary.expiringWarrantiesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Expiring within 90 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Rack Utilization</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.rackUtilization} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="rackName" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '4px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="utilizationPct" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Assets by Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {summary.assetsByType && summary.assetsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.assetsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="type"
                  >
                    {summary.assetsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ASSET_COLORS[entry.type] || ASSET_COLORS.OTHER} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '4px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-muted-foreground font-mono">NO ASSET DATA</div>
            )}
            
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {summary.assetsByType?.map(entry => (
                <div key={entry.type} className="flex items-center gap-2 text-xs font-mono">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ASSET_COLORS[entry.type] || ASSET_COLORS.OTHER }}></div>
                  <span>{entry.type} <span className="text-muted-foreground">({entry.count})</span></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
