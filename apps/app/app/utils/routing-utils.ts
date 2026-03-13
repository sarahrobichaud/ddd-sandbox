import { ROUTE_MAP } from '~/routes/route-map';

export function getRouteInfo(pathname: string) {
  return ROUTE_MAP[pathname];
}
