'use client';
import { Button, Input } from 'antd';
import { Suspense } from 'react';


function BoardActionContent() {

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <button
          className="mb-2 text-sm text-indigo-600 hover:underline"
        >
          ← Back to Boards
        </button>
        <h1 className="text-2xl font-bold text-slate-800">
          {'Edit Board' + 'Create Board'}
        </h1>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Board Title <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Product Roadmap"
            size="large"
            maxLength={200}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <Input.TextArea
            placeholder="Optional description..."
            rows={4}
            maxLength={1000}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="primary"
            size="large"
            className="bg-indigo-600"
          >
            {'Update Board' + 'Create Board'}
          </Button>
          <Button size="large" >
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
