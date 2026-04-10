# Backend API Integration Guide

## Quick Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and update the API URL:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 2. Authentication

The frontend automatically sends your auth token on every request using the `Authorization` header:

```
Authorization: Bearer <admin_access_token>
```

To set your token after login:

```typescript
// After login via /auth/login
localStorage.setItem("token", response.token);
```

The HTTP client reads this token and includes it automatically.

## API Endpoints

### Users (Mobile)

**List Users**

```typescript
import { listUsersMobile } from "@/services/users.service";

const { users, pagination, availablePlans } = await listUsersMobile({
  page: 1,
  limit: 10,
  search: "john",
  status: "active",
  date_filter: "month",
});
```

Query params:

- `page`: page number (default: 1)
- `limit`: rows per page
- `search`: search by name/email
- `sex`: filter by sex
- `status`: `active`, `inactive`, or `suspended`
- `plan_id`: filter by subscription plan
- `date_filter`: `today`, `week`, `month`, or `custom`
- `start_date` / `end_date`: for custom date range (format: `YYYY-MM-DD`)
- Aliases: `from_date` and `to_date` also accepted

**Update User Status**

```typescript
import { updateUserStatus } from "@/services/users.service";

await updateUserStatus("user_id", "suspended");
```

## Error Handling

Backend returns structured errors:

- **422 (Validation Failed)**

  ```json
  {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": {
      "email": ["Invalid email format"],
      "name": ["Name is required"]
    }
  }
  ```

- **403 (Permission Denied)**

  ```json
  {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
  ```

- **404 (Not Found)**
  ```json
  {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
  ```

Handle errors in your component:

```typescript
import { HttpError } from "@/lib/http";

try {
  await updateUserStatus("id", "active");
} catch (err) {
  if (err instanceof HttpError) {
    if (err.status === 422 && err.errors) {
      // Show field-level validation errors
      Object.entries(err.errors).forEach(([field, messages]) => {
        toast.error(`${field}: ${messages.join(", ")}`);
      });
    } else if (err.status === 403) {
      toast.error("You do not have permission for this action");
    } else {
      toast.error(err.message);
    }
  }
}
```

## Response Format

List endpoint returns:

```typescript
{
  users: User[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    total_pages: number
  },
  filters: {
    available_plans: [
      { id: string, name: string },
      ...
    ]
  }
}
```

## Using in Components

Example: fetch users with filters

```typescript
import { useUsers } from '@/hooks/useUsers';
import { listUsersMobile } from '@/services/users.service';

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { users, pagination } = await listUsersMobile({ page, limit: 10 });
        setUsers(users);
      } catch (err) {
        toast.error('Failed to load users');
      }
    };
    loadUsers();
  }, [page]);

  return (
    // Render users list...
  );
}
```
