import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  submitEmployerVerificationRequest,
  subscribeEmployerVerificationState,
  type VerificationRequestRecord,
} from '@/features/auth/services/employerVerificationService';

export type VerificationUiStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

function deriveUiStatus(
  baseStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED',
  latestRequest: VerificationRequestRecord | null
): VerificationUiStatus {
  if (baseStatus === 'VERIFIED') return 'VERIFIED';
  if (latestRequest?.status === 'REJECTED') return 'REJECTED';
  if (baseStatus === 'PENDING' || latestRequest?.status === 'PENDING') return 'PENDING';
  if (latestRequest?.status === 'APPROVED') return 'VERIFIED';
  return 'UNVERIFIED';
}

export function useEmployerVerification() {
  const { userProfile, refreshProfile } = useAuth();
  const uid = userProfile?.uid;

  const [baseStatus, setBaseStatus] = useState<'UNVERIFIED' | 'PENDING' | 'VERIFIED'>(
    userProfile?.verification_status ?? 'UNVERIFIED'
  );
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState<string | null>(
    userProfile?.business_license_url ?? null
  );
  const [latestRequest, setLatestRequest] = useState<VerificationRequestRecord | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      setBaseStatus('UNVERIFIED');
      setBusinessLicenseUrl(null);
      setLatestRequest(null);
      setIsSyncing(false);
      return undefined;
    }

    setIsSyncing(true);

    const unsubscribe = subscribeEmployerVerificationState(uid, (state) => {
      setBaseStatus(state.verificationStatus);
      setBusinessLicenseUrl(state.businessLicenseUrl);
      setLatestRequest(state.latestRequest);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    if (!userProfile) return;
    setBaseStatus(userProfile.verification_status ?? 'UNVERIFIED');
    setBusinessLicenseUrl(userProfile.business_license_url ?? null);
  }, [userProfile]);

  const submitMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!uid) {
        throw new Error('Bạn cần đăng nhập để gửi hồ sơ xác thực.');
      }
      return submitEmployerVerificationRequest(uid, file);
    },
    onSuccess: async (request) => {
      setLatestRequest(request);
      setBaseStatus('PENDING');
      await refreshProfile();
    },
  });

  const uiStatus = useMemo(
    () => deriveUiStatus(baseStatus, latestRequest),
    [baseStatus, latestRequest]
  );

  const isSubmissionLocked = uiStatus === 'PENDING' || uiStatus === 'VERIFIED' || submitMutation.isPending;

  return {
    uid,
    uiStatus,
    baseStatus,
    businessLicenseUrl,
    latestRequest,
    isSyncing,
    submitVerification: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error,
    resetSubmitError: submitMutation.reset,
    isSubmissionLocked,
  };
}
