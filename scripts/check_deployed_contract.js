import { ApiPromise, WsProvider } from '@polkadot/api';

async function checkContract() {
  const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
  const api = await ApiPromise.create({ provider });
  
  const contractAddress = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
  console.log('Checking contract at:', contractAddress);
  
  const contractInfo = await api.query.contracts.contractInfoOf(contractAddress);
  
  if (contractInfo.isSome) {
    const info = contractInfo.unwrap();
    console.log('\n✅ Contract exists!');
    console.log('Code Hash:', info.codeHash.toHex());
    console.log('Storage Deposit:', info.storageDeposit.toString());
  } else {
    console.log('\n❌ Contract not found at this address');
  }
  
  await api.disconnect();
}

checkContract().catch(console.error);
