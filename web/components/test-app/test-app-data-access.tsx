'use client';

import { getTestAppProgram, getTestAppProgramId } from '@test-app/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useTestAppProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getTestAppProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getTestAppProgram(provider);

  const accounts = useQuery({
    queryKey: ['test-app', 'all', { cluster }],
    queryFn: () => program.account.testApp.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['test-app', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ testApp: keypair.publicKey })
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function useTestAppProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useTestAppProgram();

  const accountQuery = useQuery({
    queryKey: ['test-app', 'fetch', { cluster, account }],
    queryFn: () => program.account.testApp.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['test-app', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ testApp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['test-app', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ testApp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ['test-app', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ testApp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const setMutation = useMutation({
    mutationKey: ['test-app', 'set', { cluster, account }],
    mutationFn: (value: number) =>
      program.methods.set(value).accounts({ testApp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  };
}
