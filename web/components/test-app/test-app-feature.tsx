'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useTestAppProgram } from './test-app-data-access';
import { TestAppCreate, TestAppList } from './test-app-ui';

export default function TestAppFeature() {
  const { publicKey } = useWallet();
  const { programId } = useTestAppProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="First Solana CRUD App"
        subtitle={
          'Create a new account by clicking the "Create New Entry" button..'
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <TestAppCreate />
      </AppHero>
      <TestAppList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
