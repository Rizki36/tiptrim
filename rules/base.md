# Cursor Rules for Next.js | ShadCN | Prisma

## Project Structure and Setup

### TypeScript Usage

- Use **TypeScript** for all new files and components.

### Package Manager

- Use **pnpm** as the main package manager.

### Next.js Structure

- Follow the **Next.js 15+** app directory structure:
  - Place pages in the `src/app` directory.
  - Use layout files for shared layouts.
  - Place components in the `src/components` directory.

## UI Components and Styling

### UI Components

- Use the **shadcn/ui** component library for UI components, located in `src/components/ui`.
  - Use the `cn` utility function for conditional class names.
  - Use theme colors from `global.css` / `tailwind.config.ts` for styling.
  - Use toast from `sonner` for notifications.
  - Use the **Next.js `<Image>`** component for optimized image loading.

### Tailwind CSS

- Use **Tailwind CSS** for styling.
  - Configure Tailwind in `tailwind.config.ts`.

### Custom Data Table

- For data tables, use the custom **DataTable** component with the following structure:

```tsx
const columnsConfig: TableColumnConfig<Data>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (data) => <div>{data.name}</div>,
  },
];

const {
  data: rules,
  isLoading: isLoadingData,
  isFetching: isFetchingData,
} = api.rules.getAll.useQuery();

const isLoading = isLoadingData || isFetchingData;

const columns = createColumns(columnsConfig);

return (
  <DataTable
    data={rules}
    columns={columns}
    isLoadingData={isLoading}
  />
);
```

## Input Validation and Form Handling

### Input Validation with Zod

- Use **zod** for input validation in `trpc`.

```ts
import { z } from "zod";

export const createRuleSchema = z.object({
  title: z.string(),
  content: z.string(),
  isPrivate: z.boolean(),
  tags: z.array(z.string()),
});

export type CreateRuleSchema = z.infer<typeof createRuleSchema>;
```

- Export schemas and use them in the `trpc` router for input validation.

### Form Handling

- Implement form handling using **react-hook-form** and **zod** for validation.

## Database Operations

### Prisma for Database Operations

- Use **Prisma** for database operations.
  - Define models in `prisma/schema.prisma`.
  - Use the `db` instance from `src/server/db.ts` for database queries.
  - Never expose the `db` instance to the client.
  - Use **PostgreSQL** database

### Queries and Mutations

- Organize queries in the `queries` folder and schemas in the `schemas` folder. Use them in `trpc` routers for input validation.

```ts
import { db } from "@/server/db";

export async function getRules() {
  return db.rule.findMany({
    where: { isPrivate: false },
    include: { author: true, tags: true, votes: true },
  });
}
```

- For mutations, use the `db` instance directly.

```ts
import { db } from "@/server/db";

export async function createRule(data: CreateRuleSchema) {
  return db.rule.create({ data });
}
```

- For schemas, use the `zod` library under `src/server/schemas`.

```ts
import { z } from "zod";

export const createRuleSchema = z.object({
  title: z.string(),
  content: z.string(),
  isPrivate: z.boolean(),
  tags: z.array(z.string()),
});

export type CreateRuleSchema = z.infer<typeof createRuleSchema>;
```

- and use them in the `trpc` router for input validation.

```ts
export const createRuleRouter = createTRPCRouter({
  create: publicProcedure
    .input(createRuleSchema)
    .mutation(async ({ input }) => {
      return createRule(input);
    }),
});
```

## Authentication and Security

### Authentication with NextAuth.js

- Use **NextAuth.js** for authentication.

  - Define authentication options in `src/server/auth.ts`.
  - Use `auth()` to get the user session on the server side.
  - Use `useSession()` to get the user session on the client side.
  - Use server-side authentication as much as possible.

  - For server components, use `auth()` to get the user session.

  ```tsx
  const session = await auth();
  ```

  - For client components, use `useSession()` to get the user session.

  ```tsx
  const session = useSession();
  ```

### Environment Variables

- Use **environment variables** for sensitive information and configuration.
  - Store them in the `.env` file (not committed to version control).
  - Access them using `process.env` in server-side code.

## Error Handling and Asynchronous Operations

### Error Handling and Loading States

- Implement error handling and loading states for asynchronous operations.

## Code Style and Naming Conventions

### Naming Conventions

- Follow these conventions:
  - Use **PascalCase** for component names.
  - Use **camelCase** for function and variable names.
  - Use **UPPERCASE_SNAKE_CASE** for constants.
