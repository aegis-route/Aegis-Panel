'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Activity,
  Play,
  Gauge,
  ArrowDown,
  ArrowUp,
  Wifi,
  Zap,
  Radio,
  CheckCircle2,
  Server
} from 'lucide-react';
import { SpeedtestServer, NetflowSession } from '../../types';

interface AnalyticsTabProps {
  servers: SpeedtestServer[];
  sessions: NetflowSession[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ servers, sessions }) => {
  const [selectedServerId, setSelectedServerId] = useState<string>(servers[0].id);
  const [testPhase, setTestPhase] = useState<'idle' | 'ping' | 'download' | 'upload' | 'complete'>('idle');
  const [pingVal, setPingVal] = useState<number>(2.4);
  const [jitterVal, setJitterVal] = useState<number>(0.6);
  const [downloadVal, setDownloadVal] = useState<number>(942.8);
  const [uploadVal, setUploadVal] = useState<number>(918.4);
  const [testProgress, setTestProgress] = useState<number>(0);

  const selectedServer = servers.find((s) => s.id === selectedServerId) || servers[0];

  const handleStartSpeedtest = () => {
    if (testPhase !== 'idle' && testPhase !== 'complete') return;

    setTestPhase('ping');
    setTestProgress(10);
    setDownloadVal(0);
    setUploadVal(0);

    setTimeout(() => {
      setTestPhase('download');
      setTestProgress(40);
      let curDown = 0;
      const downInterval = setInterval(() => {
        curDown += Math.floor(Math.random() * 80 + 90);
        if (curDown >= 920) {
          curDown = +(920 + Math.random() * 45).toFixed(1);
          setDownloadVal(curDown);
          clearInterval(downInterval);
          setTestPhase('upload');
          setTestProgress(75);

          let curUp = 0;
          const upInterval = setInterval(() => {
            curUp += Math.floor(Math.random() * 80 + 80);
            if (curUp >= 880) {
              curUp = +(880 + Math.random() * 40).toFixed(1);
              setUploadVal(curUp);
              clearInterval(upInterval);
              setTestPhase('complete');
              setTestProgress(100);
            } else {
              setUploadVal(curUp);
            }
          }, 150);
        } else {
          setDownloadVal(curDown);
        }
      }, 150);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 1. Multi-ISP Speedtest Cockpit */}
      <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-[#00f0ff]" />
              SLA CARRIER SPEEDTEST COCKPIT (FTTH GPON 1Gbps PROMETHEUS GAUGE)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Simulates multi-threaded TCP throughput test directly from MikroTik ether1-WAN
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedServerId}
              onChange={(e) => setSelectedServerId(e.target.value)}
              className="bg-[#06090e] border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-[#00f0ff]"
            >
              {servers.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name} ({srv.location}) - {srv.ping}ms
                </option>
              ))}
            </select>

            <button
              onClick={handleStartSpeedtest}
              disabled={testPhase !== 'idle' && testPhase !== 'complete'}
              className="px-4 py-1.5 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-[#06090e] text-xs font-mono font-bold rounded flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {testPhase === 'idle' || testPhase === 'complete' ? 'RUN SPEEDTEST' : 'TESTING...'}
            </button>
          </div>
        </div>

        {/* Progress bar during test */}
        {testPhase !== 'idle' && (
          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>
                Stage: <strong className="text-[#00f0ff] uppercase">{testPhase}</strong>
              </span>
              <span>{testProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
              <div
                className="bg-[#00f0ff] h-full transition-all duration-300"
                style={{ width: `${testProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Speedtest Metrics Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-[#06090e] border border-slate-800 rounded-lg p-4 text-center font-mono">
            <div className="text-slate-400 text-xs flex items-center justify-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00f0ff]" /> PING
            </div>
            <div className="text-3xl font-bold text-white mt-2">{pingVal}</div>
            <div className="text-[10px] text-slate-500 mt-1">ms (RTT)</div>
          </div>

          <div className="bg-[#06090e] border border-slate-800 rounded-lg p-4 text-center font-mono">
            <div className="text-slate-400 text-xs flex items-center justify-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-400" /> JITTER
            </div>
            <div className="text-3xl font-bold text-amber-400 mt-2">{jitterVal}</div>
            <div className="text-[10px] text-slate-500 mt-1">ms bufferbloat</div>
          </div>

          <div className="bg-[#06090e] border border-[#10b981]/40 rounded-lg p-4 text-center font-mono shadow-[0_0_15px_rgba(16,185,129,0.08)]">
            <div className="text-slate-400 text-xs flex items-center justify-center gap-1.5">
              <ArrowDown className="w-3.5 h-3.5 text-[#10b981]" /> DOWNLOAD
            </div>
            <div className="text-3xl font-bold text-[#10b981] mt-2">{downloadVal}</div>
            <div className="text-[10px] text-slate-500 mt-1">Mbps (Symmetrical)</div>
          </div>

          <div className="bg-[#06090e] border border-blue-500/40 rounded-lg p-4 text-center font-mono">
            <div className="text-slate-400 text-xs flex items-center justify-center gap-1.5">
              <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> UPLOAD
            </div>
            <div className="text-3xl font-bold text-blue-400 mt-2">{uploadVal}</div>
            <div className="text-[10px] text-slate-500 mt-1">Mbps (Line Rate)</div>
          </div>
        </div>
      </div>

      {/* 2. Gateway SLA & Latency Matrix */}
      <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#10b981]" />
              SUB-MILLISECOND LATENCY &amp; PACKET LOSS PROBES
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              ICMP probe telemetry dispatched every 500ms from monitoring agent
            </p>
          </div>
          <span className="text-xs font-mono text-[#10b981] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 0.0% LOSS ALL TARGETS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-4 text-xs font-mono">
          <div className="p-3 bg-[#06090e] rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">KERNEL FW (172.30.0.101)</span>
            <div className="text-base font-bold text-[#10b981] mt-1">0.04 ms</div>
            <span className="text-[10px] text-slate-500">vmbr0 driver</span>
          </div>

          <div className="p-3 bg-[#06090e] rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">ROUTEROS (10.10.1.1)</span>
            <div className="text-base font-bold text-[#10b981] mt-1">0.82 ms</div>
            <span className="text-[10px] text-slate-500">L3 Transit</span>
          </div>

          <div className="p-3 bg-[#06090e] rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">ADGUARD (10.10.100.2)</span>
            <div className="text-base font-bold text-[#10b981] mt-1">0.31 ms</div>
            <span className="text-[10px] text-slate-500">DMZ Bridge</span>
          </div>

          <div className="p-3 bg-[#06090e] rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">GOOGLE DNS (8.8.8.8)</span>
            <div className="text-base font-bold text-[#00f0ff] mt-1">14.2 ms</div>
            <span className="text-[10px] text-slate-500">FPT Hanoi Peering</span>
          </div>

          <div className="p-3 bg-[#06090e] rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">CLOUDFLARE (1.1.1.1)</span>
            <div className="text-base font-bold text-[#00f0ff] mt-1">12.8 ms</div>
            <span className="text-[10px] text-slate-500">VNIX Transit</span>
          </div>
        </div>
      </div>

      {/* 3. NetFlow v9 Top Talkers Table */}
      <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-[#8b5cf6]" />
              NETFLOW v9 ACTIVE SESSIONS (TOP TALKERS)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live export from MikroTik Traffic Flow to local analyzer collector
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">SAMPLE RATE: 1:1</span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#06090e] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Source Endpoint</th>
                <th className="py-2.5 px-3">Destination Endpoint</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Dest Port</th>
                <th className="py-2.5 px-3">Volume</th>
                <th className="py-2.5 px-3">Packet Rate</th>
                <th className="py-2.5 px-3 text-right">QoS / Flow Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-[#0f1724]/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">{sess.srcIp}</td>
                  <td className="py-3 px-3 text-slate-300">{sess.dstIp}</td>
                  <td className="py-3 px-3 uppercase text-[#00f0ff]">{sess.proto}</td>
                  <td className="py-3 px-3 text-white">{sess.port}</td>
                  <td className="py-3 px-3 text-[#10b981] font-bold">{sess.bytes}</td>
                  <td className="py-3 px-3 text-slate-400">{sess.pps} pps</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        sess.mark === 'FastTrack'
                          ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40'
                          : sess.mark === 'Prio_VoIP'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {sess.mark}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
