import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Card,
  Tabs,
  Button,
  Input,
  Select,
  Modal,
  message,
} from "antd";
import {
  DownloadOutlined,
  UserOutlined,
  SendOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import axios from "axios";
import {
  MousePointer2,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Zap,
  Radio,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAuthStore } from "../../store/authStore";
import { io } from "socket.io-client";

dayjs.extend(relativeTime);

const { Search } = Input;

const AdminPanel: React.FC = () => {
  const { accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState("live");

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              Admin Control Panel
            </h1>
            <p className="text-foreground/60">
              Manage detailed statistics, active users, and message broadcasts.
            </p>
          </div>
        </header>

        <Card className="bg-card/50 border-border backdrop-blur-xl">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="admin-tabs"
            items={[
              {
                key: "live",
                label: (
                  <span className="flex items-center gap-2 text-primary">
                    <Radio className="w-4 h-4" /> Activity Stream
                  </span>
                ),
                children: <LiveActivityTab token={accessToken!} />,
              },
              {
                key: "impressions",
                label: (
                  <span className="flex items-center gap-2">
                    <BarChartOutlined /> Detailed Impressions
                  </span>
                ),
                children: <ImpressionsTab token={accessToken!} />,
              },
              {
                key: "users",
                label: (
                  <span className="flex items-center gap-2">
                    <UserOutlined /> Active Bot Users
                  </span>
                ),
                children: <UsersTab token={accessToken!} />,
              },
              {
                key: "clicks",
                label: (
                  <span className="flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4" /> Detailed Clicks
                  </span>
                ),
                children: <ClicksTab token={accessToken!} />,
              },
              {
                key: "broadcasts",
                label: (
                  <span className="flex items-center gap-2">
                    <SendOutlined /> Broadcast Manager
                  </span>
                ),
                children: <BroadcastsTab token={accessToken!} />,
              },
            ]}
          />
        </Card>
      </div>

      <style>{`
        .admin-tabs .ant-tabs-nav::before { border-bottom-color: var(--border); }
        .admin-tabs .ant-tabs-tab { color: var(--muted-foreground); }
        .admin-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #8b5cf6 !important; }
        .admin-tabs .ant-tabs-ink-bar { background: #8b5cf6; }
        .ant-table { background: transparent !important; color: var(--foreground) !important; }
        .ant-table-thead > tr > th { background: var(--secondary) !important; color: var(--foreground) !important; border-bottom: 1px solid var(--border) !important; }
        .ant-table-tbody > tr > td { border-bottom: 1px solid var(--border) !important; color: var(--foreground) !important; }
        .ant-table-tbody > tr:hover > td { background: var(--accent) !important; }
        .ant-pagination-item { background: transparent !important; border-color: var(--border) !important; }
        .ant-pagination-item a { color: var(--foreground) !important; }
        .ant-pagination-item-active { border-color: #8b5cf6 !important; }
        .ant-pagination-item-active a { color: #8b5cf6 !important; }
        .ant-select-selector { background: var(--secondary) !important; border-color: var(--border) !important; color: var(--foreground) !important; }
        .ant-input { background: var(--secondary) !important; border-color: var(--border) !important; color: var(--foreground) !important; }
      `}</style>
    </div>
  );
};

// --- LIVE ACTIVITY TAB ---
const LiveActivityTab: React.FC<{ token: string }> = ({ token }) => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    let socketUrl = "";
    try {
      socketUrl = new URL(import.meta.env.VITE_API_URL).origin + "/admin";
    } catch {
      socketUrl = "http://localhost:5000/admin";
    }

    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to Activity Stream");
    });

    socket.on("terminal:log", (data) => {
      setLogs((prev) => [data, ...prev].slice(0, 100)); // Keep last 100 logs
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "system":
        return <Zap className="w-5 h-5 text-purple-500" />;
      case "ad":
        return <Radio className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "error":
        return "bg-rose-500/10 border-rose-500/20";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20";
      case "system":
        return "bg-purple-500/10 border-purple-500/20";
      case "ad":
        return "bg-blue-500/10 border-blue-500/20";
      default:
        return "bg-sky-500/10 border-sky-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card/40 p-5 rounded-2xl border border-border shadow-sm gap-4">
        <div>
          <h3 className="font-bold text-xl flex items-center gap-2 text-foreground">
            <Radio className="w-6 h-6 text-primary animate-pulse" /> Live
            Activity Stream
          </h3>
          <p className="text-sm text-foreground/60 mt-1">
            Real-time feed of all platform operations, ad campaigns, and bot
            events.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </div>
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">
            Live Updates Active
          </span>
        </div>
      </div>

      <div className="bg-card/30 border border-border/50 rounded-2xl overflow-hidden shadow-2xl relative min-h-[400px]">
        <div className="p-4 overflow-y-auto max-h-[650px] space-y-3 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="text-center text-foreground/40 py-24 flex flex-col items-center gap-4 text-sm w-full justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2 border border-primary/20">
                <Radio className="w-8 h-8 opacity-70 animate-pulse text-primary" />
              </div>
              <p>Waiting for incoming platform activities...</p>
              <p className="text-xs opacity-60">
                Events like signups, bot updates, and transactions will appear
                here instantly.
              </p>
            </div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={`flex gap-4 items-center p-4 rounded-xl border transition-all duration-300 shadow-sm ${getLogColor(log.type)} hover:brightness-110`}
              >
                <div className="shrink-0 p-2 rounded-full bg-background/50 shadow-sm">
                  {getLogIcon(log.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground/50 bg-background/50 px-2 py-0.5 rounded-md">
                      {dayjs(log.timestamp).format("DD MMM, HH:mm:ss")}
                    </span>
                    {log.data?.action && (
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                        {log.data.action.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  <div
                    className={`text-base font-medium ${log.type === "error" ? "text-rose-400" : log.type === "success" ? "text-emerald-400" : "text-foreground/90"}`}
                  >
                    {log.message}
                  </div>

                  {log.data &&
                    (log.data.userId || log.data.text || log.data.amount) && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground/70">
                        {log.data.userId && (
                          <span className="bg-background/40 px-2 py-1 rounded-md border border-white/5 flex items-center gap-1">
                            <span className="opacity-50">User:</span>{" "}
                            {log.data.userId}
                          </span>
                        )}
                        {log.data.amount && (
                          <span className="bg-background/40 px-2 py-1 rounded-md border border-white/5 flex items-center gap-1">
                            <span className="opacity-50">Amount:</span> $
                            {typeof log.data.amount === "number"
                              ? log.data.amount.toFixed(2)
                              : log.data.amount}
                          </span>
                        )}
                        {log.data.text && (
                          <span className="bg-background/40 px-2 py-1 rounded-md border border-white/5 italic truncate max-w-[300px]">
                            "{log.data.text}"
                          </span>
                        )}
                      </div>
                    )}
                </div>

                {log.data && log.data.botUsername && (
                  <div className="shrink-0 ml-4 hidden md:block">
                    <a
                      href={`https://t.me/${log.data.botUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      <span className="text-sm font-semibold">
                        @{log.data.botUsername}
                      </span>
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- IMPRESSIONS TAB ---
const ImpressionsTab: React.FC<{ token: string }> = ({ token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/detailed-stats/impressions`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 10, offset: (page - 1) * 10, search },
        },
      );
      setData(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (err) {
      message.error("Failed to load impressions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const columns = [
    {
      title: "User",
      key: "user",
      render: (r: any) => (
        <div>
          <div className="font-medium">
            {r.firstName} {r.lastName}
          </div>
          <div className="text-xs text-foreground/40">
            @{r.username || r.telegramUserId}
          </div>
        </div>
      ),
    },
    {
      title: "Bot",
      dataIndex: ["bot", "username"],
      key: "bot",
      render: (u: string) => <Tag color="blue">@{u}</Tag>,
    },
    {
      title: "Country",
      key: "geo",
      render: (r: any) => (
        <span className="text-xs">
          {r.country || "???"}{" "}
          {r.city && <span className="text-foreground/30">({r.city})</span>}
        </span>
      ),
    },
    { title: "Ad", dataIndex: ["ad", "title"], key: "ad", ellipsis: true },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (v: any) => `${parseFloat(v).toFixed(4)}$`,
    },
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "time",
      render: (v: string) => dayjs(v).format("YYYY-MM-DD HH:mm"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-4">
        <Search
          placeholder="Search users or TG ID"
          onSearch={setSearch}
          style={{ maxWidth: 300 }}
          allowClear
        />
        <Button
          icon={<DownloadOutlined />}
          onClick={() => message.info("Exporting...")}
        >
          Export All
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          total,
          current: page,
          pageSize: 10,
          onChange: setPage,
        }}
      />
    </div>
  );
};

// --- USERS TAB ---
const UsersTab: React.FC<{ token: string }> = ({ token }) => {
  const [bots, setBots] = useState([]);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Fetch all bots for selection
    const fetchBots = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/bots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBots(res.data.data);
    };
    fetchBots();
  }, [token]);

  const fetchUsers = async (botId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/detailed-stats/bot/${botId}/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUsers(res.data.data);
      setStats(res.data.stats);
    } catch (err) {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    if (!selectedBot) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/detailed-stats/bot/${selectedBot}/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // Simple JSON to CSV/Excel logic or direct download if backend supports it
      message.success("Success! (Downloading...)");
      console.log("Export data:", res.data.data);
    } catch (err) {
      message.error("Export failed");
    }
  };

  const columns = [
    { title: "Telegram ID", dataIndex: "telegramUserId", key: "tgid" },
    {
      title: "Name",
      key: "name",
      render: (r: any) => `${r.firstName} ${r.lastName || ""}`,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "user",
      render: (u: string) => (u ? `@${u}` : "-"),
    },
    {
      title: "Geo",
      key: "geo",
      render: (r: any) => (
        <div className="text-xs">
          <div>{r.country || "Unknown"}</div>
          <div className="text-foreground/40 text-[10px]">
            {r.lastSeenIp || "-"}
          </div>
        </div>
      ),
    },
    { title: "Language", dataIndex: "languageCode", key: "lang" },
    {
      title: "Last Seen",
      dataIndex: "lastSeenAt",
      key: "seen",
      render: (v: string) => dayjs(v).fromNow(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Select
          placeholder="Select a Bot to view active users"
          style={{ width: 300 }}
          onChange={(val) => {
            setSelectedBot(val);
            fetchUsers(val);
          }}
          options={bots.map((b: any) => ({
            label: `@${b.username}`,
            value: b.id,
          }))}
        />
        {selectedBot && (
          <Button
            icon={<DownloadOutlined />}
            onClick={exportExcel}
            type="primary"
          >
            Export to Excel
          </Button>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-purple-500/10 border-purple-500/20">
            <div className="text-foreground/60 text-xs mb-1">
              Total Unique Users
            </div>
            <div className="text-2xl font-bold">{stats.totalUnique}</div>
          </Card>
          <Card className="bg-indigo-500/10 border-indigo-500/20">
            <div className="text-foreground/60 text-xs mb-1">
              Active (Last 3 Days)
            </div>
            <div className="text-2xl font-bold">{stats.active3Days}</div>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/20">
            <div className="text-foreground/60 text-xs mb-1">
              Active (Last 7 Days)
            </div>
            <div className="text-2xl font-bold">{stats.active7Days}</div>
          </Card>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

// --- BROADCASTS TAB ---
const BroadcastsTab: React.FC<{ token: string }> = ({ token }) => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/broadcasts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setBroadcasts(res.data.data);
    } catch (err) {
      message.error("Failed to load broadcasts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const columns = [
    {
      title: "Bot",
      dataIndex: ["bot", "username"],
      key: "bot",
      render: (u: string) => `@${u}`,
    },
    {
      title: "Advertiser",
      key: "adv",
      render: (r: any) => r.advertiser.username || r.advertiser.firstName,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag
          color={
            s === "COMPLETED" ? "green" : s === "RUNNING" ? "blue" : "orange"
          }
        >
          {s}
        </Tag>
      ),
    },
    {
      title: "Progress",
      key: "prog",
      render: (r: any) => `${r.sentCount} / ${r.targetCount}`,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "date",
      render: (v: string) => dayjs(v).format("MM-DD HH:mm"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          New Broadcast
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={broadcasts}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title="Create New Broadcast"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="dark-modal"
      >
        <p className="text-foreground/60 mb-4">
          Launch a message campaign to active bot users.
        </p>
        {/* Placeholder for complicated form */}
        <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-xl">
          <SendOutlined className="text-4xl text-foreground/20 mb-2" />
          <p>Broadcast Wizard Coming Soon!</p>
          <p className="text-xs text-foreground/40">
            Advertisers can already launch broadcasts from their dashboard.
          </p>
        </div>
      </Modal>
    </div>
  );
};

// --- CLICKS TAB ---
const ClicksTab: React.FC<{ token: string }> = ({ token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/detailed-stats/clicks`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 10, offset: (page - 1) * 10, search },
        },
      );
      setData(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (err) {
      message.error("Failed to load clicks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const columns = [
    {
      title: "User",
      key: "user",
      render: (r: any) => (
        <div>
          <div className="font-medium text-blue-400">
            {r.firstName} {r.lastName}
          </div>
          <div className="text-xs text-foreground/40">
            @{r.username || r.telegramUserId}
          </div>
        </div>
      ),
    },
    {
      title: "Bot",
      dataIndex: ["bot", "username"],
      key: "bot",
      render: (u: string) => <Tag color="cyan">@{u}</Tag>,
    },
    {
      title: "Country",
      key: "geo",
      render: (r: any) => (
        <span className="text-xs font-bold">
          {r.country || "???"}{" "}
          <span className="text-foreground/30 font-normal">
            ({r.city || "?"})
          </span>
        </span>
      ),
    },
    {
      title: "Ad Campaign",
      dataIndex: ["ad", "title"],
      key: "ad",
      ellipsis: true,
    },
    {
      title: "Device/IP",
      key: "device",
      render: (r: any) => (
        <div className="text-[10px] text-foreground/50">
          <div>{r.ipAddress}</div>
          <div className="truncate max-w-[120px]">
            {r.userAgent?.split(" ")[0]}
          </div>
        </div>
      ),
    },
    {
      title: "Time",
      dataIndex: "clickedAt",
      key: "time",
      render: (v: string) => dayjs(v).format("YYYY-MM-DD HH:mm"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-4">
        <Search
          placeholder="Search users"
          onSearch={setSearch}
          style={{ maxWidth: 300 }}
          allowClear
        />
        <Button
          icon={<DownloadOutlined />}
          onClick={() => message.info("Exporting...")}
        >
          Export Clicks
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          total,
          current: page,
          pageSize: 10,
          onChange: setPage,
        }}
      />
    </div>
  );
};

export default AdminPanel;
