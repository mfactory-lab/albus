import { Circomkit } from 'circomkit'

async function main() {
  const circomkit = new Circomkit({
    protocol: 'groth16',
  })

  // artifacts output at `build/kycPolicy` directory
  await circomkit.compile('kycPolicy', {
    file: 'kycPolicy',
    template: 'Main',
    params: [3],
  })

  // proof & public signals at `build/kycPolicy/my_input` directory
  await circomkit.prove('kycPolicy', 'my_input', { in: [3, 5, 7] })

  // verify with proof & public signals at `build/multiplier_3/my_input`
  const ok = await circomkit.verify('kycPolicy', 'my_input')
  if (ok) {
    circomkit.log('Proof verified!', 'success')
  } else {
    circomkit.log('Verification failed.', 'error')
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
