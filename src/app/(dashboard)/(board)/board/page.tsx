'use client';
import { Button, Card, Input, Modal, Popconfirm, Tag } from 'antd';
import { useState } from 'react';


export default function BoardListPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [data, setData] = useState([]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Boards</h1>
          <p className="text-sm text-slate-500">Manage your collaborative boards</p>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={() => setCreateModalOpen(true)}
          className="bg-indigo-600"
        >
          + New Board
        </Button>
      </div>

      <div className="mb-4">
        <Input.Search
          placeholder="Search boards..."
          className="max-w-sm"
          allowClear
        />
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-slate-400">
          <div className="mb-2 text-4xl">📋</div>
          <p>No boards yet. Create your first board</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((_board: any, index: any) => (
            <Card
              key={index}
              hoverable
              className="cursor-pointer border border-slate-200 shadow-sm"
              actions={[
                <Button
                  key="edit"
                  type="link"
                  size="small"
                >
                  Edit
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Delete this board?"
                >
                  <Button type="link" danger size="small" >
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={<span className="font-semibold text-slate-800">{"TITLE"}</span>}
                description={
                  <div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                      {'DESCRIPTION'}
                    </p>
                    <Tag color="blue">{0} members</Tag>
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
        okText="Create"

      >
        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Board Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Product Roadmap"
              maxLength={200}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <Input.TextArea
              placeholder="Optional description..."
              rows={3}
              maxLength={1000}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
