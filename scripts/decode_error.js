import { ApiPromise, WsProvider } from '@polkadot/api';

async function decodeError() {
  const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
  const api = await ApiPromise.create({ provider });
  
  // Error from contract: module 52, error 0x02000000
  const moduleIndex = 52;
  const errorCode = '0x02000000';
  
  console.log('Decoding error...');
  console.log('Module index:', moduleIndex);
  console.log('Error code:', errorCode);
  
  try {
    const error = api.registry.findMetaError({ index: moduleIndex, error: errorCode });
    console.log('\n✅ Decoded error:');
    console.log('Section:', error.section);
    console.log('Name:', error.name);
    console.log('Docs:', error.docs.join(' '));
  } catch (e) {
    console.log('\n❌ Could not decode error:', e.message);
    console.log('\nThis is likely a contract-specific error.');
    console.log('Error code 0x02 typically means: ContractTrapped or execution reverted');
  }
  
  await api.disconnect();
}

decodeError().catch(console.error);
