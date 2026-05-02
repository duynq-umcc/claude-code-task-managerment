---
name: nextjs-firebase-feature
description: Tạo tính năng Feature trong Next.js với Firebase Firestore
---

## Ngữ cảnh dự án

Dự án sử dụng:

- **TypeScript** với path alias `@/` map tới `src/` (cấu hình trong `tsconfig.json`)
- **Next.js App Router** — trang nằm trong `src/app/(dashboard)/<feature>/page.tsx`
- **Firebase Firestore** làm backend serverless với mock-data fallback
- **@tanstack/react-table** cho data table với sorting, filtering, pagination
- **react-hook-form** + **zod** cho form validation
- **shadcn/ui** component library + **lucide-react** icons + **Tailwind CSS**
- **Functional components + hooks** — không dùng React class components

## Tham số đầu vào

Khi sử dụng skill, cần xác định:

1. **Tên feature** (ví dụ: `customer`, `product`, `order`) — dùng để tạo thư mục và files tương ứng
2. **Danh sách fields** — các trường dữ liệu (name, email, phone, status, role, v.v.)
3. **Fields bắt buộc** — validation trong form
4. **Fields search/sort** — filter options trong toolbar và sort trong table columns

## Cấu trúc mỗi feature

```
src/app/(dashboard)/<feature>/page.tsx     ← Trang chính (Client Component)
src/modules/<feature>/
  services/
    <feature>-services.ts                  ← Service layer + types
    <feature>-mock-data.ts                ← Mock data cho development
    types/
      <feature>-types.ts                  ← TypeScript interfaces
  components/
    data-table.tsx                        ← Tanstack Table + inline columns
    data-table-toolbar.tsx                 ← Search, filter, add button
    data-table-pagination.tsx              ← Pagination controls
    data-table-view-options.tsx             ← Column visibility toggle (optional)
    data-table-row-actions.tsx              ← Dropdown menu: view/edit/delete
    <feature>-stat-cards.tsx               ← Stat cards (optional)
    add-<feature>-modal.tsx                ← Dialog tạo mới
    edit-<feature>-modal.tsx               ← Dialog chỉnh sửa (optional)
    <feature>-form-dialog.tsx               ← Unified form dialog cho add/edit
```

## Firebase Integration

### Helper Firestore

Dự án dùng `getFirestoreCollection<T>()` — thử Firestore trước, fallback sang mock data nếu empty hoặc lỗi.

```typescript
// src/lib/firebase/firestore-query.ts
import { collection, getDocs } from "firebase/firestore"

export async function getFirestoreCollection<T>(
  collectionName: string,
  fallbackData: T[]
): Promise<T[]> {
  try {
    const { db } = await import("@/lib/firebase/client")
    const snapshot = await getDocs(collection(db, collectionName))
    if (snapshot.empty) return fallbackData
    return snapshot.docs.map((doc) => {
      const data = doc.data() as T
      const dataWithId = data as T & { id?: string | number }
      return { ...data, id: dataWithId.id ?? doc.id }
    })
  } catch (error) {
    console.warn(`Failed to load ${collectionName}, falling back to mock.`, error)
    return fallbackData
  }
}
```

### Quy ước Firestore

- **Collection naming**: số nhiều, snake_case (ví dụ: `tasks`, `users`, `customers`)
- **Document ID**: Firestore tự tạo bằng `addDoc`, hoặc dùng `merge: true` khi seed
- **Timestamps**: dùng `serverTimestamp()` khi seed (trong `mock-data-seeder.ts` dùng `FieldValue.serverTimestamp()`)
- **Mock data fallback**: luôn truyền mock data làm fallback — không cần `serverTimestamp()` trong service
- **No real-time**: KHÔNG dùng `onSnapshot`
- **No direct Firestore CRUD**: service chỉ dùng `getFirestoreCollection` — tạo/cập nhật/xóa thực hiện trên local state (callback pattern)
- Lưu dữ liệu vào firebase / firestore khi hoàn thành tính năng.

## Service Layer

```typescript
// src/modules/<feature>/services/<feature>-services.ts
import { getFirestoreCollection } from "@/lib/firebase/firestore-query"
import { <Feature>MockData } from "./<feature>-mock-data"
import type { <Feature>Item } from "./types/<feature>-types"

export async function get<Features>(): Promise<<Feature>Item[]> {
  return getFirestoreCollection<<Feature>Item>("<features>", <Feature>MockData)
}

// Thêm helper functions nếu cần: create, update, delete trên local state
// KHÔNG viết direct Firestore CRUD operations ở đây
// Mà xử lý trên local state trong page/component
```

## Types

