/**
 * Helper script to derive Solana wallet address from private key
 * 
 * Usage: node scripts/get-wallet-address.js [private_key]
 * Or set SOLANA_PRIVATE_KEY in .env file
 */

require('dotenv').config();
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default || require('bs58');

const privateKey = process.argv[2] || process.env.SOLANA_PRIVATE_KEY;

if (!privateKey) {
  console.error('Error: No private key provided');
  console.log('\nUsage:');
  console.log('  node scripts/get-wallet-address.js [private_key]');
  console.log('  Or set SOLANA_PRIVATE_KEY in .env file');
  process.exit(1);
}

try {
  // Decode the base58 private key
  const secretKey = bs58.decode(privateKey);
  
  // Create keypair from secret key
  const keypair = Keypair.fromSecretKey(secretKey);
  
  // Get the public key (wallet address)
  const publicKey = keypair.publicKey.toBase58();
  
  console.log('\n✅ Wallet Address (Public Key):');
  console.log(publicKey);
  console.log('\n📋 Add this to your .env file:');
  console.log(`X402_RECEIVING_WALLET=${publicKey}`);
  console.log('\n');
} catch (error) {
  console.error('Error decoding private key:', error.message);
  console.log('\nMake sure your private key is in Base58 format.');
  process.exit(1);
}
