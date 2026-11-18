import type { Server } from 'node:http';
export function globalHeaders(toml: string): Record<string, string>;
export function resolveFile(root: string, pathname: string): string | undefined;
export function createHandler(root: string, toml: string): (req: unknown, res: unknown) => void;
export function serve(root: string, port: number, toml?: string): Server;