```typescript
// src/modules/<feature>/services/types/<feature>-types.ts
import { z } from "zod"

export const <feature>Schema = z.object({
  id: z.string(),
  // Thêm fields theo feature
  name: z.string(),
  email: z.string().optional(),
})

export type <Feature>Item = z.infer<typeof <feature>Schema>
```

## Page (`page.tsx`)

Dùng `useState` khởi tạo với mock data, fetch Firestore trong `useEffect`.

```typescript
// src/app/(dashboard)/<feature>/page.tsx
"use client"

import { useEffect, useState } from "react"
import { <Feature>StatCards } from "@/modules/<feature>/components/<feature>-stat-cards"
import { DataTable } from "@/modules/<feature>/components/data-table"
import { columns } from "@/modules/<feature>/components/columns"
import { <Feature>MockData } from "@/modules/<feature>/services/<feature>-mock-data"
import { get<Features> } from "@/modules/<feature>/services/<feature>-services"
import type { <Feature>Item } from "@/modules/<feature>/services/types/<feature>-types"

export default function <Feature>Page() {
  const [items, setItems] = useState<<Feature>Item[]>(<Feature>MockData)

  useEffect(() => {
    get<Features>().then(setItems)
  }, [])

  const handleAddItem = (newItem: <Feature>Item) => {
    setItems(prev => [newItem, ...prev])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <<Feature>StatCards />
      </div>
      <div className="@container/main px-4 lg:px-6">
        <DataTable data={items} columns={columns} onAddItem={handleAddItem} />
      </div>
    </div>
  )
}
```

## Data Table (`data-table.tsx`)

Dùng `@tanstack/react-table` — xem `src/modules/tasks/components/data-table.tsx` làm reference.

Key imports:
```typescript
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
```

Table state: `sorting`, `columnVisibility`, `rowSelection`, `columnFilters`, `pagination`.

## Columns (`columns.tsx`)

Định nghĩa columns riêng, export ra `columns`. Dùng `accessorKey` hoặc custom `cell` render. Filter functions dùng `exactFilter` pattern:

```typescript
// src/modules/<feature>/components/columns.tsx
"use client"

import type { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<<Feature>Item>[] = [
  {
    id: "select",
    header: ({ table }) => <Checkbox ... />,
    cell: ({ row }) => <Checkbox ... />,
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span>{row.getValue("name")}</span>,
  },
  // Thêm columns theo feature fields
  // ...
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
```

## Toolbar (`data-table-toolbar.tsx`)

Search input + filter Select dropdowns + Add button + column visibility.

```typescript
// src/modules/<feature>/components/data-table-toolbar.tsx
"use client"

import type { Table } from "@tanstack/react-table"
import { Add<Feature>Modal } from "./add-<feature>-modal"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onAdd<Feature>?: (item: TData) => void
}

export function DataTableToolbar<TData>({ table, onAdd<Feature> }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="space-y-4">
      {/* Filter section: grid of Select dropdowns */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-N">
        {filters.map(f => (
          <Select
            value={(table.getColumn(f.key)?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) => table.getColumn(f.key)?.setFilterValue(value === "all" ? undefined : value)}
          >
            <SelectTrigger ...><SelectValue placeholder={f.label} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {f.label}</SelectItem>
              {f.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {/* Search + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
          />
          <Button variant="outline" onClick={() => table.resetColumnFilters()} disabled={!isFiltered}>
            Reset
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <DataTableViewOptions table={table} />
          <Add<Feature>Modal onAdd<Feature>={onAdd<Feature>} />
        </div>
      </div>
    </div>
  )
}
```

## Row Actions (`data-table-row-actions.tsx`)

Dùng `DropdownMenu` với view/edit/delete options.

```typescript
// src/modules/<feature>/components/data-table-row-actions.tsx
"use client"

import type { Row } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DataTableRowActions<TData>({ row }: { row: Row<TData> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem><Eye className="mr-2 size-4" />View</DropdownMenuItem>
        <DropdownMenuItem><Pencil className="mr-2 size-4" />Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(row.original)}>
          <Trash2 className="mr-2 size-4" />Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Add Modal (`add-<feature>-modal.tsx`)

Controlled state, `zod` validation, `Select` cho dropdown fields.

```typescript
// src/modules/<feature>/components/add-<feature>-modal.tsx
"use client"

import { useState } from "react"
import { z } from "zod"
import { Plus } from "lucide-react"

const <feature>FormSchema = z.object({
  // Định nghĩa fields theo feature
  title: z.string().min(1, "Title is required"),
})

