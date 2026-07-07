'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Save, Loader2, KeyRound, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getBrowserProfile } from '@/features/auth/services/browser-session';
import { resetPassword } from '@/features/auth/services/auth-service';
import type { ProfileRow } from '@/types/database.types';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Name is required.').max(100),
  phone: z.string().max(20).optional(),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

type ProfileInput = z.infer<typeof profileSchema>;
type PasswordInput = z.infer<typeof passwordSchema>;

export function ProfileSettings() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', phone: '' },
  });

  const passwordForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBrowserProfile();
      setProfile(data);
      if (data) {
        profileForm.reset({ fullName: data.full_name, phone: data.phone ?? '' });
      }
    } catch {
      setProfileMessage('Unable to load profile.');
    } finally {
      setLoading(false);
    }
  }, [profileForm]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  const onProfileSubmit = profileForm.handleSubmit(async (values) => {
    setProfileMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: values.fullName, phone: values.phone || null } as never)
        .eq('id', profile?.id ?? '');

      if (error) throw error;
      setProfileMessage('Profile updated.');
      await loadProfile();
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : 'Unable to update profile.');
    }
  });

  const onAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploadingAvatar(true);
    setProfileMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${profile.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('bug-attachments').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('bug-attachments').getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl } as never)
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfileMessage('Avatar updated.');
      await loadProfile();
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : 'Unable to upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onPasswordSubmit = passwordForm.handleSubmit(async (values) => {
    setPasswordMessage(null);
    try {
      await resetPassword(values.newPassword);
      setPasswordMessage('Password updated.');
      passwordForm.reset();
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : 'Unable to update password.');
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-950">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your profile and account.</p>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="border-b border-slate-200/70 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <User className="h-4 w-4" />
            Profile
          </div>
        </div>
        <form className="space-y-5 p-6" onSubmit={onProfileSubmit}>
          <div className="flex items-center gap-4 pb-2">
            <label className="relative cursor-pointer group">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-xl font-bold text-slate-600 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  profile?.full_name?.charAt(0)?.toUpperCase() || '?'
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                  <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarUpload} disabled={uploadingAvatar} />
            </label>
            <div>
              <p className="font-semibold text-slate-950">{profile?.full_name}</p>
              <p className="text-sm text-slate-500">{profile?.email}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" {...profileForm.register('fullName')} />
            {profileForm.formState.errors.fullName && <p className="text-xs text-red-500">{profileForm.formState.errors.fullName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+1 555 123 4567" {...profileForm.register('phone')} />
          </div>
          {profileMessage && <p className="rounded-2xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{profileMessage}</p>}
          <Button type="submit" disabled={profileForm.formState.isSubmitting} className="rounded-2xl">
            {profileForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
            Save changes
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="border-b border-slate-200/70 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <KeyRound className="h-4 w-4" />
            Password
          </div>
        </div>
        <form className="space-y-5 p-6" onSubmit={onPasswordSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" placeholder="••••••••" {...passwordForm.register('newPassword')} />
            {passwordForm.formState.errors.newPassword && <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" {...passwordForm.register('confirmPassword')} />
            {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>}
          </div>
          {passwordMessage && <p className="rounded-2xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{passwordMessage}</p>}
          <Button type="submit" disabled={passwordForm.formState.isSubmitting} className="rounded-2xl">
            {passwordForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
