"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Player, PlayerStats } from "@/types/football";

interface StatsTableProps {
  players: Player[];
  stats: Record<string, PlayerStats>;
  title: string;
}

const StatsTable: React.FC<StatsTableProps> = ({ players, stats, title }) => {
  return (
    <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-xl">
      <div className="bg-slate-900 text-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em]">
        {title} Box Score
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px] text-[10px] font-black uppercase">Player</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase">C/A</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase">P-Yds</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase">R-Yds</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase">Rec</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase">Rec-Yds</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => {
              const s = stats[player.id] || { 
                passAtt: 0, passComp: 0, passYds: 0, 
                rushAtt: 0, rushYds: 0, passTDs: 0, rushTDs: 0,
                receptions: 0, recYds: 0
              };
              
              const hasStats = s.passAtt > 0 || s.rushAtt > 0 || s.receptions > 0;
              if (!hasStats) return null;

              return (
                <TableRow key={player.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-bold text-xs py-3">
                    <span className="text-slate-400 mr-1.5 font-mono">#{player.number}</span>
                    {player.name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs font-medium">
                    {s.passComp}/{s.passAtt}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs font-bold text-blue-600">
                    {s.passYds}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs font-bold text-emerald-600">
                    {s.rushYds}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs font-medium">
                    {s.receptions}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs font-bold text-amber-600">
                    {s.recYds}
                  </TableCell>
                </TableRow>
              );
            })}
            {players.every(p => !stats[p.id]) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs italic">
                  No stats recorded for this team yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default StatsTable;