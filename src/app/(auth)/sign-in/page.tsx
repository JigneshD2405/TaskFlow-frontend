"use client";
import { apiHandler } from "@/api/apiHandler";
import { ROUTES } from "@/constants/routes";
import { actions } from "@/redux";
import { showToast } from "@/utils";
import { Button, Input } from "antd";
import { useRouter } from "next/navigation";
import { ChangeEvent, SubmitEvent, useState } from "react";
import { useDispatch } from "react-redux";
interface Payload {
  email: string;
  password: string;
}
const initialData: Payload = { email: "", password: "" };

export default function SignIn() {
  const dispatch = useDispatch();

  const router = useRouter();

  const [payload, setPayload] = useState<Payload>(initialData);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPayload((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateFields = (label: keyof Payload, value: string): Record<string, string> => {
    let error = "";

    switch (label) {
      case "email":
        if (!value.trim()) error = "Please enter your email";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid Email!";
        break;
      case "password":
        if (!value.trim()) error = "Please enter your password";
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [label]: error }));
    return { ...errors, [label]: error };
  };

  const onSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newErrors: Record<string, string> = {};
    const requiredFields: (keyof Payload)[] = ["email", "password"];

    requiredFields.forEach((field) => {
      const err = validateFields(field, payload[field]);
      if (err[field]) {
        newErrors[field] = err[field];
      }
    });

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
          }),
        );
        showToast("success", "Welcome back!");
        router.push(ROUTES.board.list);
      }
    } catch (error: any) {
      showToast("error", error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-50 to-slate-100">
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
            loading={loading}
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
