import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import fs from 'fs';

async function testQuery() {
  const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
  const api = await ApiPromise.create({ provider });
  
  const contractAddress = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
  const metadata = JSON.parse(fs.readFileSync('./frontend/src/contracts/donation_platform.json', 'utf8'));
  
  const contract = new ContractPromise(api, metadata, contractAddress);
  
  console.log('Testing getCampaignsPaginated with camelCase...\n');
  
  try {
    const result = await contract.query.getCampaignsPaginated(
      '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
      { gasLimit: -1 },
      0,
      10
    );
    
    console.log('✅ Query succeeded!');
    console.log('Result isOk:', result.result.isOk);
    console.log('Result isErr:', result.result.isErr);
    
    if (result.result.isErr) {
      console.log('\n❌ Error details:');
      console.log('Error type:', result.result.asErr.toString());
      console.log('Error JSON:', JSON.stringify(result.result.asErr.toHuman(), null, 2));
    } else {
      console.log('\n✅ Success! Output:');
      const campaigns = result.output.toHuman();
      console.log('Campaigns found:', campaigns ? campaigns.length : 0);
      if (campaigns && campaigns.length > 0) {
        console.log('First campaign:', JSON.stringify(campaigns[0], null, 2));
      }
    }
  } catch (error) {
    console.error('❌ Query exception:', error.message);
    console.error('Stack:', error.stack);
  }
  
  await api.disconnect();
}

testQuery().catch(console.error);