export function Add<Feature>Modal({ onAdd<Feature> }: { onAdd<Feature>?: (item: <Feature>Item) => void }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<z.infer<typeof <feature>FormSchema>>({ title: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const validated = <feature>FormSchema.parse(formData)
      onAdd<Feature>?.(validated)
      setFormData({ title: "" })
      setErrors({})
      setOpen(false)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          if (issue.path[0]) newErrors[issue.path[0] as string] = issue.message
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="size-4" />Add <Feature></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add <Feature></DialogTitle>
          <DialogDescription>Fill in the details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields: Input, Select, Textarea theo feature */}
          <DialogFooter>
            <Button type="submit"><Plus className="size-4" />Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

## Pagination (`data-table-pagination.tsx`)

```typescript
// src/modules/<feature>/components/data-table-pagination.tsx
"use client"

import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
  return (
    <div className="flex items-center justify-between py-4">
      <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(v) => table.setPageSize(Number(v))}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent side="top">
          {[10, 20, 30, 40, 50].map((size) => (
            <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-6">
        <span className="text-sm">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}
```

## View Options (`data-table-view-options.tsx`)

Column visibility toggle.

```typescript
// src/modules/<feature>/components/data-table-view-options.tsx
"use client"

import type { Table } from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DataTableViewOptions<TData>({ table }: { table: Table<TData> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">Columns <ChevronDown className="ml-2 size-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {table.getAllColumns().filter(col => col.getCanHide()).map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(v) => column.toggleVisibility(!!v)}
          >
            {column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Mock Data

```typescript
// src/modules/<feature>/services/<feature>-mock-data.ts
import type { <Feature>Item } from "./types/<feature>-types"

export const <Feature>MockData: <Feature>Item[] = [
  { id: "1", name: "Item 1", email: "item1@example.com" },
  { id: "2", name: "Item 2", email: "item2@example.com" },
]
```

## Các bước thực hiện

1. **Tạo types** trong `services/types/<feature>-types.ts` — dùng `zod` schema
2. **Tạo mock data** trong `services/<feature>-mock-data.ts` — array of items
3. **Tạo service** trong `services/<feature>-services.ts` — dùng `getFirestoreCollection`
4. **Tạo columns** trong `components/columns.tsx` — định nghĩa table columns
5. **Tạo row actions** trong `components/data-table-row-actions.tsx` — dropdown menu
6. **Tạo view options** trong `components/data-table-view-options.tsx` — column toggle
7. **Tạo pagination** trong `components/data-table-pagination.tsx` — page controls
8. **Tạo toolbar** trong `components/data-table-toolbar.tsx` — search + filters + add button
9. **Tạo data table** trong `components/data-table.tsx` — Tanstack Table wrapper
10. **Tạo add modal** trong `components/add-<feature>-modal.tsx` — create dialog
11. **Tạo stat cards** trong `components/<feature>-stat-cards.tsx` — dashboard stats (optional)
12. **Tạo page** trong `src/app/(dashboard)/<feature>/page.tsx` — ghép mọi thứ lại
13. **Kiểm tra TypeScript**: `npx tsc --noEmit`
14. **Chạy dev server**: `npm run dev` và xác nhận trang hoạt động

## Reference thực tế

- Feature `tasks`: `src/modules/tasks/` — đầy đủ nhất, có stats, Tanstack Table, toolbar, pagination, row actions, add modal
- Feature `users`: `src/modules/users/` — dùng `react-hook-form` + `zod` trong form dialog
- Firebase helper: `src/lib/firebase/firestore-query.ts`
- Mock data seeder: `src/lib/firebase/mock-data-seeder.ts`

## Loại trừ

- Không tạo README hay tài liệu trừ khi được yêu cầu
- Không dùng React class component
- Không hardcode Firebase config — luôn import từ `@/lib/firebase/client`
- Không dùng `onSnapshot` (real-time)
- Page route phải là `src/app/(dashboard)/<feature>/page.tsx`
- File service phải là `src/modules/<feature>/services/<feature>-services.ts` (số nhiều)

### Lưu ý Phi chức năng (Bắt buộc phải có)
1. Thao tác xóa: hiển thị confirmation dialog trước khi xóa, dùng shadcn/ui Dialog component.
2. Thao tác chỉnh sửa: sau khi chỉnh sửa, hiển thị confirmation dialog để xác nhận dùng shadcn/ui Dialog component, sau đó tự động refresh data table để hiển thị thông tin mới.
3. Thao tác tạo mới: sau khi tạo mới, tự động refresh data table để hiển thị item vừa tạo.
4. Thao tác cập nhật: sau khi cập nhật,tự động refresh data table để hiển thị thông tin mới.
5. Tất cả thao tác CRUD (tạo, cập nhật, xóa) đều phải lưu dữ liệu vào Firebase Firestore khi hoàn thành tính năng.  