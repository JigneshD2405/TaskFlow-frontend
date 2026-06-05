"use client";
import { apiHandler } from "@/api/apiHandler";
import { ROUTES } from "@/constants";
import { showToast } from "@/utils";
import { Button, Input, Select, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

interface MemberOption {
  _id: string;
  name: string;
  email: string;
}

const initialValues = { title: "", description: "", members: [] as string[] };

function BoardActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const isEdit = !!id;

  const [boardDetails, setBoardDetails] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const [memberSearching, setMemberSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchDetail = useCallback(async (detailId: string) => {
    try {
      setFetching(true);
      const { data, status } = await apiHandler.boards.get(detailId);
      if ([200, 201].includes(status)) {
        const board = data?.data || initialValues;
        const memberIds = (board.members || []).map((m: MemberOption) => m._id);
        setBoardDetails({
          title: board.title || "",
          description: board.description || "",
          members: memberIds,
        });
      }
    } catch (error: any) {
      showToast("error", error?.message);
    } finally {
      setFetching(false);
    }
  }, []);

  const fetchUsers = async (query: string = "") => {
    setMemberSearching(true);
    try {
      const { data, status } = await apiHandler.users.search(query);
      if ([200, 201].includes(status)) {
        setMemberOptions(data?.data || []);
      }
    } catch {
      // silent
    } finally {
      setMemberSearching(false);
    }
  };

  const handleMemberSearch = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(query), 350);
  };

  useEffect(() => {
    fetchUsers();
    if (id) {
      fetchDetail(id);
    } else {
      setBoardDetails(initialValues);
    }
  }, [fetchDetail, id]);

  const handleSubmit = async () => {
    if (!boardDetails.title.trim()) {
      showToast("error", "Board title is required");
      return;
    }
    setLoading(true);
    try {
      const { data, status } = id
        ? await apiHandler.boards.update(id, boardDetails)
        : await apiHandler.boards.create(boardDetails);
      if ([200, 201].includes(status)) {
        showToast("success", data?.message);
        router.push(ROUTES.board.list);
      }
    } catch (error: any) {
      showToast("error", error?.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <button onClick={() => router.push(ROUTES.board.list)} className="mb-2 text-sm text-indigo-600 hover:underline">
          ← Back to Boards
        </button>
        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? "Edit Board" : "Create Board"}</h1>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Board Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={boardDetails.title}
            onChange={(e) => setBoardDetails((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Product Roadmap"
            size="large"
            maxLength={200}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <Input.TextArea
            value={boardDetails.description}
            onChange={(e) => setBoardDetails((p) => ({ ...p, description: e.target.value }))}
            placeholder="Optional description..."
            rows={4}
            maxLength={1000}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Members</label>
          <Select
            mode="multiple"
            className="w-full"
            size="large"
            placeholder="Search by name or email..."
            value={boardDetails.members}
            onChange={(ids: string[]) => setBoardDetails((p) => ({ ...p, members: ids }))}
            onSearch={handleMemberSearch}
            filterOption={false}
            notFoundContent={
              memberSearching ? (
                <div className="flex items-center justify-center py-2">
                  <Spin size="small" />
                </div>
              ) : (
                <span className="text-xs text-slate-400">Type to search users…</span>
              )
            }
            optionLabelProp="label"
          >
            {memberOptions.map((user) => (
              <Select.Option key={user._id} value={user._id} label={user.name}>
                <div className="flex items-center gap-2 py-0.5">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-700">
                    {user.name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{user.name}</p>
                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
              </Select.Option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-slate-400">Search and select members to add to this board.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="primary" loading={loading} onClick={handleSubmit} size="large" className="bg-indigo-600">
            {isEdit ? "Update Board" : "Create Board"}
          </Button>
          <Button size="large" onClick={() => router.push(ROUTES.board.list)}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BoardActionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BoardActionContent />
    </Suspense>
  );
}
