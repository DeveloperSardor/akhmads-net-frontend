import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Select, message, Spin, Tag, Avatar } from "antd";
import { SendOutlined, InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { useTranslations } from "../../hooks/useTranslations";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Option } = Select;
const { TextArea } = Input;

const BroadcastAd: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const t = useTranslations();
  const ba = t.broadcastAd;
  
  const { accessToken } = useAuthStore();
  const [publicBots, setPublicBots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Selection state
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [activeDays, setActiveDays] = useState(30);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [targetCount, setTargetCount] = useState(100);
  
  // Content state
  const [contentType, setContentType] = useState("TEXT");
  const [text, setText] = useState("");
  const [buttons, setButtons] = useState<{ text: string; url: string }[]>([]);
  
  const [pricePerUser, setPricePerUser] = useState(0.05);

  useEffect(() => {
    const fetchBots = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/bots/public`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setPublicBots(res.data.data.bots);
      } catch (err) {
        message.error("Failed to load public bots");
      } finally {
        setLoading(false);
      }
    };
    fetchBots();
  }, [accessToken]);

  const filteredBots = publicBots.filter((b: any) => 
    b.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedBot) {
        const bot = publicBots.find((b: any) => b.id === selectedBot);
        if (bot) {
            setActiveUsersCount((bot as any).activeUsers30d || 0);
            setPricePerUser((bot as any).broadcastPricePerUser || 0.05);
            setTargetCount(Math.min(100, (bot as any).activeUsers30d || 0));
        }
    }
  }, [selectedBot, publicBots]);

  const handleLaunch = async () => {
    if (!selectedBot || !text) {
        return message.warning("Please fill required fields");
    }
    
    setIsSubmitting(true);
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/ads/broadcasts`, {
            botId: selectedBot,
            contentType,
            text,
            targetCount,
            activeDays,
            buttons: buttons.filter(b => b.text && b.url)
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        message.success("Broadcast campaign launched successfully!");
        navigate(`/${lang}/my-ads`);
    } catch (err: any) {
        message.error(err.response?.data?.message || "Failed to launch broadcast");
    } finally {
        setIsSubmitting(false);
    }
  };

  const subtotal = targetCount * pricePerUser;
  const protocolFee = subtotal * 0.05;
  const totalCost = subtotal + protocolFee;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button 
            onClick={() => navigate(-1)} 
            className="mb-8 flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-bold"
        >
            <ArrowLeft className="w-4 h-4" />
            {ba?.back ?? 'Back'}
        </button>

        <header className="mb-10">
          <h2 className="text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">
            {ba?.title ?? 'Message Broadcast'}
          </h2>
          <p className="text-white/50 text-xl font-medium max-w-2xl leading-relaxed">
            {ba?.subtitle ?? 'Reach thousands of active bot users instantly.'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card/30 border border-border/50 backdrop-blur-3xl rounded-[2.5rem] p-8 lg:p-10 shadow-3xl">
              <div className="space-y-10">
                {/* Targeting Section */}
                <div>
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span>
                     {ba?.targeting?.title ?? '1. Audience Targeting'}
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-white/30 ml-1">{ba?.targeting?.selectBot ?? 'Select Target Bot'}</label>
                        <Select
                          showSearch
                          placeholder={ba?.targeting?.searchBot ?? "Search bot..."}
                          className="w-full h-14 custom-select"
                          onChange={setSelectedBot}
                          onSearch={setSearchTerm}
                          filterOption={false}
                        >
                          {filteredBots.map((b: any) => (
                            <Option key={b.id} value={b.id}>
                               <div className="flex items-center gap-3 py-1">
                                 <Avatar size="small" src={`${import.meta.env.VITE_API_URL}/bots/avatar/${b.username}`} className="ring-1 ring-white/10" />
                                 <span className="font-bold">@{b.username}</span>
                                 <Tag color="purple" className="text-[9px] font-black uppercase m-0 border-none bg-primary/20 text-primary">
                                    {(b as any).activeUsers30d} {ba?.targeting?.users ?? 'users'}
                                 </Tag>
                               </div>
                            </Option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-white/30 ml-1">{ba?.targeting?.activityFilter ?? 'Activity Filter'}</label>
                        <Select
                          defaultValue={30}
                          className="w-full h-14 custom-select"
                          onChange={setActiveDays}
                        >
                          <Option value={7}>{ba?.targeting?.last7Days ?? 'Last 7 days'}</Option>
                          <Option value={30}>{ba?.targeting?.last30Days ?? 'Last 30 days'}</Option>
                          <Option value={90}>{ba?.targeting?.last90Days ?? 'Last 90 days'}</Option>
                        </Select>
                      </div>
                   </div>

                   {selectedBot && (
                     <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-3xl animate-in fade-in zoom-in duration-500 shadow-inner">
                       <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                         <div className="flex items-center gap-5">
                           <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-lg border border-primary/20">
                             <UserOutlined style={{ fontSize: 28 }} />
                           </div>
                           <div>
                             <div className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-1">{ba?.targeting?.availableAudience ?? 'Available Audience'}</div>
                             <div className="text-3xl font-black">{loading ? <Spin size="small" /> : `${activeUsersCount.toLocaleString()}`}</div>
                           </div>
                         </div>
                         <div className="text-right bg-white/5 py-3 px-6 rounded-2xl border border-white/5">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-1">{ba?.targeting?.unitPrice ?? 'Unit Price'}</div>
                            <div className="text-primary text-xl font-black">${pricePerUser} <span className="text-[10px] text-white/20 uppercase">/ user</span></div>
                         </div>
                       </div>

                       <div className="mt-8 pt-8 border-t border-white/5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-3 block">{ba?.targeting?.confirmCount ?? 'Confirm Target Count'}</label>
                          <div className="relative group">
                            <Input 
                                type="number"
                                max={activeUsersCount}
                                min={1}
                                value={targetCount}
                                onChange={(e) => setTargetCount(Math.min(activeUsersCount, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="bg-white/5 border-white/10 text-white h-14 w-full rounded-2xl text-lg font-bold px-6 focus:border-primary/50 transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-primary opacity-50 uppercase">{ba?.targeting?.users}</div>
                          </div>
                       </div>
                     </div>
                   )}
                </div>

                {/* Content Section */}
                <div className="pt-10 border-t border-white/5">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-8 flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></span>
                     {ba?.content?.title ?? '2. Message Content'}
                   </h3>
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-white/30 ml-1">{ba?.content?.editorType ?? 'Editor Type'}</label>
                        <Select 
                          defaultValue="TEXT" 
                          className="w-full h-12 custom-select" 
                          onChange={setContentType}
                        >
                          <Option value="TEXT">{ba?.content?.plainText ?? 'Plain Text'}</Option>
                          <Option value="HTML">{ba?.content?.htmlFormatted ?? 'HTML / Formatted'}</Option>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-white/30 ml-1">{ba?.content?.composeMessage ?? 'Compose Message'}</label>
                        <TextArea
                          rows={8}
                          placeholder={ba?.content?.placeholder ?? "Your message starts here..."}
                          className="bg-white/5 border-white/10 text-white rounded-3xl p-6 text-base leading-relaxed focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all custom-scrollbar"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                        />
                      </div>

                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                           <label className="text-[11px] font-bold uppercase tracking-wider text-white/30 ml-1">{ba?.content?.ctaButtons ?? 'Call-to-Action Buttons'}</label>
                           <button 
                               onClick={() => setButtons([...buttons, { text: "", url: "" }])}
                               className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all"
                           >
                            {ba?.content?.addNew ?? "+ Add New"}
                           </button>
                        </div>
                        <div className="space-y-4">
                          {buttons.map((btn, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-3 animate-in slide-in-from-right-4 duration-300">
                              <Input 
                                  placeholder={ba?.content?.label ?? "Label"} 
                                  value={btn.text} 
                                  className="h-12 bg-white/5 border-white/10 rounded-2xl px-5 font-bold"
                                  onChange={e => {
                                      const newBtns = [...buttons];
                                      newBtns[idx].text = e.target.value;
                                      setButtons(newBtns);
                                  }}
                              />
                              <Input 
                                  placeholder={ba?.content?.url ?? "URL"} 
                                  value={btn.url} 
                                  className="h-12 bg-white/5 border-white/10 rounded-2xl px-5"
                                  onChange={e => {
                                      const newBtns = [...buttons];
                                      newBtns[idx].url = e.target.value;
                                      setButtons(newBtns);
                                  }}
                              />
                              <button 
                                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all shrink-0 font-black"
                                onClick={() => setButtons(buttons.filter((_, i) => i !== idx))}
                              >×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border/50 backdrop-blur-3xl sticky top-24 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col p-10">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-500 to-indigo-600"></div>
              <h3 className="font-black text-2xl mb-8 tracking-tight">{ba?.checkout?.title ?? 'Checkout'}</h3>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{ba?.checkout?.recipients ?? 'Recipients:'}</span>
                   <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">{targetCount.toLocaleString()} {ba?.targeting?.users}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{ba?.checkout?.reachPeriod ?? 'Reach Period:'}</span>
                   <span className="font-bold flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      Last {activeDays} days
                   </span>
                </div>

                <div className="h-px bg-white/10 my-4"></div>

                <div className="flex justify-between items-center text-sm">
                   <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{ba?.checkout?.advertisingCost ?? 'Advertising Cost:'}</span>
                   <span className="font-black text-lg">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{ba?.checkout?.serviceFee ?? 'Service Fee (5%):'}</span>
                   <span className="text-blue-400 font-black">+${protocolFee.toFixed(2)}</span>
                </div>
                
                <div className="mt-10 pt-8 border-t border-white/10">
                  <div className="flex justify-between items-baseline mb-8">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{ba?.checkout?.total ?? 'Total'}</span>
                     <div className="text-right">
                        <span className="text-5xl font-black text-white leading-none">${totalCost.toFixed(2)}</span>
                        <div className="text-[10px] text-white/20 mt-1 uppercase font-bold tracking-widest">USD Wallet</div>
                     </div>
                  </div>
                  
                  <button 
                      disabled={isSubmitting || !selectedBot || !text}
                      onClick={handleLaunch}
                      className="w-full h-16 bg-gradient-to-r from-primary to-indigo-600 disabled:opacity-30 disabled:grayscale rounded-2xl shadow-xl shadow-primary/30 text-base font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-95 transition-all text-white"
                  >
                      {isSubmitting ? <Spin size="small" /> : <SendOutlined />}
                      {ba?.checkout?.launchNow ?? 'LAUNCH NOW'}
                  </button>
                  
                  <div className="mt-8 p-5 bg-white/5 border border-white/5 rounded-2xl text-[11px] leading-relaxed text-white/40 flex gap-3 italic">
                     <InfoCircleOutlined className="mt-0.5 text-primary" />
                     {ba?.checkout?.info ?? 'Broadcasts are usually delivered instantly or within minutes. Real-time tracking will be available in your dashboard.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-select .ant-select-selector { 
          background: rgba(255,255,255,0.04) !important; 
          border-color: rgba(255,255,255,0.1) !important; 
          border-radius: 16px !important;
          padding: 0 20px !important;
          color: white !important; 
        }
        .custom-select .ant-select-selection-placeholder {
          color: rgba(255,255,255,0.3) !important;
        }
        .ant-select-dropdown {
          background-color: #1a1a1e !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5) !important;
        }
        .ant-select-item { color: rgba(255,255,255,0.7) !important; }
        .ant-select-item-option-active { background: rgba(255,255,255,0.06) !important; color: white !important; }
        .ant-select-item-option-selected { background: rgba(139, 92, 246, 0.2) !important; color: #a78bfa !important; }
        .ant-input { border-radius: 16px !important; background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.1) !important; color: white !important; }
        .ant-input:focus { border-color: rgba(139, 92, 246, 0.5) !important; box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1) !important; }
      `}</style>
    </div>
  );
};

export default BroadcastAd;
