"use client";

import { useState, useEffect, useCallback } from "react";
import {
  supabase,
  isSupabaseConfigured,
  type Wish,
  type Prize,
  type PrizeConfig,
} from "@/utils/supabase";

/* ====== Credentials (env hoặc mặc định) ====== */
const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USER || "admin";
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Tet2026!";

type Tab = "wishes" | "prizes" | "config";

export default function AdminPage() {
  /* --- Auth --- */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  /* --- Data --- */
  const [tab, setTab] = useState<Tab>("wishes");
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [configs, setConfigs] = useState<PrizeConfig[]>([]);
  const [loading, setLoading] = useState(false);

  /* --- Edit config --- */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ amount: 0, label: "", chance: 0, max_count: 0, enabled: true });

  /* --- New config --- */
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ amount: 10000, label: "", chance: 10, max_count: 1 });

  /* ====== Fetch ====== */
  const fetchData = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) return;
    setLoading(true);
    try {
      const [wRes, pRes, cRes] = await Promise.all([
        supabase.from("wishes").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("prizes").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("prize_config").select("*").order("amount", { ascending: true }),
      ]);
      setWishes(wRes.data || []);
      setPrizes(pRes.data || []);
      setConfigs(cRes.data || []);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated, fetchData]);

  /* ====== Helpers ====== */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setAuthenticated(true);
    } else {
      alert("Sai tài khoản hoặc mật khẩu!");
    }
  };

  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return d; }
  };

  const money = (n: number) => n.toLocaleString("vi-VN") + "₫";

  /* --- Config CRUD --- */
  const startEdit = (c: PrizeConfig) => {
    setEditingId(c.id);
    setEditForm({ amount: c.amount, label: c.label, chance: c.chance, max_count: c.max_count, enabled: c.enabled });
  };

  const saveEdit = async () => {
    if (!supabase || !editingId) return;
    await supabase.from("prize_config").update({
      amount: editForm.amount,
      label: editForm.label || money(editForm.amount),
      chance: editForm.chance,
      max_count: editForm.max_count,
      enabled: editForm.enabled,
    }).eq("id", editingId);
    setEditingId(null);
    fetchData();
  };

  const deleteConfig = async (id: string) => {
    if (!supabase) return;
    if (!confirm("Xoá cấu hình lì xì này?")) return;
    await supabase.from("prize_config").delete().eq("id", id);
    fetchData();
  };

  const addConfig = async () => {
    if (!supabase) return;
    await supabase.from("prize_config").insert([{
      amount: addForm.amount,
      label: addForm.label || money(addForm.amount),
      chance: addForm.chance,
      max_count: addForm.max_count,
      enabled: true,
    }]);
    setShowAdd(false);
    setAddForm({ amount: 10000, label: "", chance: 10, max_count: 1 });
    fetchData();
  };

  const toggleEnabled = async (c: PrizeConfig) => {
    if (!supabase) return;
    await supabase.from("prize_config").update({ enabled: !c.enabled }).eq("id", c.id);
    fetchData();
  };

  const deletePrize = async (id: string) => {
    if (!supabase) return;
    if (!confirm("Xoá bản ghi lì xì này?")) return;
    const { error } = await supabase.from("prizes").delete().eq("id", id);
    if (error) {
      alert("Lỗi xoá: " + error.message);
      console.error("Delete prize error:", error);
    }
    fetchData();
  };

  const deleteWish = async (id: string) => {
    if (!supabase) return;
    if (!confirm("Xoá ước nguyện này?")) return;
    const { error } = await supabase.from("wishes").delete().eq("id", id);
    if (error) {
      alert("Lỗi xoá: " + error.message);
      console.error("Delete wish error:", error);
    }
    fetchData();
  };

  const toggleTransferred = async (p: Prize) => {
    if (!supabase) return;
    const { error } = await supabase.from("prizes").update({ transferred: !p.transferred }).eq("id", p.id);
    if (error) {
      alert("Lỗi cập nhật: " + error.message);
      console.error("Toggle transferred error:", error);
    }
    fetchData();
  };

  /* ====== Stats ====== */
  const totalWishes = wishes.length;
  const totalLikes = wishes.reduce((s, w) => s + w.likes, 0);
  const totalPrizes = prizes.length;
  const totalAmount = prizes.reduce((s, p) => s + p.amount, 0);
  const transferred = prizes.filter((p) => p.transferred);
  const pendingTransfer = prizes.filter((p) => p.bank_account?.trim() && !p.transferred);
  const totalChance = configs.filter(c => c.enabled).reduce((s, c) => s + c.chance, 0);

  /* ==================== LOGIN SCREEN ==================== */
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-5 p-8 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">🔐 Admin</h1>
            <p className="text-gray-400 text-sm">Xin Chữ Đầu Năm — Quản lý</p>
          </div>
          <div className="space-y-1">
            <label className="text-gray-400 text-xs">Tài khoản</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tài khoản..."
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder:text-gray-500 outline-none text-base"
              style={{ border: "1px solid rgba(255,255,255,0.2)" }}
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-gray-400 text-xs">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu..."
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder:text-gray-500 outline-none text-base"
              style={{ border: "1px solid rgba(255,255,255,0.2)" }}
            />
          </div>
          <button type="submit" className="w-full py-3 rounded-lg text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #D2042D, #8B0000)" }}>
            Đăng nhập
          </button>
        </form>
      </div>
    );
  }

  /* ==================== MAIN DASHBOARD ==================== */
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", color: "#e0e0e0" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">📊 Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Tết Bính Ngọ — Xin Chữ Đầu Năm</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="admin-btn">🔄 Làm mới</button>
            <button onClick={() => setAuthenticated(false)} className="admin-btn text-red-400">🚪 Đăng xuất</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Ước nguyện", value: totalWishes, icon: "🌸", color: "#D2042D" },
            { label: "Lượt thả tim", value: totalLikes, icon: "❤️", color: "#FF4060" },
            { label: "Lì xì đã trao", value: totalPrizes, icon: "🧧", color: "#FFD700" },
            { label: "Tổng tiền LX", value: money(totalAmount), icon: "💰", color: "#4CAF50" },
          ].map((s) => (
            <div key={s.label} className="card p-4 md:p-5">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-xl md:text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-gray-400 text-xs md:text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            { key: "wishes" as Tab, label: `🌸 Ước Nguyện (${totalWishes})` },
            { key: "prizes" as Tab, label: `🧧 Lì Xì (${totalPrizes})` },
            { key: "config" as Tab, label: `⚙️ Cấu hình LX (${configs.length})` },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-lg text-sm md:text-base font-medium cursor-pointer transition-all ${tab === t.key ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
              style={{
                background: tab === t.key ? "rgba(210,4,45,0.6)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${tab === t.key ? "rgba(210,4,45,0.8)" : "rgba(255,255,255,0.1)"}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-10 text-gray-400">Đang tải...</div>}

        {/* ========== TAB: WISHES ========== */}
        {!loading && tab === "wishes" && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="thead-row">
                    <th className="th">#</th>
                    <th className="th">Tên</th>
                    <th className="th">Ước nguyện</th>
                    <th className="th">Chữ</th>
                    <th className="th">Câu đối</th>
                    <th className="th">❤️</th>
                    <th className="th">Thời gian</th>
                    <th className="th"></th>
                  </tr>
                </thead>
                <tbody>
                  {wishes.map((w, i) => (
                    <tr key={w.id} className="trow">
                      <td className="td text-gray-500">{i + 1}</td>
                      <td className="td text-white font-medium whitespace-nowrap">{w.name}</td>
                      <td className="td text-gray-300 max-w-xs truncate">{w.wish_text}</td>
                      <td className="td"><span className="text-lg font-bold" style={{ color: "#D2042D" }}>{w.word}</span></td>
                      <td className="td text-gray-400 max-w-xs truncate text-xs">{w.poem}</td>
                      <td className="td text-pink-400">{w.likes}</td>
                      <td className="td text-gray-500 whitespace-nowrap text-xs">{fmt(w.created_at)}</td>
                      <td className="td">
                        <button onClick={() => deleteWish(w.id)} className="text-red-400 hover:text-red-300 cursor-pointer text-xs">🗑</button>
                      </td>
                    </tr>
                  ))}
                  {wishes.length === 0 && (
                    <tr><td colSpan={8} className="td text-center text-gray-500 py-10">Chưa có ước nguyện</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== TAB: PRIZES ========== */}
        {!loading && tab === "prizes" && (
          <>
            {/* Pool status */}
            <div className="card p-5 mb-6">
              <h3 className="text-base font-semibold text-white mb-3">🎯 Trạng thái kho lì xì</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {configs.filter(c => c.enabled).map((c) => {
                  const claimed = prizes.filter(p => p.amount === c.amount).length;
                  return (
                    <div key={c.id} className="text-center">
                      <p className="text-lg font-bold text-yellow-400">{c.label || money(c.amount)}</p>
                      <p className="text-gray-400 text-sm">{claimed}/{c.max_count} đã trao</p>
                      <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all bg-yellow-500" style={{ width: `${Math.min((claimed / c.max_count) * 100, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prize table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="thead-row">
                      <th className="th">#</th>
                      <th className="th">Số tiền</th>
                      <th className="th">Người nhận</th>
                      <th className="th">Ngân hàng</th>
                      <th className="th">Số TK</th>
                      <th className="th">Thời gian</th>
                      <th className="th">STK</th>
                      <th className="th">Đã chuyển</th>
                      <th className="th"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {prizes.map((p, i) => {
                      const hasBank = p.bank_account?.trim();
                      return (
                        <tr key={p.id} className="trow">
                          <td className="td text-gray-500">{i + 1}</td>
                          <td className="td"><span className="font-bold text-yellow-400">{money(p.amount)}</span></td>
                          <td className="td text-white font-medium">{p.winner_name || "—"}</td>
                          <td className="td text-gray-300">{p.bank_name || "—"}</td>
                          <td className="td text-gray-300 font-mono">{p.bank_account || "—"}</td>
                          <td className="td text-gray-500 whitespace-nowrap text-xs">{fmt(p.created_at)}</td>
                          <td className="td">
                            {hasBank ? (
                              <span className="badge-green">✅ Có</span>
                            ) : (
                              <span className="badge-yellow">⏳ Chờ</span>
                            )}
                          </td>
                          <td className="td">
                            <button
                              onClick={() => toggleTransferred(p)}
                              className="cursor-pointer transition-all hover:scale-110"
                              title={p.transferred ? "Đánh dấu chưa chuyển" : "Đánh dấu đã chuyển"}
                            >
                              {p.transferred ? (
                                <span className="badge-green">✅ Đã chuyển</span>
                              ) : (
                                <span className="badge-red">❌ Chưa</span>
                              )}
                            </button>
                          </td>
                          <td className="td">
                            <button onClick={() => deletePrize(p.id)} className="text-red-400 hover:text-red-300 cursor-pointer text-xs hover:scale-110 transition-transform" title="Xoá">🗑</button>
                          </td>
                        </tr>
                      );
                    })}
                    {prizes.length === 0 && (
                      <tr><td colSpan={9} className="td text-center text-gray-500 py-10">Chưa có ai trúng</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending transfer summary */}
            {pendingTransfer.length > 0 && (
              <div className="card p-5 mt-6">
                <h3 className="text-base font-semibold text-white mb-3">💸 Cần chuyển ({pendingTransfer.length}) — Tổng: <span className="text-yellow-400">{money(pendingTransfer.reduce((s, p) => s + p.amount, 0))}</span></h3>
                <div className="space-y-3">
                  {pendingTransfer.map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center gap-3 text-sm p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <span className="text-yellow-400 font-bold">{money(p.amount)}</span>
                      <span className="text-white">→</span>
                      <span className="text-white font-medium">{p.winner_name}</span>
                      <span className="text-gray-400">—</span>
                      <span className="text-gray-300">{p.bank_name}</span>
                      <span className="text-gray-300 font-mono bg-white/5 px-2 py-0.5 rounded">{p.bank_account}</span>
                      <button
                        onClick={() => toggleTransferred(p)}
                        className="ml-auto px-3 py-1 rounded-lg text-xs font-medium cursor-pointer text-white transition-opacity hover:opacity-80"
                        style={{ background: "rgba(76,175,80,0.6)", border: "1px solid rgba(76,175,80,0.8)" }}
                      >
                        ✅ Đã chuyển
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Already transferred */}
            {transferred.length > 0 && (
              <div className="card p-5 mt-4">
                <h3 className="text-base font-semibold text-white mb-3">✅ Đã chuyển ({transferred.length}) — Tổng: <span className="text-green-400">{money(transferred.reduce((s, p) => s + p.amount, 0))}</span></h3>
                <div className="space-y-2">
                  {transferred.map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center gap-3 text-sm p-2.5 rounded-lg opacity-60" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <span className="text-green-400 font-bold">{money(p.amount)}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-300">{p.winner_name}</span>
                      <span className="text-gray-500">—</span>
                      <span className="text-gray-400">{p.bank_name} • {p.bank_account}</span>
                      <button
                        onClick={() => toggleTransferred(p)}
                        className="ml-auto text-xs text-gray-500 cursor-pointer hover:text-gray-300"
                      >
                        ↩ Hoàn tác
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ========== TAB: CONFIG ========== */}
        {!loading && tab === "config" && (
          <div className="space-y-6">
            {/* Info banner */}
            <div className="card p-5 border-l-4" style={{ borderLeftColor: "#FFD700" }}>
              <p className="text-sm text-gray-300">
                <strong className="text-white">Tổng tỷ lệ trúng:</strong>{" "}
                <span className="text-yellow-400 font-bold">{totalChance}%</span>
                <span className="text-gray-400 ml-2">(mỗi lượt mở phong bao, {totalChance}% trúng, {100 - totalChance}% trượt)</span>
              </p>
            </div>

            {/* Config cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {configs.map((c) => {
                const claimed = prizes.filter(p => p.amount === c.amount).length;
                const isEditing = editingId === c.id;

                return (
                  <div
                    key={c.id}
                    className="card p-5 relative"
                    style={{ opacity: c.enabled ? 1 : 0.5 }}
                  >
                    {!c.enabled && (
                      <div className="absolute top-3 right-3 badge-yellow text-xs">TẮT</div>
                    )}

                    {isEditing ? (
                      /* === EDIT MODE === */
                      <div className="space-y-3">
                        <h4 className="text-white font-semibold mb-2">✏️ Chỉnh sửa</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-gray-400 text-xs">Số tiền (₫)</label>
                            <input
                              type="number"
                              value={editForm.amount}
                              onChange={(e) => setEditForm({ ...editForm, amount: parseInt(e.target.value) || 0 })}
                              className="cfg-input"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs">Nhãn hiển thị</label>
                            <input
                              type="text"
                              value={editForm.label}
                              onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                              className="cfg-input"
                              placeholder="VD: 10.000₫"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs">Tỷ lệ trúng (%)</label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={editForm.chance}
                              onChange={(e) => setEditForm({ ...editForm, chance: parseInt(e.target.value) || 0 })}
                              className="cfg-input"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs">Số lượng tối đa</label>
                            <input
                              type="number"
                              min={1}
                              value={editForm.max_count}
                              onChange={(e) => setEditForm({ ...editForm, max_count: parseInt(e.target.value) || 1 })}
                              className="cfg-input"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.enabled}
                            onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <label className="text-gray-300 text-sm">Bật cấu hình này</label>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={saveEdit} className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer text-white" style={{ background: "rgba(76,175,80,0.6)", border: "1px solid rgba(76,175,80,0.8)" }}>
                            ✅ Lưu
                          </button>
                          <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer text-gray-300" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                            Huỷ
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* === VIEW MODE === */
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-2xl font-bold text-yellow-400">{c.label || money(c.amount)}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{money(c.amount)}</p>
                          </div>
                          <span className="text-3xl">🧧</span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Tỷ lệ trúng</span>
                            <span className="text-white font-semibold">{c.chance}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Số lượng</span>
                            <span className="text-white font-semibold">{claimed}/{c.max_count}</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min((claimed / c.max_count) * 100, 100)}%`,
                                background: claimed >= c.max_count ? "#EF4444" : "#FFD700",
                              }}
                            />
                          </div>
                          {claimed >= c.max_count && (
                            <p className="text-red-400 text-xs font-medium">Đã hết hàng!</p>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <button onClick={() => startEdit(c)} className="admin-btn flex-1 text-center text-xs">✏️ Sửa</button>
                          <button onClick={() => toggleEnabled(c)} className="admin-btn flex-1 text-center text-xs">
                            {c.enabled ? "🔴 Tắt" : "🟢 Bật"}
                          </button>
                          <button onClick={() => deleteConfig(c.id)} className="admin-btn flex-1 text-center text-xs text-red-400">🗑 Xoá</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* ADD NEW */}
              {!showAdd ? (
                <button
                  onClick={() => setShowAdd(true)}
                  className="card p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors min-h-[200px]"
                >
                  <span className="text-4xl opacity-40">+</span>
                  <span className="text-gray-400 text-sm">Thêm loại lì xì mới</span>
                </button>
              ) : (
                <div className="card p-5 space-y-3">
                  <h4 className="text-white font-semibold">➕ Thêm loại lì xì</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 text-xs">Số tiền (₫)</label>
                      <input
                        type="number"
                        value={addForm.amount}
                        onChange={(e) => setAddForm({ ...addForm, amount: parseInt(e.target.value) || 0 })}
                        className="cfg-input"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Nhãn hiển thị</label>
                      <input
                        type="text"
                        value={addForm.label}
                        onChange={(e) => setAddForm({ ...addForm, label: e.target.value })}
                        className="cfg-input"
                        placeholder="VD: 50.000₫"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Tỷ lệ (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={addForm.chance}
                        onChange={(e) => setAddForm({ ...addForm, chance: parseInt(e.target.value) || 0 })}
                        className="cfg-input"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Số lượng</label>
                      <input
                        type="number"
                        min={1}
                        value={addForm.max_count}
                        onChange={(e) => setAddForm({ ...addForm, max_count: parseInt(e.target.value) || 1 })}
                        className="cfg-input"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={addConfig} className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer text-white" style={{ background: "rgba(210,4,45,0.6)", border: "1px solid rgba(210,4,45,0.8)" }}>
                      ✅ Thêm
                    </button>
                    <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer text-gray-300" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      Huỷ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ====== Admin Utility Styles ====== */}
      <style jsx>{`
        .card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
        }
        .admin-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e0e0e0;
        }
        .admin-btn:hover { opacity: 0.8; }
        .thead-row { background: rgba(255, 255, 255, 0.05); }
        .th { text-align: left; padding: 12px 16px; font-weight: 500; color: #9ca3af; }
        .trow { border-top: 1px solid rgba(255, 255, 255, 0.05); transition: background 0.2s; }
        .trow:hover { background: rgba(255, 255, 255, 0.03); }
        .td { padding: 12px 16px; }
        .badge-green {
          padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;
          background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3);
        }
        .badge-yellow {
          padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;
          background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.3);
        }
        .badge-red {
          padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;
          background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .cfg-input {
          width: 100%; padding: 8px 12px; border-radius: 8px; font-size: 14px;
          background: rgba(255, 255, 255, 0.08); color: white; outline: none;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .cfg-input:focus { border-color: rgba(255, 215, 0, 0.5); }
      `}</style>
    </div>
  );
}
