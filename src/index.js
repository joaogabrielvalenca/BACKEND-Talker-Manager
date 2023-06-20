const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

app.get('/talker', (_request, response) => {
  try {
      const data = fs.readFile('./talker.json', 'utf-8');
      const talkers = JSON.parse(data);
      response.status(HTTP_OK_STATUS).json(talkers);
    } catch (parseError) {
      console.error(parseError);
      response.status(404).json([]);
    }
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
