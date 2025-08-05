import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Teste de conexão
export async function testConnection() {
  try {
    await prisma.$connect()
    console.log("✅ Conexão com banco estabelecida")
    return true
  } catch (error) {
    console.error("❌ Erro na conexão com banco:", error)
    return false
  }
}
