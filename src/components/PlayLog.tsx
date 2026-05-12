"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play } from "@/types/football";
import { Clock, MapPin, User, ArrowRight, Trophy, Flag, Shield, Zap, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlayLogProps {
  plays: Play[];
}

const PlayLog: React.FC<PlayLogProps> = ({ plays }) => {
  const getPlayIcon = (type: string) => {
    switch (type) {
      case 'Touchdown': return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'Penalty': return <Flag className="w-4 h-4 text-amber-500" />;
      case 'Sack': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'Interception': return <Target className="w-4 h-4 text-blue-500" />;
      case 'Tackle': return <Shield className="w-4 h-4 text-slate-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Card className="p-6 bg-white border-none shadow-sm flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Play-by-Play</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Live Game Feed</p>
        </div>
        <Badge variant="outline" className="text-[10px] font-black uppercase border-slate-100">
          {plays.length} Plays
        </Badge>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {plays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
              <Clock className="w-12 h-12 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Waiting for kickoff...</p>
            </div>
          ) : (
            plays.map((play, idx) => (
              <div key={play.id} className="relative pl-6 pb-4 border-l border-slate-100 last:border-0">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center">
                  <div className={`w-1.5 h-1.5 rounded-full ${play.isScoringPlay ? 'bg-amber-500' : 'bg-slate-300'}`} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        {play.down}{play.down === 1 ? 'st' : play.down === 2 ? 'nd' : play.down === 3 ? 'rd' : 'th'} & {play.distance === 0 ? 'Goal' : play.distance}
                      </span>
                      <span className="text-[10px] font-black text-slate-300">•</span>
                      <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase">
                        <MapPin className="w-3 h-3" />
                        {play.yardLine > 50 ? `Opp ${100 - play.yardLine}` : `Own ${play.yardLine}`}
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">
                      {new Date(play.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border ${play.isScoringPlay ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getPlayIcon(play.type)}</div>
                      <div className="flex-1">
                        <p className={`text-xs font-bold leading-relaxed ${play.isScoringPlay ? 'text-amber-900' : 'text-slate-700'}`}>
                          {play.result}
                        </p>
                        
                        {/* Enhanced Play Details */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {play.player && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-white/50 rounded-md border border-slate-200/50 text-[9px] font-black uppercase text-slate-500">
                              <User className="w-2.5 h-2.5" />
                              #{play.player.number} {play.player.name}
                              <span className="opacity-50 ml-1">{play.player.position}</span>
                            </div>
                          )}
                          
                          {play.receiver && (
                            <>
                              <ArrowRight className="w-2.5 h-2.5 text-slate-300 self-center" />
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-white/50 rounded-md border border-slate-200/50 text-[9px] font-black uppercase text-slate-500">
                                <User className="w-2.5 h-2.5" />
                                #{play.receiver.number} {play.receiver.name}
                                <span className="opacity-50 ml-1">{play.receiver.position}</span>
                              </div>
                            </>
                          )}

                          {play.type === 'Penalty' && (
                            <Badge variant="outline" className="h-4 text-[8px] font-black uppercase border-amber-200 text-amber-600 bg-amber-50/50">
                              Flag Thrown
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default PlayLog;