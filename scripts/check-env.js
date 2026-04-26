// Script to check environment variable configuration

const envVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL'
];

console.log('=== Environment Variable Check ===\n');

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Only show URL values, mask keys
    if (varName.includes('URL') && !varName.includes('KEY')) {
      console.log(`${varName}: ${value}`);
    } else if (varName === 'R2_ACCOUNT_ID' || varName === 'R2_BUCKET_NAME') {
      console.log(`${varName}: ${value}`);
    } else {
      console.log(`${varName}: [SET] (${value.length} chars)`);
    }
  } else {
    console.log(`${varName}: [NOT SET]`);
  }
});

console.log('\n=== Test Supabase Connection ===\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  .then(res => {
    console.log(`Connection test: ${res.ok ? 'SUCCESS' : 'FAILED'} (Status: ${res.status})`);
  })
  .catch(err => {
    console.log(`Connection test: FAILED - ${err.message}`);
  });
} else {
  console.log('Cannot test connection: Missing SUPABASE_URL or ANON_KEY');
}
