import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MessagesPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;

  const messages = await prisma.messageLog.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { customer: { select: { name: true } } },
  });

  return (
    <>
      <Header title="WhatsApp messages" userEmail={session?.user?.email} />
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Message log ({messages.length})</CardTitle>
            <p className="text-sm text-slate-500">MVP uses mock provider — messages are logged, not sent to real WhatsApp.</p>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-sm text-slate-500">No messages yet.</p>
            ) : (
              <ul className="divide-y text-sm">
                {messages.map((msg) => (
                  <li key={msg.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={msg.status === "SENT" ? "default" : "warning"}>
                          {msg.status}
                        </Badge>
                        <Badge variant="secondary">{msg.type}</Badge>
                        <span className="text-slate-500">
                          {msg.customer?.name ?? msg.toPhone}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {format(msg.createdAt, "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="mt-2 text-slate-700">{msg.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
