import { useDcaCalculator } from './hooks/useDcaCalculator';
import { ASSET_CONFIG } from './constants';
import { InputForm } from './components/InputForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Chart } from './components/Chart';
import { Bitcoin, Coins, Gem } from 'lucide-react';

function App() {
  const {
    asset, setAsset,
    amount, setAmount,
    frequency, setFrequency,
    startDate, setStartDate,
    endDate, setEndDate,
    result,
    loading,
    error,
    calculate
  } = useDcaCalculator();

  const renderLogo = () => {
    switch (asset) {
      case 'BTC': return <Bitcoin size={48} className="asset-logo" />;
      case 'Gold': return <Gem size={48} className="asset-logo" />;
      case 'Silver': return <Coins size={48} className="asset-logo" />;
    }
  };

  const assetLabel = ASSET_CONFIG[asset].label;

  return (
    <div className={`app-container asset-${asset.toLowerCase()}`}>
      <header className="header">
        <div className="logo-container">
          {renderLogo()}
        </div>
        <h1 className="title">
          <span className="asset-color">{assetLabel}</span> DCA Calculator
        </h1>
        <p className="subtitle">Visualize your potential returns with Dollar Cost Averaging</p>
      </header>

      <main className="main-content">
        {error && <div className="error-banner">{error}</div>}
        
        <div className="calculator-layout">
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
          
          <div className="results-container">
            {result ? (
              <>
                <ResultsDashboard result={result} asset={asset} />
                <Chart data={result.history} asset={asset} />
              </>
            ) : (
              <div className="placeholder-card">
                <p>Enter your investment details and click "Calculate Returns" to see the magic of DCA.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;