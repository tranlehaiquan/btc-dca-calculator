import { useDcaCalculator } from "./hooks/useDcaCalculator";
import { ASSET_CONFIG } from "./constants";
import { InputForm } from "./components/InputForm";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { DetailedReport } from "./components/DetailedReport";
import { Chart } from "./components/Chart";
import { TransactionHistory } from "./components/TransactionHistory";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { SEO } from "./components/SEO";
import { Bitcoin, Coins, Gem } from "lucide-react";
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();
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
      <SEO asset={asset} />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher />
        </div>

        <header className="mb-16 space-y-4 text-center">
          <div className="mb-6 flex justify-center transition-transform duration-300 hover:scale-110">
            {renderLogo()}
          </div>
          <h1 className="text-5xl font-black tracking-tight md:text-6xl">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {t(`assets.${asset}`)}
            </span>{" "}
            <span className="bg-asset-gradient bg-clip-text text-transparent">
              DCA
            </span>{" "}
            Calculator
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-medium text-slate-400">
            {t("app.subtitle")}
          </p>
        </header>

        <main>
          {error && (
            <div className="mb-8 rounded-xl border border-red-500 bg-red-500/10 px-6 py-4 text-center font-semibold text-red-500 backdrop-blur-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
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

            <section className="space-y-8 lg:col-span-8">
              {result ? (
                <>
                  <ResultsDashboard result={result} asset={asset} />
                  <DetailedReport result={result} asset={asset} />
                  <Chart data={result.history} asset={asset} />
                  <TransactionHistory transactions={result.transactions} asset={asset} />
                </>
              ) : (
                <div className="flex h-full min-h-[400px] items-center justify-center rounded-3xl border-2 border-dashed border-white/5 bg-white/2 backdrop-blur-sm">
                  <div className="space-y-4 p-8 text-center">
                    <div className="mb-4 inline-block rounded-full bg-white/5 p-4">
                      <Coins size={32} className="text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-300">
                      {t("ready_state.title")}
                    </h3>
                    <p className="mx-auto max-w-xs text-slate-500">
                      {t("ready_state.description")}
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>

        <footer className="mt-20 border-t border-white/5 pt-8 text-center text-sm text-slate-500">
          <p>
            {t("app.footer", {
              year: new Date().getFullYear(),
              asset: assetLabel,
            })}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
