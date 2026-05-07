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
    <Card className="overflow-hidden border-none shadow-md">
      <div className="bg-slate-800 text-white px-4 py-2 text-sm font-bold uppercase tracking-wider">
        {title} Stats
      </div>
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[150px]">Player</TableHead>
            <TableHead className="text-right">Pass Yds</TableHead>
            <TableHead className="text-right">Rush Yds</TableHead>
            <TableHead className="text-right">TDs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const s = stats[player.id] || { passYds: 0, rushYds: 0, passTDs: 0, rushTDs: 0 };
            return (
              <TableRow key={player.id}>
                <TableCell className="font-medium">
                  <span className="text-slate-400 mr-2">#{player.number}</span>
                  {player.name}
                </TableCell>
                <TableCell className="text-right tabular-nums">{s.passYds}</TableCell>
                <TableCell className="text-right tabular-nums">{s.rushYds}</TableCell>
                <TableCell className="text-right tabular-nums">{(s.passTDs || 0) + (s.rushTDs || 0)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default StatsTable;