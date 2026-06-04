'use client';
import { Button, Input } from 'antd';
import { useState } from 'react';


export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">🗂️</div>
          <h1 className="text-2xl font-bold text-slate-800">TaskBoard</h1>
          <p className="mt-1 text-sm text-slate-500">Real-time collaborative kanban</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <Input
              name="email"
              type="email"
              placeholder="demo@taskboard.com"
              size="large"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <Input.Password
              name="password"
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
