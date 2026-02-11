import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());

app.get('/api/yahoo/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Missing query parameter q' });
    }
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${q}&quotesCount=10&newsCount=0&listsCount=0`;
    
    console.log(`Fetching Search from Yahoo: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy Search error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch search data from Yahoo Finance' });
  }
});

app.get('/api/yahoo/history', async (req, res) => {
  try {
    const { symbol, period1, period2 } = req.query;
    if (!symbol || !period1 || !period2) {
      return res.status(400).json({ error: 'Missing required parameters: symbol, period1, period2' });
    }
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d&events=history`;
    
    console.log(`Fetching History from Yahoo: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy History error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch history data from Yahoo Finance' });
  }
});

const PORT = process.env.PROXY_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Yahoo Proxy server running on http://localhost:${PORT}`);
});
