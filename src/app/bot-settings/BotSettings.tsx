import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Code,
  Copy,
  CheckCircle,
  Loader2,
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
  ChevronDown,
  AlertCircle,
  X,
  Info,
} from "lucide-react";
import { useBotStore } from "../../store/botStore";
import { BOT_CATEGORIES } from "../../types/bot.types";

const BotSettings = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();

  // Bot store
  const {
    currentBot,
    isLoading,
    isSubmitting,
    error,
    successMessage,
    fetchBotById,
    updateBot,
    clearError,
    clearSuccess,
  } = useBotStore();

  // Form state
  const [settings, setSettings] = useState({
    frequencyMinutes: 5,
    postFilter: "all" as "all" | "not_mine" | "only_mine",
    allowedCategories: [] as string[],
    newToken: "",
  });

  // UI state
  const [showStats, setShowStats] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState("python");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [activeTab, setActiveTab] = useState<"released" | "exceptions">("released");
  
  // ✅ Modal states
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // Fetch bot on mount
  useEffect(() => {
    if (botId) {
      fetchBotById(botId);
    }
  }, [botId, fetchBotById]);

  // Load settings when bot loads
  useEffect(() => {
    if (currentBot) {
      setSettings({
        frequencyMinutes: currentBot.frequencyMinutes || 5,
        postFilter: (currentBot.postFilter as any) || "all",
        allowedCategories: currentBot.allowedCategories || [],
        newToken: "",
      });
    }
  }, [currentBot]);

  // Clear messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => clearSuccess(), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearSuccess]);

  // Handle category toggle
  const handleCategoryToggle = (categoryId: string) => {
    setSettings((prev) => ({
      ...prev,
      allowedCategories: prev.allowedCategories.includes(categoryId)
        ? prev.allowedCategories.filter((c) => c !== categoryId)
        : [...prev.allowedCategories, categoryId],
    }));
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    if (!botId) return;

    await updateBot(botId, {
      frequencyMinutes: settings.frequencyMinutes,
      postFilter: settings.postFilter,
      allowedCategories: settings.allowedCategories,
    });
  };

  // Handle update token
  const handleUpdateToken = async () => {
    if (!botId || !settings.newToken.trim()) {
      alert("Please enter a valid token");
      return;
    }

    // TODO: Implement token update API call
    alert("Token update coming soon!");
  };

  // Get integration code
  const getIntegrationCode = (language: string) => {
    const apiKey = currentBot?.apiKey || "YOUR_API_KEY";

    const codes: Record<string, string> = {
      python: `import aiohttp

async def show_ad(chat_id: int):
    async with aiohttp.ClientSession() as session:
        async with session.post(
            'https://api.akhmads.net/ad/SendPost',
            headers={'Authorization': 'Bearer ${apiKey}'},
            json={'SendToChatId': chat_id}
        ) as response:
            result = await response.json()
            return result.get('SendPostResult') == 1`,

      javascript: `const axios = require('axios');

async function showAd(chatId) {
  const response = await axios.post(
    'https://api.akhmads.net/ad/SendPost',
    { SendToChatId: chatId },
    { headers: { 'Authorization': 'Bearer ${apiKey}' } }
  );
  return response.data.SendPostResult === 1;
}`,

      php: `<?php
function showAd($chatId) {
  $ch = curl_init('https://api.akhmads.net/ad/SendPost');
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['SendToChatId' => $chatId]));
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ${apiKey}'
  ]);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $result = curl_exec($ch);
  return json_decode($result)->SendPostResult === 1;
}`,

      csharp: `using System.Net.Http;

async Task<bool> ShowAd(long chatId) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", "${apiKey}");
  var content = new StringContent(
    JsonSerializer.Serialize(new { SendToChatId = chatId }),
    Encoding.UTF8, "application/json");
  var response = await client.PostAsync(
    "https://api.akhmads.net/ad/SendPost", content);
  var result = await response.Content.ReadAsStringAsync();
  return JsonDocument.Parse(result).RootElement
    .GetProperty("SendPostResult").GetInt32() == 1;
}`,
    };

    return codes[language] || codes.python;
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    const code = getIntegrationCode(activeCodeTab);
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // ✅ Copy API token
  const handleCopyToken = () => {
    if (currentBot?.apiKey) {
      navigator.clipboard.writeText(currentBot.apiKey);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  // Format numbers
  const formatNumber = (num: number | undefined | null = 0) => {
    return Number(num || 0).toLocaleString();
  };

  const formatCurrency = (amount: number | undefined | null = 0) => {
    return `$${Number(amount || 0).toFixed(2)}`;
  };

  if (isLoading && !currentBot) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!currentBot) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Bot not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to bots</span>
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">Bot Settings</h1>
          <p className="text-gray-400 mt-2">@{currentBot.username}</p>
        </div>

        {/* Error/Success Alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-400">{successMessage}</p>
            </div>
            <button onClick={clearSuccess} className="text-green-400 hover:text-green-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Category Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Allowed Categories</h2>
          <div className="flex flex-wrap gap-3">
            {BOT_CATEGORIES.map((category) => {
              const isAllowed = settings.allowedCategories.includes(category.id);
              const isHighRate = ["betting", "gambling"].includes(category.id);

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    isAllowed
                      ? "bg-green-500/20 border-green-500/50 text-green-400"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {isAllowed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-current rounded" />
                  )}
                  <span className="text-sm">{category.nameEn}</span>
                  {isHighRate && (
                    <span className="text-xs text-yellow-400">(x2 rate)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center justify-between p-6"
          >
            <h2 className="text-lg font-semibold">Statistics</h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                showStats ? "rotate-180" : ""
              }`}
            />
          </button>

          {showStats && (
            <div className="px-6 pb-6 grid grid-cols-4 gap-4 border-t border-gray-800 pt-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Impressions</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatNumber(currentBot.impressionsServed || 0)}
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointerClick className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Clicks</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatNumber(currentBot.clicks || 0)}
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">CTR</span>
                </div>
                <p className="text-2xl font-bold">{currentBot.ctr || 0}%</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400">Earnings</span>
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(currentBot.totalEarnings)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ad Rules Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Ad Format - Impressions</h2>
          <p className="text-sm text-gray-400 mb-4">
            This means that users will only see the ads when they interact with your
            bot. This almost guarantees that users will actually see the ads,
            regardless of whether or not they have notifications turned on, as they
            are already in a chat with your bot. Mass mailings to your user base
            through GramAds are strictly prohibited, and advertising for users is only
            allowed when the bot has done some useful work for them. Attempting mass
            mailings may result in a ban of the account.
          </p>
          <p className="text-sm text-yellow-400 mb-4">
            The bot should display advertisements only after performing useful tasks
            for the user, following the principle of "completed task - display
            advertisement."
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRulesModal(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              ACCEPT RULES AND GET INSTRUCTIONS
            </button>
            <button
              onClick={() => setShowResultModal(true)}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              Result Codes
            </button>
          </div>
        </div>

        {/* Frequency Limit */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Limit frequency, no more than 1 ad per user every 5 min
          </h2>
          <input
            type="number"
            value={settings.frequencyMinutes}
            onChange={(e) =>
              setSettings({
                ...settings,
                frequencyMinutes: parseInt(e.target.value) || 5,
              })
            }
            min="1"
            max="1440"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          />
          <p className="text-xs text-gray-400 mt-2">
            You can leave it at minimum and control it yourself by sending requests as
            frequently as you like.
          </p>
          <button
            onClick={handleSaveSettings}
            disabled={isSubmitting}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>SAVE</span>
          </button>
        </div>

        {/* Post Filter */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Which posts can this bot publish?
          </h2>
          <div className="space-y-3">
            {[
              { value: "all", label: "All posts" },
              { value: "not_mine", label: "All posts but mine" },
              { value: "only_mine", label: "My posts only" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors"
              >
                <input
                  type="radio"
                  name="postFilter"
                  value={option.value}
                  checked={settings.postFilter === option.value}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      postFilter: e.target.value as any,
                    })
                  }
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Integration Code */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Code className="w-5 h-5" />
              Integration Code
            </h2>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {copiedCode ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span className="text-sm">{copiedCode ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 mb-4">
            {["python", "javascript", "php", "csharp"].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeTab(lang)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCodeTab === lang
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {lang === "csharp" ? "C#" : lang}
              </button>
            ))}
          </div>

          {/* Code Block */}
          <pre className="bg-black border border-gray-800 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-gray-300">
              {getIntegrationCode(activeCodeTab)}
            </code>
          </pre>
        </div>

        {/* Update Token */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">Update access token</h2>
          <p className="text-xs text-gray-400 mb-4">
            If you've changed your bot's access token via the BotFather, make sure to
            update it here accordingly.
          </p>
          <input
            type="password"
            value={settings.newToken}
            onChange={(e) =>
              setSettings({ ...settings, newToken: e.target.value })
            }
            placeholder="New bot's access token from the BotFather"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-4"
          />
          <button
            onClick={handleUpdateToken}
            disabled={isSubmitting || !settings.newToken.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>SAVE</span>
          </button>
        </div>

        {/* Released Ads / Exceptions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setActiveTab("released")}
              className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                activeTab === "released"
                  ? "border-green-500 text-green-400"
                  : "border-transparent text-gray-400"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Released ads</span>
            </button>
            <button
              onClick={() => setActiveTab("exceptions")}
              className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                activeTab === "exceptions"
                  ? "border-gray-500 text-white"
                  : "border-transparent text-gray-400"
              }`}
            >
              <span className="font-medium">Exceptions</span>
            </button>
          </div>

          <div className="text-center py-12 text-gray-500">
            {activeTab === "released"
              ? "No released ads yet"
              : "No exceptions configured"}
          </div>
        </div>
      </div>

      {/* ✅ RULES MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-4">API Integration Instructions</h2>

            {/* API Token */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2 text-gray-400">Your API Token</h3>
              <div className="flex items-center gap-2 bg-black border border-gray-800 rounded-lg p-4">
                <code className="flex-1 text-sm text-green-400 break-all">
                  {currentBot?.apiKey || "Loading..."}
                </code>
                <button
                  onClick={handleCopyToken}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {copiedToken ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ Keep this token secret! Do not share it publicly.
              </p>
            </div>

            {/* Integration Code Examples */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-gray-400">Quick Start</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>1. Copy your API token above</p>
                <p>2. Choose your programming language from the Integration Code section</p>
                <p>3. Use the provided code to integrate ad requests into your bot</p>
                <p>4. Call the ad function after completing useful tasks for users</p>
              </div>
            </div>

            {/* Rules */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-gray-400">Important Rules</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Only show ads after completing useful tasks</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Follow the "completed task → display ad" principle</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Mass mailings are strictly prohibited</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">•</span>
                  <span className="text-red-400">Violation may result in account ban</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* ✅ RESULT CODES MODAL */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowResultModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-4">Result Codes</h2>
            <p className="text-sm text-gray-400 mb-6">
              The request result may contain the following values, where "1" means that a suitable ad has been successfully selected and delivered to the user:
            </p>

            {/* Example Response */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2 text-gray-400">Example Response (200 OK)</h3>
              <pre className="bg-black border border-gray-800 rounded-lg p-4">
                <code className="text-sm text-green-400">{"{\n  \"SendPostResult\": 1\n}"}</code>
              </pre>
            </div>

            {/* Result Codes */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-400">All Result Codes</h3>
              <div className="space-y-2 bg-black border border-gray-800 rounded-lg p-4">
                {[
                  { code: 0, name: "Undefined", color: "text-gray-400" },
                  { code: 1, name: "Success", color: "text-green-400" },
                  { code: 2, name: "RevokedTokenError", color: "text-red-400" },
                  { code: 3, name: "UserForbiddenError", color: "text-red-400" },
                  { code: 4, name: "TooManyRequestsError", color: "text-yellow-400" },
                  { code: 5, name: "OtherBotApiError", color: "text-red-400" },
                  { code: 6, name: "OtherError", color: "text-red-400" },
                  { code: 7, name: "AdLimited", color: "text-yellow-400" },
                  { code: 8, name: "NoAds", color: "text-gray-400" },
                  { code: 9, name: "BotIsNotEnabled", color: "text-yellow-400" },
                  { code: 10, name: "Banned", color: "text-red-400" },
                  { code: 11, name: "InReview", color: "text-yellow-400" },
                ].map((item) => (
                  <div key={item.code} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <span className={`font-mono text-sm ${item.color}`}>
                      {item.name} = {item.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowResultModal(false)}
              className="mt-6 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotSettings;