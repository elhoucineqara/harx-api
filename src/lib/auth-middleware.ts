import { getUser } from '../middleware/auth';

/**
 * Bridge for the authenticate function used in many routes.
 * Maps to the getUser implementation which extracts the user from JWT.
 */
export const authenticate = getUser;
