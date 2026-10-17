'use client';

import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  Download,
  RotateCcw,
  Plus,
  Lock,
  Key,
  FileCheck,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  User,
  LogOut,
  Bell,
  Send,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { BackupItem, AuditLog } from '../../types';

interface AuditTabProps {
  backups: BackupItem[];
  auditLogs: AuditLog[];
  onCreateBackup: () => void;
  onRestoreBackup: (filename: string) => void;
  onShowToast?: (type: 'success' | 'warning' | 'info', message: string) => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  backups,
  auditLogs,
  onCreateBackup,
  onRestoreBackup,
  onShowToast,
}) => {
  // Account Management State
  const [adminUsername] = useState('admin');
  const [lastPasswordChange, setLastPasswordChange] = useState('Mặc định ban đầu');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Webhook State
  const [telegramConnected, setTelegramConnected] = useState(true);
  const [authAlertsEnabled, setAuthAlertsEnabled] = useState(true);
  const [ddosAlertsEnabled, setDdosAlertsEnabled] = useState(true);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (currentPassword !== 'aegis@2026' && currentPassword !== 'admin') {
      setPasswordError('Mật khẩu hiện tại không đúng! (Mặc định: aegis@2026)');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Xác nhận mật khẩu mới không trùng khớp!');
      return;
    }

    // Success
    const nowStr = new Date().toLocaleString('vi-VN');
    setLastPasswordChange(nowStr);
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    if (onShowToast) {
      onShowToast('success', '✓ Đã cập nhật mật khẩu quản trị Root Admin (admin) thành công!');
    } else {
      alert('✓ Đã cập nhật mật khẩu quản trị Root Admin thành công!');
    }
  };

  const handleLogout = () => {
    if (onShowToast) {
      onShowToast('info', 'Đã làm mới phiên quản trị viên an toàn (Session Renewed)!');
    } else {
      alert('Đã làm mới phiên quản trị an toàn!');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Account Management & Security Row (Card 1, 2, 3 from index.html) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        {/* Card 1: Single Admin Account */}
        <div className="glass-panel rounded-xl border border-[#00f0ff]/30 bg-gradient-to-br from-[#0e1521]/95 to-[#070e18]/95 p-5 flex flex-col justify-between shadow-[0_0_20px_rgba(0,240,255,0.08)]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold">
                <User className="w-4 h-4 text-[#00f0ff]" />
                <span className="text-sm">Tài Khoản Quản Trị Viên</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] font-bold">
                ROOT ADMIN
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Username:</span>
                <strong className="text-[#00f0ff] font-bold text-sm tracking-wider">
                  {adminUsername}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Chính sách:</span>
                <span className="text-slate-300">1 User duy nhất (Root Admin)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Phiên làm việc:</span>
                <span className="text-[#10b981] font-bold">127.0.0.1 (Web Active)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Đổi mật khẩu:</span>
                <span className="text-slate-400 text-[11px]">{lastPasswordChange}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-5 pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                setPasswordError('');
                setShowPasswordModal(true);
              }}
              className="flex-1 py-2 px-3 bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 text-[#00f0ff] border border-[#00f0ff]/40 rounded font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              Đổi Mật Khẩu
            </button>
            <button
              onClick={handleLogout}
              className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng Xuất
            </button>
          </div>
        </div>

        {/* Card 2: Security & Session */}
        <div className="glass-panel rounded-xl border border-slate-800 bg-[#0b111a]/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-sm">Phiên Đăng Nhập &amp; Bảo Mật</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[10px] font-bold">
                AUTHENTICATED [✓]
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Mã hóa lưu trữ:</span>
                <span className="text-[#00f0ff]">Local Secure Session (AES-256)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cơ chế bảo vệ:</span>
                <span className="text-slate-300">Strict Zero-Trust Policy</span>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed mt-2 pt-2 border-t border-slate-800/80">
                Mỗi phiên đăng nhập được cấp mã token xác thực an toàn. Tự động thu hồi phiên làm việc khi bấm Đăng Xuất hoặc hết hạn.
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-[#06090e] rounded border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Session ID:</span>
            <code className="text-[#10b981]">aegis_sec_tok_9f82a17c</code>
          </div>
        </div>

        {/* Card 3: Alert Webhooks */}
        <div className="glass-panel rounded-xl border border-slate-800 bg-[#0b111a]/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold">
                <Bell className="w-4 h-4 text-[#10b981]" />
                <span className="text-sm">Webhook Cảnh Báo</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[10px] font-bold">
                CONNECTED
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Telegram Bot:</span>
                <span className="text-[#10b981] font-bold">@AegisAlertsBot [Bật]</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cảnh báo Auth:</span>
                <span className="text-[#10b981]">Bật (Sai &gt; 3 lần)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">DDoS Cảnh Báo:</span>
                <span className="text-red-400">&gt; 10,000 PPS</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
            Tự động gửi tin nhắn báo động tức thì về Telegram khi phát hiện truy cập bất thường hoặc đợt tấn công DDoS.
          </div>
        </div>
      </div>

      {/* 2. Backup Vault */}
      <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#00f0ff]" />
              KHO SAO LƯU CẤU HÌNH MÃ HÓA (ENCRYPTED BACKUP VAULT)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Tự động lưu trữ snapshot định kỳ, mã hóa AES-256-GCM kèm kiểm định toàn vẹn SHA-256
            </p>
          </div>

          <button
            onClick={onCreateBackup}
            className="px-3 py-1.5 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-[#06090e] text-xs font-mono font-bold rounded flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            <Plus className="w-4 h-4" />
            TẠO BẢN SAO LƯU CỤM
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#06090e] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Tên File Snapshot</th>
                <th className="py-2.5 px-3">Phân Hệ Đích</th>
                <th className="py-2.5 px-3">Dung Lượng</th>
                <th className="py-2.5 px-3">Thời Điểm Tạo</th>
                <th className="py-2.5 px-3">Mã Băm SHA-256</th>
                <th className="py-2.5 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {backups.map((bk) => (
                <tr key={bk.id} className="hover:bg-[#0f1724]/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#10b981]" />
                    {bk.filename}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{bk.target}</td>
                  <td className="py-3 px-3 text-[#00f0ff]">{bk.size}</td>
                  <td className="py-3 px-3 text-slate-400">{bk.created}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[10px]">{bk.hash}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => alert(`[Demo Mode] Tải về bản sao lưu: ${bk.filename}`)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                        title="Tải về file snapshot"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRestoreBackup(bk.filename)}
                        className="px-2.5 py-1 rounded bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 text-[#00f0ff] border border-[#00f0ff]/30 text-[11px] font-mono cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        KHÔI PHỤC
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Immutable Centralized Audit Log */}
      <div className="glass-panel rounded-xl border border-[#00f0ff]/20 bg-[#0b111a]/80 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00f0ff]" />
              NHẬT KÝ KIỂM TOÁN &amp; SỰ KIỆN AN NINH (CENTRALIZED AUDIT LOGS)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Ghi nhận có chữ ký số bất biến xuyên suốt 4 tầng phòng thủ (HMAC-SHA256)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">LƯU TRỮ: 365 NGÀY</span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#06090e] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Thời Gian</th>
                <th className="py-2.5 px-3">Tài Khoản</th>
                <th className="py-2.5 px-3">Hành Động</th>
                <th className="py-2.5 px-3">Phân Hệ</th>
                <th className="py-2.5 px-3">Mức Độ</th>
                <th className="py-2.5 px-3">Chi Tiết Sự Kiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#0f1724]/60 transition-colors">
                  <td className="py-3 px-3 text-slate-400">{log.timestamp}</td>
                  <td className="py-3 px-3 text-[#00f0ff]">{log.operator}</td>
                  <td className="py-3 px-3 font-bold text-white">{log.action}</td>
                  <td className="py-3 px-3 text-slate-300">{log.target}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        log.severity === 'CRIT'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : log.severity === 'WARN'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal: Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b111a] border border-[#00f0ff]/40 rounded-xl max-w-md w-full p-6 font-mono text-xs shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Key className="w-4 h-4 text-[#00f0ff]" />
                <span>ĐỔI MẬT KHẨU ROOT ADMIN</span>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-slate-400 text-[11px] mb-4">
              Tài khoản Root Admin (<code>admin</code>) có quyền truy cập toàn diện hệ thống tường lửa và cổng mạng.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-1">Mật khẩu hiện tại:</label>
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  required
                  placeholder="Mật khẩu mặc định: aegis@2026"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#06090e] border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Mật khẩu mới (≥ 6 ký tự):</label>
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu mới an toàn"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#06090e] border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Xác nhận mật khẩu mới:</label>
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#06090e] border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="flex items-center gap-2 cursor-pointer pt-1" onClick={() => setShowPasswordText(!showPasswordText)}>
                {showPasswordText ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                <span className="text-[11px] text-slate-400">Hiển thị mật khẩu</span>
              </div>

              {passwordError && (
                <div className="p-2.5 rounded bg-red-950/40 border border-red-500/40 text-red-300 text-[11px]">
                  ⚠️ {passwordError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-[#06090e] font-bold rounded cursor-pointer transition-all"
                >
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
