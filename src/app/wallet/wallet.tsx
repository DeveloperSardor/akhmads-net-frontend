import { useState } from "react";

const Wallet = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="main-container space-y-8 py-30">
        {/* Title */}
        <h1 className="text-xl font-semibold">Wallet</h1>

        {/* BALANCE CARDS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Available */}
          <div className="rounded-2xl bg-white/[0.03] p-5 backdrop-blur">
            <p className="text-xs text-white/50">Available Balance</p>
            <h2 className="mt-2 text-2xl font-semibold">$1248.50</h2>
            <button
              onClick={() => setOpen(true)}
              className="mt-4 w-full rounded-xl bg-purple-600 py-2 text-sm hover:bg-purple-700"
            >
              Add Money
            </button>
          </div>

          {/* Pending */}
          <div className="rounded-2xl bg-white/[0.03] p-5 backdrop-blur">
            <p className="text-xs text-white/50">Pending</p>
            <h2 className="mt-2 text-2xl font-semibold">$120.00</h2>
            <p className="mt-3 text-xs text-white/40">Kutilyotgan to‘lovlar</p>
          </div>

          {/* Withdrawable */}
          <div className="rounded-2xl bg-white/[0.03] p-5 backdrop-blur">
            <p className="text-xs text-white/50">Withdrawable</p>
            <h2 className="mt-2 text-2xl font-semibold">$980.30</h2>
            <button className="mt-4 w-full rounded-xl bg-white/5 py-2 text-sm hover:bg-white/10">
              Withdraw
            </button>
          </div>
        </div>

        {/* SUPPORTED PAYMENTS */}
        <div className="rounded-2xl bg-white/[0.03] p-4">
          <h2 className="mb-4 text-sm font-medium">Supported Payments</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { name: "Click", sub: "Instant" },
              { name: "Payme", sub: "Instant" },
              { name: "Visa/Mastercard", sub: "1-3 minutes" },
              { name: "Crypto (USDT)", sub: "Network fee applies" },
            ].map((item) => (
              <div key={item.name} className="rounded-xl bg-white/[0.03] p-4">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="mt-1 text-xs text-white/40">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div>
          <h2 className="mb-4 text-sm font-medium">Transactions</h2>

          <div className="overflow-hidden rounded-2xl bg-white/[0.03]">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-xs text-white/50">
                <tr>
                  <th className="px-4 py-3 text-left">Transaction ID</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/5">
                  <td className="px-4 py-3 text-xs">TXN-001234</td>
                  <td className="px-4 py-3">Deposit</td>
                  <td className="px-4 py-3 text-xs">2025-12-10 14:30</td>
                  <td className="px-4 py-3 text-green-400">+$500.00</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                      Success
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">Copy</td>
                </tr>

                <tr className="border-t border-white/5">
                  <td className="px-4 py-3 text-xs">TXN-001235</td>
                  <td className="px-4 py-3">Reklama xarajati</td>
                  <td className="px-4 py-3 text-xs">2025-12-11 09:15</td>
                  <td className="px-4 py-3 text-red-400">-$45.50</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                      Success
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">Copied</td>
                </tr>

                <tr className="border-t border-white/5">
                  <td className="px-4 py-3 text-xs">TXN-001236</td>
                  <td className="px-4 py-3">Daromad</td>
                  <td className="px-4 py-3 text-xs">2025-12-12 16:45</td>
                  <td className="px-4 py-3 text-green-400">+$89.30</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                      Success
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">Copy</td>
                </tr>

                <tr className="border-t border-white/5">
                  <td className="px-4 py-3 text-xs">TXN-001237</td>
                  <td className="px-4 py-3">Yechib olish</td>
                  <td className="px-4 py-3 text-xs">2025-12-12 16:45</td>
                  <td className="px-4 py-3 text-red-400">-$200.00</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400">
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">Copy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white/[0.03] p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-medium">Select the Payment Method</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Methods */}
            <div className="grid grid-cols-2 gap-4">
              {["Click", "Payme", "Visa/Mastercard", "Crypto (USDT)"].map(
                (method) => (
                  <button
                    key={method}
                    className="rounded-xl bg-white/[0.03] py-4 text-sm hover:bg-white/[0.08]"
                  >
                    {method}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Wallet;
