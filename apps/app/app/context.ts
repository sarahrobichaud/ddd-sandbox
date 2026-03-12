import type { ProfileIdentity } from '@cavok/core';
import { createContext } from 'react-router';

export type UserContext = {
  profile: ProfileIdentity;
  isAuthenticated: true;
};

export const userContext = createContext<UserContext | null>(null);
