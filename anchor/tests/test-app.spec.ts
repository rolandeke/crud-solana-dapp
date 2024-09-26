import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { TestApp } from '../target/types/test_app';

describe('test-app', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.TestApp as Program<TestApp>;

  const testAppKeypair = Keypair.generate();

  it('Initialize TestApp', async () => {
    await program.methods
      .initialize()
      .accounts({
        testApp: testAppKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([testAppKeypair])
      .rpc();

    const currentCount = await program.account.testApp.fetch(
      testAppKeypair.publicKey
    );

    expect(currentCount.count).toEqual(0);
  });

  it('Increment TestApp', async () => {
    await program.methods
      .increment()
      .accounts({ testApp: testAppKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.testApp.fetch(
      testAppKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Increment TestApp Again', async () => {
    await program.methods
      .increment()
      .accounts({ testApp: testAppKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.testApp.fetch(
      testAppKeypair.publicKey
    );

    expect(currentCount.count).toEqual(2);
  });

  it('Decrement TestApp', async () => {
    await program.methods
      .decrement()
      .accounts({ testApp: testAppKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.testApp.fetch(
      testAppKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Set testApp value', async () => {
    await program.methods
      .set(42)
      .accounts({ testApp: testAppKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.testApp.fetch(
      testAppKeypair.publicKey
    );

    expect(currentCount.count).toEqual(42);
  });

  it('Set close the testApp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        testApp: testAppKeypair.publicKey,
      })
      .rpc();

    // The account should no longer exist, returning null.
    const userAccount = await program.account.testApp.fetchNullable(
      testAppKeypair.publicKey
    );
    expect(userAccount).toBeNull();
  });
});
