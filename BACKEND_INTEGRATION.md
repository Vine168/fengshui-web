# Backend Integration Folder Structure

```
src/
├── config/
│   └── env.ts              # Environment variables (VITE_API_BASE_URL)
│
├── lib/
│   └── http.ts             # Shared HTTP client with auth, error handling
│
├── types/
│   ├── api.ts              # API response/error types (ApiError, Pagination, etc)
│   └── user.ts             # User domain types (User, CreateUserInput, etc)
│
├── api/
│   ├── users.api.ts        # Low-level endpoint wrapper for users
│   │                        # Functions: getUsersMobile, updateUserStatusMobile
│   └── auth.api.ts         # Low-level endpoint wrapper for auth
│                            # Functions: login, logout
│
├── services/
│   ├── users.service.ts    # Business logic + data transformation
│   │                        # Functions: listUsersMobile, updateUserStatus
│   └── auth.service.ts     # Auth session + token management
│                            # Functions: signIn, signOut, getStoredUser
│
├── hooks/
│   └── useUsers.ts         # React hook for user fetching + state
│                            # Exports: useUsers()
│
└── app/
    └── components/
        └── Users.tsx       # UI component (renders only, calls services)
```

## Data Flow

```
Component (Users.tsx)
  ↓
useUsers() hook OR service call (listUsersMobile)
  ↓
service function (src/services/users.service.ts)
  ↓
api function (src/api/users.api.ts)
  ↓
http client (src/lib/http.ts)
  ↓
Backend API
```

## Quick Example

**In your component:**

```typescript
import { listUsersMobile, updateUserStatus } from "@/services/users.service";

const [users, setUsers] = useState([]);
const [pagination, setPagination] = useState(null);
const [availablePlans, setAvailablePlans] = useState([]);

useEffect(() => {
  const load = async () => {
    try {
      const { users, pagination, availablePlans } = await listUsersMobile({
        page: 1,
        limit: 10,
      });
      setUsers(users);
      setPagination(pagination);
      setAvailablePlans(availablePlans);
    } catch (err) {
      toast.error("Failed to load users");
    }
  };
  load();
}, []);

const handleUpdateStatus = async (id: string, status: string) => {
  try {
    await updateUserStatus(id, status);
    toast.success("Status updated");
    // Refresh list...
  } catch (err) {
    toast.error("Failed to update status");
  }
};
```

## Key Files

- **Setup**: `.env` → set `VITE_API_BASE_URL`
- **Auth**: `src/lib/http.ts` → automatically sends Bearer token
- **Errors**: `src/lib/http.ts` → throws `HttpError` with `status`, `code`, `errors`
- **Documentation**: `API.md` → full endpoint reference
