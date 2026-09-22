import React, { forwardRef } from "react";
import {
  useNavigate as useRRDNavigate,
  Link as RRDLink,
  useParams as useRRDParams,
  useLocation as useRRDLocation,
  useSearchParams as useRRDSearchParams,
  type LinkProps as RRDLinkProps,
} from "react-router-dom";

export {
  useRRDParams as useParams,
  useRRDLocation as useLocation,
  useRRDSearchParams as useSearchParams,
};

export type NavigateOptions = {
  to?: string;
  search?: Record<string, string | number | boolean>;
  replace?: boolean;
};

export function useNavigate() {
  const navigate = useRRDNavigate();

  return (
    toOrOptions: string | number | NavigateOptions,
    options?: { replace?: boolean }
  ) => {
    if (typeof toOrOptions === "number") {
      return navigate(toOrOptions);
    }
    if (typeof toOrOptions === "string") {
      return navigate(toOrOptions, options);
    }
    const { to = "/", search, replace } = toOrOptions;
    if (search && Object.keys(search).length > 0) {
      const params = new URLSearchParams();
      Object.entries(search).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          params.set(key, String(val));
        }
      });
      const queryString = params.toString();
      return navigate(`${to}?${queryString}`, { replace });
    }
    return navigate(to, { replace });
  };
}

export interface LinkProps extends Omit<RRDLinkProps, "to"> {
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, string | number | boolean>;
  activeProps?: { className?: string };
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to = "/", params, search, activeProps, className, ...rest },
  ref
) {
  const location = useRRDLocation();
  let resolvedTo = to;
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      resolvedTo = resolvedTo.replace(`$${key}`, val).replace(`:${key}`, val);
    });
  }
  if (search && Object.keys(search).length > 0) {
    const sp = new URLSearchParams();
    Object.entries(search).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.set(k, String(v));
    });
    resolvedTo += (resolvedTo.includes("?") ? "&" : "?") + sp.toString();
  }

  const isActive = location.pathname === resolvedTo || (resolvedTo !== "/" && location.pathname.startsWith(resolvedTo));
  const combinedClassName = [
    className,
    isActive && activeProps?.className ? activeProps.className : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <RRDLink ref={ref} to={resolvedTo} className={combinedClassName} {...rest} />;
});
