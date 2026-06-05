'use client';
import { apiHandler } from '@/api/apiHandler';
import { ROUTES } from '@/constants';
import { showToast } from '@/utils';
import { Button, Input } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

const initialValues = { title: '', description: '' };

function BoardActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const isEdit = !!id
  const [boardDetails, setBoardDetails] = useState<Record<string, any>>(initialValues);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState<any>(null);


  const fetchDetail = useCallback(async (detailId: string) => {
    try {
      setFetching(true);
      const { data, status } = await apiHandler.boards.get(detailId);
      if ([200, 201].includes(status)) setBoardDetails(data?.data || initialValues);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (id) fetchDetail(id);
    else setBoardDetails(initialValues);
  }, [id, fetchDetail]);

  const handleChange = (key: keyof Record<string, any>, value: any) => {
    setBoardDetails((prev) => ({ ...prev, [key]: value }));
  }

  const handleSubmit =
    async (payload?: any) => {
      try {
        setLoading(true);
        const { data, status } = id ? await apiHandler.boards.update(id, payload) : await apiHandler.boards.create(payload);
        if ([200, 201].includes(status)) {
          showToast('success', data?.message);
          router.push(ROUTES.board.list)
        }
      } catch (error: any) {
        showToast('error', error?.message);
      } finally {
        setLoading(false);
      }
    }


  if (fetching) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <button
          onClick={() => router.push(ROUTES.board.list)}
          className="mb-2 text-sm text-indigo-600 hover:underline"
        >
          ← Back to Boards
        </button>
        <h1 className="text-2xl font-bold text-slate-800">
          {isEdit ? 'Edit Board' : 'Create Board'}
        </h1>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Board Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={boardDetails.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g. Product Roadmap"
            size="large"
            maxLength={200}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <Input.TextArea
            value={boardDetails.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Optional description..."
            rows={4}
            maxLength={1000}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="primary"
            loading={loading}
            onClick={() => handleSubmit()}
            size="large"
            className="bg-indigo-600"
          >
            {isEdit ? 'Update Board' : 'Create Board'}
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
