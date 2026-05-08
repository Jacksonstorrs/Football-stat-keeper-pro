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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StatsTableProps {
  players: Player[];
  stats: Record<string, PlayerStats>;
  title: string;
}

const StatsTable: React.FC<StatsTableProps> = ({ players, stats, title }) => {
  const renderOffense = () => (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          <TableHead className="w-[120px] text-[10px] font-black uppercase">Player</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">C/A</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">P-Yds</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">R-Yds</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">Rec</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">TDs</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => {
          const s = stats[player.id];
          if (!s || (s.passAtt === 0 && s.rushAtt === 0 && s.receptions === 0)) return null;
          return (
            <TableRow key={player.id}>
              <TableCell className="font-bold text-xs py-3">#{player.number} {player.name}</TableCell>
              <TableCell className="text-right text-xs">{s.passComp}/{s.passAtt}</TableCell>
              <TableCell className="text-right text-xs font-bold text-blue-600">{s.passYds}</TableCell>
              <TableCell className="text-right text-xs font-bold text-emerald-600">{s.rushYds}</TableCell>
              <TableCell className="text-right text-xs">{s.receptions}</TableCell>
              <TableCell className="text-right text-xs font-black">{s.passTDs + s.rushTDs + s.recTDs}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  const renderDefense = () => (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          <TableHead className="w-[120px] text-[10px] font-black uppercase">Player</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">Tackles</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">Sacks</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">INTs</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">FF</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => {
          const s = stats[player.id];
          if (!s || (s.tackles === 0 && s.sacks === 0 && s.defInts === 0)) return null;
          return (
            <TableRow key={player.id}>
              <TableCell className="font-bold text-xs py-3">#{player.number} {player.name}</TableCell>
              <TableCell className="text-right text-xs font-bold">{s.tackles}</TableCell>
              <TableCell className="text-right text-xs font-bold text-amber-600">{s.sacks}</TableCell>
              <TableCell className="text-right text-xs font-bold text-blue-600">{s.defInts}</TableCell>
              <TableCell className="text-right text-xs">{s.forcedFumbles}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  const renderSpecial = () => (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          <TableHead className="w-[120px] text-[10px] font-black uppercase">Player</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">FG</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">Punts</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">P-Yds</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase">K-Yds</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => {
          const s = stats[player.id];
          if (!s || (s.fgAtt === 0 && s.punts === 0 && s.kickoffs === 0)) return null;
          return (
            <TableRow key={player.id}>
              <TableCell className="font-bold text-xs py-3">#{player.number} {player.name}</TableCell>
              <TableCell className="text-right text-xs">{s.fgMade}/{s.fgAtt}</TableCell>
              <TableCell className="text-right text-xs">{s.punts}</TableCell>
              <TableCell className="text-right text-xs">{s.puntYds}</TableCell>
              <TableCell className="text-right text-xs">{s.kickYds}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-xl bg-white">
      <div className="bg-slate-900 text-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em]">
        {title}
      </div>
      <Tabs defaultValue="offense" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-slate-50/50 h-10">
          <TabsTrigger value="offense" className="text-[9px] font-black uppercase">Offense</TabsTrigger>
          <TabsTrigger value="defense" className="text-[9px] font-black uppercase">Defense</TabsTrigger>
          <TabsTrigger value="special" className="text-[9px] font-black uppercase">Special</TabsTrigger>
        </TabsList>
        <TabsContent value="offense" className="m-0">{renderOffense()}</TabsContent>
        <TabsContent value="defense" className="m-0">{renderDefense()}</TabsContent>
        <TabsContent value="special" className="m-0">{renderSpecial()}</TabsContent>
      </Tabs>
    </Card>
  );
};

export default StatsTable;