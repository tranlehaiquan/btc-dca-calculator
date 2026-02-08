import type { Frequency, Asset } from '../constants';
import { Calendar, DollarSign, RefreshCw, Coins } from 'lucide-react';

interface InputFormProps {
  asset: Asset;
  setAsset: (val: Asset) => void;
  amount: number;
  setAmount: (val: number) => void;
  frequency: Frequency;
  setFrequency: (val: Frequency) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  onCalculate: () => void;
  isLoading: boolean;
}

export function InputForm({
  asset,
  setAsset,
  amount,
  setAmount,
  frequency,
  setFrequency,
  startDate,
  setStartDate,
  onCalculate,
  isLoading
}: InputFormProps) {
  return (
    <div className="input-card">
      <div className="form-group">
        <label>
          <Coins size={16} /> Select Asset
        </label>
        <select
          value={asset}
          onChange={(e) => setAsset(e.target.value as Asset)}
        >
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="Gold">Gold (PAXG)</option>
          <option value="Silver">Silver (KAG)</option>
        </select>
      </div>

      <div className="form-group">
        <label>
          <DollarSign size={16} /> Investment Amount
        </label>
        <div className="input-wrapper">
          <span className="prefix">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="1"
          />
        </div>
      </div>

      <div className="form-group">
        <label>
          <RefreshCw size={16} /> Frequency
        </label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Frequency)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="form-group">
        <label>
          <Calendar size={16} /> Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <button 
        className="calculate-btn" 
        onClick={onCalculate}
        disabled={isLoading}
      >
        {isLoading ? 'Loading data...' : 'Calculate Returns'}
      </button>
    </div>
  );
}