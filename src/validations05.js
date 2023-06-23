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

  if (!ageString || ageString.trim() === '') {
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
  if (!talk || typeof talk !== 'object') {
    return { valid: false, message: 'O campo "talk" é obrigatório' };
  }
  return { valid: true };
};

const validateWatchedAt = (watchedAt) => {
  if (!watchedAt || watchedAt.trim() === '') {
    return { valid: false, message: 'O campo "watchedAt" é obrigatório' };
  }

  const watchedAtRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!watchedAtRegex.test(watchedAt)) {
    return { valid: false, message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' };
  }
  return { valid: true };
};

const validateRatePresence = (rate) => {
  if (!rate || rate.toString().trim() === '') {
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

const validateRate = (rate) => {
  const presenceValidation = validateRatePresence(rate);
  if (!presenceValidation.valid) {
    return presenceValidation;
  }
  return validateRateValue(rate);
};

const validateTokenLength = (token) => {
  return token && token.length === 16 && typeof token === 'string';
};

const validateToken = (token, res) => {
  if (!validateTokenLength(token)) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  return true;
};

module.exports = {
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
  validateToken,
  validateTokenLength,
};
