import { useAdStore } from "../../store/adStore";
import { Smartphone } from "lucide-react";

const LivePreview = () => {
  const { formData } = useAdStore();

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  return (
    <div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="p-6">
          <div className="relative mx-auto" style={{ maxWidth: '320px' }}>
            {/* Phone Frame */}
            <div className="relative bg-[#1a1a1a] rounded-[2.75rem] p-2.5 shadow-2xl">
              {/* Screen */}
              <div className="relative bg-[#0e1621] rounded-[2.25rem] overflow-hidden">
                {/* Status Bar */}
                <div className="flex items-center justify-between px-6 py-2 bg-[#0a0e13]">
                  <div className="text-white text-xs font-semibold">{currentTime}</div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                    </svg>
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>
                    </svg>
                  </div>
                </div>

                {/* Telegram Header */}
                <div className="flex items-center gap-3 px-4 py-2.5 bg-[#17212b] border-b border-[#0f1419]">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                    AD
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm">Sponsored</div>
                    <div className="text-xs text-gray-400">Advertisement</div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="p-3.5 min-h-[360px]">
                  <div className="max-w-[90%]">
                    <div className="bg-[#182533] rounded-2xl rounded-tl-md overflow-hidden shadow-lg">
                      {/* Media */}
                      {formData.mediaUrl && formData.contentType === "MEDIA" && (
                        <div className="relative">
                          <img src={formData.mediaUrl} alt="Ad" className="w-full h-auto" />
                          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                            <span className="text-white text-[10px] font-semibold">AD</span>
                          </div>
                        </div>
                      )}

                      {/* Text */}
                      <div className="p-3.5">
                        {formData.text ? (
                          <div className="text-white text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {formData.text}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm italic">
                            Your ad text will appear here...
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-1 mt-2 text-[11px] text-gray-500">
                          <span>{currentTime}</span>
                        </div>
                      </div>

                      {/* Buttons */}
                      {formData.buttons && formData.buttons.length > 0 && (
                        <div className="px-3 pb-3 space-y-2">
                          {formData.buttons.map((button, index) => (
                            <div
                              key={index}
                              className="py-2.5 px-4 bg-[#2b5278] rounded-lg text-white text-sm font-medium text-center"
                            >
                              {button.text || "Button text"}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Input Bar */}
                <div className="bg-[#17212b] border-t border-[#0f1419] p-2.5 flex items-center gap-2">
                  <div className="flex-1 bg-[#0f1419] rounded-full px-3.5 py-2 text-xs text-gray-500">
                    Message...
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Preview simulates Telegram appearance
          </p>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;