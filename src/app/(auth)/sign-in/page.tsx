'use client';
import { apiHandler } from '@/api/apiHandler';
import { ROUTES } from '@/constants/routes';
import { actions } from '@/redux';
import { showToast } from '@/utils';
import { Button, Input } from 'antd';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';


interface Payload {
  email: string;
  password: string;
}

const initialData: Payload = { email: '', password: '' };


export default function SignIn() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [payload, setPayload] = useState<Payload>(initialData);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPayload((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };


  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!payload.email || !payload.password) {
      showToast('error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data, status } = await apiHandler.auth.signIn(payload);
      if ([200, 201].includes(status)) {
        dispatch(
          actions.setUser({
            _id: data.data?.user?._id,
            name: data.data?.user?.name,
            email: data.data?.user?.email,
            accessToken: data.data?.accessToken,
          })
        );
        showToast('success', 'Welcome back!');
        router.push(ROUTES.board.list);
      }
    } catch (error: any) {
      showToast('error', error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">🗂️</div>
          <h1 className="text-2xl font-bold text-slate-800">TaskBoard</h1>
          <p className="mt-1 text-sm text-slate-500">Real-time collaborative kanban</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <Input
              name="email"
              type="email"
              value={payload.email}
              onChange={handleChange}
              placeholder="demo@taskboard.com"
              size="large"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <Input.Password
              name="password"
              value={payload.password}
              onChange={handleChange}
              placeholder="Enter your password"
              size="large"
              visibilityToggle={{ visible: showPassword, onVisibleChange: setShowPassword }}
            />
          </div>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            className="mt-2 bg-indigo-600 hover:bg-indigo-700"
          >
            Sign In
          </Button>
        </form>

      </div>
    </div>
  );
}
