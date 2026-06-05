"use client";
import { apiHandler } from "@/api/apiHandler";
import { DEFAULT_PAGINATION } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { Filter } from "@/types";
import { generatePaginationParams, showToast } from "@/utils";
import { Button, Card, Input, Modal, Popconfirm, Select, Spin, Tag } from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface MemberOption {
  _id: string;
  name: string;
  email: string;
}

const initialPayload = { title: "", description: "", members: [] as string[] };

export default function BoardListPage() {
  const router = useRouter();
  const [boardData, setBoardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [payload, setPayload] = useState(initialPayload);
  const [creating, setCreating] = useState(false);
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const [memberSearching, setMemberSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filters, setFilters] = useState<Filter>({
    ...DEFAULT_PAGINATION,
    sort: "createdAt",
    sortType: -1,
    search: "",
  });

  const handleFilter = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: [value],
    }));
  };

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const { data: res, status } = await apiHandler.boards.list(
        generatePaginationParams({
          page: filters.page,
          limit: filters.limit,
          sortType: filters.sortType,
          sort: filters.sort,
        }),
      );
      if ([200, 201].includes(status)) {
        setBoardData(res?.data?.docs || []);
        setFilters((prev) => ({
          ...prev,
          page: res?.data?.totalPages > 1 ? prev?.page : 1,
          totalRecords: res?.data?.totalDocs || 0,
        }));
      }
    } catch (error: any) {
      showToast("error", error?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

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

  const handleCreate = async () => {
    if (!payload.title.trim()) {
      showToast("error", "Board title is required");
      return;
    }
    setCreating(true);
    try {
      const { status } = await apiHandler.boards.create(payload);
      if ([200, 201].includes(status)) {
        showToast("success", "Board created successfully");
        setCreateModalOpen(false);
        setPayload(initialPayload);
        setMemberOptions([]);
        fetchBoard();
      }
    } catch (error: any) {
      showToast("error", error?.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await apiHandler.boards.delete(id);
        showToast("success", "Board deleted");
        fetchBoard();
      } catch (error: any) {
        showToast("error", error?.message);
      }
    },
    [fetchBoard],
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Boards</h1>
          <p className="text-sm text-slate-500">Manage your collaborative boards</p>
        </div>
        <Button type="primary" size="large" onClick={() => { setCreateModalOpen(true); fetchUsers(); }} className="bg-indigo-600">
          + New Board
        </Button>
      </div>

      <div className="mb-4">
        <Input.Search
          placeholder="Search boards..."
          value={filters.search}
          onChange={(e) => handleFilter("search", e.target.value)}
          className="max-w-sm"
          allowClear
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">Loading...</div>
      ) : boardData.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-slate-400">
          <div className="mb-2 text-4xl">📋</div>
          <p>No boards yet. Create your first board!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boardData.map((board) => (
            <Card
              key={board._id}
              hoverable
              className="cursor-pointer border border-slate-200 shadow-sm [&_li]:m-0!"
              onClick={() => router.push(`${ROUTES.board.kanban}?id=${board._id}`)}
              actions={[
                <Button
                  key="edit"
                  type="link"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`${ROUTES.board.action}?id=${board._id}`);
                  }}
                  className="w-full! h-full! py-2!"
                >
                  Edit
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Delete this board?"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDelete(board._id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                >
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full! h-full! py-2!"
                  >
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={<span className="font-semibold text-slate-800">{board.title}</span>}
                description={
                  <div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-2">{board.description || "No description"}</p>
                    <Tag color="blue">{board.members?.length || 0} members</Tag>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      )}

      <Modal
        title="Create New Board"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalOpen(false);
          setPayload(initialPayload);
          setMemberOptions([]);
        }}
        okText="Create"
        confirmLoading={creating}
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Board Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={payload.title}
              onChange={(e) => setPayload((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Product Roadmap"
              maxLength={200}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <Input.TextArea
              value={payload.description}
              onChange={(e) => setPayload((p) => ({ ...p, description: e.target.value }))}
              placeholder="Optional description..."
              rows={3}
              maxLength={1000}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Members</label>
            <Select
              mode="multiple"
              className="w-full"
              placeholder="Search by name or email..."
              value={payload.members}
              onChange={(ids: string[]) => setPayload((p) => ({ ...p, members: ids }))}
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
        </div>
      </Modal>
    </div>
  );
}
