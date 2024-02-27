const { BrainWallet } = require('@ethersproject/experimental');

const generateWallet = async (value, password = '9670') => {
  const brainWallet = await BrainWallet.generate(value, password);
  return brainWallet;
};

module.exports = { generateWallet };
