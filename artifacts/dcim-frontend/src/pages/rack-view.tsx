import React from "react";
import { useGetRackView, getGetRackViewQueryKey, AssetStatus } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Layers } from "lucide-react";

const ASSET_COLORS: Record<string, string> = {
  SERVER: "border-[hsl(200_90%_50%)] bg-[hsl(200_90%_50%/0.1)] text-[hsl(200_90%_50%)]",
  SWITCH: "border-[hsl(152_70%_45%)] bg-[hsl(152_70%_45%/0.1)] text-[hsl(152_70%_45%)]",
  PDU: "border-[hsl(40_95%_50%)] bg-[hsl(40_95%_50%/0.1)] text-[hsl(40_95%_50%)]",
  UPS: "border-[hsl(0_85%_60%)] bg-[hsl(0_85%_60%/0.1)] text-[hsl(0_85%_60%)]",
  STORAGE: "border-[hsl(260_70%_60%)] bg-[hsl(260_70%_60%/0.1)] text-[hsl(260_70%_60%)]",
  OTHER: "border-[hsl(240_5%_60%)] bg-[hsl(240_5%_60%/0.1)] text-[hsl(240_5%_60%)]",
};

export default function RackView() {
  const params = useParams();
  const rackId = parseInt(params.rackId || "0", 10);
  
  const { data: view, isLoading } = useGetRackView(rackId, { query: { enabled: !!rackId } });

  if (isLoading) return <div className="p-8 text-muted-foreground animate-pulse font-mono text-sm uppercase tracking-widest">Scanning Elevation...</div>;
  if (!view) return <div className="p-8 text-destructive font-mono text-sm uppercase tracking-widest">Failed to load rack elevation.</div>;

  const { rack, slots } = view;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
        <Link href="/sites" className="hover:text-primary transition-colors">SITES</Link>
        <span>/</span>
        <Link href={`/sites/${rack.roomId}/rooms`} className="hover:text-primary transition-colors">{rack.roomName || 'ROOM'}</Link>
        <span>/</span>
        <Link href={`/rooms/${rack.roomId}/racks`} className="hover:text-primary transition-colors">RACKS</Link>
        <span>/</span>
        <span className="text-foreground">{rack.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <Layers className="h-8 w-8" />
            {rack.name} Elevation
          </h1>
          <p className="text-muted-foreground text-sm font-mono mt-1 uppercase tracking-widest">{rack.usedU || 0} / {rack.totalU} U UTILIZED</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-3 border-[4px] border-secondary bg-background rounded-sm flex flex-col p-2 relative">
          {/* Rack Rails styling */}
          <div className="absolute top-0 bottom-0 left-6 w-2 border-x border-border/50 bg-secondary/20 z-0"></div>
          <div className="absolute top-0 bottom-0 right-6 w-2 border-x border-border/50 bg-secondary/20 z-0"></div>

          {slots.slice().reverse().map((slot, idx, arr) => {
            const isFirstOfAsset = slot.asset && (idx === arr.length - 1 || arr[idx + 1].asset?.id !== slot.asset.id);
            const isAsset = !!slot.asset;
            const assetHeightClass = "h-8"; // ~1U height

            if (!isAsset) {
              return (
                <div key={`u-${slot.uPosition}`} className={`flex items-center border-b border-border/30 ${assetHeightClass} relative z-10`}>
                  <div className="w-10 text-center font-mono text-[10px] text-muted-foreground/50 border-r border-border/30">{slot.uPosition}</div>
                  <div className="flex-1 px-4 text-xs font-mono text-muted-foreground/30 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]">Empty Slot</div>
                  <div className="w-10 border-l border-border/30"></div>
                </div>
              );
            }

            // Group multi-U assets, only render content on the top-most (first in visual order) slot of the asset
            const isTopSlotOfAsset = idx === arr.findIndex(s => s.asset?.id === slot.asset!.id);
            const assetStyle = ASSET_COLORS[slot.asset!.type] || ASSET_COLORS.OTHER;
            
            if (isTopSlotOfAsset) {
              return (
                <div key={`u-${slot.uPosition}`} className="flex relative z-10" style={{ height: `${slot.asset!.uHeight * 2}rem` }}>
                   <div className="w-10 flex flex-col justify-between border-r border-border/30">
                      {Array.from({length: slot.asset!.uHeight}).map((_, i) => (
                         <div key={i} className="h-8 flex items-center justify-center font-mono text-[10px] text-muted-foreground border-b border-border/30">{slot.uPosition - i}</div>
                      ))}
                   </div>
                   <div className="flex-1 p-[2px]">
                      <div className={`h-full border ${assetStyle} flex flex-col justify-center px-4 rounded-sm shadow-sm relative overflow-hidden group`}>
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                         <div className="flex justify-between items-center relative z-10">
                            <div>
                               <div className="font-bold font-mono text-sm tracking-tight truncate max-w-[200px]">{slot.asset!.name}</div>
                               <div className="text-[10px] font-mono uppercase tracking-widest opacity-80 mt-0.5">{slot.asset!.manufacturer} {slot.asset!.model}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                               <span className="text-[10px] font-mono px-1.5 py-0.5 border border-current rounded uppercase tracking-widest opacity-80">{slot.asset!.type}</span>
                               <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-widest ${slot.asset!.status === AssetStatus.ACTIVE ? 'bg-green-500/20 text-green-500' : slot.asset!.status === AssetStatus.MAINTENANCE ? 'bg-amber-500/20 text-amber-500' : 'bg-muted text-muted-foreground'}`}>{slot.asset!.status}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="w-10 border-l border-border/30 flex flex-col">
                      {Array.from({length: slot.asset!.uHeight}).map((_, i) => (
                         <div key={i} className="h-8 border-b border-border/30"></div>
                      ))}
                   </div>
                </div>
              );
            }
            
            return null; // Skip rendering middle/bottom slots of multi-U assets
          })}
        </div>
        
        <div className="space-y-6">
          <div className="border border-border bg-card p-4 rounded-md">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Legend</h3>
            <div className="space-y-2">
              {Object.entries(ASSET_COLORS).map(([type, style]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-4 h-4 border ${style} rounded-sm`}></div>
                  <span className="font-mono text-xs uppercase tracking-wider text-foreground">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
