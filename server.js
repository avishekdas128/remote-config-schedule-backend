const express = require('express');
const cors = require('cors');
const routes = require('./routes/schedule');

const app = express();
const PORT = process.env.PORT || 3500;

app.use(express.json());
app.use(cors());

app.use('/', routes);

app.get('/', async (_req, res) => {
  res.send('OK');
});

app.all('*', (_req, res) => {
  return res.status(404).json({
    error: 'Route not found',
  });
});

app.use((err, req, res) => {
  if (err instanceof Error) {
    console.error(err);
    return res.status(400).json({
      error: err.message,
    });
  }
  return res.status(500).json({
    error: 'Internal Server Error',
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
