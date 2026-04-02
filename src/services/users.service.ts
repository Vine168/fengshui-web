import type { CreateUserInput, UpdateUserInput, User, UpdateUserStatusInput } from '../types/user';
import { createUser, deleteUserById, getUserById, getUsersMobile, updateUserById, updateUserStatusMobile, type UserListParams } from '../api/users.api';

export async function listUsersMobile(params: UserListParams = {}) {
  const response = await getUsersMobile(params);
  const data = response.data;

  const users = data.users.map((user) => ({
    ...user,
    plan_id: user.current_subscription?.plan_id || user.plan_id,
    plan_name: user.current_subscription?.plan_name,
    lastLogin: user.updated_at || user.created_at,
  }));

  const availablePlans = data.filters.available_plans.map((plan) => ({
    id: plan.id,
    name: plan.plan_name || plan.name || plan.id,
  }));

  return {
    users,
    pagination: data.pagination,
    availablePlans,
  };
}

export async function updateUserStatus(id: string, status: UpdateUserStatusInput['status']) {
  return updateUserStatusMobile(id, { status });
}

export async function addUser(payload: CreateUserInput) {
  return createUser(payload);
}

export async function getUser(id: string) {
  const response = await getUserById(id);
  return response.data;
}

export async function updateUser(id: string, payload: UpdateUserInput) {
  const response = await updateUserById(id, payload);
  return response.data;
}

export async function deleteUser(id: string) {
  return deleteUserById(id);
}

export function filterUsers(users: User[], searchQuery: string) {
  const query = searchQuery.trim().toLowerCase();

  if (!query) {
    return users;
  }

  return users.filter((user) => {
    return (
      user.name.toLowerCase().includes(query) ||
      (user.email?.toLowerCase().includes(query) ?? false)
    );
  });
}
