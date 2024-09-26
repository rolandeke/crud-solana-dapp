'use client';

import { getTestAppProgram, getTestAppProgramId } from '@test-app/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

interface EntryArgs {
  owner: PublicKey;
  title: string;
  message: string;
}

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
    queryFn: () => program.account.journalEntryState.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ['test-app', 'create', { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      // get program address by the PDA
      const [journalEntryAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from(title), owner.toBuffer()],
        programId
      );
      return program.methods
        .createEntry(title, message)
        .accounts({ journalEntry: journalEntryAddress })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: (error) => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  };
}

export function useTestAppProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { programId, program, accounts } = useTestAppProgram();

  const accountQuery = useQuery({
    queryKey: ['test-app', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  });

  const updateEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ['test-app', 'update', { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      // get program address by the PDA
      const [journalEntryAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from(title), owner.toBuffer()],
        programId
      );
      return program.methods
        .updateEntry(title, message)
        .accounts({ journalEntry: journalEntryAddress })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: (error) => toast.error('Failed to initialize account'),
  });

  const deleteEntry = useMutation({
    mutationKey: ['test-app', 'delete', { cluster, account }],
    mutationFn: (title: string) =>
      program.methods
        .deleteEntry(title)
        .accounts({ journalEntry: account })
        .rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  };
}
