import { useDcaCalculator } from "./hooks/useDcaCalculator";
import { ASSET_CONFIG } from "./constants";
import { InputForm } from "./components/InputForm";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { Chart } from "./components/Chart";
import { Bitcoin, Coins, Gem } from "lucide-react";

function App() {
  const {
    asset,
    setAsset,
    amount,
    setAmount,
    frequency,
    setFrequency,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    result,
    loading,
    error,
    calculate,
  } = useDcaCalculator();

  const renderLogo = () => {
    switch (asset) {
      case "BTC":
        return <Bitcoin size={64} className="text-[var(--btc-color)]" />;
      case "Gold":
        return <Gem size={64} className="text-[var(--gold-color)]" />;
      case "Silver":
        return <Coins size={64} className="text-[var(--silver-color)]" />;
    }
  };

  const assetLabel = ASSET_CONFIG[asset].label;

  return (
    <div
      className={`min-h-screen bg-[#0f111a] text-white selection:bg-[var(--asset-primary)] selection:text-black asset-${asset.toLowerCase()}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="text-center mb-16 space-y-4">
          <div className="flex justify-center mb-6 transition-transform hover:scale-110 duration-300">
            {renderLogo()}
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {assetLabel}
            </span>{" "}
            <span className="bg-asset-gradient bg-clip-text text-transparent">
              DCA
            </span>{" "}
            Calculator
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Visualize your long-term wealth accumulation through strategic
            Dollar Cost Averaging.
          </p>
        </header>

        <main>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-xl mb-8 text-center font-semibold backdrop-blur-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-4">
              <InputForm
                asset={asset}
                setAsset={setAsset}
                amount={amount}
                setAmount={setAmount}
                frequency={frequency}
                setFrequency={setFrequency}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                onCalculate={calculate}
                isLoading={loading}
              />
            </aside>

            <section className="lg:col-span-8 space-y-8">
              {result ? (
                <>
                  <ResultsDashboard result={result} asset={asset} />
                  <Chart data={result.history} asset={asset} />
                </>
              ) : (
                <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/2 backdrop-blur-sm">
                  <div className="text-center space-y-4 p-8">
                    <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                      <Coins size={32} className="text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-300">
                      Ready to calculate?
                    </h3>
                    <p className="text-slate-500 max-w-xs mx-auto">
                      Adjust the parameters on the left and click "Calculate
                      Returns" to see your personalized projection.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>

        <footer className="mt-20 pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
          <p>
            © 2026 {assetLabel} DCA Calculator. Built for long-term visionaries.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
