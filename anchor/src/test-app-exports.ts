// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import TestAppIDL from '../target/idl/test_app.json';
import type { TestApp } from '../target/types/test_app';

// Re-export the generated IDL and type
export { TestApp, TestAppIDL };

// The programId is imported from the program IDL.
export const TEST_APP_PROGRAM_ID = new PublicKey(TestAppIDL.address);

// This is a helper function to get the TestApp Anchor program.
export function getTestAppProgram(provider: AnchorProvider) {
  return new Program(TestAppIDL as TestApp, provider);
}

// This is a helper function to get the program ID for the TestApp program depending on the cluster.
export function getTestAppProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return TEST_APP_PROGRAM_ID;
  }
}
