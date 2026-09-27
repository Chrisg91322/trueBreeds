import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { fullName: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      memberships: {
        include: { tenant: { select: { id: true, kennelName: true, slug: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? "person has" : "people have"} signed up. Only a
            platform admin can open this list or delete an account.
          </p>
        </div>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by name or email…"
            className="h-9 w-64 rounded-md border bg-background px-3 text-sm"
          />
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Kennel</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Signed up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.fullName || user.email}</div>
                    {user.fullName && (
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.memberships.length === 0 ? (
                      <span className="text-muted-foreground">No kennel yet</span>
                    ) : (
                      <div className="space-y-1">
                        {user.memberships.map((membership) => (
                          <div key={membership.id}>
                            <Link
                              href={`/admin/tenants/${membership.tenant.id}`}
                              className="hover:underline"
                            >
                              {membership.tenant.kennelName}
                            </Link>
                            <div className="text-xs capitalize text-muted-foreground">
                              {membership.role}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {user.platformRole.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.createdAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
