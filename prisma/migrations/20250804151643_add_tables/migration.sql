-- CreateTable
CREATE TABLE "public"."Usina" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "distribuidora" TEXT,
    "consorcio" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "potencia" DOUBLE PRECISION,

    CONSTRAINT "Usina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GeracaoDiaria" (
    "id" SERIAL NOT NULL,
    "usinaId" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "energiaKwh" DOUBLE PRECISION NOT NULL,
    "ocorrencia" TEXT NOT NULL,
    "clima" TEXT NOT NULL,

    CONSTRAINT "GeracaoDiaria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usina_nome_key" ON "public"."Usina"("nome");

-- AddForeignKey
ALTER TABLE "public"."GeracaoDiaria" ADD CONSTRAINT "GeracaoDiaria_usinaId_fkey" FOREIGN KEY ("usinaId") REFERENCES "public"."Usina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
