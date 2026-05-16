"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Player, PlayerStats } from "@/types/football";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";

interface StatsTableProps {
  players: Player[];
  stats: Record<string, PlayerStats>;
  title: string;
}

const StatsTable: React.FC<StatsTableProps> = ({ players, stats, title }) => {
  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white">
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <h3 className="text-xs font-black uppercase tracking-widest">{title} Stats</h3>
        <span className="text-[10px] font-black text-slate-400 uppercase">{players.length} Active</span>
      </div>
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase">Player</TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase">Pass</TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase">Rush</TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase">Rec</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase">TD</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => {
              const s = stats[player.id] || {
                passYds: 0, passTDs: 0, rushYds: 0, rushTDs: 0, recYds: 0, recTDs: 0
              };
              const totalTDs = (s.passTDs || 0) + (s.rushTDs || 0) + (s.recTDs || 0);
              
              return (
                <TableRow key={player.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4">
                    <Link to={`/player/${player.id}`} className="flex flex-col group">
                      <span className="font-bold text-xs group-hover:text-blue-600 transition-colors">#{player.number} {player.name}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{player.position}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-center font-mono text-[10px] text-blue-600 font-bold">
                    {s.passYds}
                  </TableCell>
                  <TableCell className="text-center font-mono text-[10px] text-emerald-600 font-bold">
                    {s.rushYds}
                  </TableCell>
                  <TableCell className="text-center font-mono text-[10px] text-purple-600 font-bold">
                    {s.recYds}
                  </TableCell>
                  <TableCell className="text-right font-black text-slate-900 text-xs">
                    {totalTDs}
                  </TableCell>
                </TableRow>
              );
            })}
            {players.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-400 text-xs italic">
                  No roster data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};

export default StatsTable;