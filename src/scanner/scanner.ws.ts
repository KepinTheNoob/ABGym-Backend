import WebSocket, { WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const lastScan = new Map<string, number>();

export function startScannerServer() {
  const wss = new WebSocketServer({ port: 8080 });

  console.log("🟢 Gym scanner running 24/7 on ws://localhost:8080");

  wss.on("connection", (ws) => {
    ws.on("message", async (data) => {
      const memberId = data.toString();
      const now = Date.now();

      console.log("📡 QR received:", memberId);

      if (lastScan.get(memberId) && now - lastScan.get(memberId)! < 3000) {
        return;
      }
      lastScan.set(memberId, now);

      try {
        const member = await prisma.members.findUnique({
          where: {
            id: memberId,
          },
          include: {
            plans: true,
          },
        });

        let response: any;

        if (!member) {
          response = {
            type: "ACCESS_DENIED",
            reason: "MEMBER_NOT_FOUND",
          };
        } else if (member.expirationDate < new Date()) {
          response = {
            type: "ACCESS_DENIED",
            reason: "MEMBERSHIP_EXPIRED",
            name: member.name,
          };
        } else {
          await prisma.attendance.create({
            data: {
              memberId: member.id,
              checkInTime: new Date(),
            },
          });

          response = {
            type: "ACCESS_GRANTED",
            member: {
              id: member.id,
              name: member.name,
              expirationDate: member.expirationDate,
              plan: member.plans?.name,
            },
            checkInTime: new Date().toISOString(),
          };
        }

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(response));
        }
      } catch (error) {
        console.error("Scanner error:", error);
      }
    });
  });
}
