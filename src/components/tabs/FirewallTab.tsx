'use client';

import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Trash2,
  Plus,
  Search,
  Filter,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { FirewallModule, AutoBanEntry, CidrRule } from '../../types';

interface FirewallTabProps {
  modules: FirewallModule[];
  autoBanList: AutoBanEntry[];
  cidrRules: CidrRule[];
  onToggleModule: (id: string) => void;
  onUnbanIp: (id: string, ip: string) => void;
  onAddCidrRule: (cidr: string, comment: string, action: 'ALLOW' | 'DROP') => void;
}

export const FirewallTab: React.FC<FirewallTabProps> = ({
  modules,
  autoBanList,
  cidrRules,
  onToggleModule,
  onUnbanIp,
  onAddCidrRule,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchModule, setSearchModule] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'modules' | 'autoban' | 'cidr'>('modules');

  // New CIDR modal state
  const [showAddCidrModal, setShowAddCidrModal] = useState<boolean>(false);
  const [newCidr, setNewCidr] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [newAction, setNewAction] = useState<'ALLOW' | 'DROP'>('DROP');

  const filteredModules = modules.filter((m) => {
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchModule.toLowerCase()) ||
      m.description.toLowerCase().includes(searchModule.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateCidr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCidr) return;
    onAddCidrRule(newCidr, newComment || 'Quy tắc thêm thủ công', newAction);
    setNewCidr('');
    setNewComment('');
    setShowAddCidrModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('modules')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'modules'
                ? 'bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1724]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            16 MODULE PHÒNG VỆ ({modules.filter((m) => m.mode === 'DROP').length}/16 ĐANG CHẶN)
          </button>

          <button
            onClick={() => setActiveSubTab('autoban')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'autoban'
                ? 'bg-red-500/15 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1724]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            DANH SÁCH AUTO-BAN ({autoBanList.length} IP)
          </button>

          <button
            onClick={() => setActiveSubTab('cidr')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'cidr'
                ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1724]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            BỘ LỌC DẢI IP / CIDR ({cidrRules.length})
          </button>
        </div>

        {/* Search bar when on modules */}
        {activeSubTab === 'modules' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm module phòng vệ..."
                value={searchModule}
                onChange={(e) => setSearchModule(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#06090e] border border-slate-700/80 rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00f0ff] w-48"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#06090e] border border-slate-700/80 rounded px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-[#00f0ff]"
            >
              <option value="ALL">Tất cả nhóm</option>
              <option value="L3/L4">Phòng vệ L3 / L4</option>
              <option value="Protocol">Tấn công Giao thức</option>
              <option value="Application">Tầng Ứng dụng / L7</option>
              <option value="Stateful">Nhận diện Botnet / C2</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: 16 Mitigation Modules Grid */}
      {activeSubTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredModules.map((m) => {
            const isDrop = m.mode === 'DROP';
            const isMonitor = m.mode === 'MONITOR';

            return (
              <div
                key={m.id}
                className={`glass-panel p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isDrop
                    ? 'border-[#00f0ff]/30 bg-[#0b111a]/85 hover:border-[#00f0ff]/60'
                    : isMonitor
                    ? 'border-amber-500/30 bg-[#161106]/70'
                    : 'border-slate-800 bg-[#06090e]/70 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {m.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                        isDrop
                          ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40'
                          : isMonitor
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {m.mode}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold font-mono text-white mt-2.5 tracking-wide">
                    {m.name}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 mt-1 line-clamp-2">
                    {m.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block">ĐÃ CHẶN (DROPS)</span>
                      <span className="text-white font-bold">{m.drops.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">PPS HIỆN TẠI</span>
                      <span className="text-[#00f0ff] font-bold">{m.pps.toLocaleString()} pps</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ĐỘ TRỄ XỬ LÝ</span>
                      <span className="text-[#10b981]">{m.latency}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">CƠ CHẾ LỌC</span>
                      <span className="text-slate-400">Driver Offload</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    Trạng thái: <strong className={isDrop ? 'text-[#10b981]' : 'text-slate-400'}>{m.status}</strong>
                  </span>

                  <button
                    onClick={() => onToggleModule(m.id)}
                    className={`px-3 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                      isDrop
                        ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40 hover:bg-[#00f0ff]/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    CHUYỂN ({m.mode === 'DROP' ? 'GIÁM SÁT' : m.mode === 'MONITOR' ? 'TẮT' : 'CHẶN'})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Auto-Ban Table */}
      {activeSubTab === 'autoban' && (
        <div className="glass-panel rounded-xl border border-red-500/20 bg-[#0b111a]/80 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                BẢNG IP TỰ ĐỘNG KHÓA VÀ TRIỆT TIÊU (AUTO-BAN REGISTRY)
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Các địa chỉ IP vượt ngưỡng cảnh báo tấn công được hệ thống tự động khóa ngay tại tầng cổng mạng
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30">
              {autoBanList.length} IP ĐANG BỊ KHÓA
            </span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#06090e] text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Địa chỉ IP</th>
                  <th className="py-2.5 px-3">Quốc gia / Nguồn</th>
                  <th className="py-2.5 px-3">Hành vi vi phạm / Lý do</th>
                  <th className="py-2.5 px-3">Thời điểm chặn</th>
                  <th className="py-2.5 px-3">Thời gian tự mở</th>
                  <th className="py-2.5 px-3">Điểm đe dọa</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {autoBanList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                      Chưa có địa chỉ IP nào bị khóa. Toàn bộ lưu lượng hiện đang an toàn.
                    </td>
                  </tr>
                ) : (
                  autoBanList.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#0f1724]/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        {entry.ip}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {entry.country} ({entry.countryCode})
                      </td>
                      <td className="py-3 px-3 text-red-400">{entry.reason}</td>
                      <td className="py-3 px-3 text-slate-400">{entry.bannedAt}</td>
                      <td className="py-3 px-3 text-amber-400">{entry.expires}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                          {entry.score}/100
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onUnbanIp(entry.id, entry.ip)}
                          className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-[11px] font-mono cursor-pointer transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                          MỞ KHÓA (UNBAN)
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: CIDR Filter Rules */}
      {activeSubTab === 'cidr' && (
        <div className="glass-panel rounded-xl border border-[#10b981]/20 bg-[#0b111a]/80 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#10b981]" />
                BỘ QUY TẮC LỌC DẢI IP &amp; PHÂN ĐOẠN MẠNG (CIDR ACCESS CONTROL)
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Kiểm soát luồng lưu lượng theo tiền tố subnet với độ trễ thấp
              </p>
            </div>
            <button
              onClick={() => setShowAddCidrModal(true)}
              className="px-3 py-1.5 bg-[#10b981]/15 hover:bg-[#10b981]/25 text-[#10b981] border border-[#10b981]/40 rounded text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              THÊM QUY TẮC CIDR
            </button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#06090e] text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Dải mạng CIDR</th>
                  <th className="py-2.5 px-3">Hành động</th>
                  <th className="py-2.5 px-3">Mô tả / Phân vùng</th>
                  <th className="py-2.5 px-3">Gói tin đã kiểm tra</th>
                  <th className="py-2.5 px-3">Ngày thêm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {cidrRules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-xs">
                      Chưa có quy tắc CIDR nào. Nhấn &quot;+ THÊM QUY TẮC CIDR&quot; để thiết lập phân đoạn mạng.
                    </td>
                  </tr>
                ) : (
                  cidrRules.map((r) => (
                    <tr key={r.id} className="hover:bg-[#0f1724]/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{r.cidr}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            r.action === 'ALLOW'
                              ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40'
                              : 'bg-red-500/20 text-red-400 border-red-500/40'
                          }`}
                        >
                          {r.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{r.comment}</td>
                      <td className="py-3 px-3 text-[#00f0ff]">{r.hits.toLocaleString()} pkts</td>
                      <td className="py-3 px-3 text-slate-400">{r.added}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add CIDR Rule */}
      {showAddCidrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b111a] border border-[#00f0ff]/40 rounded-xl max-w-md w-full p-6 font-mono text-xs shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00f0ff]" /> THÊM QUY TẮC LỌC CIDR
            </h3>
            <p className="text-slate-400 mb-4">Áp dụng trực tiếp vào bảng phân đoạn mạng</p>

            <form onSubmit={handleCreateCidr} className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-1">Dải mạng (CIDR, ví dụ: 192.168.1.0/24)</label>
                <input
                  type="text"
                  required
                  placeholder="10.0.0.0/16"
                  value={newCidr}
                  onChange={(e) => setNewCidr(e.target.value)}
                  className="w-full bg-[#06090e] border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Hành động</label>
                <select
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value as 'ALLOW' | 'DROP')}
                  className="w-full bg-[#06090e] border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                >
                  <option value="DROP">CHẶN (DROP)</option>
                  <option value="ALLOW">CHO PHÉP (ALLOW / Whitelist)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Ghi chú phân loại</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Mạng văn phòng chi nhánh"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-[#06090e] border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCidrModal(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-[#06090e] font-bold rounded cursor-pointer"
                >
                  Lưu quy tắc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
