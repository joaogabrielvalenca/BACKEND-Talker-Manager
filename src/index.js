const express = require('express');
const fs = require('fs/promises');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || '3001';
const HTTP_OK_STATUS = 200;
const talkerJson = 'src/talker.json';

function generateToken(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }
  return token;
}
app.get('/talker', async (_request, response) => {
  try {
    const data = await fs.readFile(talkerJson, 'utf-8');
    const talkers = JSON.parse(data);
    response.status(HTTP_OK_STATUS).json(talkers);
    } catch (parseError) {
      console.error(parseError);
      response.status(404).json([]);
    }
});
app.get('/talker/:id', async (req, res) => {
  try {
    const data = await fs.readFile(talkerJson, 'utf-8');
    const talkers = JSON.parse(data);
    const getTalkerById = talkers.find(({ id }) => id === Number(req.params.id));
    if (getTalkerById) {
      res.status(HTTP_OK_STATUS).json(getTalkerById);
    } else {
      res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    }
  } catch (error) {
    res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
});
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validateEmailField(email, res) {
  if (!email || email.trim() === '') {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  return true;
}
function validatePasswordField(password, res) {
  if (!password || password.trim() === '') {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  return true;
}
function validateLoginFields(req, res, next) {
  const { email, password } = req.body;
  if (
    validateEmailField(email, res) !== true
    || validatePasswordField(password, res) !== true
  ) {
    return;
  }
  next();
}
app.post('/login', validateLoginFields, (req, res) => {
  const token = generateToken(16); 
  res.status(200).json({ token });
});
const validateToken = (token) => {
  if (!token) {
    return { valid: false, message: 'Token não encontrado' };
  }
  if (token.length !== 16 || typeof token !== 'string') {
    return { valid: false, message: 'Token inválido' };
  }
  return { valid: true };
};
const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { valid: false, message: 'O campo "name" é obrigatório' };
  }
  if (name.length < 3) {
    return { valid: false, message: 'O "name" deve ter pelo menos 3 caracteres' };
  }
  return { valid: true };
};

const validateAge = (age) => {
  const ageString = String(age); 
  console.log(ageString);
  if (!age) {
    return { valid: false, message: 'O campo "age" é obrigatório' };
  }
  const ageNumber = Number(ageString);
  const isValidAge = Number.isInteger(ageNumber) && ageNumber >= 18;
  if (!isValidAge) {
    return {
      valid: false,
      message: 'O campo "age" deve ser um número inteiro igual ou maior que 18',
    };
  }
  return { valid: true };
};
const validateTalk = (talk) => {
  if (!talk) {
    return { valid: false, message: 'O campo "talk" é obrigatório' };
  }
  return { valid: true };
};
const validateWatchedAt = (talk) => {
  const { watchedAt } = talk;
  if (!watchedAt) {
    return { valid: false, message: 'O campo "watchedAt" é obrigatório' };
  }

  const watchedAtRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!watchedAtRegex.test(watchedAt)) {
    return { valid: false, message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' };
  }
  return { valid: true };
};
const validateRatePresence = (rate) => {
  if (rate === undefined) {
    return { valid: false, message: 'O campo "rate" é obrigatório' };
  }

  if (rate < 1 || rate > 5) {
    return { valid: false, message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' };
  }
  return { valid: true };
};
const validateRateValue = (rate) => {
  const rateNumber = Number(rate);
  if (Number.isNaN(rateNumber)) {
    return { valid: false, message: 'O campo "rate" deve ser um número' };
  }

  if (!Number.isInteger(rateNumber) || rateNumber < 1 || rateNumber > 5) {
    return { valid: false, message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' };
  }
  return { valid: true };
};
const validateRate = (talk) => {
  const { rate } = talk;
  const presenceValidation = validateRatePresence(rate);
  if (!presenceValidation.valid) {
    return presenceValidation;
  }
  return validateRateValue(rate);
};
function validateTokenLength(token, res) {
  if (!token || token.length !== 16 || typeof token !== 'string') {
    return res.status(401).json({ message: 'Token inválido' });
  }
  return true;
}
const validateTokenMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  const tokenValidation = validateToken(token);
  if (!tokenValidation.valid) {
    return res.status(401).json({ message: tokenValidation.message });
  }
  if (validateTokenLength(token, res) !== true) {
    return;
  }
  next();
};
const validateTalkerFieldsMiddleware = (req, res, next) => {
  const { name, age, talk } = req.body;
  const validations = [
    validateName(name),
    validateAge(age),
    validateTalk(talk),
    talk && validateWatchedAt(talk),
    talk && validateRate(talk),
  ];
  const invalidValidation = validations.find((validation) => !validation.valid);
  if (invalidValidation) {
    return res.status(400).json({ message: invalidValidation.message });
  }
  next();
};
app.post('/talker', validateTokenMiddleware, validateTalkerFieldsMiddleware, async (req, res) => {
  const { name, age, talk } = req.body;
  const { watchedAt, rate } = talk;
  const data = await fs.readFile(talkerJson, 'utf-8');
  const talkers = JSON.parse(data);
  const newTalker = {
    id: talkers.length + 1,
    name,
    age: Number(age),
    talk: {
      watchedAt,
      rate: Number(rate),
    },
  };
  talkers.push(newTalker);
  await fs.writeFile(talkerJson, JSON.stringify(talkers, null, 2));
  return res.status(201).json(newTalker);
});
app.put('/talker/:id',
  validateTokenMiddleware, validateTalkerFieldsMiddleware, async (req, res) => {
    const { name, age, talk } = req.body;
    const data = await fs.readFile(talkerJson, 'utf-8');
    const talkers = JSON.parse(data);  
    const getTalkerById = talkers.find(({ id }) => id === Number(req.params.id));
    if (getTalkerById) {
      getTalkerById.name = name;
      getTalkerById.age = age;
      getTalkerById.talk = talk;   
    await fs.writeFile(talkerJson, JSON.stringify(talkers, null, 2));
  } else {
     return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  return res.status(200).json(getTalkerById);
});
app.delete('/talker/:id',
  validateTokenMiddleware, async (req, res) => {
    const data = await fs.readFile(talkerJson, 'utf-8');
    const talkers = JSON.parse(data);  
    const deleteTalkerById = talkers.filter(({ id }) => id !== Number(req.params.id));
    console.log(deleteTalkerById);
    await fs.writeFile(talkerJson, JSON.stringify(deleteTalkerById, null, 2));
    return res.status(204).end();
});

app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});
app.listen(PORT, () => {
  console.log('Online');
});
