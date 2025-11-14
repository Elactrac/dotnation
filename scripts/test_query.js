import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import fs from 'fs';

async function testQuery() {
  const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
  const api = await ApiPromise.create({ provider });
  
  const contractAddress = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
  const metadata = JSON.parse(fs.readFileSync('./frontend/src/contracts/donation_platform.json', 'utf8'));
  
  const contract = new ContractPromise(api, metadata, contractAddress);
  
  console.log('Available query methods:', Object.keys(contract.query));
  console.log('\nTesting get_campaigns_paginated...');
  
  try {
    const result = await contract.query.get_campaigns_paginated(
      '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
      { gasLimit: -1 },
      0,
      10
    );
    
    console.log('Query result:', result);
    console.log('Result isOk:', result.result.isOk);
    console.log('Result isErr:', result.result.isErr);
    
    if (result.result.isErr) {
      console.log('Error:', result.result.asErr.toHuman());
    } else {
      console.log('Output:', result.output.toHuman());
    }
  } catch (error) {
    console.error('Query failed:', error.message);
  }
  
  await api.disconnect();
}

testQuery().catch(console.error);
